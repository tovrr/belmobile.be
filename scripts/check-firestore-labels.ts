import * as admin from 'firebase-admin';
import { adminDb } from '../src/lib/firebase-admin';

async function checkCollections() {
    const db = adminDb;
    if (!db) {
        console.log("No DB access");
        return;
    }

    const targetCollections = ['repair_issues', 'metadata', 'repair_prices', 'services'];

    for (const col of targetCollections) {
        const snap = await db.collection(col).limit(5).get();
        console.log(`Collection: ${col} - Docs found: ${snap.size}`);
        if (snap.size > 0) {
            console.log(`Sample Doc ID: ${snap.docs[0].id}`);
            console.log(`Sample Data: ${JSON.stringify(snap.docs[0].data(), null, 2).slice(0, 500)}`);
        }
    }
}

checkCollections();
