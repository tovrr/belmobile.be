---
description: Perform a health and security audit of the platform
---

1. Check `.env.local` for accidental credential leaks.
2. Run `npm audit` to check for vulnerable dependencies.
3. Verify that `X-Admin-Token` is properly enforced on all sensitive `/api/admin/*` and `/api/shipping/*` routes.
4. Verify HMAC signature validation for all third-party webhooks (e.g., SendCloud).
5. Review Firestore rules for public write access vulnerabilities.
