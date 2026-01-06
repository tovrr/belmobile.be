---
description: The Standard Operating Procedure (SOP) for Development and Deployment to prevent regressions and errors.
---

# Development & Deployment SOP

This strategy enforces a **Safety-First Flow** to prevent "catastrophes", rollbacks, and confusion.

## 1. The Golden Rule
🚫 **NEVER push directly to `main` without Staging Verification.**
✅ **ALWAYS flow**: `Local` → `Staging` → `Verify` → `Production`.

---

## 2. Phase 1: Local Development (The Lab)
**Goal**: Create and validation code logic.
1.  **Work on Localhost**: `npm run dev`.
2.  **Verify Build Integrity**: Before ANY push, you MUST run:
    ```bash
    npm run build
    ```
    *If this fails, STOP. Do not push broken code.*

---

## 3. Phase 2: Staging Deployment (The Real World Test)
**Goal**: Verify code on Vercel infrastructure (Mobile/Tablet/PC).
1.  **Push to Staging**:
    ```bash
    git checkout staging
    git merge main   # Or your feature branch
    git push origin staging
    ```
2.  **Verify**:
    *   Go to **Vercel Dashboard** → **Project** → **Deployments**.
    *   Find the **Staging** deployment (top of list).
    *   **Open the URL on your PHONE** (not just desktop simulator).
    *   *Check critical flows (Hero, Purchase, etc.).*

---

## 4. Phase 3: Production Release (The Launch)
**Goal**: Release confirmed code to the public.
1.  **Condition**: ONLY proceed if Phase 2 is **APPROVED**.
2.  **Check Vercel Status**: Ensure no active **ROLLBACKS** are pinning the version (check for red banners).
3.  **Merge & Push**:
    ```bash
    git checkout main
    git merge staging
    git push origin main
    ```
4.  **Post-Launch Check**:
    *   Visit `belmobile.be` immediately.
    *   If issues arise → **DO NOT PANIC**. Use Vercel "Instant Rollback".
    *   *Important*: After a rollback, **Phase 3 is locked**. You must "Undo Rollback" before new code can go live (as learned today!).

---

## 5. Emergency Recovery (Rollback Protocol)
If `main` is broken:
1.  **Vercel Dashboard** → Click `...` on previous good deployment → **Instant Rollback**.
2.  **Fix Code Locally** → Push to **Staging**.
3.  **Verify Staging Fix**.
4.  **Vercel Dashboard** → **Undo Rollback** (Unlock the gate).
5.  **Promote New Deployment** from Step 2 to Production.

---

## 6. AI Agent Instructions
*   When asked to "Deploy", the AI will default to **Staging** first.
*   The AI will ask for "Confirmation" before pushing to `main`.

---

## 7. Current Project Focus & Attention Points (Technical SOP)
**Critical architecture rules for all future development:**

### A. Pricing Engine (SSoT)
*   **Source of Truth**: All pricing data (Repair & Buyback) MUST come from the `getWizardQuote` Server Action or `pricing.dal.ts`.
    *   ❌ NEVER hardcode prices in frontend components.
    *   ❌ NEVER import `pricingLogic.ts` directly in Client Components (it exposes business logic).
    *   ✅ ALWAYS use `useWizardPricing` hook for UI estimates.
*   **Firestore Collections**:
    *   `repair_prices`: Dynamic repair catalog (screen, battery, etc.).
    *   `buyback_pricing`: Base buyback offers (often calculated from Market Value).
    *   `market_values`: The reference "Sell Price" used to auto-calculate Buyback offers.

### B. Localization Strategy
*   **Static Labels**: Use `useLanguage()` hook and `t()` function.
*   **Dynamic Data**: Repair issues (e.g. "Screen Replacement") are localized in the Backend/DAL (`getLocalizedRepairDictionary`) and passed via the `breakdown` object.
    *   ❌ Do not create new translation keys for dynamic database content.

### C. SEO & Metadata
*   **Generation**: All Page Titles/Descriptions are generated in `page.tsx` using `pricing.dal.ts` to ensure the "Starting From" price matches the actual content.
*   **JSON-LD**: Product Schema and Breadcrumbs must be injected on every product page using the same SSoT data.

### D. Metadata & Sitemap Routing ⚠️
*   **Collision Prevention**: NEVER create a physical route folder named `sitemap` (e.g. `src/app/[lang]/sitemap`) as it conflicts with the `sitemap.ts` dynamic generator.
*   **Redirect Strategy**: Localized metadata requests (e.g. `/fr/sitemap.xml`) MUST be redirected to the root `/sitemap.xml` in `proxy.ts`.
*   **Gatekeeper Rule**: `proxy.ts` must catch `.xml` and `.txt` files early and return `NextResponse.next()` to bypass catch-all UI routes.


