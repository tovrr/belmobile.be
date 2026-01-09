# 🧠 Brain of Belmobile Project (v2026.3)

**Belmobile.be Identity**: High-Velocity Device Buyback & Repair Platform (`next-platform`).
**Current Phase**: **OPERATION VELOCITY + B2B EXPANSION (Molenbeek Launch)**.
**Status**: Technical Foundation COMPLETED | Multi-Site Strategy ACTIVE.

---

## 🏛️ Core Architecture (The Immutable Truth)

### 1. The Pricing Engine (Bulletproof V3)
*   **Logic**: `[src/utils/pricingLogic.ts]` (Refactored Jan 2026)
    *   **Architecture**: Declarative Strategy Pattern (Strict Tier Lookup).
    *   **Repair**: Uses `repair_prices` collection (Manual Matrix). Constant prices.
    *   **Buyback**: Uses `buyback_pricing` (Anchor System).
    *   **Resilience**: Wrapper `try/catch` with safe fallbacks (0) for missing data.
    *   **Admin**: `[BuybackAnchorManager]` (Command Center) – Single point of control for the 443 models. Manual Anchor based (No Scrapers).
*   **Polymorphic Pricing**: The Command Center adapts based on category:
    *   **Phones/Tablets**: Base Anchor + 6% Storage Jump.
    *   **Consoles**: Manual prices for "0/1/2 Controllers" variants.
    *   **Laptops**: Multi-Spec configuration pricing.
*   **SSoT Verification**: Automated scripts like `verify-ssot.ts` must be used after every pricing update to ensure the DAL (Pricing Engine) and SEO (JSON-LD) match exactly. No manual overrides allowed in production.
*   **Slug Integrity**: internal slugs (e.g., `samsung-galaxy-s24-ultra`) MUST be SEO-clean. Avoid redundant technology suffixes like `-5g` in slugs unless required for unique identification (e.g., A52 vs A52s).

### 2. The Multi-Site Router (New)
*   **Schaerbeek/Anderlecht**: Consumer Retail (High Flux / No Appointment).
*   **Molenbeek Hub**: B2B Fleet Operations (Exclusive Appointment Flow).
*   **Routing Logic**: `src/app/_actions/get-quote.ts` now differentiates leads based on volume (Fleet vs Single) and location availability.

### 3. Critical Workflows
*   **Lead Gen**: Wizard -> StepUserInfo -> `orderService.saveLead`.
*   **B2B Conversion**: Special B2B Landing Page -> Professional PDF Quote (`pdfMake`).
*   **SEO**: 
    *   **Programmatic**: Device Pages generated via `sitemap.ts`.
    *   **Deep Linking**: Wizard (`useWizardSEO`) syncs URL `/service/model` in real-time.

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

1.  **NO REFACTORING**: Pricing Engine V2 is now "Bulletproof". Do not touch unless adding new Extension Strategies (e.g., new device types).
2.  **MOLENBEEK FILTER**: Do not allow walk-in retail scheduling for Molenbeek on the website. Keep it Professional/B2B only.
3.  **MOBILE FIRST**: 85% traffic. Test the "Price Wizard" on mobile after every commit.
4.  **SSoT ADHERENCE**: All business strategy/checklists must be stored in `/docs` and indexed via `CONTROL_PANEL.md`.
5.  **GRAMMAR SENSITIVITY**: Respect language-specific sentence structures (e.g., TR/NL Object-First "iPhone 15 Verkopen") in all Wizard and Meta Title generation.
6.  **ADMIN UX (DUAL-VIEW)**: All admin management pages MUST implement a dual-view architecture: Desktop (Persistent Tables with visible actions) and Mobile (Card-Based layouts with condensed actions). Never rely on hover-only actions.
7.  **SCRIPT AUTH**: All Firebase-admin scripts MUST include the standard `privateKey.replace(/\\n/g, '\n')` logic to handle Vercel/Environment secrets correctly.
8.  **PRICING SSOT**: The Admin **Buyback Command Center** is the ONLY Source of Truth for buyback prices. Do not manually edit CSVs for production updates. After clicking "Sync Prices" in the dashboard, run `verify-ssot.ts --slug=[brand-model]` to guarantee integrity.
9.  **SCRAPER BAN**: Do not use the GSMArena scraper for pricing. It is decommissioned due to IP bans. Always use the "Activate Model" feature in the Command Center for new devices.

---

## 🔐 Secrets & Config
*   **Firebase**: `belmobile-firebase` (Region: `europe-west1`).
*   **Docs Index**: `/docs/CONTROL_PANEL.md` (Source of Truth for Strategy).
*   **Admin Access**: `/login` -> Admin Dashboard.

*Last Updated: 2026-01-08 (Operation Velocity Pricing Audit)*
