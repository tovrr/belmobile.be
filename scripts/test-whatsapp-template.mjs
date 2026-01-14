import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

/**
 * TEST SCRIPT FOR WHATSAPP TEMPLATES
 * This helps verify that templates with parameters (recovery) work.
 */

const WHATSAPP_API_URL = 'http://localhost:3000/api/notifications/whatsapp'; // Assuming local dev is running

async function testTemplate() {
    console.log('--- WhatsApp Template Test ---');

    const testData = {
        to: '32484837560', // Omero's number
        template: 'hello_world', // Use standard Meta test template
        components: [],
        orderId: 'TEST-HELLO-002'
    };

    try {
        const response = await fetch(WHATSAPP_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        console.log('Result:', result);

        if (result.simulated) {
            console.log('⚠️ Simulation Mode Active (Check env vars)');
        } else if (result.success) {
            console.log('✅ WhatsApp Template Sent Successfully!');
        } else {
            console.error('❌ Failed:', result);
        }
    } catch (error) {
        console.error('Error during fetch:', error.message);
    }
}

testTemplate();
