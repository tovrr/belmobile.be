import { NextResponse } from 'next/server';
import { BrevoEmailPayload } from '@/types/models';

export async function POST(request: Request) {
    try {
        const { to, subject, html, attachments } = await request.json();
        const apiKey = process.env.BREVO_API_KEY?.trim();

        if (!to || !to.includes('@')) {
            console.error('Invalid recipient email:', to);
            return NextResponse.json({ error: 'Invalid recipient email' }, { status: 400 });
        }

        if (!apiKey) {
            console.error('BREVO_API_KEY is missing');
            return NextResponse.json({
                error: 'Mail server configuration error (API Key Missing)',
                details: 'Please check if BREVO_API_KEY is defined in .env.local'
            }, { status: 500 });
        }

        console.log(`[EmailAPI] Attempting to send email to: ${to} | Subject: ${subject}`);

        const senderEmail = process.env.SENDER_EMAIL || "info@belmobile.be";
        const body: BrevoEmailPayload = {
            sender: {
                name: "Belmobile.be",
                email: senderEmail
            },
            to: [{ email: to.trim().toLowerCase() }],
            subject: subject,
            htmlContent: html,
        };

        if (attachments && Array.isArray(attachments)) {
            console.log(`[EmailAPI] Processing ${attachments.length} attachment(s)`);
            body.attachment = attachments.map((att: any) => {
                const content = att.content;
                const size = content ? content.length : 0;
                console.log(`[EmailAPI] Attachment: ${att.filename || 'document.pdf'} Size: ${size} chars`);
                return {
                    name: att.filename || att.name || 'document.pdf',
                    content: content
                };
            });
        }

        console.log('[EmailAPI] Sending to Brevo...');

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[EmailAPI] Brevo rejected the request:', {
                status: response.status,
                body: errorText
            });
            return NextResponse.json({
                error: 'Brevo failed to send email',
                details: errorText,
                status: response.status
            }, { status: response.status });
        }

        const result = await response.json();
        console.log('Brevo API Success:', result);
        return NextResponse.json({ success: true, messageId: result.messageId });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in send-confirmation API:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
    }
}
