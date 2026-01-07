# Sitemap Recovery Masterplan

## 🚨 Problem Analysis
**Symptom**: Accessing `/sitemap.xml` returns an HTML page (likely a 404 or Generic Page) containing "strings" instead of a valid XML document.
**Environment**: Production (Vercel) & Local.

### Potential Root Causes
1.  **Middleware Interference (Most Likely)**:
    *   The `middleware.ts` might be redirecting `/sitemap.xml` to `/{lang}/sitemap.xml` (e.g., `/fr/sitemap.xml`).
    *   Since `sitemap.ts` is usually generated at the **root** level in `src/app/sitemap.ts`, a localized request `/fr/sitemap.xml` might not match it, causing Next.js to fall back to the `[...slug]` catch-all page.
    *   This explains why you see "HTML strings" (it's rendering the Buyback/Repair standard page logic for a non-existent "sitemap.xml" product).

2.  **File Conflict**:
    *   We observed a directory `src/app/[lang]/sitemap/page.tsx`.
    *   If this exists, it might be serving an actual HTML page for `/fr/sitemap`, conflicting with the XML generation.

3.  **Generation Timeout**:
    *   If `sitemap.ts` takes too long (>10s) to fetch all devices, Vercel might kill it or serve a fallback.

---

## 🛠️ Execution Plan (Step-by-Step)

### Phase 1: Local Diagnostics (Do NOT Push)
1.  **Analyze Middleware Logs**:
    *   Add temporary `console.log` in `middleware.ts` to track requests to `/sitemap.xml`.
    *   Confirm if it is being skipped (returned early) or rewritten/redirected.
2.  **Investigate Routing Conflicts**:
    *   Check contents of `src/app/[lang]/sitemap/page.tsx`.
    *   If it's a legacy or unused file, **DELETE IT**. It likely conflicts with SEO.
3.  **Verify Catch-All Behavior**:
    *   Visit `http://localhost:3000/sitemap.xml`.
    *   If it redirects to `/fr/sitemap.xml` -> **FAIL** (Middleware issue).
    *   If it stays on `/sitemap.xml` and shows XML -> **PASS**.

### Phase 2: Implementation & Fixes
1.  **Harden Middleware**:
    *   Ensure the exclusion logic for `sitemap.xml` comes **BEFORE** any `i18n` redirection.
    *   Use exact string matching (`pathname === '/sitemap.xml'`).
2.  **Optimize `sitemap.ts`**:
    *   Ensure `generateSitemaps` is returning clean data.
    *   Verify the `getAllDevices` cache is working to prevent timeouts.
3.  **Clean Project Structure**:
    *   Remove `src/app/[lang]/sitemap` folder if verified as conflicting.

### Phase 3: Validation
1.  **Local Test**: `npm run dev` -> Open `/sitemap.xml` -> Expect raw XML.
2.  **Build Test**: `npm run build` -> Check for static generation errors.
3.  **Production**: Deploy only after Local & Build pass.

---

## 📝 Prompt for Next Session
*Copy and paste this into the new conversation:*

> "We are fixing the sitemap.xml issue where it renders as HTML.
> Refer to `implementation_plans/SITEMAP_RECOVERY.md` for the analysis.
>
> **Task**:
> 1. Check if `src/app/[lang]/sitemap/page.tsx` exists and delete it if it's conflicting.
> 2. Debug `middleware.ts` locally to ensure `/sitemap.xml` is NOT redirected.
> 3. Verify `sitemap.ts` generates valid XML locally."
