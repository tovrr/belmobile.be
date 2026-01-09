import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../firebase';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { serverEmailService } from '../../../../services/server/emailService';
import { getFixedT } from '../../../../utils/i18n-server';
import 'server-only';
import * as Sentry from "@sentry/nextjs";

export async function POST(req: NextRequest) {
    try {
        const { orderId, email, lang = 'fr' } = await req.json();

        if (!orderId || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const normalizedId = orderId.trim().toUpperCase();
        const normalizedEmail = email.trim().toLowerCase();
        const t = getFixedT(lang);

        // searchLogic same as client side basically, but server side
        let foundDoc = null;
        let collectionName = 'quotes';

        // 1. Try quotes
        const qQuotes = query(collection(db, 'quotes'), where('orderId', '==', normalizedId)); // exact match
        const snapQuotes = await getDocs(qQuotes);

        foundDoc = snapQuotes.docs.find(d => {
            const data = d.data();
            return (data.customerEmail || data.email || '').toLowerCase().trim() === normalizedEmail;
        });

        if (!foundDoc) {
            // 2. Try reservations
            const qRes = query(collection(db, 'reservations'), where('orderId', '==', normalizedId));
            const snapRes = await getDocs(qRes);
            foundDoc = snapRes.docs.find(d => {
                const data = d.data();
                return (data.customerEmail || data.email || '').toLowerCase().trim() === normalizedEmail;
            });
            if (foundDoc) collectionName = 'reservations';
        }

        if (!foundDoc) {
            // 3. Try ID match directly (if it's not custom orderId)
            // This is harder on server without multiple queries. 
            // Simplified: We enforce orderId match. If user uses internal doc ID, we might miss it unless we query efficiently.
            // For security, strict matching on Order ID (ORD-...) is preferred.
            return NextResponse.json({ error: 'Order not found or email does not match' }, { status: 404 });
        }

        const data = foundDoc.data();
        let trackingToken = data.trackingToken;

        // Verify or Generate Token
        if (!trackingToken) {
            const { randomBytes } = await import('crypto');
            trackingToken = randomBytes(32).toString('hex');

            await updateDoc(doc(db, collectionName, foundDoc.id), {
                trackingToken,
                trackingTokenCreatedAt: serverTimestamp()
            });
        }

        // Send Email
        const magicLink = `https://belmobile.be/${lang}/track-order?id=${normalizedId}&token=${trackingToken}`;

        const emailFooter = `<div style="padding: 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e5e7eb;"><p style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0;">Belmobile.be</p><p style="font-size: 12px; color: #64748b; margin: 4px 0;">Rue Gallait 4, 1030 Schaerbeek, Brussels</p><p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">&copy; ${new Date().getFullYear()} Belmobile. All rights reserved.</p></div>`;

        const htmlContent = `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="padding: 20px 0; border-bottom: 1px solid #eaeaea; margin-bottom: 24px; text-align: center;">
                     <h1 style="color: #4338ca;">Belmobile.be</h1>
                </div>
                <div style="padding: 30px; line-height: 1.6;">
                    <h2>${t('magic_link_title') || 'Access your Order'}</h2>
                    <p>${t('magic_link_description') || 'Click the button below to view your order details securely. This link is valid for this order only.'}</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${magicLink}" style="background-color: #4338ca; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            ${t('magic_link_button') || 'View Order'}
                        </a>
                    </div>
                </div>
                ${emailFooter}
            </div>
        `;

        await serverEmailService.sendEmail(
            normalizedEmail,
            t('magic_link_subject') || `Access Link for Order ${normalizedId}`,
            htmlContent
        );

        return NextResponse.json({ success: true, message: 'Magic link sent' });

    } catch (error) {
        console.error('Magic Link Error:', error);
        Sentry.captureException(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
