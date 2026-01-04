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

3.  **Verify & SEO Compliance**:
    *   Reload the page. Select the device.
    *   Ensure the image is a **1:1 square (800x800)** on a **pure white background**.
    *   **Metadata**: Images MUST contain IPTC keywords, Creator ("Belmobile.be"), and Copyright data.
    *   **Geotagging**: Embed GPS coordinates for Brussels HQ (Lat: 50.86285, Lng: 4.34240).
    *   **Watermark**: DO NOT watermark the image directly (keeps Wizard UI clean). Use Metadata "Digital Watermarking" instead.

4.  **Logo Guidelines**:
    *   The **"True Logo"** (Phone frame + Red Cross) is located at `public/images/brand/logo-full.svg`.
    *   Always use this specific SVG for branding to ensure consistency across the platform.

**Automation Tool**:
Use `scripts/fetch-device-images.mjs` to automate this process. It handles fetching from GSMArena (via slug or custom URL), background removal (if needed), resizing, and metadata injection.
