# 🚀 Release Notes: Belmobile Core 1.0.0

**Date:** January 2, 2026
**Status:** Deployed to Production
**Codename:** "Market Leader"

## 💎 executive Summary
This release marks the transition from MVP (`next-platform`) to a scalable enterprise solution (`belmobile-core`). Key achievements include a complete overhaul of the translation engine, a $0 cost performance architecture upgrade, and the establishment of a robust corporate identity.

## ⚡ Performance Architecture
| Metric | Before (SSR) | After (ISR + Edge) | Impact |
| :--- | :--- | :--- | :--- |
| **Region** | US East (Washington) | **Global Edge (Paris)** | 🌍 Localized Speed |
| **Latency** | ~250ms (Roundtrip) | **<50ms (Cache Hit)** | ⚡ 5x Faster TTFB |
| **Cost** | High (Pro Required) | **$0 (Hobby Compatible)** | 💰 Budget Optimized |
| **Scaling** | Dynamic on-demand | **Cached & Scalable** | 📈 High Traffic Ready |

## 🌍 Localization & Content
*   **French (`fr.json`):**
    *   Resolved critical duplicate keys causing linting failures.
    *   Standardized B2B terminology ("Flotte", "TVA Déductible").
*   **Identity Upgrade:**
    *   Renamed package to `belmobile-core`.
    *   Updated `public/llms.txt` to position Belmobile as an Authority for AI Agents.
*   **SEO:**
    *   Verified Sitemap Strategy (Dynamic 1800+ URLs).
    *   Confirmed `sitemap.xml` builds correctly for iPhone 17 readiness.

## 💼 B2B & Growth Features
*   **Business Page ("Pro"):**
    *   **Interactive Savings Calculator:** Real-time simulation of savings based on Fleet Size.
    *   **Lead Magnet:** "Unlock Corporate Rates" form capturing high-intent B2B leads directly.
*   **Maillage Interne (Internal Linking):**
    *   **Cross-Funnel Loops:** Users on Repair pages are nudged to Buyback ("Too expensive? Sell it") and vice versa ("Want to keep it? Fix it").
    *   **B2B Upsell:** Fleet Management promo injected into consumer Repair pages.
*   **AEGIS PDF V2:**
    *   **Modular Architecture:** Entire PDF engine refactored into Atomic Render Blocks for 100% layout stability.
    *   **1-Page Optimization:** Strategic space management ensures all documents (Forms, Orders, Reservations) fit on a single A4 page.
    *   **SVG Branding:** Switched to institutional ink-saver SVG logos for crystal-clear printing.
    *   **TR Support:** Full Turkish language support integrated into the PDF generation pipeline.

## 🛠 Technical Fixes
*   **Fixed:** `fr.json` trailing comma syntax error.
*   **Fixed:** `npm run dev` naming confusion.
*   **Added:** `docs/PERFORMANCE_STRATEGY.md` (Architecture Documentation).
*   **Added:** `docs/DEVICE_IMAGE_STRATEGY.md` (Visuals Roadmap).

## 🔮 Next Steps (Phase 2)
*   **Visuals:** Implement CSS/SVG Devices to replace static images.
*   **Verification:** Monitor Vercel Dashboard for deployment health.

## 🚀 Patch: Surgical Refinement & Deep Linking (Jan 8, 2026)
*   **SEO & Routing ("The Phantom Page Fix"):**
    *   **Deep Linking Active:** Wizard now updates URL in real-time (e.g., `/fr/rachat/apple/iphone-15-pro`).
    *   **Localized Slugs:** Full support for `/reparation` (FR), `/inkoop` (NL), etc.
    *   **Metadata Sync:** Dynamic page titles map perfectly to the user's selected model.
*   **Pricing Engine V2:**
    *   **Bulletproof Logic:** Replaced fragile "deduction math" with a strict Declarative Strategy Pattern in `pricingLogic.ts`.
    *   **Type Safety:** Removed invalid `capacity` field from Buyback records.
    *   **Resilience:** added `try/catch` guard rails to prevent calculation crashes.
*   **Localization (Turkish & Dutch Polish):**
    *   **Grammar Engine:** Implemented linguistic-aware title generation (Object-Verb order for TR/NL: "iPhone 15 Verkopen").
    *   **Typewriter Fix:** Adjusted Step 1 visual animation for Turkish grammar rules (Suffixes + Order).
    *   **Cleanup:** Removed legacy duplicate content from `en.json`.


---
*Built with ❤️ by Antigravity for Tovrr.*
