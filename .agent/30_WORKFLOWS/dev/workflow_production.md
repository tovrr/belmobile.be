---
description: Deploy the platform to Production on Vercel
---

# Production Deployment Workflow

Production deployment is fully automated via Vercel integration with the GitHub repository.

### 1. Prerequisite
- Ensure changes have been verified on **Staging** (Vercel Preview) first.
- Ensure strict `npm run build` passes locally.

### 2. Triggering Deployment
> **STOP**: Have you verified the changes on Staging (`dev.belmobile.be`) on a real device in accordance with the SOP?

Please refer to `.agent/workflows/workflow_sop.md` for the official protocol.

If verification is complete:
```bash
git checkout main
git merge staging
git push origin main
```
> **Critical**: If Vercel has an active **Rollback** (Red Banner), you must manually **"Undo Rollback"** in the Vercel Dashboard before new deployments will go live.

### 3. Verification
- **URL**: [https://belmobile.be](https://belmobile.be)
- **Dashboard**: Check deployment status in the Vercel Dashboard.
- **Security Rules**: If you modified `firestore.rules`, run:
  ```bash
  firebase deploy --only firestore:rules
  ```
- **Rollback**: If issues arise, use the "Instant Rollback" feature in Vercel.

### 4. Architecture Note
- **Frontend**: Hosted on Vercel.
- **Backend**: Connected to Firebase Production (`belmobile-database`) via SDK.
- **Database Rules**: Managed via `firebase.json` / `firestore.rules` in the repo, but deployed separately if rules change (rare).
