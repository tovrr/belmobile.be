---
description: How to maintain and access the Staging Environment
---

# Staging Environment Workflow

The staging environment (`dev.belmobile.be` or Vercel Preview URL) is a mirror of production used for final verification.

> [!IMPORTANT]
> **Workflow Policy**: ALWAYS push changes to the `staging` branch first. Only merge to `main` after verification and confirmation.

### 1. Accessing Staging
- **URL**: `https://dev.belmobile.be` (or your Vercel preview link)
- **PIN Code**: `2580`
- **Protection**: The site is protected by `src/proxy.ts` application-level logic.

### 2. Deployment Architecture
- **Frontend**: Hosted on Vercel (Preview Environment).
- **Backend**: Connected to Firebase Production (Same as main, but protected by PIN).

### 3. Vercel Configuration
- **Vercel Authentication**: Ensure "Deployment Protection" is **DISABLED** to allow our application-level `src/proxy.ts` PIN protection to function.
- **Trigger**: Push to `staging` branch (or Pull Request).

### 4. Verification
1. Open the Preview URL.
2. Enter PIN `2580`.
3. Verify core flows (Buyback, Repair, Chat) work with live Firebase data.
