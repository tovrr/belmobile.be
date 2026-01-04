import "server-only";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

let app: admin.app.App;

// Prevent multiple initializations in development
if (!admin.apps.length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        console.error("❌ SERVER ERROR: Missing Firebase Admin Credentials in .env.local");
        console.error(`   - NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${!!projectId ? 'OK' : 'MISSING'}`);
        console.error(`   - FIREBASE_CLIENT_EMAIL: ${!!clientEmail ? 'OK' : 'MISSING'}`);
        console.error(`   - FIREBASE_PRIVATE_KEY: ${!!privateKey ? 'OK' : 'MISSING'}`);
        // Allow build to pass, but runtime will fail if accessed
    }

    try {
        if (projectId && clientEmail && privateKey) {
            app = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            console.log("✅ Firebase Admin Initialized Successfully");
        } else {
            // Mock app for build time safety if needed, or null
        }
    } catch (error) {
        console.error("❌ Firebase Admin Initialization Exception:", error);
    }
} else {
    app = admin.app();
}

// Safely export database connection
// We now target 'belmobile-database' explicitly to match the Client SDK
// If app is undefined (credentials missing), accessing this will throw a clearer error
export const adminDb = (app && getFirestore(app, "belmobile-database")) as FirebaseFirestore.Firestore;

if (!adminDb && process.env.NODE_ENV !== 'production') {
    console.warn("⚠️ adminDb export is undefined (Credentials Missing?)");
}
