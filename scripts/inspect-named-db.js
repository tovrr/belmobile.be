const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
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

const app = admin.app();
const db = getFirestore(app, 'belmobile-database');

async function inspectData() {
    const collections = ['repair_issues', 'metadata', 'repair_prices', 'services'];
    for (const col of collections) {
        try {
            const snap = await db.collection(col).limit(5).get();
            console.log(`Collection: ${col} | Count: ${snap.size}`);
            if (snap.size > 0) {
                snap.docs.forEach(doc => {
                    console.log(`Doc: ${doc.id} | Data: ${JSON.stringify(doc.data()).slice(0, 200)}`);
                });
            }
        } catch (e) {
            console.log(`Error ${col}: ${e.message}`);
        }
    }
}

inspectData();
