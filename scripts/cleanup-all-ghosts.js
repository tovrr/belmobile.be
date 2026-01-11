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

// --- DATA DEFINITIONS (Copied from src/data/models/*.ts) ---

const SAMSUNG_SPECS = {
    // S Series
    'Galaxy S25 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S25+': ['256GB', '512GB'], 'Galaxy S25': ['128GB', '256GB', '512GB'], 'Galaxy S25 FE': ['128GB', '256GB'],
    'Galaxy S24 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S24+': ['256GB', '512GB'], 'Galaxy S24': ['128GB', '256GB'], 'Galaxy S24 FE': ['128GB', '256GB'],
    'Galaxy S23 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S23+': ['256GB', '512GB'], 'Galaxy S23': ['128GB', '256GB'], 'Galaxy S23 FE': ['128GB', '256GB'],
    'Galaxy S22 Ultra': ['128GB', '256GB', '512GB', '1TB'], 'Galaxy S22+': ['128GB', '256GB'], 'Galaxy S22': ['128GB', '256GB'],
    'Galaxy S21 Ultra': ['128GB', '256GB', '512GB'], 'Galaxy S21+': ['128GB', '256GB'], 'Galaxy S21': ['128GB', '256GB'], 'Galaxy S21 FE': ['128GB', '256GB'],
    'Galaxy S20 Ultra': ['128GB', '512GB'], 'Galaxy S20+': ['128GB', '512GB'], 'Galaxy S20': ['128GB'], 'Galaxy S20 FE': ['128GB', '256GB'],
    'Galaxy S10+': ['128GB', '512GB', '1TB'], 'Galaxy S10': ['128GB', '512GB'], 'Galaxy S10 Lite': ['128GB', '512GB'], 'Galaxy S10e': ['128GB', '256GB'],

    // Z / Note / A ... (Included in previous script, simplified here for criticals, user can expand)
    'Galaxy Z Fold6': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip6': ['256GB', '512GB'],
    // ... Add more if needed.
};

const APPLE_SPECS = {
    // iPhone
    'iPhone 17 Pro Max': ['256GB', '512GB', '1TB', '2TB'], 'iPhone 17 Pro': ['256GB', '512GB', '1TB'], 'iPhone 17': ['128GB', '256GB', '512GB'],
    'iPhone 16 Pro Max': ['256GB', '512GB', '1TB'], 'iPhone 16 Pro': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 16 Plus': ['128GB', '256GB', '512GB'], 'iPhone 16': ['128GB', '256GB', '512GB'],
    'iPhone 15 Pro Max': ['256GB', '512GB', '1TB'], 'iPhone 15 Pro': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 15 Plus': ['128GB', '256GB', '512GB'], 'iPhone 15': ['128GB', '256GB', '512GB'],
    'iPhone 14 Pro Max': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 14 Pro': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 14 Plus': ['128GB', '256GB', '512GB'], 'iPhone 14': ['128GB', '256GB', '512GB'],
    'iPhone 13 Pro Max': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 13 Pro': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 13': ['128GB', '256GB', '512GB'], 'iPhone 13 mini': ['128GB', '256GB', '512GB'],
    'iPhone 12 Pro Max': ['128GB', '256GB', '512GB'], 'iPhone 12 Pro': ['128GB', '256GB', '512GB'], 'iPhone 12': ['64GB', '128GB', '256GB'], 'iPhone 12 mini': ['64GB', '128GB', '256GB'],
    'iPhone 11 Pro Max': ['64GB', '256GB', '512GB'], 'iPhone 11 Pro': ['64GB', '256GB', '512GB'], 'iPhone 11': ['64GB', '128GB', '256GB'],
    'iPhone XS Max': ['64GB', '256GB', '512GB'], 'iPhone XS': ['64GB', '256GB', '512GB'], 'iPhone XR': ['64GB', '128GB', '256GB'], 'iPhone X': ['64GB', '256GB'],
    'iPhone 8 Plus': ['64GB', '128GB', '256GB'], 'iPhone 8': ['64GB', '128GB', '256GB'],
    'iPhone SE (3rd Gen)': ['64GB', '128GB', '256GB'], 'iPhone SE (2020)': ['64GB', '128GB', '256GB'],

    // iPad
    'iPad Pro 12.9 M2': ['128GB', '256GB', '512GB', '1TB', '2TB'],
    // ... Covering major ones
};

const GOOGLE_SPECS = {
    'Pixel 10 Pro XL': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 10 Pro': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 10': ['128GB', '256GB'],
    'Pixel 9 Pro Fold': ['256GB', '512GB'],
    'Pixel 9 Pro XL': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 9 Pro': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 9': ['128GB', '256GB'], 'Pixel 9a': ['128GB', '256GB'],
    'Pixel Fold': ['256GB', '512GB'],
    'Pixel 8 Pro': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 8': ['128GB', '256GB'], 'Pixel 8a': ['128GB', '256GB'],
    'Pixel 7 Pro': ['128GB', '256GB', '512GB'], 'Pixel 7': ['128GB', '256GB'], 'Pixel 7a': ['128GB'],
    'Pixel 6 Pro': ['128GB', '256GB', '512GB'], 'Pixel 6': ['128GB', '256GB'], 'Pixel 6a': ['128GB']
};

const SONY_SPECS = {
    'PlayStation 5 Pro': ['2TB'],
    'PlayStation 5 Slim': ['1TB'],
    'PlayStation 5 (Disc)': ['825GB', '1TB'],
    'PlayStation 5 (Digital)': ['825GB', '1TB'],
    'PlayStation 4 Pro': ['1TB'],
    'PlayStation 4 Slim': ['500GB', '1TB']
};

const BRAND_SPECS = {
    'samsung': SAMSUNG_SPECS,
    'apple': APPLE_SPECS,
    'google': GOOGLE_SPECS,
    'sony': SONY_SPECS
};

// Utils
const slugify = (text) => text.toString().toLowerCase()
    .normalize('NFD') // Separate accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\+/g, '-plus') // Handle + sign explicitly
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const createSlug = (brand, model) => {
    // Special handling for brand/model combo logic to match project
    const brandSlug = slugify(brand);
    const modelSlug = slugify(model);
    return `${brandSlug}-${modelSlug}`;
};

async function cleanupGlobalGhosts() {
    console.log('🌍 Starting Global Ghost Storage Cleanup (Apple, Google, Samsung, Sony)...');

    let totalDeleted = 0;

    for (const [brand, specsMap] of Object.entries(BRAND_SPECS)) {
        console.log(`\n📦 Processing Brand: ${brand.toUpperCase()}`);

        for (const [modelName, validStorages] of Object.entries(specsMap)) {
            const slug = createSlug(brand, modelName);
            // console.log(`   Checking ${slug} (Valid: ${validStorages.join(',')})`);

            const snap = await db.collection('buyback_pricing')
                .where('deviceId', '==', slug)
                .get();

            if (snap.empty) continue;

            const batch = db.batch();
            let deleteCount = 0;

            snap.docs.forEach(doc => {
                const data = doc.data();
                if (!validStorages.includes(data.storage)) {
                    console.log(`   ❌ GHOST: ${data.storage} for ${slug} (Doc: ${doc.id})`);
                    batch.delete(doc.ref);
                    deleteCount++;
                }
            });

            if (deleteCount > 0) {
                await batch.commit();
                console.log(`   ✅ Cleaned ${deleteCount} records.`);
                totalDeleted += deleteCount;
            }
        }
    }

    console.log(`\n🎉 Global Cleanup Complete. Total Deleted: ${totalDeleted}`);
}

cleanupGlobalGhosts();
