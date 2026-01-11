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

async function purgeLegacy() {
    console.log('☢️ PURGING LEGACY PRICING RECORDS...');

    // Deleting records with old source signature
    const batchSize = 500;
    const collectionRef = db.collection('buyback_pricing');
    const query = collectionRef.where('source', '==', 'cascade-v3-multi-tier').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
    const batchSize = snapshot.size;
    if (batchSize === 0) {
        console.log('✅ Purge Complete. No more legacy records found.');
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    console.log(`   Deleted ${batchSize} legacy records...`);
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

purgeLegacy();
