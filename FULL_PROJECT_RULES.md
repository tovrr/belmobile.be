# 🏆 FULL_PROJECT_RULES: Belmobile Architectural & Behavioral Standards

**Lead Developer & Visionary**: Omer Ozkan
**AI Partner & Guardian**: AEGIS

---

## 🚀 The 3 Golden Rules (Quick Reference)

1.  **The `@/types` Reflex**: Before adding a component or service, define/update the interface in `src/types/models.ts` or `ui.ts`. **Zero `any` policy**.
2.  **RSC-First Hybrid**: New layout elements (Footer/Header) must be **Server Components** by default. Use Client Components only for surgical interactivity.
3.  **Mandatory `loading.tsx`**: Every public dynamic route must have a `loading.tsx` skeleton that mimics the final content dimensions to eliminate CLS.

---

## 🧠 AI Agent Brain Initialization (Read First)
To maintain the integrity of this project, every new AI session MUST:
1.  **Scan Context**: Read `FULL_PROJECT_SNAPSHOT.md` and `FULL_PROJECT_CRITIQUE.md`.
2.  **Align Strategy**: Refer to `FULL_PROJECT_SOLUTIONS.md` for refactoring and `FULL_PROJECT_BUILDING.md` for new features.
3.  **Enforce History**: Consult `FULL_PROJECT_CHRONOLOGY.md` to avoid repeating past mistakes.
4.  **Verification**: Always run `npm test` after modifying core business logic (Pricing/Routing).

---

## ⚡ AI Proactivity & Autonomy Guidelines
To operate as a Senior Partner, the AI must apply these "Operational" constraints:

- **Sentry & Observability**: Automatically add `Sentry.captureException` or "breadcrumbs" when handling critical flows (payments, wizard, API calls).
- **Compliance Core Web Vitals**: For every UI change, proactively verify tag hierarchy (H1-H6) and `next/image` attributes (`priority`, `sizes`).
- **Enforcement of Patterns**: Detect manual state passing and suggest `useWizard` or `usePricing` hooks.
- **Turbo Workflows**: Use `// turbo` in `.agent/workflows` to auto-execute safe terminal commands.
- **Deep Work Mode**: When in "Task Mode," focus on thorough, multi-step goal completion rather than small tweaks.

---

## 🏗️ Architectural Zones

### 1. 🌍 Public Zone (Performance-First)
*Scope: Customer-facing pages.*
- **Goal**: 90+ Lighthouse score.
- **Rendering**: Server Components (RSC) by default.
- **Skeletons**: Mandatory `loading.tsx` for all routes.
- **i18n**: Multi-lingual support via `src/data/i18n/*.json`.

### 2. 🛡️ Admin Zone (Type-Safe-First)
*Scope: Dashboard and internal tools.*
- **Goal**: Data Integrity & Security.
- **Type Safety**: **Strict Zero `any`**. Use `src/types/admin.ts`.
- **Forms**: Strict validation using **Zod** + React Hook Form.

---

## 🚫 Deprecated / Forbidden
- Inline interfaces for domain entities. Move to `src/types`.
- Direct `bg-gradient-to-*` Tailwind classes (Use `bg-linear-to-*`).
- Hardcoded text without i18n keys in the Public Zone.
