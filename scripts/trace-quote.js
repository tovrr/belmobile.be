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

async function traceQuote() {
    console.log('🕵️‍♂️ Tracing Quote for S25 (512GB, Like New)...');
    const deviceId = 'samsung-galaxy-s25';
    const params = { storage: '512GB', condition: 'like-new' };

    // 1. Fetch Anchor
    const anchorSnap = await db.collection('pricing_anchors').doc(deviceId).get();
    const anchor = anchorSnap.exists ? anchorSnap.data() : null;
    console.log('⚓ Anchor Data:', anchor ? { anchorPrice: anchor.anchorPriceEur, basePrice: anchor.basePriceEur } : 'NOT FOUND');

    // 2. Fetch Buyback Pricing
    const pricingSnap = await db.collection('buyback_pricing').where('deviceId', '==', deviceId).get();
    console.log(`📚 Found ${pricingSnap.size} Pricing Records.`);

    const relevantRecords = [];
    pricingSnap.forEach(doc => {
        const d = doc.data();
        if (d.storage === params.storage && d.condition === params.condition) {
            relevantRecords.push(d);
        }
    });

    console.log('🎯 Relevant Records (Match 512GB + like-new):', relevantRecords);

    if (relevantRecords.length > 0) {
        console.log(`✅ EXACT MATCH FOUND: €${relevantRecords[0].price}`);
    } else {
        console.log('❌ NO EXACT MATCH. Simulating Fallback Logic...');
        // Simulate fallback (simplified)
        // If anchor exists, use anchor?
        if (anchor && anchor.anchorPriceEur) {
            console.log(`⚠️ Fallback to Anchor Price: €${anchor.anchorPriceEur}`);
        }
    }
}

traceQuote();
