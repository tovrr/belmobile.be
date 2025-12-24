---
description: How to maintain and access the Staging Environment
---

# Staging Environment Workflow

The staging environment (`dev.belmobile.be` or Vercel Preview URL) is a mirror of production used for final verification.

### 1. Accessing Staging
- **URL**: `https://dev.belmobile.be` (or your Vercel preview link)
- **PIN Code**: `2580`
- **Protection**: The site is protected by `src/proxy.ts` application-level logic.

### 2. Critical Vercel Configuration
**WARNING**: Vercel automatically enables "Deployment Protection" (Vercel Authentication) for preview deployments. This **CONFLICTS** with our application-level PIN gate.

**You MUST disable Vercel Authentication:**
1.  Go to Vercel Dashboard -> Project -> Settings -> **Deployment Protection**.
2.  Find **"Vercel Authentication"**.
3.  Set "Enabled for Standard Protection" to **OFF**.
4.  Click **Save**.

*If mistakenly enabled, users will be redirected to a Vercel Login screen instead of our PIN screen.*

### 3. Build & Deploy
- Pushing to the `staging` branch (or opening a PR) automatically triggers a deployment.
- Check `src/proxy.ts` (Next.js 16) or `middleware.ts` (Next.js 15) logic if redirects behave identically in local dev but fail on Vercel.
