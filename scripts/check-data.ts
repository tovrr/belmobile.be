import * as admin from 'firebase-admin';

try {
    process.loadEnvFile('.env.local');
} catch (e) { }

async function check() {
    if (admin.apps.length === 0) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        if (!privateKey) {
            console.error('FIREBASE_PRIVATE_KEY not found in env');
            process.exit(1);
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: 'belmobile-firebase',
                clientEmail: "firebase-adminsdk-fbsvc@belmobile-firebase.iam.gserviceaccount.com",
                privateKey: privateKey,
            }),
        });
    }

    const db = admin.firestore();
    const buybackCount = (await db.collection('buyback_pricing').count().get()).data().count;
    const repairCount = (await db.collection('repair_prices').count().get()).data().count;
    const marketCount = (await db.collection('market_values').count().get()).data().count;

    console.log(`Summary of new project:`);
    console.log(`- buyback_pricing: ${buybackCount} docs`);
    console.log(`- repair_prices: ${repairCount} docs`);
    console.log(`- market_values: ${marketCount} docs`);
}

check();
