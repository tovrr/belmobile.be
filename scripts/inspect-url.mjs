
import { google } from 'googleapis';

async function inspectUrl() {
    console.log("🔍 Authenticating with GSC for Inspection...");
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'C:/Users/omero/Downloads/belmobile-firebase-d2b49fe21b90.json',
        scopes: ['https://www.googleapis.com/auth/webmasters'],
    });

    const searchConsole = google.searchconsole({ version: 'v1', auth });
    const siteUrl = 'sc-domain:belmobile.be';
    const inspectionUrl = 'https://belmobile.be/fr/reparation/apple/iphone-13'; // Target a high-value page

    try {
        console.log(`🕵️ Inspecting URL: ${inspectionUrl}...`);

        const res = await searchConsole.urlInspection.index.inspect({
            requestBody: {
                inspectionUrl: inspectionUrl,
                siteUrl: siteUrl,
                languageCode: "fr-BE"
            }
        });

        const result = res.data.inspectionResult;
        console.log("\n--- Index Inspection Results ---");
        console.log(`Verdict: ${result.indexStatusResult.verdict}`);
        console.log(`Coverage: ${result.indexStatusResult.coverageState}`);
        console.log(`Crawl Time: ${result.indexStatusResult.lastCrawlTime}`);

        if (result.richResultsResult) {
            console.log("\n--- Rich Results ---");
            console.log(`Detected Items: ${result.richResultsResult.detectedItems ? result.richResultsResult.detectedItems.length : 0}`);

            if (result.richResultsResult.detectedItems) {
                result.richResultsResult.detectedItems.forEach(item => {
                    console.log(`\nType: ${item.richResultType}`);
                    console.log(`Name: ${item.items ? item.items[0].name : 'N/A'}`);
                    // Check for issues/errors
                    // The API structure ensures we see if it's valid
                });
            }
        } else {
            console.log("\n❌ No Rich Results detected on this page (or page not indexed yet).");
        }

        if (result.mobileUsabilityResult) {
            console.log(`\nMobile Usability: ${result.mobileUsabilityResult.verdict}`);
        }

    } catch (e) {
        console.error("❌ Error inspecting URL:", e.message);
        if (e.message.includes('403')) console.log("👉 Suggestion: Enable 'Google Search Console API' in Google Cloud Console.");
        if (e.message.includes('404')) console.log("👉 URL might not be in the property or index yet.");
    }
}

inspectUrl();
