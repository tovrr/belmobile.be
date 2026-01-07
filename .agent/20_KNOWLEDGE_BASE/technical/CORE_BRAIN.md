# 🧠 Brain of Belmobile Project (v2026.1)

**Belmobile.be Identity**: High-Velocity Device Buyback & Repair Platform (`next-platform`).
**Current Phase**: **OPERATION VELOCITY + B2B EXPANSION (Molenbeek Launch)**.
**Status**: Technical Foundation COMPLETED | Multi-Site Strategy ACTIVE.

---

## 🏛️ Core Architecture (The Immutable Truth)

### 1. The Pricing Engine (Hybrid V3)
*   **Logic**: `[src/utils/pricingLogic.ts]`
    *   **Repair**: Uses `repair_prices` collection (Manual Matrix). Constant prices.
    *   **Buyback**: Uses `buyback_pricing` (Anchor System).
    *   **Sources**: GSMArena (Market Anchor) via `[scripts/sync-device-data.mjs]`.
    *   **SSoT**: Every price flows through `pricing_anchors` before being verified for production.
*   **Admin**: `[BuybackAnchorManager]` (Dashboard) – Single point of control for the 3 Brussels shops.

### 2. The Multi-Site Router (New)
*   **Schaerbeek/Anderlecht**: Consumer Retail (High Flux / No Appointment).
*   **Molenbeek Hub**: B2B Fleet Operations (Exclusive Appointment Flow).
*   **Routing Logic**: `src/app/_actions/get-quote.ts` now differentiates leads based on volume (Fleet vs Single) and location availability.

### 3. Critical Workflows
*   **Lead Gen**: Wizard -> StepUserInfo -> `orderService.saveLead`.
*   **B2B Conversion**: Special B2B Landing Page -> Professional PDF Quote (`pdfMake`).
*   **SEO**: Programmatic Device Pages + Dynamic Suffixing (e.g., "Original Parts", "Express Repair").

---

## 🗺️ Operation Velocity Roadmap (Updated Jan 2026)

### 🟢 Week 1: SEO & B2B Launch (CURRENT FOCUS)
*   **Goal**: 500+ Indexed Pages & Molenbeek Activation.
*   **Tasks**:
    *   [ ] Deploy Molenbeek B2B Page with specific "Appointment Only" flow.
    *   [ ] Audit `sitemap.ts` to include new local SEO landing pages.
    *   [ ] Activate B2B Trust Badges on Homepage.

### 🟡 Week 2: Conversion (CRO)
*   **Goal**: 15% Recovery Rate.
*   **Tasks**:
    *   [x] Exit Intent Popups for "Cash Estimate" abandonment. (Completed)
    *   [ ] Implement "Save Quote" functionality for B2B price comparisons.

### 🔴 Week 3: Fleet Management Portal
*   **Goal**: 1st Corporate Contract signed (Molenbeek Focus).
*   **Tasks**:
    *   [ ] Batch IMEI Upload tool for Corporate Buyback.
    *   [ ] Automated PDF Invoicing for tax-deductible repairs.

### 🔵 Week 4: Partner Network
*   **Goal**: White-label Buyback Widget (Aegis Beta).
*   **Tasks**:
    *   [ ] Kiosk Mode for partner shops.

---

## 📝 Rules of Engagement

1.  **NO REFACTORING**: The pricing engine is stable. Focus on Feature Addition and Conversion.
2.  **MOLENBEEK FILTER**: Do not allow walk-in retail scheduling for Molenbeek on the website. Keep it Professional/B2B only.
3.  **MOBILE FIRST**: 85% traffic. Test the "Price Wizard" on mobile after every commit.
4.  **SSoT ADHERENCE**: All business strategy/checklists must be stored in `/docs` and indexed via `CONTROL_PANEL.md`.

---

## 🔐 Secrets & Config
*   **Firebase**: `belmobile-firebase` (Region: `europe-west1`).
*   **Docs Index**: `/docs/CONTROL_PANEL.md` (Source of Truth for Strategy).
*   **Admin Access**: `/login` -> Admin Dashboard.

*Last Updated: 2026-01-07 (Molenbeek Strategy Integration)*
