import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

export async function POST(request: Request) {
    try {
        const { to, message, template, components, languageCode, orderId } = await request.json();

        // 1. Validation
        if (!to || (!message && !template)) {
            return NextResponse.json({ error: 'Missing target phone and either message or template' }, { status: 400 });
        }

        // 2. Meta Cloud API Configuration
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const version = 'v22.0'; // Current Graph API Version

        // 3. Simulated / Production Dispatch
        logger.info(`[WhatsApp API] Request start`, { action: 'whatsapp_api_start', to, orderId, useTemplate: !!template });

        if (!accessToken || !phoneNumberId || accessToken === 'YOUR_META_ACCESS_TOKEN' || accessToken.startsWith('EAAB')) {
            // AEGIS: Robust detection of placeholder or temporary tokens
            const isPlaceholder = !accessToken || accessToken === 'YOUR_META_ACCESS_TOKEN' || accessToken.includes('PLACEHOLDER');

            if (isPlaceholder || !phoneNumberId) {
                const reason = !accessToken ? 'Missing WHATSAPP_ACCESS_TOKEN' :
                    !phoneNumberId ? 'Missing WHATSAPP_PHONE_NUMBER_ID' :
                        'Default placeholder token detected';

                logger.warn(`[WhatsApp API] Simulation Mode`, { reason, orderId });
                return NextResponse.json({
                    success: true,
                    simulated: true,
                    reason,
                    message: 'WhatsApp automated notification was simulated. To activate, please add valid Meta credentials to Vercel Environment Variables.'
                });
            }
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

        let payload: any = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanTo,
        };

        if (template) {
            payload.type = "template";
            payload.template = {
                name: template,
                language: { code: languageCode || (template === 'hello_world' ? 'en_US' : 'fr') },
                components: components || []
            };
        } else {
            payload.type = "text";
            payload.text = {
                preview_url: false,
                body: message
            };
        }

        logger.info(`[WhatsApp API] Dispatching to Meta Graph API`, {
            action: 'whatsapp_api_dispatch',
            metaUrl,
            to: cleanTo,
            orderId,
            type: payload.type,
            templateName: template
        });

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
            logger.error('[WhatsApp API] Meta API Error Response', { action: 'whatsapp_api_error', result, orderId });
            return NextResponse.json({
                error: 'Meta Cloud API rejected the request',
                status: response.status,
                metaResponse: result
            }, { status: response.status });
        }

        logger.info(`[WhatsApp API] Success`, { action: 'whatsapp_api_success', messageId: result.messages?.[0]?.id, orderId });
        return NextResponse.json({
            success: true,
            messageId: result.messages?.[0]?.id,
            to: cleanTo
        });

    } catch (error: any) {
        logger.error('[WhatsApp API] Internal Error', { action: 'whatsapp_api_internal_error' }, error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
