---
description: Finalized Hybrid Implementation Plan (Anchor Buyback + Manual Repair)
---

# 🚀 Pricing Engine V3: The Hybrid Anchor System (Final Plan)

**Objective**: Split the pricing engine into two distinct logic streams:
1.  **Repair**: Validation of the existing Manual Matrix (Control-First).
2.  **Buyback**: Migration to an Automated "Anchor-Based" System (Stability-First).

---

## 🏗️ Phase 1: Data Mastery (The Map)

**Goal**: Establish the "Single Source of Truth" for device definitions.

1.  **Create `src/data/gsmarena-links.ts`**:
    *   This file maps our internal `slug` (e.g., `apple-iphone-13`) to the **Exact GSMArena Specs URL**.
    *   *Why*: We solved the "Random ID" problem by simply hardcoding these links once.

**Goal**: Visualize and Control the Hybrid Engine.

1.  **Modify `RepairPricingManagement.tsx`**:
    *   **Repair Tab (Unchanged)**: Keep the existing Matrix. It works.
    *   **Buyback Tab (New)**:
        *   **Left Column**: "Anchor Price" (Coming from GSMArena). Status indicator (Green = Fresh).
        *   **Middle Column**: "Multipliers" (Sliders for Condition %).
        *   **Right Column**: "Final Offers" (Live Preview).
        *   **Action**: "Sync Anchors" button -> Triggers the scraper script (via API).

---

## 🧹 Phase 4: Migration & Cleanup

**Goal**: Switch from V2 to V3 cleanly.

1.  **Legacy**: Move `price-war-scraper.js` to `legacy/`.
2.  **Deprecate**: Remove `useBuybackDefaults` (the old hardcoded prices).
3.  **Run**: Execute `sync-device-data.mjs` to populate the first batch of anchors.

---

## 📅 Execution Order (Next 30 Mins)

1.  [x] **Create Map**: `src/data/gsmarena-links.ts` (Top 20 iPhones added).
2.  [x] **Create Script**: `scripts/sync-device-data.ts`.
3.  [x] **Validate**: Script ran successfully, Anchors populated.
4.  [x] **UI**: `BuybackAnchorManager` updated and verified live.

## 🏁 Phase 5: Final Verification (Now)

1.  [x] **Generate**: User clicks "Generate Offers" in Admin Dashboard (Verified: Logic uses Tiers).
2.  [x] **Verify**: Check Public Wizard for correct pricing (Base + Storage Bumps + Condition).
3.  [x] **Cleanup**: Remove legacy scraper scripts and debugging tools.

---
