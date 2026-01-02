---
description: The Standard Operating Procedure (SOP) for Development and Deployment to prevent regressions and errors.
---

# Development & Deployment SOP

This strategy enforces a **Safety-First Flow** to prevent "catastrophes", rollbacks, and confusion.

## 1. The Golden Rule
🚫 **NEVER push directly to `main` without Staging Verification.**
✅ **ALWAYS flow**: `Local` → `Staging` → `Verify` → `Production`.

---

## 2. Phase 1: Local Development (The Lab)
**Goal**: Create and validation code logic.
1.  **Work on Localhost**: `npm run dev`.
2.  **Verify Build Integrity**: Before ANY push, you MUST run:
    ```bash
    npm run build
    ```
    *If this fails, STOP. Do not push broken code.*

---

## 3. Phase 2: Staging Deployment (The Real World Test)
**Goal**: Verify code on Vercel infrastructure (Mobile/Tablet/PC).
1.  **Push to Staging**:
    ```bash
    git checkout staging
    git merge main   # Or your feature branch
    git push origin staging
    ```
2.  **Verify**:
    *   Go to **Vercel Dashboard** → **Project** → **Deployments**.
    *   Find the **Staging** deployment (top of list).
    *   **Open the URL on your PHONE** (not just desktop simulator).
    *   *Check critical flows (Hero, Purchase, etc.).*

---

## 4. Phase 3: Production Release (The Launch)
**Goal**: Release confirmed code to the public.
1.  **Condition**: ONLY proceed if Phase 2 is **APPROVED**.
2.  **Check Vercel Status**: Ensure no active **ROLLBACKS** are pinning the version (check for red banners).
3.  **Merge & Push**:
    ```bash
    git checkout main
    git merge staging
    git push origin main
    ```
4.  **Post-Launch Check**:
    *   Visit `belmobile.be` immediately.
    *   If issues arise → **DO NOT PANIC**. Use Vercel "Instant Rollback".
    *   *Important*: After a rollback, **Phase 3 is locked**. You must "Undo Rollback" before new code can go live (as learned today!).

---

## 5. Emergency Recovery (Rollback Protocol)
If `main` is broken:
1.  **Vercel Dashboard** → Click `...` on previous good deployment → **Instant Rollback**.
2.  **Fix Code Locally** → Push to **Staging**.
3.  **Verify Staging Fix**.
4.  **Vercel Dashboard** → **Undo Rollback** (Unlock the gate).
5.  **Promote New Deployment** from Step 2 to Production.

---

## 6. AI Agent Instructions
*   When asked to "Deploy", the AI will default to **Staging** first.
*   The AI will ask for "Confirmation" before pushing to `main`.
