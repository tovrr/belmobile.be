import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';
import * as cheerio from 'cheerio';
// Ensure correct relative import for ts-node usage
import { GSMARENA_LINKS } from '../src/data/gsmarena-links';

// --- ADMIN CONFIG (Shared with migration script) ---
const NEW_ADMIN_CONFIG = {
    projectId: "belmobile-firebase",
    clientEmail: "firebase-adminsdk-fbsvc@belmobile-firebase.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHsHG4tNZ+wPRr\nxTE3ljX1kuH6V8KokHVeE92hjeuuK4c91o2++rCtNDHjj5jhBXEun/giwCnFwyyg\nM4EqKSM6c/7tCu1mzdR4Nxe0ms5dKzwm8vZ1az73TAogMGZr47enn99xDM2tk2Rf\nstlUzZwcDQbiOL2fA5aYO726AWQKqWQbDw6CQp5So2enLCOkl65CGrm/BaH0NcRZ\nkhUOgGOB09n9s4ZzsJ2i7aEWDdifGBcFGUqlnZ9m7733mOXK43WjSz+QLC6xqjAC\nc3U+3THUJNBIFEYyAUUa6A1dN6O9IOEO+ywLFohwJc+4e2EHDBGHB11805Inp/BN\nT3rHOSW9AgMBAAECggEAEITmq3Z+RgcVUTMDYstQ1GtduVV4O3ST2QAAtiQk6ogc\nTH/KwxE++10VgXM4HOlT1x0RrGJEMmF2eBw6o6+6g9Pjs11TjU0atgUst1qVFr0E\nYV55B/aiw1dtgQMv/d3dLAc8N0BtZV4LkCUd+Hd34hQrzRwPh6+Gzjom9FO4IG+E\neIe+f8c5OoSyKQOSA0jSW9zSqhU3EwS1spugn9GZ7XWajfh66IPp3bJ+g569dUys\nm2E8z/hBRU5bfezQK21Qx57Pf3uECakZBgsXPW5lLgCtfeItS9hJgIQnqfXa+p9O\ntlXRKAs9EERLr+UHkNV8/p4pysa2IE+b7U5dXNpWsQKBgQDlVHfBDmQc9vAPQxan\nQjVczJwM2I6jJtl0Z/YmXO3P0FrAC/+Z27OZkIzFU6M4iqOG2qdqdtwADW5HUi3C\nllzplWLVocD152VFNq5TVg3V4S6c/TC0TLJouR56yaiifA+2r9+aYwC6SAXndPm4\nP32Z3/vLJty8AOvyzH4+HSTNKQKBgQDe6YXysiQbPB1GCUsyWeRyt2GEIXid8bTE\ng3RaAJVmAXAI2OMsRPAVWU751TKknHDia2D8VtepnfG2qY81a6epZ3qTbGA+C/f2\n5q4BU7VWByGSV6FWEVYRralcRMWqCn3TPra7eda3EPJRshWHWsi4etEYOrHgj+eJ\n9hi4G/aSdQKBgQC9zXAj72Y6dsJuz0bTfb+uo4XQN/et3ryBVH3seGM26SoC4qtU\nyvpVccaglr1zUYNQXG3NdrxUqskH7GMFNu+FP+eCCpMqsq4lX8FeJc3jo7Cxq/gA\nca4DcJtiYr7YZDeZKuy02ZXDl1KTo0P/E0U/8ppyJCLy0wx1cnxVqkdIKQKBgHmc\nWTFgsoYRM79Dzrx3gkR7ez4ErLMubHpRZSa87sSpwB9zg+xg58Id6RIvl+NqXcOI\n5W6FSj8FJhuLQc/ZHa00ARFwrMjs6qjOjNu4eVOnrE8Uc7Zq2tPmNGFcO6Ja+u5G\nZpa9D8DsA+dCCrC/fIX4qx5W1zg2ChGgKzg2OT0JAoGAMyPMLdHY2Im9Xz6G8vbI\nbw3NPQB1xef+matYaiw2YN9ftFfkEYIGtalxUW5o/8h24tDhjhabH7AjpvytWiRh\ncKB9aQp2+SFh7oZIgzeWH/1XnXqBWFHidr0EV15lcUIr1YbzD4Aq095hjz4oKkvp\nZ2AjnuUrCKD2Kqa2jlZJ/gI=\n-----END PRIVATE KEY-----\n",
    databaseId: "(default)"
};

// INITIALIZE FIREBASE
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: NEW_ADMIN_CONFIG.projectId,
            clientEmail: NEW_ADMIN_CONFIG.clientEmail,
            privateKey: NEW_ADMIN_CONFIG.privateKey.replace(/\\n/g, '\n'),
        }),
    });
}
const db = getFirestore();

// HELPERS
async function scrapeGSMArena(url: string) {
    console.log(`Searching: ${url}`);
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });
        const $ = cheerio.load(data);

        // Core extraction
        const name = $('.specs-phone-name-title').text();
        const priceStr = $('[data-spec="price"]').text(); // "About 1200 EUR"

        let price = 0;
        // Updated Regex for common formats: "About 1200 EUR", "1200 EUR", etc.
        const priceMatch = priceStr.match(/(\d[\d\s,]*)/);
        if (priceMatch && priceStr.includes('EUR')) {
            price = parseInt(priceMatch[1].replace(/[\s,]/g, ''), 10);
        } else if (priceMatch && priceStr.includes('$')) {
            // Basic USD conversion fallback if EUR missing?
            // For now, strict EUR
            // Or assume number is price.
            price = parseInt(priceMatch[1].replace(/[\s,]/g, ''), 10); // Dangerous if currency mix?
        }

        // Extract basic specs just in case
        const storage = $('[data-spec="internalmemory"]').text(); // "128GB/256GB/512GB/1TB..."
        const battery = $('[data-spec="batdescription1"]').text();
        const year = $('[data-spec="year"]').text(); // "2023, September"

        return {
            name,
            priceEur: price,
            specs: {
                storage,
                battery,
                year
            },
            sourceUrl: url
        };

    } catch (e: any) {
        console.error("Scrape Error:", e.message);
        return null;
    }
}

async function main() {
    console.log("🚀 Syncing Pricing Anchors...");
    let successCount = 0;

    for (const [slug, url] of Object.entries(GSMARENA_LINKS)) {
        if (!url) continue;

        const data = await scrapeGSMArena(url);
        if (data && data.priceEur > 0) {
            console.log(`✅ [${slug}] ${data.name} => €${data.priceEur}`);

            await db.collection('pricing_anchors').doc(slug).set({
                slug: slug,
                deviceName: data.name,
                anchorPriceEur: data.priceEur,
                sourceUrl: data.sourceUrl,
                specs: data.specs,
                lastScraped: new Date().toISOString()
            });
            successCount++;
        } else {
            console.warn(`⚠️ [${slug}] No price found or scrape failed. (Price: ${data?.priceEur})`);
        }

        // Random delay 1-3s
        const sleep = Math.floor(Math.random() * 2000) + 1000;
        await new Promise(r => setTimeout(r, sleep));
    }
    console.log(`🏁 Sync Complete! Updated ${successCount} anchors.`);
}

main().catch(console.error);
