/**
 * FIREBASE CONFIGURATION - BELMOBILE
 * 
 * CRITICAL: This project uses 'belmobile-database' exclusively.
 * The '(default)' database is deprecated and should NOT be used for production data.
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

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
export const db = getFirestore(app, "belmobile-database");
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
