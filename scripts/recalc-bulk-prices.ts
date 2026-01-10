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
    // CLI Args: "apple" or "iPhone 16"
    const FILTER_ARG = process.argv[2]?.toLowerCase();

    console.log(`🚀 STARTING PRICE RECALCULATION ${FILTER_ARG ? `(FILTER: "${FILTER_ARG}")` : '(ALL DEVICES)'}`);

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

    // 3. ACTIVATION LOOP (Only if no filter or matches filter)
    let newActivations = 0;

    for (const brand of BRAND_FILES) {
        // If filter is active, skip brands that don't match (unless filter is a model name inside this brand)
        // Simple logic: If filter is "samsung", skip "apple". 
        if (FILTER_ARG && !brand.includes(FILTER_ARG) && !FILTER_ARG.includes(brand)) {
            // If the filter is "iPhone 16", "apple" does not include it, but we need to check inside.
            // We'll filter strictly at the model level below.
        }

        const brandData = fullCatalog[brand];
        if (!brandData) continue;

        Object.entries(brandData.prices).forEach(([category, models]: [string, any]) => {
            Object.entries(models).forEach(([modelName, basePrice]: [string, any]) => {
                let slug = createSlug(`${brand} ${modelName}`);
                if (brand === 'apple' && !slug.startsWith('apple-')) slug = `apple-${slug}`;
                if (brand === 'samsung' && !slug.startsWith('samsung-')) slug = `samsung-${slug}`;

                // FILTER CHECK
                if (FILTER_ARG && !slug.includes(FILTER_ARG) && !modelName.toLowerCase().includes(FILTER_ARG)) {
                    return;
                }

                if (!existingAnchorsMap.has(slug)) {
                    const anchorRef = db.collection('pricing_anchors').doc(slug);
                    batch.set(anchorRef, {
                        deviceId: slug,
                        deviceName: modelName,
                        slug: slug,
                        brand: brand,
                        category: category,
                        anchorPriceEur: basePrice,
                        basePriceEur: basePrice,
                        managedManually: true,
                        source: 'catalog_backfill_script',
                        lastUpdated: new Date().toISOString()
                    });

                    existingAnchorsMap.set(slug, {
                        deviceId: slug,
                        deviceName: modelName,
                        anchorPriceEur: basePrice,
                        brand: brand
                    });

                    ops++;
                    newActivations++;
                }
                // UPDATE BASE PRICE IF CHANGED (Crucial for your "Lower Price" workflow)
                else {
                    const existing = existingAnchorsMap.get(slug);
                    const currentPrice = existing.anchorPriceEur || existing.basePriceEur;
                    if (currentPrice !== basePrice) {
                        // Update the anchor itself first
                        const anchorRef = db.collection('pricing_anchors').doc(slug);
                        batch.update(anchorRef, {
                            anchorPriceEur: basePrice,
                            basePriceEur: basePrice,
                            lastUpdated: new Date().toISOString()
                        });
                        // Update local map so recalc uses new price
                        existing.anchorPriceEur = basePrice;
                        existingAnchorsMap.set(slug, existing);
                        ops++;
                    }
                }
            });
        });
    }

    if (ops > 0) await commitBatch();
    console.log(`\n✨ Activated/Updated Anchors: ${ops}`);

    // 4. PRICING RECALC LOOP
    console.log("🔄 Recalculating Buyback Tiers...");

    let pricingCount = 0;
    // We iterate the map which now contains both old + new
    for (const [slug, anchor] of existingAnchorsMap.entries()) {
        const deviceName = anchor.deviceName || slug;

        // FILTER CHECK
        if (FILTER_ARG && !slug.includes(FILTER_ARG) && !deviceName.toLowerCase().includes(FILTER_ARG)) {
            continue;
        }

        const price = Number(anchor.anchorPriceEur || anchor.basePriceEur);
        if (!price || price <= 0) continue;

        const brand = (anchor.brand || slug.split('-')[0]).toLowerCase();

        // Lookup Specs
        let modelSpecs = [];
        const brandSpecs = fullCatalog[brand]?.specs;

        if (brandSpecs) {
            if (brandSpecs[anchor.deviceName]) {
                modelSpecs = brandSpecs[anchor.deviceName];
            } else {
                const key = Object.keys(brandSpecs).find(k => k.toLowerCase() === deviceName.toLowerCase());
                if (key) modelSpecs = brandSpecs[key];
                else {
                    const key2 = Object.keys(brandSpecs).find(k => deviceName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(deviceName.toLowerCase()));
                    if (key2) modelSpecs = brandSpecs[key2];
                }
            }
        }

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

                // TODO: Smart Diff Check could go here to save writes
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
    console.log(`\n\n🎉 SUCCESS! Filtered Sync Done.\n- Target: ${FILTER_ARG || 'ALL'}\n- Updated Prices: ${pricingCount} entries`);
}

main().catch(console.error);
