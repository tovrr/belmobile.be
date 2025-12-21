---
description: Ensure all translation keys exist across EN, FR, and NL
---

1. Identify the missing key (usually discovered in a view file).
2. Add the key and its default value to `src/utils/translations.ts`.
3. Verify the key works in the UI by switching languages.
4. (Optional) Sync with external translation JSONs if used.
