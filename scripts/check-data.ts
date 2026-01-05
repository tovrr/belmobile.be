import * as admin from 'firebase-admin';

async function check() {
    if (admin.apps.length === 0) {
        admin.initializeApp({
            projectId: 'belmobile-firebase',
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
