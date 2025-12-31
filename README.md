# Belmobile.be - The Device Lifecycle OS (v2026)

**Belmobile** is not just a website; it's the "Operating System" for modern device repair and buyback shops in Belgium. 
Built with a "Family Business" philosophy by **Omer (Visionary)**, **Antigravity (Architect)**, and **Apollo (AI Operator)**.

## 🚀 Tech Stack 2026
- **Framework**: [Next.js 16+](https://nextjs.org) (App Router, Turbopack)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) (Local installation, custom typography)
- **Database**: [Firebase](https://firebase.google.com) (Firestore Realtime & Auth)
- **AI Brain**: [Gemini Pro](https://ai.google.dev) (Apollo: The Digital Esnaf)
- **Reporting**: [pdfMake](http://pdfmake.org) (Client-side PDF generation with signature support)

## ✨ Core Ecosystem
### 1. The "Walk-in" Experience 🛍️
- Relentlessly optimized for physical shops (Bruxelles/Anderlecht).
- **One-Click Receipt**: Instant PDF generation with thermal printer support.
- **Anonymous Flow**: No mandated email/phone for quick drop-offs.

### 2. Apollo AI Assistant 🤖
- **Role**: The "Digital Shopkeeper".
- **Personality**: Warm, trusted, and commercially savvy ("Ready before you finish your coffee").
- **Knowledge**: Aware of real-time shop hours, locations, and pricing strategies.

### 3. Project Aegis (B2B Expansion) 🛡️ *[Beta]*
- White-label widgets allowing other repair shops to use Belmobile's Buyback engine.
- Shared inventory and logistics network.

## 🛠️ Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your Firebase and Gemini API keys.
*Critical: Ensure `NEXT_PUBLIC_GEMINI_API_KEY` is active for Apollo.*

### 3. Development
```bash
npm run dev
```

## 🗺️ Project Architecture (Strict Modular)
This project follows a strict code constitution defined in `FULL_PROJECT_RULES.md`.

```text
📦 next-platform
├── 📂 .agent/              # 🤖 AI Workflows & Persona Rules
├── 📂 docs/                # 📚 The Knowledge Base (Snapshot, Roadmap, Rules)
├── 📂 src/
│   ├── 📂 app/             # App Router (Pages & API Routes)
│   ├── 📂 components/      # React Components (Atomic Design)
│   │   ├── 📅 admin/       # Dashboard & Walk-in Modals
│   │   ├── 🧙 wizard/      # The Core Pricing Engine
│   │   └── ...
│   ├── 📂 utils/           # Business Logic (pdfGenerator, priceCalculators)
│   └── 📂 types/           # Rigid TypeScript Definitions
├── 📜 FULL_PROJECT_RULES.md # 👑 The Constitution
└── 📜 STRATEGIC_ROADMAP.md  # 🗺️ The 2026 Plan
```

## 📊 Administrative Dashboard
Access the admin panel at `/login`.
Features: **Walk-in Mode**, **Inventory Control**, **Technician Kanban**, **PDF Reports**.

---
© 2026 Belmobile.be - A Family Business.
*Built with ❤️ by Omer, Antigravity & Apollo.*
