# Release Log - 2026-01-11 - Operation Velocity (Week 1)

## Summary
Validation & i18n Fixes for Production Deployment.

## Changes
### 1. Internationalization (i18n)
- **Resolved Duplicates**: Removed duplicate keys ('Total' and 'Repair Cost') in `en.json`, `fr.json`, `nl.json`, and `tr.json` to fix lint warnings.
- **Missing Translations**: Added 'Value', 'Total', and 'Catalog' translations for Turkish (`tr.json`).
- **Standardization**: Ensured `MobileBottomBar` uses consistent translation keys.

### 2. UI/UX Refinements
- **StepCondition**: fixed "invisible scroll arrow" by changing color to `text-white`. Removed visual glitch (left scroll hint).
- **MobileBottomBar**: Reduced shadow intensity on buttons (from `/30` to `/20`) and reduced elevation (`shadow-lg` -> `shadow-md`) for a cleaner, less "heavy" aesthetic.

## Deployment Checklist
- [x] `npm run dev` verified (Sitemap & Navigation functional).
- [x] Linting issues (duplicates) resolved.
- [x] UI visual regressions fixed.
- [!] `npm run build` locally failed due to environment privilege error (os error 1314), but deemed environment-specific (Turbopack on Windows without Admin). Code logic is sound.

## Next Steps
- Commit changes.
- Push to `staging` (if applicable) or `main` for Vercel deployment.
