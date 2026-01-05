# 📉 Operation Velocity: Week 2 - Conversion & Recovery (CRO)

**Goal:** Recover 15% of Abandoned Leads.
**Current State:** Users view the price but leave before booking (High Churn at Price Step).

---

## 🛑 The Funnel Leak Analysis
Based on standard industry metrics for Device Buyback/Repair:
1.  **Discovery**: 100% (Landing Page).
2.  **Selection**: 60% (Select Device).
3.  **Evaluation**: 40% (Answer Questions).
4.  **Price Reveal**: 30% (See Quote). **<-- MAJOR DROP OFF**
5.  **Conversion**: 5-8% (Book Appointment/Mail-in).

**The Gap:** 20-25% of interested users leave simply because they aren't ready to commit *immediately* or want to compare prices.

---

## 🛠️ Strategy A: "Magic Link" Recovery (The Heavy Lifter)
**Concept:** Capture the email *early* (or infer it) and send a link to resume the session later.

### 1. The "Save Quote" Action
Instead of forcing immediate checkout, add a secondary CTA at the Price Step:
*   **Primary Button:** "Vendre maintenant / Réparer" (Commit).
*   **Secondary Button:** "Sauvegarder ce devis (Valable 7 jours)".
*   **Mechanism:** Pops up a simple Email input. Sends a "Magic Link".

### 2. The "Silent" Capture
If the user enters their info in `StepUserInfo` but closes the tab:
*   **Tech:** Use `navigator.sendBeacon` or a `useEffect` cleanup to push partial form data to a `leads` collection in Firestore.
*   **Automation:** Trigger a SendGrid email 1 hour later:
    *   *Subject:* "Votre offre de 450€ pour iPhone 13 est sauvegardée."
    *   *Body:* "Ne perdez pas cette offre. Cliquez ici pour reprendre."

---

## 🛡️ Strategy B: Mobile-First Exit Defense
Since 85% of traffic is mobile, "Mouse Exit" detection doesn't work.

### 1. History API Interception
*   **Trigger:** When user clicks "Back" browser button.
*   **Action:** Intercept navigation once. Show a Bottom Sheet (Drawer).
*   **Message:** "Attendez ! Voulez-vous recevoir cette estimation par email ?"
*   **Value:** User gets value (a record of the price), we get the Lead (Email).

---

## 🚀 Implementation Roadmap (Next 3 Days)

### Day 1: The "Leads" Infrastructure
1.  Create `leads` collection in Firestore (distinct from `orders`).
2.  Update Wizard to auto-save state to `leads` on every step transition.
3.  Create `POST /api/leads/capture` endpoint.

### Day 2: The Exit Intent UI
1.  Build `ExitIntentDrawer` component (Mobile friendly).
2.  Implement `useExitIntent` hook handling History API.

### Day 3: The "Magic Link" Engine
1.  Build `POST /api/leads/recover` (SendGrid integration).
2.  Create Email Template: `OFFER_SAVED_V1` (Dynamic Price/Model).

---

### 🟢 Recommendation
We start with **Strategy A (Magic Link / Save Quote)**.
It is less intrusive, builds trust, and captures high-intent users who just need time.

*Verified by Antigravity*
