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

// --- SPECS FROM SOURCE CODE (Consolidated) ---
// Validated against src/data/models/*.ts

const BRAND_SPECS = {
    // 1. SAMSUNG
    'samsung': {
        // S Series
        'Galaxy S25 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S25+': ['256GB', '512GB'], 'Galaxy S25': ['128GB', '256GB', '512GB'], 'Galaxy S25 FE': ['128GB', '256GB'],
        'Galaxy S24 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S24+': ['256GB', '512GB'], 'Galaxy S24': ['128GB', '256GB'], 'Galaxy S24 FE': ['128GB', '256GB'],
        'Galaxy S23 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S23+': ['256GB', '512GB'], 'Galaxy S23': ['128GB', '256GB'], 'Galaxy S23 FE': ['128GB', '256GB'],
        'Galaxy S22 Ultra': ['128GB', '256GB', '512GB', '1TB'], 'Galaxy S22+': ['128GB', '256GB'], 'Galaxy S22': ['128GB', '256GB'],
        'Galaxy S21 Ultra': ['128GB', '256GB', '512GB'], 'Galaxy S21+': ['128GB', '256GB'], 'Galaxy S21': ['128GB', '256GB'], 'Galaxy S21 FE': ['128GB', '256GB'],
        'Galaxy S20 Ultra': ['128GB', '512GB'], 'Galaxy S20+': ['128GB', '512GB'], 'Galaxy S20': ['128GB'], 'Galaxy S20 FE': ['128GB', '256GB'],
        'Galaxy S10+': ['128GB', '512GB', '1TB'], 'Galaxy S10': ['128GB', '512GB'], 'Galaxy S10 Lite': ['128GB', '512GB'], 'Galaxy S10e': ['128GB', '256GB'],
        // Z / Note / A
        'Galaxy Z Fold6': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip6': ['256GB', '512GB'],
        'Galaxy Z Fold5': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip5': ['256GB', '512GB'],
        'Galaxy Z Fold4': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip4': ['128GB', '256GB', '512GB'],
        'Galaxy Note 20 Ultra': ['256GB', '512GB'], 'Galaxy Note 20': ['256GB'],
        'Galaxy A55': ['128GB', '256GB'], 'Galaxy A54': ['128GB', '256GB'], 'Galaxy A35': ['128GB', '256GB']
    },
    // 2. APPLE
    'apple': {
        'iPhone 17 Pro Max': ['256GB', '512GB', '1TB', '2TB'], 'iPhone 17 Pro': ['256GB', '512GB', '1TB'], 'iPhone 17': ['128GB', '256GB', '512GB'],
        'iPhone 16 Pro Max': ['256GB', '512GB', '1TB'], 'iPhone 16 Pro': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 16 Plus': ['128GB', '256GB', '512GB'], 'iPhone 16': ['128GB', '256GB', '512GB'],
        'iPhone 15 Pro Max': ['256GB', '512GB', '1TB'], 'iPhone 15 Pro': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 15 Plus': ['128GB', '256GB', '512GB'], 'iPhone 15': ['128GB', '256GB', '512GB'],
        'iPhone 14 Pro Max': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 14 Pro': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 14 Plus': ['128GB', '256GB', '512GB'], 'iPhone 14': ['128GB', '256GB', '512GB'],
        'iPhone 13 Pro Max': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 13 Pro': ['128GB', '256GB', '512GB', '1TB'], 'iPhone 13': ['128GB', '256GB', '512GB'], 'iPhone 13 mini': ['128GB', '256GB', '512GB'],
        'iPhone 12 Pro Max': ['128GB', '256GB', '512GB'], 'iPhone 12 Pro': ['128GB', '256GB', '512GB'], 'iPhone 12': ['64GB', '128GB', '256GB'], 'iPhone 12 mini': ['64GB', '128GB', '256GB'],
        'iPhone 11 Pro Max': ['64GB', '256GB', '512GB'], 'iPhone 11 Pro': ['64GB', '256GB', '512GB'], 'iPhone 11': ['64GB', '128GB', '256GB'],
        'iPhone XS Max': ['64GB', '256GB', '512GB'], 'iPhone XS': ['64GB', '256GB', '512GB'], 'iPhone XR': ['64GB', '128GB', '256GB'], 'iPhone X': ['64GB', '256GB'],
        'iPad Pro 12.9 M2': ['128GB', '256GB', '512GB', '1TB', '2TB'],
        'MacBook Pro 16 M2': ['512GB', '1TB', '2TB', '4TB', '8TB']
    },
    // 3. GOOGLE
    'google': {
        'Pixel 10 Pro XL': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 9 Pro XL': ['128GB', '256GB', '512GB', '1TB'],
        'Pixel 8 Pro': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 8': ['128GB', '256GB'], 'Pixel 8a': ['128GB', '256GB'],
        'Pixel 7 Pro': ['128GB', '256GB', '512GB'], 'Pixel 7': ['128GB', '256GB'], 'Pixel 6 Pro': ['128GB', '256GB', '512GB'], 'Pixel 6': ['128GB', '256GB'], 'Pixel 6a': ['128GB'],
        'Pixel Fold': ['256GB', '512GB']
    },
    // 4. SONY
    'sony': {
        'PlayStation 5 Pro': ['2TB'], 'PlayStation 5 Slim': ['1TB'], 'PlayStation 5 (Disc)': ['825GB', '1TB'], 'PlayStation 5 (Digital)': ['825GB', '1TB'],
        'PlayStation 4 Pro': ['1TB'], 'PlayStation 4 Slim': ['500GB', '1TB']
    },
    // 5. XBOX
    'xbox': {
        'Xbox Series X': ['1TB'], 'Xbox Series S': ['512GB', '1TB'], 'Xbox One X': ['1TB'], 'Xbox One S': ['500GB', '1TB']
    },
    // 6. XIAOMI
    'xiaomi': {
        'Xiaomi 14 Ultra': ['256GB', '512GB', '1TB'], 'Xiaomi 14': ['256GB', '512GB', '1TB'],
        'Xiaomi 13 Ultra': ['256GB', '512GB', '1TB'], 'Xiaomi 13 Pro': ['128GB', '256GB', '512GB'], 'Xiaomi 13': ['128GB', '256GB', '512GB'],
        'Xiaomi 13T Pro': ['256GB', '512GB', '1TB'], 'Xiaomi 13T': ['256GB'],
        'Redmi Note 13 Pro+': ['256GB', '512GB'], 'POCO F6 Pro': ['256GB', '512GB', '1TB']
    },
    // 7. ONEPLUS
    'oneplus': {
        'OnePlus 12': ['256GB', '512GB', '1TB'], 'OnePlus 11': ['128GB', '256GB'],
        'OnePlus 10 Pro': ['128GB', '256GB', '512GB'], 'OnePlus 9 Pro': ['128GB', '256GB'],
        'OnePlus Open': ['512GB', '1TB']
    },
    // 8. OPPO
    'oppo': {
        'Find N3': ['512GB', '1TB'], 'Find X7 Ultra': ['256GB', '512GB'], 'Find X5 Pro': ['256GB', '512GB']
    },
    // 9. MOTOROLA
    'motorola': {
        'Razr 50 Ultra': ['256GB', '512GB'], 'Razr 40 Ultra': ['256GB', '512GB']
    },
    // 10. REALME
    'realme': {
        'Realme GT 6': ['256GB', '512GB'], 'Realme 12 Pro+': ['256GB', '512GB']
    },
    // 11. HUAWEI
    'huawei': {
        'P40 Pro': ['256GB', '512GB'], 'P40 Pro+': ['512GB'], 'P40': ['128GB', '256GB'], 'P40 Lite': ['128GB'],
        'P30 Pro': ['128GB', '256GB', '512GB'], 'P30': ['64GB', '128GB', '256GB'], 'P30 Lite': ['128GB'],
        'P20 Pro': ['128GB'], 'P20 Lite': ['64GB'], 'P20': ['128GB'],
        // Honor
        'Honor Magic6 Pro': ['512GB', '1TB'], 'Honor Magic6 Lite': ['256GB'],
        'Honor 200': ['256GB', '512GB'], 'Honor 90': ['256GB', '512GB'], 'Honor 70': ['128GB', '256GB'], 'Honor 50': ['128GB', '256GB']
    }
};

