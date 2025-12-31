import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { to, message, orderId } = await request.json();

        // 1. Validation
        if (!to || !message) {
            return NextResponse.json({ error: 'Missing target phone or message' }, { status: 400 });
        }

        // 2. Twilio Configuration (Placeholder/infrastructure)
        // In production, these will be in .env.local
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox default

        // 3. Simulated / Production Dispatch
        console.log(`[WhatsApp API] Attempting to send to ${to} for Order ${orderId}`);

        if (!accountSid || !authToken) {
            console.warn('[WhatsApp API] Twilio credentials missing. Running in MOCK mode.');
            // We return success to the caller so the "Eyes and Ears" flow continues, 
            // but we log that it was just a simulation.
            return NextResponse.json({
                success: true,
                mock: true,
                message: 'WhatsApp simulated successfully (Add credentials to activate real dispatch)'
            });
        }

        // Real Twilio Dispatch logic
        // Using basic auth for Twilio REST API
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        const params = new URLSearchParams();
        params.append('To', `whatsapp:${to}`);
        params.append('From', fromNumber);
        params.append('Body', message);

        const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('[WhatsApp API] Twilio Error:', result);
            return NextResponse.json({ error: 'Twilio dispatch failed', details: result }, { status: response.status });
        }

        return NextResponse.json({ success: true, messageId: result.sid });

    } catch (error: any) {
        console.error('[WhatsApp API] Internal Error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
