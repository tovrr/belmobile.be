const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc, doc, deleteDoc } = require('firebase/firestore');
const { MOCK_SHOPS } = require('./src/constants.ts');

// Firebase config from .env.local
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncShopsToFirestore() {
    console.log('Syncing MOCK_SHOPS to Firestore...\n');

    try {
        // First, get all existing shops to see what we have
        const shopsSnapshot = await getDocs(collection(db, 'shops'));
        console.log(`Found ${shopsSnapshot.size} existing shops in Firestore\n`);

        // Delete all existing shops
        console.log('Deleting existing shops...');
        for (const docSnapshot of shopsSnapshot.docs) {
            await deleteDoc(doc(db, 'shops', docSnapshot.id));
            console.log(`Deleted shop: ${docSnapshot.id}`);
        }
        console.log('\n');

        // Add all shops from MOCK_SHOPS
        console.log('Adding shops from MOCK_SHOPS...');
        for (const shop of MOCK_SHOPS) {
            const shopData = {
                ...shop,
                id: String(shop.id) // Ensure ID is a string
            };

            await setDoc(doc(db, 'shops', String(shop.id)), shopData);
            console.log(`Added shop: ${shop.name} (ID: ${shop.id}, Status: ${shop.status})`);
        }

        console.log('\n✅ Successfully synced all shops to Firestore!');
        console.log(`\nShops with status 'open': ${MOCK_SHOPS.filter(s => s.status === 'open').length}`);
        console.log(`Shops with status 'coming_soon': ${MOCK_SHOPS.filter(s => s.status === 'coming_soon').length}`);

    } catch (error) {
        console.error('❌ Error syncing shops:', error);
    }
}

syncShopsToFirestore();
