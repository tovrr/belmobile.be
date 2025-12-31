# 🗺️ 2026 STRATEGIC ROADMAP: Belmobile Evolution

**Vision**: To transition Belmobile from a disjointed operation (Shopify + Notion) into a unified, high-performance **Operating System for Device Lifecycle Management**.

**North Star Metric**: % of Operations handled automatically by the Platform (Target: 90%).

---

## 🚀 PHASE 1: THE LAUNCH & SEO RETENTION (January 2026)
*Objective: Successful migration from Shopify without losing organic traffic or revenue.*

### 1.1. Zero-Hour Execution (The Gift 🎁)
- [ ] **DNS Switch**: Point `belmobile.be` to Vercel Production.
- [ ] **SEO Shield**: Verify all `next.config.ts` redirects are active (301 Permanent).
- [ ] **Data Continuity**: Ensure the new Buyback/Repair limits match physical shop capacity.
- [ ] **Analytics**: Confirm GA4 / Mixpanel is receiving events from the new domain.

### 1.2. Trust & Conversion
- [ ] **Review Loop**: Implement automated "Leave a Review" SMS/WhatsApp 24h after order completion.
- [ ] **Content Migration**: Port top 5 traffic-driving blog posts from Shopify (e.g., "iPhone Change Screen Messages") to the new Blog section.
- [ ] **Payment Verification**: Real-money test of Stripe/Bancontact flow on Production.

### 1.3. The "Walk-in" Adoption
- [ ] **Goal**: Process **100%** of physical shop customers via the new "Walk-in Modal".
- [ ] **Training**: Ensure staff knows how to use the QR code logic and PDF generation.

---

## ⚙️ PHASE 2: OPERATION "NOTION KILLER" (February 2026)
*Objective: Eliminate the dependency on Notion for day-to-day operations.*

### 2.1. Stock Management v1
- [x] ~~Basic Product List~~ (Done)
- [ ] **Real-time Inventory**: Decrement stock automatically when a Repair/Sale happens.
- [ ] **Low Stock Alerts**: Notify Admin when critical parts (e.g., iPhone 13 Screens) are low.

### 2.2. Technician Workflow
- [ ] **Assignment System**: Admin assigns a ticket to a specific Technician.
- [ ] **Repair Status Board**: A Kanban-style view in Admin Dashboard (To Do -> In Progress -> Tested -> Done).
- [ ] **Internal Comments**: Private notes thread for technicians within the Order details.

### 2.3. Financial Reconciliation
- [ ] **Daily Closing Report (Z-Report)**: One-click PDF showing total Cash/Card revenue for the day per shop.
- [ ] **Invoice Generation**: Auto-generate formal VAT invoices for B2B clients.

---

## 📈 PHASE 3: SCALE & B2B DOMINATION (March 2026 +)
*Objective: Grow revenue through High-Volume channels and Automation.*

### 3.1. B2B / Wholesale Portal (The "Grossiste" Legacy)
- [ ] **Tiered Pricing**: Automatic discounts for logged-in B2B accounts (Pro/Gold tiers).
- [ ] **Bulk Upload**: Allow companies to upload a CSV of 50 devices for Buyback estimation instantly.
- [ ] **VAT Reverse Charge**: Automatic handling of Intracommunautaire VAT rules (if expanding to EU).

### 3.2. Marketing Automation
- [ ] **Abandoned Cart Recovery**: If a user stops at the Wizard summary, send a WhatsApp magic link after 1 hour.
- [ ] **Price Drop Alerts**: Allow customers to subscribe to "iPhone 14 Pro" and get emailed when price drops below €X.

### 3.3. AI Intelligence
- [ ] **Dynamic Pricing Engine**: Adjust Buyback offers based on current market trends (competitor scraping).
- [ ] **Support Bot**: Upgrade the Chatbot to handle "Where is my order?" queries by reading real-time Firestore status.

---

## ✅ SUCCESS CRITERIA (KPIs)
1.  **SEO Authority**: Zero 404 errors on top 100 legacy URLs.
2.  **Efficiency**: Time to process a customer < 2 minutes.
3.  **Stability**: Zero "Uncaught Exceptions" (500 Errors) in Sentry.

---
*Created by Antigravity & User on Dec 31, 2025*
