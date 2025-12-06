
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyB-tTI2c7vVRjTcT-dP343kJVmXrWEKg04",
    authDomain: "bemobile-be-live.firebaseapp.com",
    projectId: "bemobile-be-live",
    storageBucket: "bemobile-be-live.firebasestorage.app",
    messagingSenderId: "762182430296",
    appId: "1:762182430296:web:57265d4a4661bdc0cbe42d",
    measurementId: "G-M3D46BYRSX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkShops() {
    console.log("Checking shops collection...");
    const snapshot = await getDocs(collection(db, "shops"));
    snapshot.forEach(doc => {
        console.log(`\nShop ID: ${doc.id}`);
        const data = doc.data();
        console.log("Name:", data.name);
        console.log("Opening Hours:", data.openingHours);
        console.log("Slugs:", data.slugs);
        console.log("GMB URL:", data.googleMapUrl);
    });
}

checkShops();
