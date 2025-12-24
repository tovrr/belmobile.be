import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import crypto from 'crypto';

interface SendCloudPayload {
    action: string;
    parcel: {
        id: number;
        status: {
            id: number;
            message: string;
        };
        tracking_url: string;
        order_number: string;
    };
}

export async function POST(request: NextRequest) {
    try {
        const signature = request.headers.get('x-sendcloud-signature');
        const webhookSecret = process.env.SENDCLOUD_WEBHOOK_SECRET;
        let payload: SendCloudPayload;

        // Verify signature if secret is configured
        if (webhookSecret && signature) {
            const body = await request.text();
            const computedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('hex');

            if (computedSignature !== signature) {
                console.error('[WEBHOOK] Invalid signature from SendCloud');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
            payload = JSON.parse(body);
        } else if (webhookSecret && !signature) {
            console.error('[WEBHOOK] Missing signature while secret is configured');
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        } else {
            payload = await request.json();
        }

        const { parcel, action } = payload;

        if (action === 'parcel_status_changed' && parcel) {
            const { id: sendcloudParcelId, status, tracking_url, order_number } = parcel;

            if (order_number) {
                const docRef = doc(db, 'quotes', order_number);

                await updateDoc(docRef, {
                    shippingStatus: status.message,
                    trackingUrl: tracking_url,
                    sendcloudParcelId: sendcloudParcelId,
                    lastUpdate: new Date().toISOString()
                });

                return NextResponse.json({ message: 'Quote updated successfully' });
            }
        }

        return NextResponse.json({ message: 'Webhook received' });
    } catch (error) {
        console.error('Error processing SendCloud webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
