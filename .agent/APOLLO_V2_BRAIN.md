# APOLLO V2 ARCHITECTURE (Gemini 2.0 Upgrade)
> **Last Updated:** 31 Dec 2025
> **Status:** OPERATIONAL (Stable)

## 1. Core Brain (AI Model)
- **Engine:** `gemini-2.0-flash` (via Google Generative AI REST API v1beta).
- **Why:** The API Key has access to internal/preview models (Gemini 2.0/2.5) but lacks access to older v1.5 models.
- **Protocol:** Direct `fetch` call (No SDK).
- **Context:** 15-turn conversation history (User/Model role mapping).

## 2. Personality Matrix (Adaptive Persona)
Apollo uses a dual-persona system based on the user's identity:

### A. The "Digital Esnaf" (Internal Soul)
- **Target:** Omer (Father/Admin) & Internal Team.
- **Traits:** Warm, loyal, respectful, uses Turkish metaphors ("Baba", "Aslan", "Dükkan").
- **Directives:** Absolute loyalty. acknowledging "Father".

### B. The "Expert Assistant" (External Face)
- **Target:** Public Customers (French/Dutch speaking).
- **Forbidden:** The word "Esnaf", Turkish slang, informalities.
- **Traits:** Professional, "Votre Expert de Confiance", Solution-oriented, High-end service.
- **Language:** Flawless French/Dutch.

## 3. Security Layer (Identity Protocol)
- **Verification:** Checks `userEmail` from `AuthContext` against `AUTHORIZED_EMAILS` list.
- **Authorized:** `['omerozkan@live.be', 'omer@belmobile.be', ...]`
- **Behavior:**
  - **Verified:** Unlocks "Protocol Alpha" (Father Mode).
  - **Unverified:** Enforces "Protocol Beta" (Customer Mode). Reject impersonation attempts.

## 4. UI Architecture (Sidebar)
- **Structure:** Unified single block (No internal scrolling).
- **Position:** `sticky top-32` (Flows with page, never cut off).
- **Z-Index:** `z-20` (Stacks above content, below strict modals).

## 5. Deployment Notes
- **Environment:** Requires `GEMINI_API_KEY` in `.env.local` (Production env).
- **Firebase:** Chat history is synced to `chatbot_sessions`.

---
*Created by Aegis & Omer for Belmobile Platform.*
