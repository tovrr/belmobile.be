import { NextResponse } from 'next/server';
import { generateReviewEmailHtml } from '@/utils/emailTemplates';
import { SHOPS } from '@/constants';

export async function POST(request: Request) {
    try {
        const { email, name, orderId, shopId, language } = await request.json();
        const apiKey = process.env.BREVO_API_KEY?.trim();

        if (!apiKey) {
            return NextResponse.json({ error: 'Config error' }, { status: 500 });
        }

        // Validate Shop
        const shop = SHOPS.find(s => s.id === shopId);
        const shopName = shop ? shop.name : shopId;

        // Generate Content
        const { subject, htmlContent } = generateReviewEmailHtml(
            language || 'en',
            name || 'Customer',
            shopId,
            orderId,
            shopName
        );

        // Calculate trigger time: NOW + 3 Days
        // NOTE: For testing, you might want 3 minutes.
        // We'll use 3 days by default, or accept a 'delaySeconds' for testing.
        const delayMs = 3 * 24 * 60 * 60 * 1000; // 3 Days
        const scheduledAt = new Date(Date.now() + delayMs).toISOString();

        console.log(`[Review Trigger] Scheduling email for ${email} at ${scheduledAt} (Order: ${orderId})`);

        const body = {
            sender: { name: "Belmobile.be", email: "info@belmobile.be" },
            to: [{ email: email, name: name }],
            subject: subject,
            htmlContent: htmlContent,
            scheduledAt: scheduledAt
        };

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
            console.error('[Review Trigger] Brevo Error:', errorText);
            return NextResponse.json({ error: 'Failed to schedule email', details: errorText }, { status: 502 });
        }

        const result = await response.json();
        return NextResponse.json({ success: true, messageId: result.messageId, scheduledAt });

    } catch (error: unknown) {
        console.error('[Review Trigger] Server Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
