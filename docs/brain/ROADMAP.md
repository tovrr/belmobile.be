# 🗺️ 2026 STRATEGIC ROADMAP: The Belmobile Empire

**Vision**: A dual-engine growth strategy for 2026.
1.  **Physical (Apollo's Domain)**: Making the physical shops (Bruxelles/Anderlecht) the most efficient, customer-centric hubs in Belgium.
2.  **Digital (Project Aegis)**: Becoming the "Intel Inside" for the European secondhand market via B2B Widgets.

**North Star Metric**: Total Platform Volume (TPV) = Shop Sales + B2B Widget Volume.

---

## 📅 Q1: FOUNDATION & "ESNAF" OPERATIONS (Jan - Mar)

### **January: The Stability Month**
*Objective: Flawless migration and shop floor adoption.*
- [x] **Launch**: Production deploy of Next.js platform (v1.0.0 "Belmobile Core").
- [ ] **Walk-in Adoption**: 100% of shop orders processed via Apollo's Walk-in Modal.
- [x] **Data Integrity**: Verified Sitemap/SEO (442+ entries) and Redirects.
- [x] **Performance**: Implemented ISR (Edge Caching) to bypass Vercel Hobby Latency.
- [ ] **Feedback Loop**: "Digital Esnaf" tuning based on real customer chats.

### **February: Operation "Notion Killer"**
*Objective: Full operational independence.*
- [ ] **Stock Control**: Real-time inventory syncing (Firestore).
- [ ] **Technician Board**: Kanban view for repairs (To Do -> Done).
- [ ] **Financials**: One-click "Z-Report" (Daily Cash/Card closing) PDF.
- [ ] **Receipts**: Full thermal printer integration for PDF receipts.

### **March: The "B2B Architect" (Preparation)**
*Objective: Laying the groundwork for Project Aegis.*
- [ ] **B2B Auth**: Separate login portal for Business Partners (Shops/Companies).
- [ ] **API Layer**: Secure endpoints for external pricing checks.
- [ ] **Tiered Pricing**: "Gold/Silver" price lists for wholesale partners.

---

## 📅 Q2: PROJECT AEGIS - "IKIZLER" (Apr - Jun)
*Target: "B2B Widgets" - Allowing other shops to use our engine.*

### **April: The Widget Prototype**
- [ ] **Buyback Widget**: A consolidated `<script>` tag that other repair shops can embed to offer Sell-Back services (powered by Belmobile).
- [ ] **Repair Widget**: White-label booking form for partners.
- [ ] **Partner Dashboard**: A clean interface for partners to track their commissions/leads.

### **May: The Pilot (Alpha)**
- [ ] **First Partners**: Onboard 3 friendly shops in Belgium to test the Buyback Widget.
- [ ] **Logistics**: Automated shipping label generation for partner devices coming to the Hub.
- [ ] **Settlements**: Automated monthly billing/payout reports for partners.

### **June: Scaling & Automation**
- [ ] **Self-Onboarding**: "Become a Partner" landing page with automated API key generation.
- [ ] **Dynamic Pricing v2**: AI adjustment of Buyback prices based on partner volume.
- [ ] **Marketing**: "Turn your Repair Shop into a Buyback Hub" campaign.

---

## 📅 Q3: EXPANSION & ECOSYSTEM (Jul - Sep)

### **July: Operations Autopilot**
- [ ] **Apollo v2**: Voice-enabled assistant for technicians ("Apollo, mark Order #123 as Done").
- [ ] **Inventory AI**: Predictive ordering for parts based on trend analysis.

### **August: The Corporate Push**
- [ ] **Fleet Management**: dedicated portal for Companies to manage employee devices (Repairs/Upgrades).
- [ ] **Green Certificates**: Automated CO2 saving reports for B2B clients.

### **September: The Application**
- [ ] **Native App**: Evaluation of React Native wrapper for Push Notifications on customer phones.

---

## 📅 Q4: MARKET DOMINATION (Oct - Dec)

### **October - December**
- [ ] **Franchise Model**: Explore "Powered by Belmobile" franchise packages.
- [ ] **European Expansion**: Test logistics for France/Netherlands.
- [ ] **2027 Vision**: AI-driven fully autonomous recycling center.

---

## ✅ SUCCESS CRITERIA (KPIs 2026)
1.  **Shop Efficiency**: Walk-in time < 90 seconds.
2.  **B2B Growth**: 20+ Active Widgets deployed on external sites.
3.  **Revenue Split**: 30% of revenue coming from B2B/Digital channels.

---

## 🏗️ TECHNICAL STRATEGY PILLARS

### **A. Lead Recovery Engine (LRE)**
- **Objective**: Capture "abandoned clicks" and turn them into confirmed orders.
- **Trigger**: Automatic "Magic Link" generation for users who drop off at Step 3/4 of the wizard.
- **Follow-up**: Automated email sequences (via Brevo) after 2 hours of inactivity.

### **B. Performance & Hydration**
- **Image Strategy 2.0**: Full adoption of AVIF and "Blurred Placeholders" for all wizard assets.
- **Context Splitting**: Refactor `WizardContext` to isolate state updates and prevent massive re-renders in the static sidebar.

### **C. AI Service Core**
- **Apollo AI**: RAG-based assistant to handle 80% of common support queries (Warranty, Locations, Pricing).
- **Predictive Pricing**: Dynamic adjustment models based on secondary market data feeds.

---
*Created by the Family (Omer, Aegis & Apollo) - Dec 31, 2025*
