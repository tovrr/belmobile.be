
import { google } from 'googleapis';

async function analyze() {
    console.log("🔍 Authenticating with GSC...");
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'C:/Users/omero/Downloads/belmobile-firebase-d2b49fe21b90.json',
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const webmasters = google.webmasters({ version: 'v3', auth });
    const siteUrl = 'sc-domain:belmobile.be';

    // Calculate dates (Last 28 days)
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 3); // GSC data has 2-3 day lag
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 28);

    const formatDate = (d) => d.toISOString().split('T')[0];

    try {
        console.log(`📊 Fetching Search Analytics for ${formatDate(startDate)} to ${formatDate(endDate)}...`);

        const res = await webmasters.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                dimensions: ['query', 'page'],
                rowLimit: 50
            }
        });

        const rows = res.data.rows || [];
        console.log(`\nFound ${rows.length} data points. Analyzing...\n`);

        // 1. Striking Distance (Position 11-20)
        console.log("🚀 STRIKING DISTANCE OPPORTUNITIES (Rank 11-20)");
        console.log("   (These keywords are on Page 2 - Easy wins!)");
        const striking = rows.filter(r => r.position >= 10 && r.position <= 20);
        if (striking.length === 0) console.log("   No striking distance keywords found.");
        striking.slice(0, 5).forEach(r => {
            console.log(`   - "${r.keys[0]}" -> ${r.keys[1]} (Pos: ${r.position.toFixed(1)}, Impr: ${r.impressions})`);
        });
        console.log("");

        // 2. High Impression / Low CTR (Underperforming Titles)
        console.log("🎣 LOW CTR OPPORTUNITIES (High visibility, few clicks)");
        console.log("   (Optimize Title/Meta for these!)");
        const lowCtr = rows.filter(r => r.impressions > 100 && r.ctr < 0.02); // >100 views, <2% clicks
        if (lowCtr.length === 0) console.log("   No obvious low CTR outliers found.");
        lowCtr.sort((a, b) => b.impressions - a.impressions).slice(0, 5).forEach(r => {
            console.log(`   - "${r.keys[0]}" (CTR: ${(r.ctr * 100).toFixed(1)}%, Impr: ${r.impressions})`);
        });
        console.log("");

        // 3. Top Performers
        console.log("🏆 TOP PERFORMING QUERIES");
        rows.sort((a, b) => b.clicks - a.clicks).slice(0, 5).forEach(r => {
            console.log(`   - "${r.keys[0]}" (${r.clicks} clicks, Pos: ${r.position.toFixed(1)})`);
        });

    } catch (e) {
        console.error("❌ Error analyzing GSC data:", e.message);
    }
}

analyze();
