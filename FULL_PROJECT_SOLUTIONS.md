# 🛠️ FULL_PROJECT_SOLUTIONS: Engineering Redemption Path

This document provides actionable engineering solutions to the structural weaknesses identified in `FULL_PROJECT_CRITIQUE.md` and tracks the evolution of major architectural decisions.

---

## 1. 🧩 Decomposing the "Grand Lasagne" (WizardContext)
**Problem**: Monolithic context causing global re-renders.
**Solution**:
- **State Partitioning**: Split `WizardContext` into `UserContext`, `PricingContext`, and `NavigationContext`.
- **Atomic State**: Migrate to **Zustand** or **Jotai**. These libraries allow components to subscribe only to the specific piece of state they need, eliminating unnecessary re-renders.
- **Implementation**:
    - Wrap only the Wizard steps in these providers.
    - Use selectors to extract only `pricingResult` in the Sidebar, for example.

## 2. 🚦 Streamlining the [...slug] Routing
**Problem**: Over-reliance on a catch-all route with complex branching.
**Solution**:
- **Route Specificity**: Move from `[...slug]` to named dynamic segments where possible (e.g., `/[lang]/repair/[brand]/[model]`).
- **Parallel Routes**: Use Next.js **Parallel Routes (@modal or @sidebar)** to handle complex UI overlays without bloating the main page logic.
- **Implementation**:
    - Refactor `src/utils/route-parser.ts` to return strict route types.
    - Use `generateStaticParams` for high-traffic brand/model combinations to shift work to build time.

## 3. ☁️ Single Source of Truth: Full Cloud Migration
**Problem**: Mixing static constants with database data.
**Solution**:
- **DB-First Architecture**: Migrate all `LOCATIONS` and `SHOPS` constants into Firestore.
- **Edge Caching**: Use **Vercel KV** or **Incremental Static Regeneration (ISR)** with a short revalidation window (e.g., 3600s).
- **Implementation**:
    - Create an Admin UI in the dashboard specifically for Shop/Location management.
    - Replace all imports of `LOCATIONS` with a `getLocations()` helper that fetches from the cache.

## 4. ⚡ Asynchronous Resilience (Task Queues)
**Problem**: Blocking, sequential order submission.
**Solution**:
- **Background Workers**: Integrate **Inngest** or **Upstash Workflow**.
- **Implementation**:
    - The API route `/api/orders/submit` only validates the input and pushes a "New Order" event to the queue.
    - The user immediately sees "Success."
    - A background worker handles the PDF generation and the two Brevo emails with automatic retries on failure.

## 5. 🛡️ Eliminating "Type Theatre" (Zod Validation)
**Problem**: Silent failures hidden by `as unknown as Type` casts.
**Solution**:
- **Schema Validation**: Use **Zod** to validate every object coming from Firestore or external APIs.
- **Implementation**:
    - `const shop = ShopSchema.parse(await getDoc(...))`.
    - If the DB schema changes, the app fails early and predictably with a clear Zod error, rather than crashing in the UI.

## 6. 📊 Closing the Business Blind Spot
**Problem**: Lack of business-centric monitoring.
**Solution**:
- **Funnel Analytics**: Implement **Mixpanel** or **GA4** events at every step of the wizard.
- **Custom Sentry Metric Alerts**: Set up Sentry "Metric Alerts" for business events (e.g., "Alert if `orders.submitted` is 0 for more than 4 hours during business time").
- **Implementation**:
    - Track "Step Drop-off" rates to identify precisely which part of the UI is frustrating users.

---

## 7. 🏗️ The Great Component Refactoring (Dec 31, 2025)
**Problem**: Disorganized `src/components` folder causing "Module not found" errors, circular dependencies, and a fragile Developer Experience (DX).
**Solution**:
- **Modular Architecture**: Reorganized 100+ components into semantic folders:
    * `layout` (Header, Footer), `features` (TrackOrder), `common` (FAQ), `ui` (Button, Skeleton), `pages` (Contact), `sections` (Hero), `store` (Map).
- **Systematic Path Resolution**: Updated imports in 135 files to reflect new locations.
- **Strict Verification**: Achieved **Zero TypeScript Errors** (53 errors fixed).
- **Implementation**:
    * Run `npx tsc --noEmit` iteratively after each batch move.
    * Use recursive grep to find all usages (`grep_search`).
    * Clean up archive/deprecated code (`proxy.ts`).

---

## 8. 🎯 Walk-in Optimization & SEO Migration (Dec 31, 2025)
**Problem**:
1. Walk-in customers reluctant to provide emails.
2. Legacy Shopify URLs risking SEO value loss.
3. Transactional emails blocked by spam filters due to heavy HTML.

**Solution**:
- **Anonymous Walk-in Flow**:
    - **Logic**: If no email is provided, default to `walkin.shop{ID}@belmobile.be`.
    - **UX**: Prioritize **WhatsApp** notifications over Email.
    - **ID**: Client-side generation of `ORD-YYYY-XXXX` for instant feedback.
- **SEO 301 Strategy**:
    - **Map**: Comprehensive `next.config.ts` regex map redirecting legacy URLs (e.g., `/pages/reparation-iphone-*`) to new localized routes (`/fr/reparation/apple/iphone-*`).
    - **Protection**: `robots` meta tag dynamically set to `noindex` for staging environments.
- **Email Delivery**:
    - **Redesign**: Switched to **Text-Only HTML Headers** (tables) to bypass Gmail's "Show Images" warning and improve deliverability.

---

## 9. 🧠 Apollo Upgrade & B2B Foundation (New Year's Eve 2025)
**Problem**:
1. AI Assistant (`gemini-1.5-flash`) hallucinating addresses and behaving robotically.
2. No physical proof of purchase for Walk-in customers.
3. Lack of infrastructure for B2B partners.

**Solution**:
- **"Digital Esnaf" Protocol**:
    - **Model**: Upgraded to **Gemini Pro** (Stable) for reliable reasoning.
    - **Instruction Set**: Injected "Merchant Psychology" (Warmth, localized knowledge of Liedts/Bara).
    - **Context**: Dynamically injected Opening Hours and Phone Numbers into the AI prompt.
- **Professional Receipts**:
    - **Engine**: Implemented **pdfMake** for client-side generation.
    - **Features**: Embedded Base64 Logo, Signature Blocks (Customer/Shop), and Legal Disclaimers.
    - **Flow**: Modal -> Success Screen -> Print/Download PDF.
- **Project Aegis (B2B)**:
    - **Vision**: Defined the roadmap for White-label Widgets (Q2 2026).
    - **Architecture**: Established the "Family Business" governance model (Omer/Anti/Apollo).

---

> [!TIP]
> **Priority #1**: **Maintain Zero Errors**. Run `npx tsc --noEmit` before every push to Staging to ensure we never regress from this clean state.
