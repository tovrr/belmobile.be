# PDF Generator Master Prompt (AEGIS V2)

This document defines the requirements, structure, and design principles for the AEGIS PDF generation system (v2.0). It serves as the authoritative blueprint for the modular rendering engine.

## 1. Modular Architecture (Atomic Render Blocks)
The engine is split into independent units located in `src/utils/PdfTemplates.ts`. This ensures maintainability and layout stability.

- **`renderTopBanner`**: Branding, Ink-saver SVG Logo, and Document Title.
- **`renderIndigoDivider`**: Institutional indigo line separating brand and data.
- **`renderAdminGrid`**: High-level metadata (ID, Date, Time, Status).
- **`renderIdentification`**: Customer info & Logistics/QR code tracking.
- **`renderMissionDetails`**: Product/Shop specifics.
- **`renderFinancials`**: Rigid, consolidated price breakdown.
- **`renderExecution`**: Next steps, Signature blocks, and IBAN.

## 2. Visual Identity & Brand
- **Aesthetic**: Clean, institutional, corporate "INK SAVER" mode.
- **Color Palette**:
  - `Primary`: Indigo (#4338ca) - Accent and titles.
  - `Secondary`: Dark Navy (#1e1b4b) - Headers.
  - `Accent`: Red (#dc2626) - Urgent status (e.g., DEVI REQUIS).
  - `Border`: Light Gray (#d1d5db).
- **Typography**: Roboto. Clear hierarchy (Labels 8pt / Values 9-11pt).

## 3. 1-Page Optimization Principles
All documents must fit on a single A4 page for professional presentation and reduced waste.
- **QR Relocation**: QR codes are moved to the top branding banner to save vertical whitespace.
- **Rigid Consolidation**: Line items and totals are rendered in a **single table** to prevent page breaks between subtotal and total.
- **Margins**: Strategic margins ([40, 30, 40, 40]) to maximize density without losing breathability.
- **Atomic Scaling**: Block-level font scaling (11pt for names, 9pt for secondary values).

## 4. Document Types (Scenarios)
- **`pdf_title_dropoff`**: Take-over form for in-store drop-offs.
- **`pdf_title_send`**: Shipping instructions for postal sends.
- **`pdf_title_courier`**: Mission orders for external couriers.
- **`pdf_title_reservation`**: Confirmation for refurbished device sales.

## 5. Technical Specification
- **Library**: `pdfmake`.
- **Typing**: Use `PdfData` interface for input.
- **i18n**: Support EN, FR, NL, TR. Labels must be pulled from the `data.labels` object.
- **Currency**: All amounts must use `.toFixed(2)` and include the € symbol.

## 6. Footer Strategy
- Standardized Support info: `+32 2 275 98 67 | www.belmobile.be`.
- Dynamic page numbering: `X / Y`.
- Horizontal line divider for clarity.
