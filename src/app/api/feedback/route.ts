import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { stars, shopId, orderId, comment, shopName } = await request.json();
        const apiKey = process.env.BREVO_API_KEY?.trim();

        console.log(`[Feedback API] Received feedback: ${stars} stars from ${shopName} (Order: ${orderId})`);

        // If stars are high, we technically don't need to do much since they were redirected,
        // but we might want to log it or save to DB later.
        if (stars >= 4) {
            return NextResponse.json({ success: true, message: 'Positive feedback acknowledged' });
        }

        // For negative feedback, send alert to support
        if (!apiKey) {
            console.error('[Feedback API] Missing BREVO_API_KEY');
            return NextResponse.json({ error: 'Config error' }, { status: 500 });
        }

        const htmlContent = `
            <h2>New Negative Feedback Alert ⚠️</h2>
            <p><strong>Rating:</strong> ${stars}/5 Stars</p>
            <p><strong>Shop:</strong> ${shopName || shopId}</p>
            <p><strong>Order ID:</strong> ${orderId || 'N/A'}</p>
            <p><strong>Customer Comment:</strong></p>
            <div style="padding: 15px; background: #f8f9fa; border-left: 4px solid #dc3545; font-style: italic;">
                "${comment}"
            </div>
            <br>
            <p>Please contact the customer to resolve their issue.</p>
        `;

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: "Belmobile Gating", email: "info@belmobile.be" },
                to: [{ email: "info@belmobile.be" }],
                subject: `⚠️ LOW RATING ALERT: ${stars} Stars for ${shopName || shopId}`,
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('[Feedback API] Brevo Error:', errorData);
            return NextResponse.json({ error: 'Failed to send alert' }, { status: 502 });
        }

        return NextResponse.json({ success: true, message: 'Feedback received and support notified' });
    } catch (error: any) {
        console.error('[Feedback API] Server Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
