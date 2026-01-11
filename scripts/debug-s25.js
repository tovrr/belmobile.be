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

async function inspectS25() {
    console.log('🔍 Inspecting S25 Pricing Records...');

    // Check multiple potential IDs
    const ids = ['samsung-galaxy-s25', 'galaxy-s25', 'samsung-s25'];

    for (const id of ids) {
        console.log(`\n📂 Checking DeviceID: "${id}"`);
        const snap = await db.collection('buyback_pricing').where('deviceId', '==', id).get();
        if (snap.empty) {
            console.log('   (No records found)');
        } else {
            snap.docs.forEach(doc => {
                const d = doc.data();
                console.log(`   📄 [${doc.id}] Storage: ${d.storage} | Condition: ${d.condition} | Price: €${d.price} | ManagedBy: ${d.managedBy}`);
            });
        }
    }

    console.log('\n--- Checking Pricing Anchors ---');
    for (const id of ids) {
        const doc = await db.collection('pricing_anchors').doc(id).get();
        if (doc.exists) {
            const d = doc.data();
            console.log(`⚓ [${id}] Anchor: €${d.anchorPriceEur} | Base: €${d.basePriceEur}`);
        }
    }
}

inspectS25();
