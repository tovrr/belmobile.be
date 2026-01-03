# 🎯 Sentry Vigilance Guide: Belmobile Production Launch (First 24h)

This guide outlines the essential monitoring steps to ensure the stability, security, and SEO health of the Belmobile platform following the production deployment.

---

## 1. 🛡️ Noise Filtering (Signal vs. Noise)
Production environments are often flooded with irrelevant browser extension errors. To focus on the **Signal** (your server and business logic):

- **In Sentry Dashboard**: 
    - Go to **Project Settings** > **Inbound Filters**.
    - Enable **"Filter out errors thrown from common browser extensions"**.
    - Enable **"Filter out known legacy browser errors"**.
- **Issue Search Query**: Use the following query in the "Issues" tab to focus on critical failures:
  `is:unresolved !mechanism:handled tag:env:production`
- **Focus Areas**:
    - `api/orders/submit`: Monitor for any `Brevo` or `PDF` related timeouts.
    - `firebase-auth`: Monitor for `auth/network-request-failed` (Check CORS/Whitelisting).

## 2. ⚡ Alert Thresholds (When to Worry)
Set up **Performance Alerts** in Sentry to notify you if user experience degrades:

| Metric | Threshold | Action Needed |
| :--- | :--- | :--- |
| **PDF Generation** | > 5s | Potential memory leak or heavy Base64 processing in API route. |
| **Email Dispatch** | > 3s | Brevo API latency; check if Brevo is experiencing downtime. |
| **FCP (First Contentful Paint)** | > 2s | Large assets (Header icons/Hero images) are not optimized. |
| **LCP (Largest Contentful Paint)** | > 3.5s | Critical performance issue; check bundle size or slow server response. |

## 3. 🔍 404 Tracking & SEO Health
With ~1800 dynamic routes, malformed slugs are your biggest threat to SEO ranking.

- **Catching Malformed Slugs**:
    - Filter Issues by `status:404` and `logger:nextjs`.
    - Look at the `url` tag to identify which slugs are failing. 
    - **Proactive Check**: If you see a cluster of 404s on a specific brand (e.g., `/fr/reparation/apple/...`), check the `slugToDisplayName` utility or the `parseRouteParams` logic.
- **Sitemap Sync**: Ensure Sentry doesn't show 404s for URLs that exist in your `sitemap.xml`.

## 4. 🧼 PII Confirmation Checklist (RGPD/GDPR)
Verify that the `beforeSend` hook in `sentry.client.config.ts` and `sentry.server.config.ts` is effective.

**Verification Steps**:
1. [ ] Search Sentry Issues for any string containing `@` (to find escaped emails).
2. [ ] Search for keywords: `email`, `phone`, `customerName`, `imei`.
3. [ ] Check the **"Additional Data"** section of an error from the `/api/orders/submit` route.
4. [ ] **Pass Condition**: Sensitive fields should show `[SCRUBBED]` or be completely missing from the telemetry data.

---

## 🚀 Emergency Response
If the **Customer Email Dispatch** fails more than 3 times in 10 minutes:
1. Check Brevo API Key expiration.
2. Verify the `NEXT_PUBLIC_BASE_URL` sanitization hasn't caused a mismatch in the absolute URL generation for the PDF logo.
3. Check Server Logs for `[Email] Customer dispatch success: false`.

---

> [!IMPORTANT]
> Keep the **Sentry Performance** tab open during the first hour of peak traffic (usually lunch-time and post-18:00) to monitor the "real-world" latency of your server-side API routes.
