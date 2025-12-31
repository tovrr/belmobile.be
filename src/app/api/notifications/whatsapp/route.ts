import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { to, message, orderId } = await request.json();

        // 1. Validation
        if (!to || !message) {
            return NextResponse.json({ error: 'Missing target phone or message' }, { status: 400 });
        }

        // 2. Meta Cloud API Configuration
        const accessToken = process.env.META_ACCESS_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const version = 'v22.0'; // Current Graph API Version

        // 3. Simulated / Production Dispatch
        console.log(`[WhatsApp API] Attempting to send to ${to} for Order ${orderId}`);

        if (!accessToken || !phoneNumberId) {
            console.warn('[WhatsApp API] Meta credentials missing. Running in MOCK mode.');
            return NextResponse.json({
                success: true,
                mock: true,
                message: 'WhatsApp simulated successfully (Add META_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID to activate)'
            });
        }

        // Meta Cloud API Dispatch
        const metaUrl = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

        // Clean user's phone number (Must be digits only)
        const cleanTo = to.replace(/\D/g, '');

        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanTo,
            type: "text",
            text: {
                preview_url: false,
                body: message
            }
        };

        const response = await fetch(metaUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('[WhatsApp API] Meta Error:', result);
            return NextResponse.json({ error: 'Meta Cloud API dispatch failed', details: result }, { status: response.status });
        }

        return NextResponse.json({ success: true, messageId: result.messages?.[0]?.id });

    } catch (error: any) {
        console.error('[WhatsApp API] Internal Error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
