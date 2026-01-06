
import dotenv from 'dotenv';
import path from 'path';
import { serverEmailService } from '../src/services/server/emailService';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyBrevo() {
    console.log('🔍 Checking Brevo Configuration...');

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.error('❌ BREVO_API_KEY is missing in .env.local');
        process.exit(1);
    }
    console.log('✅ BREVO_API_KEY found');

    const senderEmail = process.env.SENDER_EMAIL || "info@belmobile.be";
    console.log(`📧 Sender Email: ${senderEmail}`);

    // Optional: Send a test email if an argument is provided
    const testEmail = process.argv[2];
    if (testEmail) {
        console.log(`📨 Sending test email to ${testEmail}...`);
        try {
            await serverEmailService.sendEmail(
                testEmail,
                'Brevo Test - Belmobile',
                '<h1>It Works!</h1><p>Your Brevo integration is correctly configured.</p>'
            );
            console.log('✅ Test email sent successfully!');
        } catch (error) {
            console.error('❌ Failed to send test email:', error);
        }
    } else {
        console.log('ℹ️  To send a test email, run: npx tsx scripts/check-brevo.ts your@email.com');
    }
}

verifyBrevo().catch(console.error);
