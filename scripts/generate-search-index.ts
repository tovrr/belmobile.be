
import * as fs from 'fs';
import * as path from 'path';

// Note: To run this script, use: npx tsx -r dotenv/config scripts/generate-search-index.ts
// It requires .env.local variables to be loaded.

// 1. Initialize Firebase Admin Manually to avoid "server-only" import restriction in scripts
// We borrow logic from src/lib/firebase-admin.ts without importing "server-only"
import * as admin from "firebase-admin";

if (!admin.apps.length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    let cert: admin.ServiceAccount | null = null;

    if (serviceAccountJson) {
        try {
            cert = JSON.parse(serviceAccountJson);
        } catch (e) {
            console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON");
        }
    } else if (projectId && clientEmail && privateKey) {
        cert = { projectId, clientEmail, privateKey };
    }

    if (cert) {
        admin.initializeApp({
            credential: admin.credential.cert(cert),
        });
        console.log("✅ Firebase Admin Initialized (Script Mode)");
    } else {
        console.error("❌ Credentials Missing in Environment. Script will fail.");
        console.error("DEBUG: ProjectID:", projectId, "Email:", clientEmail ? "Exists" : "Missing");
    }
}

const db = admin.firestore();

interface DeviceIndexItem {
    id: string; // Slug (apple-iphone-14)
    label: string; // Display Name (Apple iPhone 14)
    price: number; // Max Buyback Price
    brand: string;
    model: string;
}

function formatLabel(id: string): string {
    const cleanId = id.replace(/^(apple-|samsung-|google-|huawei-|xiaomi-|oppo-)/, '');
    const brand = id.split('-')[0];
    const brandLabel = brand.charAt(0).toUpperCase() + brand.slice(1);

    // Capitalize parts
    const modelLabel = cleanId.split('-').map(p => {
        if (p === 'se') return 'SE';
        if (p === 'pro') return 'Pro';
        if (p === 'max') return 'Max';
        if (p === 'plus') return 'Plus';
        if (p === 'ultra') return 'Ultra';
        return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(' ');

    return `${brandLabel} ${modelLabel}`;
}

async function generateIndex() {
    console.log('🚀 Starting Device Index Generation...');

    try {
        // 1. Fetch ALL repair prices (SSoT for existence)
        const snap = await db.collection('repair_prices').get();
        console.log(`Found ${snap.size} repair documents.`);

        const uniqueDevices = new Map<string, number>();

        // 2. Process & Deduplicate
        snap.docs.forEach(doc => {
            const rawId = doc.data().deviceId || doc.id;

            // CLEANING LOGIC:
            // Remove suffixes like _screen, _battery, _antenna
            const baseId = rawId.split('_')[0];

            // Verify it looks like a device slug
            if (!baseId.includes('-')) return;

            // Initialize with 0 price (will hydrate later)
            if (!uniqueDevices.has(baseId)) {
                uniqueDevices.set(baseId, 0);
            }
        });

        console.log(`Identified ${uniqueDevices.size} unique base devices.`);

        // 3. Hydrate Prices
        console.log('Fetching buyback data...');
        const buybackSnap = await db.collection('buyback_pricing').get();

        buybackSnap.docs.forEach(doc => {
            const d = doc.data();
            const id = d.deviceId; // Assuming this matches baseId
            const price = d.price || 0;
            const condition = d.condition || 'good';

            // Check if this buyback corresponds to a known device
            // Sometimes buyback IDs might be different or dirty
            const baseId = id.split('_')[0];

            if (uniqueDevices.has(baseId)) {
                if (condition !== 'new' && condition !== 'damaged') {
                    const currentMax = uniqueDevices.get(baseId) || 0;
                    if (price > currentMax) {
                        uniqueDevices.set(baseId, price);
                    }
                }
            }
        });

        // 4. Transform to Array
        const index: DeviceIndexItem[] = [];
        for (const [id, price] of uniqueDevices.entries()) {
            const parts = id.split('-');
            const brand = parts[0];
            // Basic Brand Check
            if (!['apple', 'samsung', 'google', 'xiaomi', 'oppo', 'huawei', 'oneplus', 'sony', 'microsoft', 'nintendo', 'dell', 'hp', 'lenovo', 'asus'].includes(brand)) {
                continue;
            }

            index.push({
                id,
                label: formatLabel(id),
                price,
                brand: brand.charAt(0).toUpperCase() + brand.slice(1),
                model: parts.slice(1).join(' ')
            });
        }

        // Sort by Priority (Newer Apple/Samsung first)
        index.sort((a, b) => {
            // Price Boost
            if (b.price !== a.price) return b.price - a.price;
            return a.label.localeCompare(b.label);
        });

        // 5. Write to File
        const outputPath = path.resolve(process.cwd(), 'src/data/generated-device-index.json');
        fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));

        console.log(`✅ Index Generated! Saved ${index.length} devices to src/data/generated-device-index.json`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Generation Failed:', error);
        process.exit(1);
    }
}

generateIndex();
