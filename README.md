# 📱 Belmobile.be - The Device Lifecycle OS (v2026)

Belmobile is the "Operating System" for modern device repair and buyback shops in Belgium.  
Built with a "Family Business" philosophy by **Omer** (Visionary), **Aegis** (Architect), and **Apollo** (AI Operator).

## 🚀 Tech Stack 2026

*   **Framework**: Next.js 16+ (App Router, Turbopack)
*   **Styling**: Tailwind CSS 4
*   **Database**: Firebase (Firestore Realtime & Auth)
*   **AI Brain**: Gemini Pro (Apollo: The Digital Esnaf)
*   **Pricing Engine**: Hybrid GSMArena Scraper + Firestore Anchors.

## 🏛️ The Three-Pillar Presence (Brussels)

| Location | Role | Access | SSoT Strategy |
| :--- | :--- | :--- | :--- |
| **Schaerbeek (Liedts)** | Retail & History | Walk-in | High-flux consumer repairs |
| **Anderlecht (Bara)** | Transit & Buyback | Walk-in | Gare du Midi fast cash flow |
| **Molenbeek (B2B)** | Business Hub | By Appt Only | Fleet management & Pro accounts |

## 🧪 The "Secret Sauce" (Proprietary Logic)

### 1. The Anchor System (SSoT)
We don't chase volatile market prices. We use **Technical Specification Anchors** (GSMArena) mapped in `src/data/gsmarena-links.ts`.
*   **Logic**: `Market Value (Scraped) -> Firestore Anchor -> User Quote`.
*   **Benefit**: Stable pricing that resists "fake" low-market listings.

### 2. Profit Floor Protection
Our `BulkPriceEditor` ensures no repair is sold at a loss.
*   **Formula**: `MAX( (Part + Labor) * Margin, Competitive_Cap )`.

### 3. Apollo B2B Routing
Apollo (AI) is trained to filter leads. High-volume fleet requests are automatically routed to the **Molenbeek Hub** schedule, while single repairs are sent to Schaerbeek/Anderlecht maps.

## 🛠️ Operational Workflow

### 🔄 Syncing Market Prices
To refresh the global pricing anchors:

```bash
node scripts/sync-device-data.mjs
```

> **Note**: Always review changes in the Admin Dashboard before pushing live.

### 📄 Documenting Workflows
All markdown files have been organized into the `/docs` (or `.agent`) directory:
*   `docs/business/`: B2B Strategy & Molenbeek Expansion.
*   `docs/staff/`: Social Media scripts & Shop Checklists.
*   `docs/technical/`: Firestore schemas & Code Constitution.

## 🗺️ Project Architecture

```plaintext
📦 next-platform
├── 📂 .agent/              # 🤖 AI Persona & Workflow Rules
├── 📂 docs/                # 📚 The Knowledge Base (Business, Staff, Tech)
├── 📂 scripts/             # ⚙️ Automation (Scrapers, DB Maintenance)
├── 📂 src/
│   ├── 📂 app/             # App Router & API
│   ├── 📂 components/      # UI (Admin, Wizard, Walk-in)
│   ├── 📂 data/            # SSoT Mappings (gsmarena-links.ts)
│   ├── 📂 utils/           # Business Logic (Price Calculators, PDF)
└── 📜 .agent/CONTROL_PANEL.md     # 🎛️ The Master Index for all Docs
```

## 📊 Administrative Dashboard

*   **Access**: `/login`
*   **Features**: Walk-in Mode, Inventory Control, Buyback Wizard, Technician Kanban, B2B Fleet Reports.

---

**© 2026 Belmobile.be - A Family Business.**  
Built with ❤️ by Omer, Aegis & Apollo.
