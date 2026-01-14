import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { pricingService } from '../../../../services/pricingService';
import { createSlug } from '../../../../utils/slugs';
import { calculateBuybackPriceShared, calculateRepairPriceShared } from '../../../../utils/pricingLogic';
import 'server-only';
import * as Sentry from "@sentry/nextjs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            price: clientPrice,
            brand,
            model,
            condition,
            issues,
            type,
            storage,
            deviceType,
            shopId
        } = body;

        // 1. Validate Payload Structure
        if (!brand || !model || !type || (!clientPrice && clientPrice !== 0)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Server-Side Price Verification
        const slug = createSlug(`${brand} ${model}`);
        const pricingData = await pricingService.fetchDevicePricing(slug);

        const pricingParams = {
            ...body,
            type,
            brand,
            model,
            repairIssues: issues,
            selectedScreenQuality: body.selectedScreenQuality || 'generic'
        };

        const calculatedPrice = type === 'buyback'
            ? calculateBuybackPriceShared(pricingParams, pricingData).price
            : calculateRepairPriceShared(pricingParams, pricingData);


        // 3. Strict Verification for Buyback
        if (type === 'buyback') {
            if (Math.abs(calculatedPrice - clientPrice) > 5) {
                console.error(`Security Alert: Price Mismatch. Client: ${clientPrice}, Server: ${calculatedPrice}`);
                return NextResponse.json({
                    error: 'Price validation failed. The quote has been updated.',
                    serverPrice: calculatedPrice
                }, { status: 422 });
            }
        }

        // 4. Save to Firestore (Server-Side using Admin SDK)
        // We import adminDb dynamically or statically. Statically is fine if it handles init checks.
        const { adminDb } = await import('../../../../lib/firebase-admin');
        const { FieldValue } = await import('firebase-admin/firestore');

        try {
            // Generate Readable ID securely
            const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
            const preGeneratedId = `ORD-${new Date().getFullYear()}-${randomSuffix}`;

            // Generate secure tracking token
            const { randomBytes } = await import('crypto');
            const trackingToken = randomBytes(32).toString('hex');

            // Logistics Status
            const { logisticsService } = await import('../../../../services/server/logisticsService');
            const deliveryMethod = body.deliveryMethod || 'dropoff';
            const initialStatus = logisticsService.getInitialStatus(deliveryMethod);

            let shippingLabelUrl = null;
            let trackingNumber = null;

            if (deliveryMethod === 'send' || deliveryMethod === 'courier') {
                try {
                    const labelResult = await logisticsService.createShippingLabel({
                        name: body.customerName,
                        email: body.customerEmail,
                        address: body.customerAddress || '',
                        city: body.customerCity || '',
                        postal_code: body.customerZip || '',
                        country: 'BE',
                        telephone: body.customerPhone,
                        request_label: true
                    });
                    trackingNumber = labelResult.trackingNumber;
                    shippingLabelUrl = labelResult.labelUrl;
                } catch (logisticsError) {
                    console.error('Logistics Error:', logisticsError);
                }
            }

            // ADMIN SDK WRITE
            const docReference = await adminDb.collection('quotes').add({
                ...body,
                price: calculatedPrice,
                status: initialStatus,
                isVerified: true,
                createdAt: FieldValue.serverTimestamp(),
                source: 'web_wizard_secure',
                orderId: preGeneratedId,
                trackingToken,
                trackingTokenCreatedAt: FieldValue.serverTimestamp(),
                originPartnerId: body.partnerId || null,
                deviceType: deviceType || 'smartphone',
                shopId: shopId || body.selectedShop || 'online',
                shippingLabelUrl,
                trackingNumber
            });

            Sentry.setTag("order_id", preGeneratedId);
            Sentry.setTag("brand", brand);
            Sentry.setContext("order_details", { type, price: calculatedPrice, model });

            // 5. B2B INVOICE GENERATION & STORAGE
            let invoiceUrl = null;
            if (body.isCompany) {
                try {
                    const { adminStorage, adminDb } = await import('../../../../lib/firebase-admin');
                    const { mapQuoteToPdfData } = await import('../../../../utils/orderMappers');
                    const { generatePDFFromPdfData } = await import('../../../../utils/pdfGenerator');
                    const { getFixedT } = await import('../../../../utils/i18n-server');

                    const lang = body.language || 'fr';
                    const t = getFixedT(lang);

                    const quoteData = {
                        ...body,
                        id: docReference.id,
                        orderId: preGeneratedId,
                        price: calculatedPrice,
                        createdAt: { seconds: Math.floor(Date.now() / 1000) }
                    };

                    const pdfData = mapQuoteToPdfData(quoteData as any, t);
                    // Force filename prefix 'Invoice' to ensure clarity
                    const { blob, base64 } = await generatePDFFromPdfData(pdfData, 'Invoice');

                    // Convert base64 to Buffer for Admin SDK upload
                    const pdfBuffer = Buffer.from(base64, 'base64');
                    const invoiceFileName = `invoices/${preGeneratedId}_${Date.now()}.pdf`;
                    const bucket = adminStorage.bucket();
                    const file = bucket.file(invoiceFileName);

                    await file.save(pdfBuffer, {
                        contentType: 'application/pdf',
                        metadata: {
                            metadata: {
                                firebaseStorageDownloadTokens: trackingToken // Use tracking token as pseudo-token
                            }
                        }
                    });

                    // Get Signed URL (Valid for 10 years)
                    const [signedUrl] = await file.getSignedUrl({
                        action: 'read',
                        expires: '03-01-2035'
                    });

                    invoiceUrl = signedUrl;

                    // Update quote with invoice URL
                    await docReference.update({ invoiceUrl });

                    console.log(`[B2B Invoice] Generated and uploaded: ${invoiceFileName}`);
                } catch (invoiceError) {
                    console.error('[B2B Invoice] Generation failed:', invoiceError);
                    Sentry.captureException(invoiceError);
                    // Don't fail the order if invoice generation fails, but log it
                }
            }

            // 6. SERVER-SIDE EMAIL DISPATCH
            try {
                const { mapQuoteToPdfData } = await import('../../../../utils/orderMappers');
                const { generatePDFFromPdfData } = await import('../../../../utils/pdfGenerator');
                const { getFixedT } = await import('../../../../utils/i18n-server');
                const { serverEmailService } = await import('../../../../services/server/emailService');

                const lang = body.language || 'fr';
                const t = getFixedT(lang);

                // Prepare quote data
                const quoteData = {
                    ...body,
                    id: docReference.id,
                    orderId: preGeneratedId,
                    price: calculatedPrice,
                    createdAt: { seconds: Math.floor(Date.now() / 1000) }
                };

                const pdfData = mapQuoteToPdfData(quoteData as any, t);
                const { base64, safeFileName } = await generatePDFFromPdfData(pdfData, type === 'buyback' ? 'Buyback' : 'Repair');

                const { getOrderConfirmationEmail } = await import('../../../../utils/emailTemplates');
                const { subject, html } = getOrderConfirmationEmail(quoteData, preGeneratedId, lang as any, t);

                // Send to Customer
                await serverEmailService.sendEmail(
                    body.customerEmail,
                    subject,
                    html,
                    [{ name: safeFileName, content: base64 }]
                );

                // Send to Admin
                await serverEmailService.sendEmail(
                    'info@belmobile.be',
                    `[ADMIN COPY] Order ${preGeneratedId} (${body.customerName})`,
                    html,
                    [{ name: safeFileName, content: base64 }]
                );

                console.log(`[Email] Dispatch clean success for ${preGeneratedId}`);

                // 7. MULTICHANNEL WHATSAPP (Proactive)
                if (body.customerPhone) {
                    try {
                        const { notificationService } = await import('../../../../services/notificationService');
                        const whatsappMsg = notificationService.getWhatsAppTemplate(quoteData as any, preGeneratedId, lang as any);

                        // We use fetch to the internal API route for standard formatting & simulation handling
                        // Note: Using absolute URL if needed, but relative works in Next.js internal routes
                        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                        await fetch(`${baseUrl}/api/notifications/whatsapp`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                to: body.customerPhone,
                                message: whatsappMsg,
                                orderId: preGeneratedId
                            })
                        });
                        console.log(`[WhatsApp] Dispatch initiated for ${preGeneratedId}`);
                    } catch (waError) {
                        console.error('[API Order Submit] WhatsApp Dispatch Failed:', waError);
                    }
                }

            } catch (emailError) {
                console.error('[API Order Submit] Email Dispatch Failed:', emailError);
                Sentry.captureException(emailError);
            }

            return NextResponse.json({ success: true, id: docReference.id, orderId: preGeneratedId, price: calculatedPrice, trackingToken });

        } catch (dbError) {
            console.error('Admin Firestore Write Failed:', dbError);
            throw dbError; // Admin write failure is fatal/real error, don't fallback to client
        }

    } catch (error) {
        console.error('Order Submission Error:', error);
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
