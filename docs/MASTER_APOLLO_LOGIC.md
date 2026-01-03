# MASTER PROMPT: THE APOLLO LOGIC CORE (Security & Logistics)

**Objective:**
Shift entirely from UI/Design to **Security, Logic, and Logistics**. We are building the "Circulatory System" of the Belmobile Platform. The goal is to secure user data and rigorously define the lifecycle of an order from "Click" to "Delivery".

## 1. Security & Access Control (The "Zero-Trust" Mandate)
*   **Problem:** Currently, order/tracking pages might be accessible via simple URL ID manipulation.
*   **Requirement:** Implement a **Token-Based Access System** (Magic Links).
    *   An Order ID is public knowledge (easy to guess).
    *   An Access Token (UUID) is secret.
    *   **Rule:** A user CANNOT view `/track-order?id=123` without also providing `&token=xyz...` or being authenticated as the owner.
    *   **Fallback:** If no token is present, redirect to a "Verify Identity" page (enter Email -> send Magic Link).

## 2. The Order State Machine (Rigid Workflow)
Define and enforce the strict lifecycle of an order. No "jumping" steps allowed.
*   **States:**
    1.  **DRAFT:** User is filling wizard. (Unsaved/Partial).
    2.  **PENDING_DROP:** Wizard complete. User selected "Shop Drop-off" or "Post".
    3.  **RECEIVED:** Device physically scanned at Shop OR Courier Hub.
    4.  **IN_DIAGNOSTIC:** Technician is verifying device (matching Wizard data).
    5.  **VERIFIED:** Quote confirmed exact match.
        *   *Branch A (Buyback):* **PAYMENT_QUEUED** -> **PAID**.
        *   *Branch B (Repair):* **INVOICED** -> **PAID** -> **REPAIRING** -> **READY**.
    6.  **COMPLETED:** Handover complete.
*   **Action:** Create the `OrderStateMachine` class/utility that validates every transition.

## 3. The Logistics Dispatch System (The "Driver" Flow)
*   **Walk-in:** Handled by `ShopManagement` (Admin scans QR -> Status `RECEIVED`).
*   **Mail-in (Courier):**
    *   **Integration:** We need to simulate (or connect) the SendCloud/Bpost flow.
    *   **Trigger:** When user selects "Mail-in", generate the Shipping Label PDF immediately.
    *   **Tracking:** We must webhook/poll the courier status to auto-update our Order State to `RECEIVED` when the courier scans the package.

## 4. Deliverables for this Session
1.  **Security Audit:** Verify all public routes are guarded.
2.  **State Logic:** Implement `validateTransition(current, next)` in the backend.
3.  **Logistics map:** Document exactly when and how the Shipping Label is generated and who receives it.

**Context:**
The UI is "Aegis V2" (Done). The Admin is "Template Manager" (Done).
Now we build the **Engine Room**. No CSS. No Animations. Pure Logic Types, Security Rules, and Database Triggers.
