---
description: Ensure all translation keys exist across EN, FR, and NL
---

# Translation Sync Workflow

We use dynamic JSON loading for translations to minimize bundle size.

1. **Location**: `src/data/i18n/`
   - `en.json`
   - `fr.json`
   - `nl.json`

2. **Process**:
   - Identify the missing key.
   - Add the key to ALL three JSON files. If a translation is missing, use the English value as a fallback.
   - For Wizard-specific keys, ensure they are compatible with the `t(key)` helper in `useLanguage`.

3. **Legacy**:
   - `src/utils/translations.ts` is DEPRECATED and only exists for type definitions. Do NOT add data there.

4. **Dynamic Keys**:
   - Product categories and brands often map to keys like `smartphone`, `tablet`, `repair_screen`.
   - Ensure these map to the correct labels in the JSON files.
