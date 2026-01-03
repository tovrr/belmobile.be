# Vercel Hobby Performance Strategy
**Status:** Deployed | **Cost:** $0 | **Region:** Edge (Paris/Global)

## The Challenge
Vercel's "Hobby" (Free) plan forces all Serverless Functions to execute in **US East (Washington, D.C.)**.
Since our database is in **Europe-West (Belgium)**, every server-side request (SSR) incurs a **~200ms latency penalty** per roundtrip. This destroys TTFB (Time to First Byte).

## The Solution: ISR (Incremental Static Regeneration)
Instead of generating pages on-demand (SSR), we generate them **once** and cache them at the Edge (CDN).

### Configuration
```typescript
// src/app/[lang]/[service]/[brand]/page.tsx
export const revalidate = 3600; // Cache for 1 hour
export const dynamicParams = true; // Generate unknown paths on demand (then cache them)
// REMOVED: export const dynamic = 'force-dynamic';
```

### Architecture
1.  **First Visit:** Vercel builds the page in US East (Slow ~500ms).
2.  **HTML Saved:** The result is saved to the Global Edge Network (including Paris).
3.  **Subsequent Visits:** Users in Brussels hit the Paris cache (<20ms).
4.  **Updates:** The cache refreshes automatically every hour.

## Client-Side Dynamic Features
Some features need to be dynamic (e.g., `?partnerId=123`).
We moved this logic to **Client Components**:
*   **Old:** Server reads `searchParams` -> page must be Dynamic -> Slow.
*   **New:** Server ignores params (Static Page) -> Component reads `window.location` -> Fast Page + Dynamic Data.

## Do Not Break This
*   **Never** add `export const dynamic = 'force-dynamic'` to high-traffic pages.
*   **Never** await `searchParams` or `headers()` in the server Page component unless absolutely necessary (it will de-opt to Dynamic SSR).
