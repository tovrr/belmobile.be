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

async function checkCollections() {
    const targetCollections = ['repair_issues', 'metadata', 'repair_prices', 'services'];

    for (const col of targetCollections) {
        try {
            const snap = await db.collection(col).limit(5).get();
            console.log(`Collection: ${col} - Docs found: ${snap.size}`);
            if (snap.size > 0) {
                console.log(`Sample Doc ID: ${snap.docs[0].id}`);
                console.log(`Sample Data: ${JSON.stringify(snap.docs[0].data(), null, 2).slice(0, 500)}`);
            }
        } catch (e) {
            console.log(`Error checking ${col}: ${e.message}`);
        }
    }
}

checkCollections();
