const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
// Logic is replicated below
// Since we can't import TS in JS script easily without compilation, we will replicate the logic snippet.

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

// Replicated Logic from pricingLogic.ts
const determineConditionTier = (params) => {
    if (params.turnsOn === false || params.isUnlocked === false) return 'damaged';
    if (params.worksCorrectly === false || params.faceIdWorking === false) return 'damaged';
    if (params.screenState === 'cracked' || params.bodyState === 'bent') return 'damaged';
    if (params.bodyState === 'dents') return 'fair';
    if (params.screenState === 'scratches') return 'fair';
    if (params.bodyState === 'scratches') return 'good';
    if (params.screenState === 'flawless' && params.bodyState === 'flawless') return 'like-new';
    return 'good';
};

async function traceUnlocked() {
    console.log('🕵️‍♂️ Tracing Simlocked (Unlocked=No) Logic for S25 512GB...');

    // Simulate Params
    const params = {
        storage: '512GB',
        isUnlocked: false, // USER SAYS NO
        turnsOn: true,
        worksCorrectly: true,
        screenState: 'flawless',
        bodyState: 'flawless'
    };

    // 1. Determine Tier
    const tier = determineConditionTier(params);
    console.log(`🤖 Logic says Tier should be: "${tier}"`);

    // 2. Fetch Pricing Records from DB
    const deviceId = 'samsung-galaxy-s25';
    const snap = await db.collection('buyback_pricing').where('deviceId', '==', deviceId).get();

    const relevantRecords = [];
    snap.forEach(doc => {
        const d = doc.data();
        relevantRecords.push(d);
    });

    // 3. Find Match
    const match = relevantRecords.find(p => p.storage === params.storage && p.condition === tier);

    if (match) {
        console.log(`✅ FOUND MATCH for ${tier}: €${match.price}`);
    } else {
        console.log(`❌ NO RECORD FOUND for ${tier}. Logic would return 0.`);
    }
}

traceUnlocked();
