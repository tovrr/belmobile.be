# 🗺️ Operation Velocity Roadmap (Next 4 Weeks) - COMPLETED

**Status**: **MISSION COMPLETE** 🚀
**Launch Date**: 2026-01-05
**Completion Date**: 2026-01-13

### 🟢 Week 1: SEO Dominance (COMPLETED)
*   **Goal**: 500+ Indexed Device Pages.
*   **Strategy**: Programmatic SEO using `pricing_anchors` data.
*   **Tasks**:
    *   [x] Audit `sitemap.ts` for full coverage.
    *   [x] Optimize `generateMetadata` for High CTR.
    *   [x] Validate Structured Data (JSON-LD).

### 🟢 Week 2: Conversion (CRO) (COMPLETED)
*   **Goal**: 15% Recovery Rate.
*   **Tasks**:
    *   [x] Exit Intent Popups.
    *   [x] "Magic Link" Recovery Emails.
    *   [x] "Save Quote" functionality.

### 🟢 Week 3: B2B Fleet Portal (COMPLETED)
*   **Goal**: 1 Corporate Contract.
*   **Tasks**:
    *   [x] Client Dashboard View.
    *   [x] Bulk IMEI Upload.
    *   [x] Automated PDF Invoicing.

### 🟢 Week 4: Physical Expansion (COMPLETED)
*   **Goal**: 5 Partner Stores.
*   **Tasks**:
    *   [x] Kiosk Mode (Locked UI).
    *   [x] Print Label Integration.

---

## ️ Operation Stability (Phase 2)
**Goal**: Reliability, Speed, & Trust.
**Status**: STABLE �

### � Week 1: Observability (The "Eyes")
*   **Goal**: Zero "Silent Failures".
*   **Tasks**:
    *   [x] **Sentry Audit**: Tuned `tracesSampleRate`, enabled source map uploads, and hardened PII scrubbing.
    *   [x] **Vercel Analytics**: Enabled Audience & Speed Insights for performance monitoring.
    *   [x] **Logging**: Migrated `console.log/warn` to structured `logger` across critical API paths and DAL.

### � Week 2: Performance (The "Engine")
*   **Goal**: Sub-100ms interactions.
*   **Tasks**:
    *   [x] **Firestore**: Implemented `firestore.indexes.json` with composite indexes for shop-specific queries.
    *   [x] **Caching**: Implement & Verify `unstable_cache` / Tags in `pricing.dal.ts` and `productService.ts`.
    *   [x] **Images**: Validated `next/image` usage with `sizes`, `priority`, and remote patterns in `next.config.ts`.

### � Week 3: Hygiene (The "Armor")
*   **Goal**: Maintainable, lean code.
*   **Tasks**:
    *   [x] **Types**: Replaced `any` with specific interfaces in Pricing DAL, Firestore Hooks, and Core Components.
    *   [x] **Bundle**: Verified `pdfmake` lazy loading; uninstalled unused `playwright` (legacy) and `puppeteer`.
    *   [x] **Cleanup**: Removed `legacy/` directory and temporary scripts.

### � Week 4: Verification (The "Shield")
*   **Goal**: Automated confidence.
*   **Tasks**:
    *   [ ] **E2E Tests**: Playwright for Core Funnel (Planned for next sprint).
    *   [x] **Security Rules**: Hardened `firestore.rules` (fixed `repair_prices` debug vulnerability).

---

## 🚀 Operation Autonomy (Phase 3)
**Goal**: Conversion Intelligence & Fleet Scaling.
**Status**: **IN PROGRESS** 🟡

### 🟢 Week 1: Lead Recovery Pro (WhatsApp) (COMPLETED)
*   **Goal**: Recover high-value abandoned sessions via "Nudge" automation.
*   **Tasks**:
    *   [x] **Meta Connection**: Finalize WhatsApp Business Platform setup in Meta Events Manager.
    *   [x] **Message Templates**: Register and Approve "Abandoned Cart / Recovery" templates in Meta (Implementation ready).
    *   [x] **WhatsApp Recovery**: Automate notifications for leads > €300 via existing WhatsApp API route.
    *   [x] **Magic Link Logic**: Refine the "Resume Session" experience to ensure 100% state persistence on mobile.

### 🟡 Week 2: B2B Fleet Intelligence
*   **Goal**: Institutional-grade device management.
*   **Tasks**:
    *   [x] **IMEI Lifecycle**: Track repair history per IMEI in the B2B portal.
    *   [x] **Bulk Buyback**: Implement CSV/Excel upload for corporate fleet liquidation.

### 🔵 Week 3: Conversion & Yield (CRO)
*   **Goal**: Maximize ROI per visitor.
*   **Tasks**:
    *   [ ] **Incentive Engine**: A/B test "Cash" vs "Belmobile Store Credit (+15%)" for buybacks.
    *   [x] **Trust Signals**: Dynamically display "Last price paid in [City]" on device pages.

### 🟣 Week 4: Automated Verification
*   **Goal**: Prevent regression & fraud.
*   **Tasks**:
    *   [ ] **E2E Test Suite**: Implement modern `@playwright/test` for critical "Quote -> Label -> Email" flow.
    *   [ ] **Fraud Shield**: Integrate GSMA IMEI check API for high-value shipping orders.
