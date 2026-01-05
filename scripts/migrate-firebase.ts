import { initializeApp as initializeClientApp } from 'firebase/app';
import { getFirestore as getClientFirestore, collection, getDocs } from 'firebase/firestore';
import * as admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

/**
 * 🛠️ FIREBASE PUBLIC-TO-ADMIN MIGRATION SCRIPT
 * This script READS from the old project using a Public API Key (no private key needed)
 * and WRITES to the new project using an Admin Key.
 */

// --- SOURCE: OLD PROJECT (Public Config from your .env.local) ---
const OLD_PUBLIC_CONFIG = {
    apiKey: "AIzaSyB-tTI2c7vVRjTcT-dP343kJVmXrWEKg04",
    projectId: "bemobile-be-live",
    databaseId: "belmobile-database"
};

// --- DESTINATION: NEW PROJECT (Admin Config from your JSON file) ---
const NEW_ADMIN_CONFIG = {
    projectId: "belmobile-firebase",
    clientEmail: "firebase-adminsdk-fbsvc@belmobile-firebase.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHsHG4tNZ+wPRr\nxTE3ljX1kuH6V8KokHVeE92hjeuuK4c91o2++rCtNDHjj5jhBXEun/giwCnFwyyg\nM4EqKSM6c/7tCu1mzdR4Nxe0ms5dKzwm8vZ1az73TAogMGZr47enn99xDM2tk2Rf\nstlUzZwcDQbiOL2fA5aYO726AWQKqWQbDw6CQp5So2enLCOkl65CGrm/BaH0NcRZ\nkhUOgGOB09n9s4ZzsJ2i7aEWDdifGBcFGUqlnZ9m7733mOXK43WjSz+QLC6xqjAC\nc3U+3THUJNBIFEYyAUUa6A1dN6O9IOEO+ywLFohwJc+4e2EHDBGHB11805Inp/BN\nT3rHOSW9AgMBAAECggEAEITmq3Z+RgcVUTMDYstQ1GtduVV4O3ST2QAAtiQk6ogc\nTH/KwxE++10VgXM4HOlT1x0RrGJEMmF2eBw6o6+6g9Pjs11TjU0atgUst1qVFr0E\nYV55B/aiw1dtgQMv/d3dLAc8N0BtZV4LkCUd+Hd34hQrzRwPh6+Gzjom9FO4IG+E\neIe+f8c5OoSyKQOSA0jSW9zSqhU3EwS1spugn9GZ7XWajfh66IPp3bJ+g569dUys\nm2E8z/hBRU5bfezQK21Qx57Pf3uECakZBgsXPW5lLgCtfeItS9hJgIQnqfXa+p9O\ntlXRKAs9EERLr+UHkNV8/p4pysa2IE+b7U5dXNpWsQKBgQDlVHfBDmQc9vAPQxan\nQjVczJwM2I6jJtl0Z/YmXO3P0FrAC/+Z27OZkIzFU6M4iqOG2qdqdtwADW5HUi3C\nllzplWLVocD152VFNq5TVg3V4S6c/TC0TLJouR56yaiifA+2r9+aYwC6SAXndPm4\nP32Z3/vLJty8AOvyzH4+HSTNKQKBgQDe6YXysiQbPB1GCUsyWeRyt2GEIXid8bTE\ng3RaAJVmAXAI2OMsRPAVWU751TKknHDia2D8VtepnfG2qY81a6epZ3qTbGA+C/f2\n5q4BU7VWByGSV6FWEVYRralcRMWqCn3TPra7eda3EPJRshWHWsi4etEYOrHgj+eJ\n9hi4G/aSdQKBgQC9zXAj72Y6dsJuz0bTfb+uo4XQN/et3ryBVH3seGM26SoC4qtU\nyvpVccaglr1zUYNQXG3NdrxUqskH7GMFNu+FP+eCCpMqsq4lX8FeJc3jo7Cxq/gA\nca4DcJtiYr7YZDeZKuy02ZXDl1KTo0P/E0U/8ppyJCLy0wx1cnxVqkdIKQKBgHmc\nWTFgsoYRM79Dzrx3gkR7ez4ErLMubHpRZSa87sSpwB9zg+xg58Id6RIvl+NqXcOI\n5W6FSj8FJhuLQc/ZHa00ARFwrMjs6qjOjNu4eVOnrE8Uc7Zq2tPmNGFcO6Ja+u5G\nZpa9D8DsA+dCCrC/fIX4qx5W1zg2ChGgKzg2OT0JAoGAMyPMLdHY2Im9Xz6G8vbI\nbw3NPQB1xef+matYaiw2YN9ftFfkEYIGtalxUW5o/8h24tDhjhabH7AjpvytWiRh\ncKB9aQp2+SFh7oZIgzeWH/1XnXqBWFHidr0EV15lcUIr1YbzD4Aq095hjz4oKkvp\nZ2AjnuUrCKD2Kqa2jlZJ/gI=\n-----END PRIVATE KEY-----\n", // The JSON one!
    databaseId: "(default)"
};

async function migrate() {
    console.log("🚀 Starting Migration (Public Read -> Admin Write)...");

    // 1. Initialize Old Project (Public)
    const oldApp = initializeClientApp({
        apiKey: OLD_PUBLIC_CONFIG.apiKey,
        projectId: OLD_PUBLIC_CONFIG.projectId,
    }, 'old-project-public');

    const sourceDb = getClientFirestore(oldApp, OLD_PUBLIC_CONFIG.databaseId);

    // 2. Initialize New Project (Admin)
    const newApp = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: NEW_ADMIN_CONFIG.projectId,
            clientEmail: NEW_ADMIN_CONFIG.clientEmail,
            privateKey: NEW_ADMIN_CONFIG.privateKey.replace(/\\n/g, '\n'),
        }),
    }, 'new-project-admin');

    const destinationDb = getAdminFirestore(newApp);

    const collectionsToMigrate = [
        'repair_prices',
        'market_values',
        'shops',
        'blog_posts',
        'products',
        'buyback_pricing',
        'services',
        'faq_categories',
        'settings'
    ];

    for (const colName of collectionsToMigrate) {
        console.log(`📦 Fetching ${colName} from old project...`);

        try {
            const querySnapshot = await getDocs(collection(sourceDb, colName));
            console.log(`  - Found ${querySnapshot.size} documents.`);

            if (querySnapshot.size === 0) continue;

            const batch = destinationDb.batch();
            let count = 0;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const docRef = destinationDb.collection(colName).doc(doc.id);
                batch.set(docRef, data);
                count++;
            });

            await batch.commit();
            console.log(`  ✅ Successfully moved ${count} docs to the new project.`);
        } catch (error) {
            console.error(`  ❌ Error:`, error);
        }
    }

    console.log("\n🏁 Migration Finished!");
    process.exit(0);
}

migrate();
