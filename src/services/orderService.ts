import { db, storage as firebaseStorage } from '../firebase';
import { collection, addDoc, serverTimestamp, updateDoc, setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { REPAIR_ISSUES } from '../constants';
import * as Sentry from "@sentry/nextjs";
import { TFunction } from '../utils/i18n-server';
import { OrderSubmissionSchema } from '../types/schemas';

export interface OrderSubmissionData {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string | null;
    customerCity?: string | null;
    customerZip?: string | null;
    brand: string;
    model: string;
    type: 'buyback' | 'repair';
    price: number;
    condition: string | { screen: string; body: string } | null;
    issues: string[] | null;
    deliveryMethod: string | null;
    iban?: string | null;
    idFile?: File | null;
    servicePoint?: any | null; // Third-party object structure
    language: string;
    storage?: string;
    hasHydrogel?: boolean;
    courierTier?: 'bridge' | 'brussels';
    isCompany?: boolean;
    companyName?: string;
    vatNumber?: string;
    partnerId?: string;
    shopId?: string | number;
    deviceType?: string;
}

export const orderService = {
    async uploadFile(file: File): Promise<string> {
        const storageRef = ref(firebaseStorage, `uploads/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    },

    async createShippingLabel(data: any) {
        const response = await fetch('/api/shipping/create-label', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Token': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to generate shipping label');
        return await response.json();
    },

    async submitOrder(orderData: OrderSubmissionData, t: (key: string, ...args: (string | number)[]) => string) {
        return Sentry.startSpan({ name: "submitOrder", op: "order.submit" }, async (span) => {
            let idUrl = null;
            if (orderData.idFile) idUrl = await this.uploadFile(orderData.idFile);

            let shippingLabelUrl = null;
            let trackingNumber = null;
            if (orderData.deliveryMethod === 'send') {
                try {
                    const shipping = await this.createShippingLabel({
                        customer: {
                            name: orderData.customerName,
                            email: orderData.customerEmail,
                            phone: orderData.customerPhone,
                            address: orderData.customerAddress,
                            city: orderData.customerCity,
                            zip: orderData.customerZip,
                        },
                        servicePoint: orderData.servicePoint
                    });
                    shippingLabelUrl = shipping.labelUrl;
                    trackingNumber = shipping.trackingNumber;
                } catch (err) {
                    console.error('Shipping label error:', err);
                    // Proceed without label
                }
            }

            // AEGIS: Robust validation before submission
            const validation = OrderSubmissionSchema.safeParse(orderData);
            if (!validation.success) {
                Sentry.captureException(new Error(`Order Validation Failed: ${JSON.stringify(validation.error.format())}`));
                throw new Error('Invalid order data. Please check your inputs.');
            }

            // Server-Side Submission with Fallback
            const firestoreData = {
                ...validation.data,
                idUrl,
                shippingLabelUrl,
                trackingNumber,
                createdAt: serverTimestamp(),
                status: 'new',
                date: new Date().toISOString().split('T')[0],
                isPriceValidated: true,
                partnerId: orderData.partnerId
            };

            Sentry.addBreadcrumb({
                category: "order",
                message: `Submitting order for ${orderData.customerEmail}`,
                level: "info",
                data: { brand: orderData.brand, model: orderData.model, type: orderData.type }
            });

            // Explicitly remove File object
            delete (firestoreData as any).idFile;

            try {
                // 1. Attempt Secure Server Submission
                const response = await fetch('/api/orders/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(firestoreData)
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || `Submission failed with status ${response.status}`);
                }

                if (result.success && result.id) {
                    const finalOrderId = result.orderId || `ORD-${new Date().getFullYear()}-${result.id.substring(0, 6).toUpperCase()}`;
                    await this.markLeadAsConverted(orderData.customerEmail);

                    return {
                        success: true,
                        docId: result.id,
                        readableId: finalOrderId,
                        trackingToken: result.trackingToken,
                        firestoreData: { ...firestoreData, orderId: finalOrderId }
                    };
                }

                if (result.success && result.verified) {
                    // Fallback: Client-side write
                    // Generate a token client-side for consistency
                    const trackingToken = Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');

                    const docRef = await addDoc(collection(db, 'quotes'), {
                        ...firestoreData,
                        price: result.price,
                        isVerified: true,
                        trackingToken,
                        trackingTokenCreatedAt: serverTimestamp(),
                        source: 'web_wizard_fallback'
                    });
                    const readableId = `ORD-${new Date().getFullYear()}-${docRef.id.substring(0, 6).toUpperCase()}`;
                    await updateDoc(docRef, { orderId: readableId });
                    await this.markLeadAsConverted(orderData.customerEmail);

                    return { success: true, docId: docRef.id, readableId, trackingToken, firestoreData: { ...firestoreData, orderId: readableId } };
                }

                throw new Error("Unexpected server response");

            } catch (error: any) {
                console.error("Order Submit Error", error);
                throw error;
            }
        });
    },

    async sendOrderConfirmationEmail(
        readableId: string,
        data: OrderSubmissionData & { id?: string },
        lang: string,
        t: TFunction,
        sendEmail: (to: string, subject: string, html: string, attachments?: any[]) => Promise<void>
    ) {
        const { generatePDFFromPdfData } = await import('../utils/pdfGenerator');
        const { mapQuoteToPdfData } = await import('../utils/orderMappers');

        const quoteLikeData = {
            ...data,
            orderId: readableId,
            id: readableId,
            createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
            status: 'new',
            date: new Date().toISOString().split('T')[0],
            deviceType: 'smartphone',
            shopId: 'online',
        } as unknown as import('../types').Quote;

        const pdfData = mapQuoteToPdfData(quoteLikeData, t);
        const { blob, safeFileName } = await generatePDFFromPdfData(pdfData, data.type === 'buyback' ? 'Buyback' : 'Repair');

        const buffer = await blob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        const emailStyles = `font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;`;
        const emailHeader = `<div style="background-color: #4338ca; padding: 30px; text-align: center;"><div style="display: inline-block; text-align: left;"><div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #ffffff; white-space: nowrap; margin-bottom: 2px; line-height: 1;">BELMOBILE<span style="color: #eab308;">.BE</span></div><div style="font-size: 10px; font-weight: 700; letter-spacing: 5.1px; text-transform: uppercase; color: #94a3b8; white-space: nowrap; line-height: 1; padding-left: 1px;">BUYBACK & REPAIR</div></div></div>`;
        const emailFooter = `<div style="padding: 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e5e7eb;"><p style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0;">Belmobile.be</p><p style="font-size: 12px; color: #64748b; margin: 4px 0;">Rue Gallait 4, 1030 Schaerbeek, Brussels</p><p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">&copy; ${new Date().getFullYear()} Belmobile. All rights reserved.</p></div>`;

        const htmlContent = `
            <div style="${emailStyles}">
                ${emailHeader}
                <div style="padding: 30px; line-height: 1.6;">
                    <h2 style="color: #4338ca;">${t('email_buyback_repair_greeting', data.customerName)}</h2>
                    <p>${t('email_buyback_repair_thanks', data.type === 'buyback' ? t('Buyback') : t('Repair'))}</p>
                    <p>${t('email_buyback_repair_attachment')}</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://belmobile.be/${lang}/track-order?id=${readableId}&email=${encodeURIComponent(data.customerEmail)}" style="background-color: #4338ca; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            ${t('email_track_button')}
                        </a>
                    </div>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">${t('email_automatic_message')}</p>
                </div>
                ${emailFooter}
            </div>
        `;

        await sendEmail(data.customerEmail, t('email_buyback_repair_subject', data.type === 'buyback' ? t('Buyback') : t('Repair'), readableId), htmlContent, [{ filename: safeFileName, content: base64, encoding: 'base64' }]);
        await sendEmail('info@belmobile.be', `[ADMIN COPY] Order ${readableId}`, htmlContent, [{ filename: safeFileName, content: base64, encoding: 'base64' }]);
    },

    async generateAndSendPDF(readableId: string, data: any, lang: string, t: (key: string, ...args: (string | number)[]) => string, sendEmail: any) {
        await this.sendOrderConfirmationEmail(readableId, data, lang, t, sendEmail);
    },

    async saveLead(email: string, data: any, fullWizardState?: any) {
        return Sentry.startSpan({ name: "saveLead", op: "lead.save" }, async (span) => {
            if (!email || !email.includes('@')) return;
            try {
                const leadId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const now = new Date();
                const retentionDays = 30;
                const expiresAt = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);
                const magicLinkToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

                await setDoc(doc(db, 'leads', leadId), {
                    email: email.toLowerCase(),
                    ...data,
                    wizardState: fullWizardState || null,
                    updatedAt: serverTimestamp(),
                    createdAt: serverTimestamp(),
                    status: 'draft',
                    expiresAt: expiresAt.toISOString(),
                    isConverted: false,
                    magicLinkToken
                }, { merge: true });
            } catch (error) {
                console.error('Lead capture error:', error);
            }
        });
    },

    async markLeadAsConverted(email: string) {
        if (!email) return;
        try {
            const leadId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
            await updateDoc(doc(db, 'leads', leadId), {
                status: 'converted',
                isConverted: true,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.warn('Could not mark lead as converted', error);
        }
    },

    async getLeadByToken(token: string) {
        const { query, where, getDocs, limit } = await import('firebase/firestore');
        const q = query(collection(db, 'leads'), where('magicLinkToken', '==', token), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return null;
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    },

    async getOrderByToken(token: string) {
        const { query, where, getDocs, limit } = await import('firebase/firestore');
        const q = query(collection(db, 'quotes'), where('trackingToken', '==', token), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return null;
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
};
