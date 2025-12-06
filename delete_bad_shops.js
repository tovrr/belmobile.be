
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, deleteDoc } = require("firebase/firestore");

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

async function deleteBadShops() {
    console.log("Deleting bad shop docs (1, 2, 3)...");
    await deleteDoc(doc(db, "shops", "1"));
    await deleteDoc(doc(db, "shops", "2"));
    await deleteDoc(doc(db, "shops", "3"));
    console.log("Deleted.");
}

deleteBadShops();
