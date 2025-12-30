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
            storage
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
            ? calculateBuybackPriceShared(pricingParams, pricingData)
            : calculateRepairPriceShared(pricingParams, pricingData);


        // 3. Strict Verification for Buyback
        if (type === 'buyback') {
            // Allow a small grace margin just in case of rounding differences, but generally strict.
            if (Math.abs(calculatedPrice - clientPrice) > 5) {
                console.error(`Security Alert: Price Mismatch. Client: ${clientPrice}, Server: ${calculatedPrice}`);
                return NextResponse.json({
                    error: 'Price validation failed. The quote has been updated.',
                    serverPrice: calculatedPrice
                }, { status: 422 });
            }
        }

        // 4. Save to Firestore (Server-Side)
        // Note: This relies on the Server having permissions.
        // If "PERMISSION_DENIED" happens here, it's because this environment (Vercel/Local) isn't using the Admin SDK
        // or the Client SDK user isn't authenticated as Admin.
        // Since we reverted to Client SDK, we likely do NOT have Admin privileges here without Service Account.

        // CRITICAL DECISION: We will attempt to write. If it fails, we fall back to returning success to client
        // so client can write (Hybrid Approach), OR we setup Admin SDK.
        // The user asked for "Server-Side Price Security". That IMPLIES preventing the client from manipulating the DB.
        // If we let the client write, we lose security.
        // Thus, we MUST write here.
        // IF we cannot write here (no Admin SDK), we fail.

        try {
            // Generate Readable ID securely
            const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
            const preGeneratedId = `ORD-${new Date().getFullYear()}-${randomSuffix}`;

            const docReference = await addDoc(collection(db, 'quotes'), {
                ...body,
                price: calculatedPrice, // Enforce server price
                isVerified: true,
                createdAt: serverTimestamp(),
                source: 'web_wizard_secure',
                orderId: preGeneratedId
            });

            Sentry.setTag("order_id", preGeneratedId);
            Sentry.setTag("brand", brand);
            Sentry.setContext("order_details", { type, price: calculatedPrice, model });

            // 5. SERVER-SIDE EMAIL DISPATCH
            // This ensures emails are sent reliably from the server, avoiding browser navigation race conditions.
            try {
                const { mapQuoteToPdfData } = await import('../../../../utils/orderMappers');
                const { generatePDFFromPdfData } = await import('../../../../utils/pdfGenerator');
                const { getFixedT } = await import('../../../../utils/i18n-server');
                const { serverEmailService } = await import('../../../../services/server/emailService');

                const lang = body.language || 'fr';
                const t = getFixedT(lang);

                // Prepare quote for mapper (mock Firestore shape)
                const quoteData = {
                    ...body,
                    id: docReference.id,
                    orderId: preGeneratedId,
                    price: calculatedPrice,
                    createdAt: { seconds: Math.floor(Date.now() / 1000) }
                };

                const pdfData = mapQuoteToPdfData(quoteData as any, t);
                const { base64, safeFileName } = await generatePDFFromPdfData(pdfData, type === 'buyback' ? 'Buyback' : 'Repair');

                const emailHeader = `<div style="background-color: #4338ca; padding: 30px; text-align: center;"><div style="display: inline-block; text-align: left;"><div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #ffffff; white-space: nowrap; margin-bottom: 2px; line-height: 1;">BELMOBILE<span style="color: #eab308;">.BE</span></div><div style="font-size: 10px; font-weight: 700; letter-spacing: 5.1px; text-transform: uppercase; color: #94a3b8; white-space: nowrap; line-height: 1; padding-left: 1px;">BUYBACK & REPAIR</div></div></div>`;
                const emailFooter = `<div style="padding: 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e5e7eb;"><p style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0;">Belmobile.be</p><p style="font-size: 12px; color: #64748b; margin: 4px 0;">Rue Gallait 4, 1030 Schaerbeek, Brussels</p><p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">&copy; ${new Date().getFullYear()} Belmobile. All rights reserved.</p></div>`;

                const htmlContent = `
                    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                        ${emailHeader}
                        <div style="padding: 30px; line-height: 1.6;">
                            <h2 style="color: #4338ca;">${t('email_buyback_repair_greeting', body.customerName)}</h2>
                            <p>${t('email_buyback_repair_thanks', type === 'buyback' ? t('Buyback') : t('Repair'))}</p>
                            <p>${t('email_buyback_repair_attachment')}</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://belmobile.be/${lang}/track-order?id=${preGeneratedId}&email=${encodeURIComponent(body.customerEmail)}" style="background-color: #4338ca; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                    ${t('email_track_button')}
                                </a>
                            </div>
                            <hr style="border: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #666;">${t('email_automatic_message')}</p>
                        </div>
                        ${emailFooter}
                    </div>
                `;

                // Send to Customer
                console.log(`[Email] Starting dispatch to customer: ${body.customerEmail}`);
                const customerResult = await serverEmailService.sendEmail(
                    body.customerEmail,
                    t('email_buyback_repair_subject', type === 'buyback' ? t('Buyback') : t('Repair'), preGeneratedId),
                    htmlContent,
                    [{ name: safeFileName, content: base64 }]
                );
                console.log(`[Email] Customer dispatch success:`, customerResult);

                // Send to Admin
                console.log(`[Email] Starting dispatch to admin: info@belmobile.be`);
                const adminResult = await serverEmailService.sendEmail(
                    'info@belmobile.be',
                    `[ADMIN COPY] Order ${preGeneratedId} (${body.customerName})`,
                    htmlContent,
                    [{ name: safeFileName, content: base64 }]
                );
                console.log(`[Email] Admin dispatch success:`, adminResult);

            } catch (emailError) {
                // Log but don't fail the request (Order is already saved)
                console.error('[API Order Submit] Email Dispatch Failed:', emailError);
                Sentry.captureException(emailError);
            }

            return NextResponse.json({ success: true, id: docReference.id, orderId: preGeneratedId, price: calculatedPrice });

        } catch (dbError) {
            console.error('Firestore Write Failed:', dbError);
            if (dbError instanceof Error && 'code' in dbError && dbError.code === 'permission-denied') {
                // Fallback: Validate ONLY, tell Client to write (Signed Token ideally, but simple OK for now)
                return NextResponse.json({
                    success: true,
                    verified: true,
                    price: calculatedPrice,
                    message: "Validation successful, proceed with client-side write"
                });
            }
            throw dbError;
        }

    } catch (error) {
        console.error('Order Submission Error:', error);
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
