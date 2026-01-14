import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const testPhone = process.argv[2]; // Get phone from command line

async function sendTest() {
    if (!token || !phoneId || !testPhone) {
        console.error('❌ Missing credentials or test phone number.');
        console.log('Usage: node scripts/test-whatsapp.mjs 32484xxxxxx');
        return;
    }

    const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;
    const payload = {
        messaging_product: "whatsapp",
        to: testPhone,
        type: "template",
        template: {
            name: "hello_world",
            language: { code: "en_US" }
        }
    };

    console.log(`🚀 Sending Hello World template to ${testPhone}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
            console.log('✅ Success! Message ID:', data.messages?.[0]?.id);
        } else {
            console.error('❌ Meta API Error:', data);
        }
    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
}

sendTest();
