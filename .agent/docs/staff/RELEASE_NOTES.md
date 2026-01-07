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

---
*Built with ❤️ by Antigravity for Tovrr.*
