import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { to, subject, html, attachments } = await request.json();
        const apiKey = process.env.BREVO_API_KEY?.trim();

        if (!apiKey) {
            console.error('BREVO_API_KEY is missing');
            return NextResponse.json({ error: 'Mail server configuration error' }, { status: 500 });
        }

        console.log('Sending email to:', to);

        interface BrevoEmailBody {
            sender: { name: string; email: string };
            to: { email: string }[];
            subject: string;
            htmlContent: string;
            attachment?: { name: string; content: string }[];
        }

        const body: BrevoEmailBody = {
            sender: {
                name: "Belmobile.be",
                email: "info@belmobile.be"
            },
            to: [{ email: to.trim().toLowerCase() }],
            subject: subject,
            htmlContent: html,
        };

        if (attachments && attachments.length > 0) {
            body.attachment = attachments.map((att: { filename: string; content: string }) => ({
                name: att.filename,
                content: att.content
            }));
        }

        console.log('Brevo API Request Body (sanitized):', { ...body, htmlContent: '...' });

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
            console.error('Brevo API error response:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            return NextResponse.json({
                error: 'Failed to send email',
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
