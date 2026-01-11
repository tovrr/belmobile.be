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

async function resetS25() {
    console.log('🧹 Wiping S25 Pricing Records...');

    const deviceId = 'samsung-galaxy-s25';
    const batch = db.batch();

    const snap = await db.collection('buyback_pricing').where('deviceId', '==', deviceId).get();

    if (snap.empty) {
        console.log('   No records to delete.');
        return;
    }

    snap.docs.forEach(doc => {
        console.log(`   🗑️ Deleting: ${doc.id} (€${doc.data().price})`);
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('✅ Wiped all S25 records. Ready for fresh Sync.');
}

resetS25();
