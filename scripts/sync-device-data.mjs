import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { exiftool } from 'exiftool-vendored';
import pLimit from 'p-limit';
import admin from 'firebase-admin';
import * as cheerio from 'cheerio';

// --- DATA SOURCE ---
// We import the manually validated links to solve the "Random ID" problem
// In a real TS environment we would import directly, but allowed in .mjs via simple read or similar if module.
// For simplicity in this standalone script, I will copy-paste the dict or read it.
// Let's assume we can import it if it's .js or we assume standard strings.
// Actually, I will read the file I just created to ensure I moved the logic correctly.
// To play safe in .mjs, I'll dynamically import or hardcode the list if import fails.
// But for now, let's just re-declare the dict here or try to import it.
// Since `src/data/gsmarena-links.ts` is TS, I cannot import it in MJS easily without transpiling.
// STRATEGY: I will use a regex to read the file contents of gsmarena-links.ts essentially "parsing" it manually.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public/images/models');
const LINK_FILE = path.join(__dirname, '../src/data/gsmarena-links.ts');
const DATA_FILE = path.join(__dirname, '../src/data/deviceImages.ts');

const limit = pLimit(2); // Politeness
const HQ_COORDS = { lat: 50.86285, lng: 4.34240 };

// --- INIT FIREBASE (Admin) ---
if (!admin.apps.length) {
    try {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belmobile-firebase';
        const cleanProjectId = projectId.trim().replace(/^["']|["']$/g, '');
        admin.initializeApp({
            projectId: cleanProjectId,
            credential: admin.credential.applicationDefault()
        });
        console.log("🔥 Firebase Initialized");
    } catch (e) {
        console.warn("⚠️ Firebase Init Failed:", e.message);
    }
}
const db = admin.firestore();

// --- HELPER: Read Links from TS File ---
function loadLinks() {
    try {
        const content = fs.readFileSync(LINK_FILE, 'utf8');
        const lines = content.split('\n');
        const map = {};
        lines.forEach(line => {
            // Look for: 'slug': 'url',
            const match = line.match(/'([^']+)':\s*'([^']+)'/);
            if (match) {
                map[match[1]] = match[2];
            }
        });
        return map;
    } catch (e) {
        console.error("Failed to load generic links:", e);
        return {};
    }
}

const LINK_MAP = loadLinks();

// --- HELPER: Currency Parser ---
function parsePrice(html, deviceName) {
    const $ = cheerio.load(html);

    // GSMArena usually has a table row named "Price" at the bottom
    // td.nfo containing price string

    let priceText = '';

    // Strategy 1: Look for data-spec="price"
    const specPrice = $('[data-spec="price"]').text();
    if (specPrice) priceText = specPrice;

    // Strategy 2: Look for any td containing "EUR" or "Price"
    if (!priceText) {
        $('td.nfo').each((i, el) => {
            const txt = $(el).text();
            if (txt.includes('€') || txt.includes('EUR') || txt.includes('$')) {
                // Heuristic: Short string likely price
                if (txt.length < 50) priceText += ' ' + txt;
            }
        });
    }

    console.log(`   💰 Raw Price Text for ${deviceName}: "${priceText.trim()}"`);

    // PARSING PRIORITY
    const EUR_USD_RATE = 0.92; // 1 USD = 0.92 EUR (Conservative)

    // 1. Explicit EUR
    // Regex matches: € 300, 300 €, 300EUR, about 300 EUR
    // We remove commas

    const eurMatch = priceText.match(/€\s*([\d,.]+)/) || priceText.match(/([\d,.]+)\s*EUR/);
    if (eurMatch) {
        const val = parseFloat(eurMatch[1].replace(/,/g, ''));
        if (!isNaN(val)) return { price: val, currency: 'EUR', source: 'explicit', flag: 'ok' };
    }

    // 2. USD Fallback
    const usdMatch = priceText.match(/\$\s*([\d,.]+)/) || priceText.match(/([\d,.]+)\s*USD/);
    if (usdMatch) {
        const val = parseFloat(usdMatch[1].replace(/,/g, ''));
        if (!isNaN(val)) {
            const converted = Math.round(val * EUR_USD_RATE);
            return {
                price: converted,
                currency: 'EUR',
                source: 'converted_usd',
                flag: 'manual_review',
                original: `$${val}`
            };
        }
    }

    return { price: 0, currency: 'EUR', source: 'none', flag: 'manual_review' };
}


async function processDevice(slug, url) {
    const deviceName = slug.replace(/-/g, ' ').toUpperCase();
    console.log(`\n🤖 Processing: ${deviceName}`);

    try {
        // 1. Fetch Page
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();

        // 2. Extract Price (Anchor)
        const priceData = parsePrice(html, deviceName);
        console.log(`   👉 Extracted Anchor: €${priceData.price} [${priceData.flag}]`);

        // 3. Save Anchor to Firestore
        if (db) {
            await db.collection('pricing_anchors').doc(slug).set({
                basePriceEur: priceData.price,
                currency: 'EUR',
                lastUpdated: new Date().toISOString(),
                sourceUrl: url,
                dataFlag: priceData.flag,
                conversionNote: priceData.source === 'converted_usd' ? `Converted from ${priceData.original}` : null,
                deviceId: slug
            }, { merge: true });
            console.log("   💾 Saved Anchor to DB");
        }

        // 4. Image Handling (Only if missing)
        // Extract Image URL from OG tags or specific selector
        const $ = cheerio.load(html);
        const imgUrl = $('.specs-photo-main a img').attr('src');

        if (imgUrl) {
            const finalPath = path.join(PUBLIC_DIR, `${slug}.jpg`);
            if (!fs.existsSync(finalPath)) {
                console.log("   📸 Downloading Image...");
                const imgRes = await fetch(imgUrl);
                const buffer = await imgRes.arrayBuffer();

                await sharp(Buffer.from(buffer))
                    .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
                    .jpeg({ quality: 90 })
                    .toFile(finalPath);

                // Exif Metadata injection... (Simplified for brevity, reusing existing logic if needed)
                console.log("   ✅ Image Saved");
            } else {
                console.log("   ⏭️  Image already exists");
            }
        }

    } catch (e) {
        console.error(`   ❌ Error: ${e.message}`);
    }
}

async function run() {
    console.log("🚀 Starting Sync of Device Data (Anchors + Images)...");
    const tasks = Object.entries(LINK_MAP).map(([slug, url]) => {
        return limit(() => processDevice(slug, url));
    });
    await Promise.all(tasks);
    console.log("🏁 Sync Complete.");
}

run();
