
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

try {
    process.loadEnvFile('.env.local');
} catch (e) { }

const DEVICE_ID = 'apple-iphone-16-pro-max';

// --- INIT ---
const NEW_ADMIN_CONFIG = {
    projectId: "belmobile-firebase",
    clientEmail: "firebase-adminsdk-fbsvc@belmobile-firebase.iam.gserviceaccount.com",
    privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined,
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: NEW_ADMIN_CONFIG.projectId,
            clientEmail: NEW_ADMIN_CONFIG.clientEmail,
            privateKey: NEW_ADMIN_CONFIG.privateKey!,
        }),
    });
}
const db = getFirestore();

async function main() {
    console.log(`\n🔍 INSPECTING: ${DEVICE_ID}\n`);

    // 1. Check Anchor
    const anchorSnap = await db.collection('pricing_anchors').doc(DEVICE_ID).get();
    console.log("⚓ ANCHOR (pricing_anchors):", anchorSnap.exists ? anchorSnap.data() : "NOT FOUND");

    // 2. Check Market Value
    const marketSnap = await db.collection('market_values').doc(DEVICE_ID).get();
    console.log("\n📈 MARKET VALUE (market_values):", marketSnap.exists ? marketSnap.data() : "NOT FOUND");

    // 3. Check specific Buyback Docs
    console.log("\n💰 BUYBACK ENTRIES (buyback_pricing):");
    const snapshot = await db.collection('buyback_pricing').where('deviceId', '==', DEVICE_ID).get();

    if (snapshot.empty) {
        console.log("   (No documents found)");
    } else {
        snapshot.docs.forEach(doc => {
            console.log(`   - ID: ${doc.id} => Price: €${doc.data().price} | Storage: ${doc.data().storage}`);
        });
    }
}

main().catch(console.error);
