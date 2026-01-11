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

async function forcePrice() {
    console.log('🚀 Forcing S25 Price to 365...');

    // Target specific doc: 512GB Like-New
    // ID format: slug_storage_condition
    const docId = 'samsung-galaxy-s25_512GB_like-new';

    await db.collection('buyback_pricing').doc(docId).set({
        deviceId: 'samsung-galaxy-s25',
        storage: '512GB',
        condition: 'like-new',
        price: 365,
        updatedAt: new Date().toISOString(),
        managedBy: 'FORCE_SCRIPT'
    }, { merge: true });

    console.log('✅ S25 Price Set to 365€.');
}

forcePrice();
