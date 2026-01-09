import * as admin from 'firebase-admin';
import { getFirestore, WriteBatch } from 'firebase-admin/firestore';
import * as path from 'path';

// --- CONFIG ---
const STORAGE_STEP_UP = 0.06;

const RULES = [
    { condition: 'new', multiplier: 0.82 },
    { condition: 'like-new', multiplier: 0.72 },
    { condition: 'good', multiplier: 0.62 },
    { condition: 'fair', multiplier: 0.45 },
    { condition: 'damaged', multiplier: 0.15 },
];

const BRAND_FILES = [
    'apple', 'samsung', 'google', 'xiaomi', 'oppo', 'oneplus',
    'huawei', 'sony', 'nintendo', 'xbox', 'dell', 'hp', 'lenovo', 'microsoft'
];

// --- INIT ---
try {
    process.loadEnvFile('.env.local');
} catch (e) { }

if (!admin.apps.length) {
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
const db = getFirestore();

// --- HELPERS ---
function createSlug(text: string): string {
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// --- DATA LOADING ---
async function loadFullCatalog() {
    const catalog: Record<string, { specs: any, prices: any }> = {};
    for (const brand of BRAND_FILES) {
        try {
            const cleanPath = `../src/data/models/${brand}.ts`;
            const module = require(cleanPath);
            catalog[brand] = {
                specs: module.SPECS || {},
                prices: module.MODELS || {} // This is usually nested { smartphone: {...}, tablet: {...} }
            };
        } catch (e) {
            console.warn(`Could not load catalog for ${brand}`);
        }
    }
    return catalog;
}

// --- MAIN ---
async function main() {
    console.log("🚀 STARTING FULL CATALOG ACTIVATION & PRICING");

    // 1. Load Static Catalog
    const fullCatalog = await loadFullCatalog();
    console.log("✅ Catalog Loaded.");

    // 2. Load Existing Anchors
    const anchorsSnap = await db.collection('pricing_anchors').get();
    const existingAnchorsMap = new Map();
    anchorsSnap.docs.forEach(d => existingAnchorsMap.set(d.id, d.data()));
    console.log(`✅ Database currently has ${existingAnchorsMap.size} active anchors.`);

    let batch = db.batch();
    let ops = 0;

    const commitBatch = async () => {
        await batch.commit();
        batch = db.batch();
        ops = 0;
        process.stdout.write('.');
    };

    // 3. ACTIVATION LOOP
    // Iterate through every brand -> category -> model in the STATIC file
    // If it's not in DB, create it.
    let newActivations = 0;

    for (const brand of BRAND_FILES) {
        const brandData = fullCatalog[brand];
        if (!brandData) continue;

        // Flatten price structure: { smartphone: { 'iPhone 16': 800 }, tablet: ... }
        Object.entries(brandData.prices).forEach(([category, models]: [string, any]) => {
            Object.entries(models).forEach(([modelName, basePrice]: [string, any]) => {

                // Generate Slug
                // Special handling for Apple to ensure "apple-" prefix if needed, though standard createSlug often suffices
                // We'll mimic the standard logic: brand + model
                // But typically the slug should be the ID.
                let slug = createSlug(`${brand} ${modelName}`);
                // Ensure unique ID logic matches project (usually brand-model)
                if (brand === 'apple' && !slug.startsWith('apple-')) slug = `apple-${slug}`;
                if (brand === 'samsung' && !slug.startsWith('samsung-')) slug = `samsung-${slug}`;

                // CHECK EXISTENCE
                if (!existingAnchorsMap.has(slug)) {
                    // CREATE NEW ANCHOR
                    const anchorRef = db.collection('pricing_anchors').doc(slug);
                    batch.set(anchorRef, {
                        deviceId: slug,
                        deviceName: modelName,
                        slug: slug,
                        brand: brand,
                        category: category,
                        anchorPriceEur: basePrice, // The SSoT Price
                        basePriceEur: basePrice,
                        managedManually: true,
                        source: 'catalog_backfill_script',
                        lastUpdated: new Date().toISOString()
                    });

                    // Add to map so we process pricing next
                    existingAnchorsMap.set(slug, {
                        deviceId: slug,
                        deviceName: modelName,
                        anchorPriceEur: basePrice,
                        brand: brand
                    });

                    ops++;
                    newActivations++;
                }
            });
        });
    }

    if (ops > 0) await commitBatch();
    console.log(`\n✨ Activated ${newActivations} new devices from catalog.`);

    // 4. PRICING RECALC LOOP (For ALL anchors, old and new)
    console.log("🔄 Recalculating Buyback Tiers for ALL active anchors...");

    let pricingCount = 0;
    // We iterate the map which now contains both old + new
    for (const [slug, anchor] of existingAnchorsMap.entries()) {
        const price = Number(anchor.anchorPriceEur || anchor.basePriceEur);
        if (!price || price <= 0) continue;

        let deviceName = anchor.deviceName;
        if (!deviceName) {
            deviceName = slug.split('-').slice(1).map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        }
        const brand = (anchor.brand || slug.split('-')[0]).toLowerCase();

        // Lookup Specs
        let modelSpecs = [];
        const brandSpecs = fullCatalog[brand]?.specs;

        if (brandSpecs) {
            // Strict Match
            if (brandSpecs[deviceName]) {
                modelSpecs = brandSpecs[deviceName];
            }
            // Fuzzy Match
            else {
                const key = Object.keys(brandSpecs).find(k => k.toLowerCase() === deviceName.toLowerCase());
                if (key) modelSpecs = brandSpecs[key];
                // Super Fuzzy (contains)
                else {
                    const key2 = Object.keys(brandSpecs).find(k => deviceName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(deviceName.toLowerCase()));
                    if (key2) modelSpecs = brandSpecs[key2];
                }
            }
        }

        // Default if no specs found
        if (!modelSpecs || modelSpecs.length === 0) {
            modelSpecs = ['128GB'];
        }

        // Generate Pricing Logic
        for (let i = 0; i < modelSpecs.length; i++) {
            const spec = modelSpecs[i];
            const specMultiplier = 1 + (i * STORAGE_STEP_UP);
            const specBaseGood = price * specMultiplier;

            for (const rule of RULES) {
                const finalPrice = Math.round(specBaseGood * rule.multiplier);
                const docId = `${slug}_${spec}_${rule.condition}`;
                const docRef = db.collection('buyback_pricing').doc(docId);

                batch.set(docRef, {
                    deviceId: slug,
                    storage: spec,
                    condition: rule.condition,
                    price: finalPrice,
                    updatedAt: new Date().toISOString(),
                    managedBy: 'catalog_backfill_script',
                    capacity: spec
                }, { merge: true });

                ops++;
                pricingCount++;
                if (ops >= 400) await commitBatch();
            }
        }
    }

    if (ops > 0) await batch.commit();
    console.log(`\n\n🎉 SUCCESS! Full Catalog Synced.\n- Activated: ${newActivations} devices\n- Updated Prices: ${pricingCount} entries`);
}

main().catch(console.error);
