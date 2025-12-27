---
description: How to extend or modify the Admin Dashboard
---

# Admin Dashboard Development Workflow

This workflow describes how to add features or modify the Admin Dashboard located at `/src/app/admin`.

## 📂 Structure
- **Page**: `src/app/admin/orders/page.tsx` (Wrapper)
- **Main Component**: `src/components/admin/QuoteManagement.tsx` (Table View)
- **Modal**: `src/components/admin/QuoteDetailsModal.tsx` (Deep Edit View)

## 🛠️ Common Tasks

### 1. Adding a new Field to Quotes
1.  **Update Type**: `src/types.ts` -> Add field to `Quote` interface.
2.  **Update Modal**: `QuoteDetailsModal.tsx`
    - Add state variable (if editable).
    - Add UI input in the appropriate section.
    - Use `updateQuoteFields(quote.id, { newField: value })` to save.
    - **Important**: Log the change using `logActivity`.

### 2. Modifying the PDF
1.  **Generator**: Edit `src/utils/pdfGenerator.ts`.
2.  **Template**: `src/utils/PdfTemplates.ts` defines the visual layout.
    - `createPdfDefinition` maps data to `pdfmake` blocks.
3.  **Testing**: Open an order in Admin, click "Download PDF" to verify changes immediately.

### 3. Adding a new Admin Route
1.  Create new folder: `src/app/admin/new-route/page.tsx`.
2.  Wrap content in `<AdminShell>`.
3.  Add link to `Sidebar` in `src/components/admin/AdminShell.tsx`.

## 🧪 Verification
- **Local**: `npm run dev` -> http://localhost:3000/admin/login
- **Build**: Always run `npm run build` before pushing, as Admin components share types with the Wizard.
