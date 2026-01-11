// import "server-only"; // Removed for script compatibility
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

let app: admin.app.App | undefined;

// Prevent multiple initializations in development
if (!admin.apps.length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    let cert: admin.ServiceAccount | null = null;

    if (serviceAccountJson) {
        try {
            cert = JSON.parse(serviceAccountJson);
            console.log("🛠️ Using FIREBASE_SERVICE_ACCOUNT from JSON string");
        } catch (e) {
            console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON");
        }
    } else if (projectId && clientEmail && privateKey) {
        cert = { projectId, clientEmail, privateKey };
    }

    if (!cert) {
        // Reduced noise during build time
        const logMethod = process.env.NODE_ENV === 'production' ? console.warn : console.error;
        logMethod("❌ SERVER ERROR: Missing Firebase Admin Credentials.");
        logMethod("   To fix this, add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to Vercel/env.");
        logMethod("   Alternatively, provide a single FIREBASE_SERVICE_ACCOUNT JSON string.");
    }

    try {
        if (cert) {
            app = admin.initializeApp({
                credential: admin.credential.cert(cert),
            });
            console.log("✅ Firebase Admin Initialized Successfully");
        }
    } catch (error) {
        console.error("❌ Firebase Admin Initialization Exception:", error);
    }
} else {
    app = admin.app();
}

// Safely export database connection
// We now target the default database as per the new project structure
export const adminDb = (app && getFirestore(app)) as FirebaseFirestore.Firestore;
export const adminStorage = (app && admin.storage(app)) as admin.storage.Storage;
export const adminAuth = (app && admin.auth(app)) as admin.auth.Auth;

if (!adminDb && process.env.NODE_ENV !== 'production') {
    console.warn("⚠️ adminDb export is undefined (Credentials Missing?)");
}
