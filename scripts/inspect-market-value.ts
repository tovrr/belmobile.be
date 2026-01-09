const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load env
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach((line: string) => {
            const [key, value] = line.split('=');
            if (key && value) {
                let val = value.trim();
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                process.env[key.trim()] = val;
            }
        });
    }
} catch (e) { }

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

async function checkMarketValue(slug: string) {
    console.log(`Checking market value for: ${slug}`);
    try {
        const doc = await db.collection('market_values').doc(slug).get();
        if (doc.exists) {
            console.log("✅ Market Value Record Found:");
            console.log(JSON.stringify(doc.data(), null, 2));
        } else {
            console.log("❌ No record found in 'market_values'");
        }
    } catch (e) {
        console.error("Error fetching data:", e);
    }
}

const args = process.argv.slice(2);
const slug = args[0] || 'apple-iphone-13';
checkMarketValue(slug);
