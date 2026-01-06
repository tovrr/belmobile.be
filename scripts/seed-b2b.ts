
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// -- INIT --
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

let cert = null;
if (serviceAccountJson) {
    try {
        cert = JSON.parse(serviceAccountJson);
    } catch (e) { console.error("Bad JSON cert"); }
} else if (projectId && clientEmail && privateKey) {
    cert = { projectId, clientEmail, privateKey };
}

if (!cert) {
    console.error("❌ Missing Credentials. Ensure .env.local has FIREBASE keys.");
    process.exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(cert),
    });
}
const db = getFirestore();
const auth = admin.auth();

async function seed() {
    console.log("🌱 Seeding B2B Portal Data...");

    // 1. Create Company
    const companyId = 'TEST-CORP-01';
    const companyData = {
        name: 'Acme Corporation',
        vatNumber: 'BE0987654321',
        contactEmail: 'admin@acme.com',
        contractTier: 'premium',
        priceMultiplier: 0.9,
        billingAddress: {
            street: 'Rue de la Loi',
            number: '16',
            box: 'B',
            city: 'Brussels',
            zip: '1000',
            country: 'Belgium'
        },
        deliveryAddresses: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('b2b_companies').doc(companyId).set(companyData);
    console.log(`✅ Company Created: ${companyId}`);

    // 2. Create User (Auth + Firestore)
    const testEmail = 'b2b-demo@belmobile.be';
    // const testPass = 'Belmobile2026'; // We can't set password easily via Admin SDK unless we do it via update or create.
    const uid = 'b2b-demo-user';

    try {
        await auth.deleteUser(uid);
    } catch (e) { } // ignore if not exists

    await auth.createUser({
        uid: uid,
        email: testEmail,
        password: 'Password123!',
        displayName: 'John Doe',
        emailVerified: true
    });
    console.log(`✅ Auth User Created: ${testEmail} (Password123!)`);

    const userData = {
        uid: uid,
        companyId: companyId, // LINKED HERE
        email: testEmail,
        fullName: 'John Doe',
        role: 'admin',
        isActive: true
    };
    await db.collection('b2b_users').doc(uid).set(userData);
    console.log(`✅ User Profile Created in Firestore b2b_users`);

    // 3. Create Inventory (3 Devices)
    const devices = [
        { brand: 'Apple', model: 'iPhone 13', companyId, status: 'active', assignedTo: 'Alice', imei: '358123456789012' },
        { brand: 'Samsung', model: 'Galaxy S23', companyId, status: 'in_repair', assignedTo: 'Bob', imei: '359123456789012' },
        { brand: 'Apple', model: 'MacBook Air M2', companyId, status: 'active', assignedTo: 'CEO', serialNumber: 'FVFGWE123' }
    ];

    for (const dev of devices) {
        await db.collection('b2b_inventory').add({
            ...dev,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    console.log(`✅ Inventory Seeded (3 Devices)`);
    console.log("Done.");
}

seed().catch(console.error);
