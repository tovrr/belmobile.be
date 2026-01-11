---
description: How to recover abandoned leads via Magic Links (Price Lock)
---

## Overview
Leads who save their quote but don't checkout are sent a "Price Lock" email. This email contains a Magic Link to resume their session exactly where they left off. Detailed in `src/app/_actions/save-quote.ts`.

## Architecture

1.  **Capture**:
    *   User clicks "Save Quote" in Wizard.
    *   `saveQuote` action stores `WizardState` in Firestore `quotes/{quoteId}` (Status: `saved`).

2.  **Magic Link**:
    *   Format: `https://belmobile.be/[lang]/resume/[quoteId]`
    *   The `resume` page fetches the quote, hydrates the `WizardProvider`, and redirects to the Wizard with restored state.

3.  **Email Trigger (Brevo)**:
    *   Server Side dispatch sends the "Price Lock Certificate".
    *   Template: `getMagicLinkEmail` (in `src/utils/emailTemplates.ts`).
    *   **Config**: Requires `BREVO_API_KEY` in environment variables.

4.  **Security**:
    *   Quotes expire after 7 days (Pricing Logic).
    *   Magic Links are read-only until converted.

## Workflow Status
*   [x] **Capture Logic**: Implemented.
*   [x] **Resume Page**: Implemented (`src/app/[lang]/resume`).
*   [x] **Email API**: Implemented (`serverEmailService`).
*   [ ] **Automation**: Abandoned Cart auto-trigger (Future).
