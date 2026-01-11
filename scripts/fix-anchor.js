const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
}

const db = admin.firestore();

async function fixAnchor() {
    console.log('🛠️ Force-Fixing S25 Anchor...');

    // Explicitly update both fields to 365
    const id = 'samsung-galaxy-s25';

    try {
        await db.collection('pricing_anchors').doc(id).update({
            anchorPriceEur: 365,
            basePriceEur: 365,
            lastUpdated: new Date().toISOString()
        });
        console.log(`✅ Anchor for ${id} corrected to 365€.`);
    } catch (e) {
        console.error("Error:", e);
    }
}

fixAnchor();
