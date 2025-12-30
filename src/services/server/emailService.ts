import { BrevoEmailPayload } from '@/types/models';

/**
 * Server-side email service to send emails via Brevo API.
 * This helper avoids the "Failed to fetch" browser race condition by running on the server.
 */
export const serverEmailService = {
    async sendEmail(to: string, subject: string, html: string, attachments?: { name: string, content: string }[]) {
        const apiKey = process.env.BREVO_API_KEY?.trim();
        const senderEmail = process.env.SENDER_EMAIL || "info@belmobile.be";

        if (!apiKey) {
            console.error('[ServerEmailService] BREVO_API_KEY is missing');
            throw new Error('Email configuration error');
        }

        const body: BrevoEmailPayload = {
            sender: {
                name: "Belmobile.be",
                email: senderEmail
            },
            to: [{ email: to.trim().toLowerCase() }],
            subject: subject,
            htmlContent: html,
        };

        if (attachments && attachments.length > 0) {
            body.attachment = attachments.map(att => ({
                name: att.name,
                content: att.content // Base64 content
            }));
        }

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
            console.error('[ServerEmailService] Brevo Error:', {
                status: response.status,
                body: errorText
            });
            throw new Error(`Brevo failed: ${response.status}`);
        }

        return await response.json();
    }
};
