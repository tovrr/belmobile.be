# Phase 2: Apollo Logic Core (Progress Report)

**Date:** 2026-01-03
**Status:** Completed ✅
**Focus:** Backend Logic, State Management, Logistics, and Admin UI.

## 1. Completed Items ✅

### A. The Apollo State Machine (`src/utils/OrderStateMachine.ts`)
*   **Concept**: A strict, centralized logic engine that dictates the lifecycle of an order.
*   **Statuses Defined**:
    *   `draft`: User exploring wizard.
    *   `new`: User finished wizard (Legacy/Walk-in).
    *   `pending_drop`: User selected Mail-in, waiting for package.
    *   `received`: Package scanned at Hub/Shop.
    *   `in_diagnostic`: Technician Review.
    *   `verified`: Quote Confirmed.
    *   `waiting_parts`: Repair paused.
    *   `in_repair`: Technician working.
    *   `payment_queued` / `invoiced` / `paid`: Financial states.
    *   `ready`: Ready for pickup/ship.
    *   `shipped` / `completed`: Terminal states.
*   **Transitions**: Implemented a `canTransition(from, to)` method to enforce valid flows (e.g., preventing `draft` -> `paid` skipping verification).

### B. Logistics Service (`src/services/server/logisticsService.ts`)
*   **Objective**: Automate the "Mail-in" flow.
*   **Features**:
    *   **SendCloud Integration**: Replaced mock generator with real API calls to SendCloud.
    *   **Fallback**: Auto-mock mode if keys are missing (Dev friendly).
    *   **Logic**: `getInitialStatus` automatically sets order to `pending_drop` if delivery method is 'send'/'courier'.

### C. Secure Order Submission (`src/app/api/orders/submit/route.ts`)
*   **Integration**:
    *   Now fully integrated with `logisticsService`.
    *   If user selects "Mail-in", it **automatically generates a shipping label** via SendCloud.
    *   Saves `trackingNumber` and `shippingLabelUrl` to the Order in Firestore.
    *   Sets the correct initial status (`pending_drop` vs `new`).

### D. Admin UI & Technician Portal
*   **`StatusBadge.tsx`**: Unified component that handles all new statuses (`pending_drop` = Orange, `waiting_parts` = Yellow, etc.).
*   **Kanban Board**: Updated columns to group new statuses logically (Intake, Diagnostic, Work, Ready).
*   **Quote Filters**: Updated Admin filters to include all new statuses using `<optgroup>`.
*   **Technician Portal**:
    *   Updated `/admin/technician` with new lifecycle logic.
    *   Flow: `New` -> `In Diagnostic` -> `Verified` -> `In Repair` -> `Ready`.
    *   Added visual support for `pending_drop`.

### E. System Integrity
*   **Type Safety**: Updated `src/types/models.ts` with the new `OrderStatus` union type.
*   **Build**: `npx tsc --noEmit` passing with 0 errors.

## 2. Pending / Next Steps 🚧

### A. Repair Flow Specifics (Phase 5)
*   **Objective**: Implement "Part Allocation" logic when entering `waiting_parts`.
*   **Inventory**: Link `waiting_parts` to inventory decrement.

### B. User Dashboard
*   **Objective**: Allow customers to see these granular statuses in their "My Orders" view.

## 3. Technical Debt / Notes
*   **Legacy Support**: Legacy statuses mapped in State Machine.
*   **Hotfix**: Homepage Reviews are still disabled (see `docs/HOTFIX_REVIEWS.md`).
