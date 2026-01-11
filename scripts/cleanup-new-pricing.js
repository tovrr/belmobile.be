const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase credentials in .env.local');
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
}

const db = admin.firestore();

async function purgeNewCondition() {
    console.log('🔍 Scanning for "new" condition records in buyback_pricing...');

    // Safety Limit: Get 500 at a time
    const snapshot = await db.collection('buyback_pricing')
        .where('condition', '==', 'new')
        .limit(500)
        .get();

    if (snapshot.empty) {
        console.log('✅ No records found with condition="new".');
        return;
    }

    console.log(`⚠️ Found ${snapshot.size} records to delete.`);

    // Batch Delete
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🗑️ Successfully deleted ${snapshot.size} records.`);

    // Recursion check (if more exist)
    if (snapshot.size === 500) {
        console.log('🔄 Checking for more...');
        await purgeNewCondition();
    } else {
        console.log('🎉 Cleanup complete!');
    }
}

purgeNewCondition();
