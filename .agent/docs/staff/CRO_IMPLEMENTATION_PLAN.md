---
description: Implementation Plan for Week 2 Conversion (CRO) features: Exit Intent, Magic Links, and Lead Recovery.
---

# 🟡 Week 2: Conversion (CRO) & Lead Recovery - Implementation Plan

## 🎯 **Objective**
Recover 15% of abandoned wizard sessions by capturing leads *before* they exit and providing a seamless "resume later" experience via Magic Links.

## 🏗️ **Architecture Overview**

### 1. The "Exit Defense" System (Frontend)
We will detect user disengagement and trigger a high-value intervention.
*   **Trigger**: Cursor leaving the window (Desktop), rapid scroll up/back button (Mobile fallback).
*   **Component**: `ExitIntentModal.tsx`
*   **Logic**:
    *   Only trigger if user is > Step 2 (Price Estimate shown).
    *   Limit frequency (once per session/day).
    *   **Offer**: "Save this quote for 7 days" OR "Get +10€ coupon code".

### 2. The "Magic Link" Engine (Backend)
We need a secure way to store "frozen" wizard states and resurrect them.
*   **Data Model**: `leads` collection in Firestore.
    *   `id`: unique token (e.g., `lead_abc123`)
    *   `status`: 'abandoned' | 'recovered' | 'converted'
    *   `wizardState`: JSON string of the user's choices (Device, Condition, Answers).
    *   `email`: User's email (if captured).
    *   `expiresAt`: Timestamp (7 days later).
*   **API**: `POST /api/leads/save` (Creates lead, returns Token).
*   **Route**: `/resume/[token]` (Loads state, redirects to Wizard).

### 3. "Owl Recovery" (Email Automation)
*   **Trigger**: When user inputs email in Exit Intent modal.
*   **Action**: Send "Your Quote is Saved" email via SendGrid/Brevo.
*   **Content**: Device summary, Price lock guarantee, Button: "Resume Quote".

---

## 📅 **Step-by-Step Execution Plan**

### Phase 1: Smart Detection & Capture (Frontend)
1.  **Create Hook**: `useExitIntent.ts` (Already partially exists, needs refinement for mobile sensitivity).
2.  **Create Component**: `SaveQuoteModal.tsx`
    *   Design: "Don't lose your price!" (Fear of Missing Out).
    *   Input: Email Address.
    *   Action: Calls `saveLead` server action.
3.  **Integrate**: Mount inside `WizardLayout` but only active on specific steps.

### Phase 2: Persistence Layer (Backend)
1.  **Firestore**: Update `pricing.dal.ts` or create `leads.dal.ts` to handle lead storage.
2.  **Server Action**: `saveWizardState(email, state)` 
    *   Validates email.
    *   Generates secure short-token (nanoid).
    *   Saves to Firestore `leads`.
    *   Triggers Email (Phase 3).

### Phase 3: The Resurrection (Routing)
1.  **Magic Route**: Create `src/app/[lang]/resume/[token]/page.tsx`.
2.  **Logic**:
    *   Fetch lead from Firestore.
    *   If expired -> Show "Quote Expired" (with CTA to start over).
    *   If valid -> Inject state into `WizardContext`.
    *   Redirect to `/[lang]/repair/summary` or `/[lang]/buyback/summary`.

---

## 🧪 **Validation Strategy**
1.  **Trigger Test**: Verify popup triggers on mouse-out (Desktop) and pattern match (Mobile).
2.  **Data Integrity**: Verify JSON state in Firestore matches the user's selection exactly.
3.  **Resume Flow**: Click the specific link `.../resume/xyz` and confirm the Wizard is pre-filled correctly.
4.  **Security**: Ensure one user cannot guess another's token easily (use UUID/NanoID).

## ⚠️ **Risks & Mitigation**
*   **Risk**: Annoying the user.
    *   *Mitigation*: Strict cookie-based "cooldown" (don't show again for 7 days).
*   **Risk**: Mobile exit intent is hard to detect.
    *   *Mitigation*: Use "Back Button" interception (history.pushState) as a soft gate.

---

**Next Action**: Begin Phase 1 - `useExitIntent` refinement and `SaveQuoteModal` creation.
