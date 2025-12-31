# 🚀 Belmobile Strategic Roadmap: 2026 Growth & Scalability

This roadmap outlines the strategic pillars for evolving the Belmobile platform from a stable MVP to a high-converting, scalable business engine.

---

## 🏛️ Pillar 1: Administrative Excellence & Automation
*Goal: Reduce manual overhead and improve data-driven decision making.*

- **[ ] Advanced Dashboard (Phase 10)**: 
    - Real-time order analytics (Revenue per device type, Repair vs. Buyback ratio).
    - Inventory management with low-stock triggers for repair parts.
- **[ ] Customer Support Bot (AI)**:
    - Integration of a RAG-based AI agent to answer common repair questions ("How long is the warranty?", "Do you have a shop in Molenbeek?").
- **[ ] Role-Based Access Control (RBAC)**:
    - Secure login for technicians (repair status updates only) vs. Managers (full pricing/analytics access).

## 📈 Pillar 2: Lead Recovery & Conversion Optimization
*Goal: Turn "abandoned clicks" into "confirmed orders".*

- **[ ] Lead Recovery Engine**:
    - Automatic "Magic Link" generation for users who drop off at Step 3/4 of the wizard.
    - Automated follow-up emails (via Brevo) after 2 hours of inactivity.
- **[ ] A/B Testing Infrastructure**:
    - Setup for testing different "Anxiety Reducers" (Trustpilot reviews vs. Warranty badges) in the `LocalPainPoints` component.
- **[ ] Upsell/Cross-sell Logic**:
    - Suggesting protective glass or cases at the end of a repair booking.

## ⚡ Pillar 3: Performance & Core Web Vitals
*Goal: Achieve a "Perfect 100" Lighthouse score and superior UX.*

- **[ ] Image Strategy 2.0**:
    - Migration to AVIF format where supported.
    - Implementing "Blurred Placeholder" (LCP) for all hero images in the wizard.
- **[ ] Bundle Hydrogenation**:
    - Splitting the massive `WizardContext` to prevent re-renders in static parts of the layout.
    - Removing any unused legacy libraries (Leaflet vs. Google Maps consolidation).

## 🌍 Pillar 4: Ecosystem & Expansion
*Goal: Making Belmobile the central hub for mobile repairs in Belgium.*

- **[ ] Partner Widget SDK**:
    - Creation of a lightweight, iframe-able "Repair Quote" widget for third-party partner websites.
- **[ ] Dynamic SEO Hubs (Local Extension)**:
    - Scaling the `[...slug]` logic to target more Belgian cities (Gent, Antwerpen, Liège) with localized pricing if needed.
- **[ ] B2B Portal**:
    - dedicated flow for corporate fleets to manage multiple device repairs at once.

---

> [!IMPORTANT]
> Priority for Q1 2026: **Lead Recovery Engine** and **Dashboard Expansion**.
