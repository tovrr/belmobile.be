
import { google } from 'googleapis';

async function auditCanonicalAndMobile() {
    console.log("🔍 Authenticating with GSC...");
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'C:/Users/omero/Downloads/belmobile-firebase-d2b49fe21b90.json',
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const searchConsole = google.searchconsole({ version: 'v1', auth });
    const siteUrl = 'sc-domain:belmobile.be';

    // We inspect a BUYBACK page this time to ensure coverage across page types
    const sensitiveUrl = 'https://belmobile.be/fr/rachat/apple/iphone-14';

    try {
        console.log(`🛡️ Auditing Canonical & Mobile Health for: ${sensitiveUrl}`);

        const res = await searchConsole.urlInspection.index.inspect({
            requestBody: {
                inspectionUrl: sensitiveUrl,
                siteUrl: siteUrl,
                languageCode: "fr-BE"
            }
        });

        const result = res.data.inspectionResult;
        const indexResult = result.indexStatusResult;
        const mobileResult = result.mobileUsabilityResult;

        console.log("\n--- CANONICALIZATION AUDIT ---");
        console.log(`• Status: ${indexResult.verdict}`);
        console.log(`• User-Declared Canonical: ${indexResult.userCanonical || 'MISSING/NONE'}`);
        console.log(`• Google-Selected Canonical: ${indexResult.googleCanonical || 'PENDING'}`);

        if (indexResult.userCanonical && indexResult.googleCanonical) {
            if (indexResult.userCanonical === indexResult.googleCanonical) {
                console.log("✅ MATCH: Google respects your authoritative version.");
            } else {
                console.log("⚠️ MISMATCH: Google ignored your canonical request. (This is common if the page was previously duplicated)");
            }
        }

        console.log("\n--- MOBILE USABILITY AUDIT ---");
        if (mobileResult) {
            console.log(`• Verdict: ${mobileResult.verdict}`);
            if (mobileResult.issues && mobileResult.issues.length > 0) {
                console.log("⚠️ Issues Found:");
                mobileResult.issues.forEach(issue => console.log(`   - ${issue.issueType}`));
            } else {
                console.log("✅ Page is Mobile Friendly");
            }
        } else {
            console.log("ℹ️ No Mobile Usability data available yet.");
        }

        console.log("\n--- CRAWL TECH ---");
        console.log(`• Last Crawl Time: ${indexResult.lastCrawlTime}`);
        console.log(`• Crawled As: ${indexResult.crawledAs}`);
        console.log(`• Indexing Allowed: ${indexResult.indexingState}`);

    } catch (e) {
        console.error("❌ Error auditing URL:", e.message);
    }
}

auditCanonicalAndMobile();
