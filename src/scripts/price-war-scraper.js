const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);
const readline = require('readline');

const admin = require('firebase-admin');

// 1. Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp();
    } catch (e) {
        console.error("Firebase Init Error:", e);
    }
}
const db = admin.firestore();

// 2. Configuration & Selectors
const COMPETITORS = [
    {
        id: 'iclinique',
        name: 'iClinique',
        baseUrl: 'https://www.iclinique.be',
        selector: 'table tr:has-text("iPhone") td:nth-child(2), .price, .amount',
    },
    {
        id: 'fixit',
        name: 'Fix It Brussels',
        baseUrl: 'https://fixit-brussels.be',
        selector: '.woocommerce-Price-amount',
    },
    {
        id: 'misterminit',
        name: 'Mister Minit',
        baseUrl: 'https://misterminit.eu',
        selector: '.service-price',
    }
];

// Helper: Random Delay (Human behavior)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomHumanDelay = () => {
    const ms = Math.floor(Math.random() * 10000) + 5000;
    console.log(`      ⏳ Waiting ${(ms / 1000).toFixed(1)}s (Human Pause)...`);
    return delay(ms);
};

// Helper: Ask User for Input (Interactive Mode)
const askUser = (metrics) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => {
        rl.question(metrics, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

// Helper: Handle Google Consent Popup
async function handleConsentPopup(page) {
    try {
        // Common selectors for "Accept all" or "Tout accepter"
        // #L2AGLb is the ID for "Accept all" in many regions
        const consentButton = await page.$('#L2AGLb, button:has-text("Tout accepter"), button:has-text("Accept all"), div[role="button"]:has-text("Tout accepter")');
        if (consentButton) {
            console.log(`      🍪 Auto-clicking Google Consent...`);
            await consentButton.click();
            await page.waitForTimeout(2000); // Wait for popup to clear
            return true;
        }
    } catch (e) {
        // Ignore errors
    }
    return false;
}

// 3. The Scraper Logic
async function runPriceWarScraper(modelName, specificDeviceId = null) {
    console.log(`⚔️  Starting Bulletproof Price War Radar for: ${modelName}`);

    // --- SMART MAPPING ---
    let docId = specificDeviceId;
    if (!docId) {
        if (modelName.toLowerCase().startsWith('iphone')) {
            docId = 'apple-' + modelName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        } else {
            docId = modelName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        }
    }
    console.log(`   🎯 Target Device ID: ${docId}`);

    // --- FETCH INTERNAL PRICE ---
    let myLivePrice = null;
    try {
        const docRef = db.collection('repair_prices').doc(docId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            myLivePrice = data['screen_replacement_(generic)'] || data['screen_replacement_(original)'] || null;
            console.log(`   🛡️  Your Current Live Price: ${myLivePrice ? '€' + myLivePrice : 'NOT SET'}`);
        } else {
            console.log(`   ⚠️  Device not found in DB (${docId}).`);
        }
    } catch (e) {
        console.error(`   ❌ Failed to fetch internal price: ${e.message}`);
    }

    // --- BROWSER LAUNCH STRATEGY ---
    const SB_KEY = process.env.SCRAPINGBEE_API_KEY;
    let browser;

    if (SB_KEY) {
        console.log(`   🐝 Mode: ScrapingBee Proxy Detected. Launching Headless with Proxy...`);
        // Construct ScrapingBee Proxy URL
        // Format: http://API_KEY:render_js=false&premium_proxy=true@proxy.scrapingbee.com:8886
        // We use premium_proxy=true to get residential IPs which is crucial for Google
        const proxyUrl = `http://${SB_KEY}:render_js=false&premium_proxy=true&country_code=be@proxy.scrapingbee.com:8886`;

        browser = await chromium.launch({
            headless: true,
            proxy: { server: proxyUrl }
        });
    } else {
        console.log(`   👤 Mode: No Proxy Key. Launching HEADFUL Fallback (Stealth Mode)...`);
        console.log(`   👉 Please manually solve any CAPTCHAs if they appear!`);

        browser = await chromium.launch({
            headless: false, // FALLBACK TO HEADFUL
            args: ['--start-maximized']
        });
    }

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    const results = {};
    let lowestCompetitorPrice = Infinity;
    let captchaDetected = false;

    // --- COMPETITOR LOOP ---
    for (const comp of COMPETITORS) {
        try {
            console.log(`   -----------`);
            console.log(`   Scanning ${comp.name}...`);

            await randomHumanDelay();

            // Search Strategy
            const searchUrl = `https://www.google.com/search?q=site:${comp.baseUrl}+${encodeURIComponent(modelName)}+repair+price`;
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

            // --- HANDLE CONSENT ---
            await handleConsentPopup(page);

            // --- CAPTCHA CHECK ---
            // Generic check for common Google captcha text or elements
            const pageText = await page.innerText('body');
            if (pageText.includes("detected unusual traffic")) {
                console.log(`   🚨 CAPTCHA DETECTED!`);
                captchaDetected = true;

                // Interactive Solver for Free Mode
                if (!SB_KEY) {
                    console.log(`   🛑 SCRIPT PAUSED.`);
                    console.log(`   👉 Please perform the CAPTCHA check in the browser window now.`);
                    await askUser("   ⌨️  Press ENTER here once you have solved it and results are visible...");
                    console.log(`   ✅ Resuming...`);
                }
            }

            // --- RESULT PROCESSING ---
            let hasResult = await page.waitForSelector('h3', { timeout: 5000 }).catch(() => null);

            // Interactive Fallback: If no results, ask user to help
            if (!hasResult && !SB_KEY) {
                console.log(`   ⚠️  No results found automatically.`);
                console.log(`   👉 Do you see a Consent Popup or CAPTCHA in the browser?`);
                await askUser("   ⌨️  Please clear any blocks in the browser and press ENTER to retry...");
                // Retry finding selector once
                hasResult = await page.waitForSelector('h3', { timeout: 5000 }).catch(() => null);
            }

            if (hasResult) {
                await randomHumanDelay();

                const firstLink = await page.$('h3');
                if (firstLink) {
                    await firstLink.click();
                    await page.waitForLoadState('domcontentloaded');
                    await page.waitForTimeout(3000); // Settling time

                    // Extract Prices
                    let foundPrices = [];

                    // 1. Selector Specific
                    if (comp.selector) {
                        try {
                            if (comp.id === 'iclinique') {
                                const rows = await page.$$('tr');
                                for (const row of rows) {
                                    const text = await row.innerText();
                                    if (text.toLowerCase().includes(modelName.toLowerCase()) || text.toLowerCase().includes('écran')) {
                                        const priceText = await row.innerText();
                                        const match = priceText.match(/€\s*(\d+[,.]?\d*)/);
                                        if (match) foundPrices.push(parseFloat(match[1].replace(',', '.')));
                                    }
                                }
                            }
                        } catch (err) { }
                    }

                    // 2. Fallback Regex
                    if (foundPrices.length === 0) {
                        const content = await page.content();
                        const priceRegex = /€\s*(\d+[,.]?\d*)/g;
                        const matches = [...content.matchAll(priceRegex)];
                        if (matches.length > 0) {
                            foundPrices = matches
                                .map(m => parseFloat(m[1].replace(',', '.')))
                                .filter(p => p > 30 && p < 600);
                        }
                    }

                    if (foundPrices.length > 0) {
                        const estimatedPrice = Math.min(...foundPrices);
                        if (estimatedPrice < lowestCompetitorPrice) lowestCompetitorPrice = estimatedPrice;

                        console.log(`   ✅ Found Price: €${estimatedPrice}`);
                        results[comp.id] = {
                            competitor: comp.name,
                            price: estimatedPrice,
                            url: page.url(),
                            lastUpdated: new Date().toISOString(),
                            product: modelName
                        };
                    } else {
                        console.log(`   ⚠️  No prices found on page.`);
                    }
                }
            } else {
                console.log(`   ⚠️  No Google results found (or blocked).`);
            }

        } catch (e) {
            console.error(`   ❌ Failed to scrape ${comp.name}: ${e.message}`);
        }
    }

    await browser.close();

    // --- SAVE TO FIRESTORE ---
    if (Object.keys(results).length > 0 || captchaDetected) {

        const marketMin = lowestCompetitorPrice === Infinity ? 0 : lowestCompetitorPrice;

        // Audit logic
        let auditStatus = 'UNKNOWN';
        let priceGap = 0;
        let alertTriggered = false;

        if (myLivePrice && marketMin > 0) {
            priceGap = marketMin - myLivePrice;
            if (priceGap < -5) {
                auditStatus = 'UNDERPRICED_ALERT';
                alertTriggered = true;
            } else if (priceGap > 5) {
                auditStatus = 'OVERPRICED_OPP';
            } else {
                auditStatus = 'COMPETITIVE';
            }
        }

        if (captchaDetected) {
            auditStatus = 'BLOCKED_CAPTCHA';
            alertTriggered = true;
        }

        await db.collection('competitor_prices').doc(docId).set({
            competitors: results,
            market_min: marketMin,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            market_intel: {
                my_last_known_price: myLivePrice || 0,
                price_gap: priceGap,
                status: auditStatus,
                confidence: Object.keys(results).length > 1 ? 'HIGH' : 'LOW',
                alert_triggered: alertTriggered,
                captcha_blocked: captchaDetected
            }
        }, { merge: true });

        console.log(`💾 Scrape Result Saved. Status: ${auditStatus}`);
    } else {
        console.log(`🤷 No actionable data found.`);
    }

    return results;
}

if (require.main === module) {
    const targetModel = process.argv[2] || 'iPhone 13';
    const targetDeviceId = process.argv[3] || null;
    runPriceWarScraper(targetModel, targetDeviceId).then(() => process.exit(0));
}

module.exports = { runPriceWarScraper };
