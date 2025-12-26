import { db, storage as firebaseStorage } from '../firebase';
import { collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { REPAIR_ISSUES } from '../constants';

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
    condition: any;
    issues: string[] | null;
    deliveryMethod: string | null;
    iban?: string | null;
    idFile?: File | null;
    servicePoint?: any | null;
    language: string;
    storage?: string;
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
            }
        }

        const firestoreData = {
            ...orderData,
            idUrl,
            shippingLabelUrl,
            trackingNumber,
            createdAt: serverTimestamp(),
            status: 'new',
            date: new Date().toISOString().split('T')[0],
        };
        delete (firestoreData as any).idFile;

        const docRef = await addDoc(collection(db, 'quotes'), firestoreData);
        const readableId = `ORD-${new Date().getFullYear()}-${docRef.id.substring(0, 6).toUpperCase()}`;
        await updateDoc(docRef, { orderId: readableId });

        return { docId: docRef.id, readableId, firestoreData };
    },

    async generateAndSendPDF(readableId: string, data: any, lang: string, t: (key: string, ...args: (string | number)[]) => string, sendEmail: any) {
        const { generateRepairBuybackPDF, savePDFBlob } = await import('../utils/pdfGenerator');

        const pdfInput = {
            type: data.type,
            orderId: readableId,
            date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-BE' : lang === 'nl' ? 'nl-BE' : 'en-US'),
            customer: {
                name: data.customerName,
                email: data.customerEmail,
                phone: data.customerPhone,
                address: (data.deliveryMethod === 'send' || data.deliveryMethod === 'courier') ? `${data.customerAddress}, ${data.customerZip} ${data.customerCity}` : undefined
            },
            device: {
                name: `${data.brand} ${data.model}`,
                storage: data.storage || undefined,
                issue: data.type === 'repair' ? (data.issues || []).map((i: string) => t(REPAIR_ISSUES.find(iss => iss.id === i)?.label || i)).join(', ') : undefined,
                condition: data.type === 'buyback' ? `${t('Screen')}: ${t(data.condition?.screen)}, ${t('Body')}: ${t(data.condition?.body)}` : undefined
            },
            value: data.type === 'buyback' ? data.price : undefined,
            cost: data.type === 'repair' ? data.price : undefined,
            deliveryMethod: data.deliveryMethod,
            iban: data.iban,
            trackingUrl: `https://belmobile.be/${lang}/track-order?id=${readableId}&email=${encodeURIComponent(data.customerEmail)}`
        };

        const { pdfBase64, safeFileName, blob } = await generateRepairBuybackPDF(pdfInput, t);
        if (blob) savePDFBlob(blob, safeFileName);

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

        await sendEmail(data.customerEmail, t('email_buyback_repair_subject', data.type === 'buyback' ? t('Buyback') : t('Repair'), readableId), htmlContent, [{ filename: safeFileName, content: pdfBase64, encoding: 'base64' }]);
        await sendEmail('info@belmobile.be', `[ADMIN COPY] Order ${readableId}`, htmlContent, [{ filename: safeFileName, content: pdfBase64, encoding: 'base64' }]);
    }
};
