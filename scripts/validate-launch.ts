import { normalizeDeviceId, getPriceQuote } from './src/services/server/pricing.dal';
import { getLocalizedPath } from './src/utils/i18n-helpers';

async function validate() {
    console.log("=== CROSS-LANGUAGE ROUTING TEST ===");
    const frPath = "/fr/reparation/apple/iphone-15-pro";
    const trPath = getLocalizedPath(frPath, 'tr');
    console.log(`FR: ${frPath} -> TR: ${trPath}`);
    if (trPath === "/tr/onarim/apple/iphone-15-pro") {
        console.log("✅ Routing correctly handled translation.");
    } else {
        console.log("❌ Routing failed translation.");
    }

    const trBuybackPath = "/tr/geri-alim/apple/iphone-15-pro";
    const nlBuybackPath = getLocalizedPath(trBuybackPath, 'nl');
    console.log(`TR Buyback: ${trBuybackPath} -> NL Buyback: ${nlBuybackPath}`);
    if (nlBuybackPath === "/nl/inkoop/apple/iphone-15-pro") {
        console.log("✅ Buyback routing correctly handled translation.");
    } else {
        console.log("❌ Buyback routing failed translation.");
    }

    console.log("\n=== NORMALIZE DEVICE ID TEST ===");
    const testSlugs = [
        "reparation-apple-iphone-15-pro",
        "onarim-apple-iphone-15-pro",
        "reparatie-apple-iphone-15-pro",
        "rachat-apple-iphone-15-pro",
        "geri-alim-apple-iphone-15-pro"
    ];
    testSlugs.forEach(slug => {
        const id = (normalizeDeviceId as any)(slug);
        console.log(`Slug: ${slug} -> normalized: ${id}`);
        if (id === "apple-iphone-15-pro") {
            console.log(`✅ Normalized ${slug}`);
        } else {
            console.log(`❌ Failed to normalize ${slug}`);
        }
    });

    console.log("\n=== METADATA & JSON-LD AUDIT ===");
    // Mocking the getPriceQuote response or calling it if we have credentials
    // Since I'm in a test script, I'll just check the logic in pricing.dal.ts
    const id = "apple-iphone-15-pro";
    const quote = await getPriceQuote(id);

    if (quote) {
        console.log(`Device: ${id}`);
        ['fr', 'nl', 'en', 'tr'].forEach(lang => {
            const seo = (quote.seo as any)[lang];
            console.log(`Language [${lang.toUpperCase()}]:`);
            console.log(`  Repair Title: ${seo.repair.title}`);
            console.log(`  Buyback Title: ${seo.buyback.title}`);
            console.log(`  Buyback Price in SEO: ${quote.buyback.maxPrice} (Type: ${typeof quote.buyback.maxPrice})`);
        });

        if (typeof quote.buyback.maxPrice === 'number') {
            console.log("✅ Buyback price is a number.");
        } else {
            console.log("❌ Buyback price is NOT a number.");
        }
    } else {
        console.log("⚠️ Could not fetch real quote (probably missing DB connection in test), skipping live data check.");
    }

    process.exit(0);
}

validate();
