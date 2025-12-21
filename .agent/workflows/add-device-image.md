---
description: How to add a device image for the Buyback/Repair summary
---

To add a photo for a specific device model (e.g., iPhone 13, Samsung Galaxy S21), follow these steps:

1.  **Prepare the Image**:
    *   Format: **JPG** (preferred) or PNG.
    *   Naming Convention: Convert the full model name to "kebab-case" (lowercase with hyphens).
        *   `iPhone 13` -> `apple-iphone-13.jpg` (Note: Include brand prefix to be safe, but the code checks `brand-model` slug)
        *   Wait, code uses `createSlug("${brand} ${model}")`.
        *   If Brand is "Apple" and Model is "iPhone 13", the slug is `apple-iphone-13`.
        *   If Brand is "Samsung" and Model is "Galaxy S21", the slug is `samsung-galaxy-s21`.

2.  **Save the File**:
    *   Place the file in: `next-platform/public/images/models/`.
    *   Example Path: `next-platform/public/images/models/apple-iphone-13.jpg`

3.  **Verify**:
    *   Reload the page.
    *   Select the device.
    *   The image should appear automatically. If not, it will fall back to the brand logo.

**Pro Tip**: You can verify the expected slug by looking at the URL when you select the device (e.g. `/fr/reparation/apple/iphone-13`). The image name should match that structure.
