---
description: Deploy the platform to Production on Vercel
---

# Production Deployment Workflow

Production deployment is fully automated via Vercel integration with the GitHub repository.

### 1. Prerequisite
- Ensure changes have been verified on **Staging** (Vercel Preview) first.
- Ensure strict `npm run build` passes locally.

### 2. Triggering Deployment
To deploy to production, simply merge your changes to the `main` branch and push:

```bash
git checkout main
git merge staging
git push origin main
```

### 3. Verification
- **URL**: [https://belmobile-next-st7t42wyo-tovrrs-projects.vercel.app](https://belmobile-next-st7t42wyo-tovrrs-projects.vercel.app)
- **Dashboard**: Check deployment status in the Vercel Dashboard.
- **Rollback**: If issues arise, use the "Instant Rollback" feature in Vercel to revert to the previous deployment ID.

### 4. Architecture Note
- **Frontend**: Hosted on Vercel.
- **Backend**: Connected to Firebase Production (`belmobile-database`) via SDK.
- **Database Rules**: Managed via `firebase.json` / `firestore.rules` in the repo, but deployed separately if rules change (rare).
