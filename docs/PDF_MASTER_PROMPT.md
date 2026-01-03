# PDF Generator Master Prompt (B2B Standard)

This document defines the requirements, structure, and design principles for the Belmobile PDF generation system. Use this prompt to guide the creation or modification of PDF templates to ensure a professional, legally sound "B2B vibe."

## 1. Visual Identity & Brand
- **Aesthetic:** Clean, minimalist, corporate "INK SAVER" mode.
- **Color Palette:**
  - `Primary`: Indigo (#4338ca) - Used for accents and main titles.
  - `Text`: Pure Black (#000000) for high contrast and readability.
  - `Labels`: Dark Gray (#4b5563) for secondary information.
  - `Borders`: Light Gray (#d1d5db) for structured tables.
- **Typography:** Use a professional sans-serif font (e.g., Roboto). Clear hierarchy between labels (7-8pt) and values (9-11pt).

## 2. Document Structure (5-Block Strategy)

### BLOCK 1: Administrative Header
- **Position:** Top of the page.
- **Content:** 4-Column Balanced Grid.
  - **Order ID:** Bold, uppercase alphanumeric.
  - **Date:** DD/MM/YYYY.
  - **Time:** HH:MM.
  - **Status:** Highlighted in Accent color (upper case).
- **Style:** Thin borders separates values for a "dashboard" look.

### BLOCK 2: Identification (Client & Logistics)
- **Position:** Below header.
- **Split:** 50/50 Columns.
  - **Left (Client):** Full name, Company name (if B2B), VAT Number (if B2B), Email, Phone, and Full Address.
  - **Right (Method):** Delivery/Collection method (e.g., Courier, In-Store Pickup) + **QR Code** for real-time tracking.

### BLOCK 3: Mission Details (The "What")
- **Position:** Central area.
- **Content:** High-level summary of the service.
  - **Title:** "DÉTAILS RÉPARATION", "DÉTAILS RACHAT", or "DÉTAILS RÉSERVATION".
  - **Item Name:** Bold, larger font (e.g., Brand + Model).
  - **Specifics:** List of issues (for repairs), condition/specs (for buyback), or shop location (for reservations).

### BLOCK 4: Financial Breakdown
- **Position:** Focused table.
- **Content:**
  - **Table Headers:** Description, Price.
  - **Rows:** Detailed line items (Base service, parts, extras like Hydrogel, Delivery fees).
  - **Totals Box:** 
    - Subtotal (Ex-VAT) - Required for B2B.
    - VAT (21%) Amount - Required for B2B.
    - **Total Price (Bold, Accent Color).**

### BLOCK 5: Execution & Call to Action
- **Position:** Footer/Bottom area.
- **Content:**
  - **Next Steps:** Numbered list of actionable instructions for the user (e.g., "Backup data", "Visit shop").
  - **Payment/IBAN:** If bank transfer is requested.
  - **Signature Block:** Legal space for "Client Signature" and "Shop Stamp" (for walk-in receipts).

## 3. Technical Requirements
- **Library:** `pdfmake`.
- **Localization:** All labels must be dynamic (i18n) Supporting EN, FR, NL.
- **Data Integrity:** Handle floating point math in cents to avoid display errors.
- **Unbreakable Blocks:** Ensure headers and mission blocks do not split across pages.

## 4. Legal Compliance
- Documents must explicitly state **VAT numbers** for both Belmobile and the Client if `isCompany` is true.
- Clear distinction between "Estimated Price" (Buyback) and "Final Price" (Repair/Sale).
- Mandatory footer with support contact info: "+32 2 275 98 67" and "belmobile.be".
