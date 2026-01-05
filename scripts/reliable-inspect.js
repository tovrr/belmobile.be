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

async function run() {
    const col = 'repair_issues';
    console.log(`Checking collection: ${col}`);
    const snap = await db.collection(col).get();
    console.log(`Found ${snap.size} documents in ${col}`);
    snap.forEach(doc => {
        console.log(`Document ID: ${doc.id}`);
        console.log(`Data: ${JSON.stringify(doc.data())}`);
    });
}

run();
