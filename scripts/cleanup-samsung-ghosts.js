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

// SOURCE OF TRUTH (Comprehensive from src/data/models/samsung.ts)
const VALID_SPECS = {
    // S Series
    'samsung-galaxy-s25-ultra': ['256GB', '512GB', '1TB'],
    'samsung-galaxy-s25-plus': ['256GB', '512GB'],
    'samsung-galaxy-s25': ['128GB', '256GB', '512GB'],
    'samsung-galaxy-s25-fe': ['128GB', '256GB'],
    'samsung-galaxy-s25-edge': ['256GB', '512GB'],

    'samsung-galaxy-s24-ultra': ['256GB', '512GB', '1TB'],
    'samsung-galaxy-s24-plus': ['256GB', '512GB'],
    'samsung-galaxy-s24': ['128GB', '256GB'],
    'samsung-galaxy-s24-fe': ['128GB', '256GB'],

    'samsung-galaxy-s23-ultra': ['256GB', '512GB', '1TB'],
    'samsung-galaxy-s23-plus': ['256GB', '512GB'],
    'samsung-galaxy-s23': ['128GB', '256GB'],
    'samsung-galaxy-s23-fe': ['128GB', '256GB'],

    'samsung-galaxy-s22-ultra': ['128GB', '256GB', '512GB', '1TB'],
    'samsung-galaxy-s22-plus': ['128GB', '256GB'],
    'samsung-galaxy-s22': ['128GB', '256GB'],

    'samsung-galaxy-s21-ultra': ['128GB', '256GB', '512GB'],
    'samsung-galaxy-s21-plus': ['128GB', '256GB'],
    'samsung-galaxy-s21': ['128GB', '256GB'],
    'samsung-galaxy-s21-fe': ['128GB', '256GB'],

    'samsung-galaxy-s20-ultra': ['128GB', '512GB'],
    'samsung-galaxy-s20-plus': ['128GB', '512GB'],
    'samsung-galaxy-s20': ['128GB'],
    'samsung-galaxy-s20-fe': ['128GB', '256GB'],

    'samsung-galaxy-s10-plus': ['128GB', '512GB', '1TB'],
    'samsung-galaxy-s10': ['128GB', '512GB'],
    'samsung-galaxy-s10-lite': ['128GB', '512GB'],
    'samsung-galaxy-s10e': ['128GB', '256GB'],

    // Z Series
    'samsung-galaxy-z-fold7': ['256GB', '512GB', '1TB'], 'samsung-galaxy-z-flip7': ['256GB', '512GB'], 'samsung-galaxy-z-flip7-fe': ['256GB', '512GB'],
    'samsung-galaxy-z-fold6': ['256GB', '512GB', '1TB'], 'samsung-galaxy-z-flip6': ['256GB', '512GB'],
    'samsung-galaxy-z-fold5': ['256GB', '512GB', '1TB'], 'samsung-galaxy-z-flip5': ['256GB', '512GB'],
    'samsung-galaxy-z-fold4': ['256GB', '512GB', '1TB'], 'samsung-galaxy-z-flip4': ['128GB', '256GB', '512GB'],
    'samsung-galaxy-z-fold3': ['256GB', '512GB'], 'samsung-galaxy-z-flip3': ['128GB', '256GB'],

    // Note Series
    'samsung-galaxy-note-20-ultra': ['256GB', '512GB'], 'samsung-galaxy-note-20': ['256GB'],
    'samsung-galaxy-note-10-plus': ['256GB', '512GB'], 'samsung-galaxy-note-10': ['256GB'], 'samsung-galaxy-note-10-lite': ['128GB'],

    // A Series (Selected)
    'samsung-galaxy-a56': ['128GB', '256GB'], 'samsung-galaxy-a55': ['128GB', '256GB'],
    'samsung-galaxy-a54': ['128GB', '256GB'], 'samsung-galaxy-a53': ['128GB', '256GB'],
    'samsung-galaxy-a36': ['128GB', '256GB'], 'samsung-galaxy-a35': ['128GB', '256GB'],
    'samsung-galaxy-a16': ['128GB', '256GB'], 'samsung-galaxy-a15': ['128GB', '256GB'],
};

async function cleanupGhosts() {
    console.log('👻 Starting Ghost Storage Cleanup for Samsung (All Series)...');

    // Process each defined model
    for (const [slug, validStorages] of Object.entries(VALID_SPECS)) {
        // console.log(`🔍 Checking ${slug}...`); // Reduce noise

        const snap = await db.collection('buyback_pricing')
            .where('deviceId', '==', slug)
            .get();

        if (snap.empty) continue;

        const batch = db.batch();
        let deleteCount = 0;

        snap.docs.forEach(doc => {
            const data = doc.data();
            // Check if storage is valid
            if (!validStorages.includes(data.storage)) {
                console.log(`   ❌ FOUND GHOST for ${slug}: ${data.storage} (Doc: ${doc.id}) - Deleting...`);
                batch.delete(doc.ref);
                deleteCount++;
            }
        });

        if (deleteCount > 0) {
            await batch.commit();
            console.log(`   ✅ Deleted ${deleteCount} ghosts for ${slug}.`);
        }
    }

    console.log('\n🎉 Cleanup Complete for All Series.');
}

cleanupGhosts();
