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

async function checkPrices() {
    console.log('🔍 Checking S25 Pricing Records...');
    const deviceId = 'samsung-galaxy-s25';
    const snap = await db.collection('buyback_pricing').where('deviceId', '==', deviceId).get();

    snap.docs.forEach(doc => {
        const d = doc.data();
        console.log(`Paper: ${d.condition.padEnd(10)} | Storage: ${d.storage} | Price: €${d.price}`);
    });
}

checkPrices();
