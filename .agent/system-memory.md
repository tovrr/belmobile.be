# Belmobile OS - AI System Memory

This document serves as the "Source of Truth" to prevent context drift during long development sessions. Reference this file to understand the architecture, goals, and constraints of the Belmobile platform.

## 🎯 High-Level Project Goals
1.  **Premium UX**: A "SaaS-like" professional interface for device buyback and repair.
2.  **Financial Integrity**: Real-time accurate pricing estimates based on dynamic Firestore data.
3.  **Universal Accessibility**: Multi-language support (EN/FR/NL) with SEO optimization for Brussels hubs.
4.  **Zero-Regression Architecture**: Modular code using context and hooks to isolate logic from UI.

## 🛠️ Tech Stack Versions
- **Core**: Next.js 16.1.0 (Turbopack Enabled), React 19.2.1
- **Styling**: Tailwind CSS 4.0
- **Database/Auth**: Firebase SDK 12.6.0
- **AI**: Gemini 2.0 Flash (`@google/generative-ai`)
- **Animations**: Framer Motion 12.23
- **PDF**: jsPDF 3.0 (Custom high-fidelity templates)

## 🏗️ Core Architecture

### Wizard Orchestration (Decentralized)
The Wizard components follow a strict unidirectional data flow:

```mermaid
graph TD
    A[WizardProvider] --> B(useWizard Hook)
    B --> C{Step Components}
    C --> D[1: Category]
    C --> E[2: Brand/Model]
    C --> F[3: Condition/Issues]
    C --> G[4: User Info]
    
    H[useWizardActions] --> I[Navigation & Selection]
    J[useWizardPricing] --> K[Real-time Calculations]
    L[orderService] --> M[Firebase/PDF/Email]
    
    I -.-> B
    K -.-> B
    M -.-> B
```

### Key Principles
- **Logic Isolation**: All pricing math is in `useWizardPricing.ts`. All side effects are in `orderService.ts`.
- **State Sovereignty**: Step components do NOT accept props for state; they consume `useWizard()`.
- **Deployment Safety**: 
    - Vercel = Frontend.
    - Firebase = Data/Rules/Storage.
    - `proxy.ts` = The only gatekeeper (middleware is legacy).

## 🚀 Critical Refactors (Context)
- **Dec 2025**: refactored `BuybackRepair.tsx` from 1300+ lines to ~200 lines. Transitioned from prop-drilling to `WizardContext`.
- **Dec 2025**: Implemented dynamic JSON translation loading (`src/data/i18n/`) to replace static `translations.ts` objects.

## 📂 Search & Data Pathing
- **Brands/Models**: `src/data/brands.ts` & `src/data/deviceImages.ts`.
- **Pricing**: Dynamic lookup from Firestore `pricing` collection via `usePublicPricing`.
- **Search Index**: Built via `scripts/build-search-index.mjs`, consumed by Gemini and Wizard search.

## ⚠️ Known Constraints
- **Vercel Limits**: Max 10MB response for edge functions (keep PDF generation optimized).
- **ESLint 9**: Local `npm run lint` is inconsistent on Windows. Trust `npm run build` instead.