const slugify = (text) => text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\+/g, '-plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const createSlug = (brand, model) => `${slugify(brand)}-${slugify(model)}`;

async function cleanupGlobalGhosts() {
    console.log('🌍 Starting SUPER Ghost Storage Cleanup...');
    let totalDeleted = 0;

    for (const [brand, specsMap] of Object.entries(BRAND_SPECS)) {
        console.log(`\n📦 Brand: ${brand.toUpperCase()}`);
        for (const [modelName, validStorages] of Object.entries(specsMap)) {
            const slug = createSlug(brand, modelName);
            const snap = await db.collection('buyback_pricing').where('deviceId', '==', slug).get();
            if (snap.empty) continue;

            const batch = db.batch();
            let deleteCount = 0;
            snap.docs.forEach(doc => {
                const data = doc.data();
                if (!validStorages.includes(data.storage)) {
                    // console.log(`   ❌ GHOST: ${data.storage} for ${slug}`);
                    batch.delete(doc.ref);
                    deleteCount++;
                }
            });

            if (deleteCount > 0) {
                await batch.commit();
                console.log(`   ✅ Cleaned ${deleteCount} ghosts for ${modelName}`);
                totalDeleted += deleteCount;
            }
        }
    }
    console.log(`\n🎉 DONE. Total Deleted: ${totalDeleted}`);
}

cleanupGlobalGhosts();
