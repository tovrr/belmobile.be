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
        console.log(`[WhatsApp API] Request: To=${to}, Message=${message?.substring(0, 30)}...`);

        if (!accessToken || !phoneNumberId || accessToken === 'YOUR_META_ACCESS_TOKEN') {
            const reason = !accessToken ? 'Missing META_ACCESS_TOKEN' :
                !phoneNumberId ? 'Missing WHATSAPP_PHONE_NUMBER_ID' :
                    'Default placeholder token detected';

            console.warn(`[WhatsApp API] Simulation Mode: ${reason}`);
            return NextResponse.json({
                success: true,
                simulated: true,
                reason,
                message: 'WhatsApp automated notification was simulated. To activate, please add valid Meta credentials to Vercel Environment Variables.'
            });
        }

        // Meta Cloud API Dispatch
        const metaUrl = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

        // Clean user's phone number
        // Meta requires: [country code][number] e.g. 32484... for Belgium
        let cleanTo = to.replace(/\D/g, '');

        // Auto-fix common Belgian input if prefix is missing
        if (cleanTo.startsWith('04') && cleanTo.length === 10) {
            cleanTo = '32' + cleanTo.substring(1);
        } else if (cleanTo.startsWith('4') && cleanTo.length === 9) {
            cleanTo = '32' + cleanTo;
        }

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

        console.log(`[WhatsApp API] Dispatching to Meta Graph API: ${metaUrl} for ${cleanTo}`);

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
            console.error('[WhatsApp API] Meta API Error Response:', JSON.stringify(result, null, 2));
            return NextResponse.json({
                error: 'Meta Cloud API rejected the request',
                status: response.status,
                metaResponse: result
            }, { status: response.status });
        }

        console.log(`[WhatsApp API] Success! Message ID: ${result.messages?.[0]?.id}`);
        return NextResponse.json({
            success: true,
            messageId: result.messages?.[0]?.id,
            to: cleanTo
        });

    } catch (error: any) {
        console.error('[WhatsApp API] Internal Error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
