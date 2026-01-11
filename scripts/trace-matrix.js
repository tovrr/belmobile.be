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

// ---------------------------------------------------------
// REPLICATE LOGIC EXACTLY (Because we can't import TS)
// ---------------------------------------------------------

const getCosmeticMultiplier = (screen, body) => {
    // 1. Screen Flawless
    if (screen === 'flawless') {
        if (body === 'flawless') return 1.0;
        if (body === 'scratches') return 0.8;
        if (body === 'dents') return 0.65;
        if (body === 'bent') return 0.40;
    }
    // 2. Screen Scratches
    if (screen === 'scratches') {
        if (body === 'flawless') return 0.75;
        if (body === 'scratches') return 0.65;
        if (body === 'dents') return 0.50;
        if (body === 'bent') return 0.30;
    }
    // 3. Screen Broken
    if (screen === 'cracked') {
        if (body === 'flawless') return 0.40;
        if (body === 'scratches') return 0.35;
        if (body === 'dents') return 0.25;
        if (body === 'bent') return 0.20;
    }
    return 0.25;
};

async function traceMatrix() {
    console.log('🕵️‍♂️ Tracing Cosmetic Matrix Logic...');

    const deviceId = 'samsung-galaxy-s25';
    const storage = '512GB';

    // FETCH DATA
    const snap = await db.collection('buyback_pricing').where('deviceId', '==', deviceId).get();
    const buybackPrices = [];
    snap.forEach(doc => buybackPrices.push(doc.data()));

    const baseRecord = buybackPrices.find(p => p.storage === storage && p.condition === 'like-new');
    if (!baseRecord) { console.log('❌ No Base Record Found'); return; }
    const basePrice = baseRecord.price;
    console.log(`💎 Base Price (Like-New): €${basePrice}`);

    // TEST CASES
    const cases = [
        { name: 'Pure Flawless', screen: 'flawless', body: 'flawless', works: true, unlocked: true },
        { name: 'Cosmetic Drop', screen: 'flawless', body: 'scratches', works: true, unlocked: true },
        { name: 'Functional Fail', screen: 'flawless', body: 'flawless', works: false, unlocked: true },
        { name: 'Simlock Fail', screen: 'flawless', body: 'flawless', works: true, unlocked: false },
    ];

    cases.forEach(c => {
        let final = basePrice;

        // Critical
        const isCritical = (c.unlocked === false); // Simplified for trace
        const isFunctional = (c.works === false);

        if (isCritical) {
            console.log(`[${c.name.padEnd(15)}] 🛑 CRITICAL (Simlock/Dead) -> 25%`);
            final = basePrice * 0.25;
        } else if (isFunctional) {
            console.log(`[${c.name.padEnd(15)}] ⚠️ FUNCTIONAL (Works=No) -> 60%`);
            final = basePrice * 0.60;
        } else {
            const mult = getCosmeticMultiplier(c.screen, c.body);
            console.log(`[${c.name.padEnd(15)}] ✨ MATRIX: ${c.screen}/${c.body} -> ${mult * 100}%`);
            final = basePrice * mult;
        }

        console.log(`   -> Price: €${Math.round(final)}`);
    });
}

traceMatrix();
