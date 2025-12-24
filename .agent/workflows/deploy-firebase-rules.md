---
description: How to deploy only Firestore Security Rules without affecting Hosting
---

# Deploying Firestore Rules

You may need to update `firestore.rules` to change permissions or validation logic in the database.
To do this **without overwriting the Vercel-hosted frontend**, you must use the `--only` flag.

### 1. The Command
Run this command in your terminal:

```bash
firebase deploy --only firestore:rules
```

### 2. What this does
- ✅ Updates your security rules in the cloud.
- 🛡️ **Ignores** your `build` folder and hosting settings.
- 🛡️ **Ignores** Cloud Functions (unless you specify them).

### 3. Verification
- Go to the [Firebase Console](https://console.firebase.google.com/) -> Build -> Firestore Database -> Rules.
- Verify the "Last updated" timestamp matches your deployment.
