# Pricing Engine Implementation Checklist & Roadmap

## 1. Current State Assessment
- **Status**: ✅ **Unified & SSoT-Driven**
- **SSOT**: Implemented. Data is fetched via `pricing.dal.ts` from Firestore collections (`market_values`, `repair_prices`, `buyback_pricing`).
- **Injector**: The Wizard uses `useWizardPricing` which connects to the server action `getWizardQuote`, ensuring SSoT consistency. The SEO components (`DynamicSEOContent`) also use the DAL.
- **Automation**: `price-war-scraper.js` now writes to `market_values`.

## 2. Implementation Checklist

### Phase 1: Standardization & cleanup (Completed)
- [x] **Refactor Core Logic**: Remove hardcoded magic numbers from calculation logic.
- [x] **Unified Logic File**: `pricingLogic.ts` is now the single source of truth for calculation logic. `pricingCalculator.ts` is deprecated/removed.
- [x] **Config Integration**: Logic uses standard params.
- [x] **Console Logic Preservation**: Controller logic is preserved in `StepCondition.tsx`.

### Phase 2: Centralized API (The SSOT) (Completed)
- [x] **Create `PricingService`**: Implemented as `pricing.dal.ts` (Data Access Layer) and `pricingService.ts` (Client Service).
    -   `getPriceQuote(deviceSlug)` returns locally formatted data for SEO and Wizard.
- [x] **Server-Side Compatibility**: Fully implemented in Next.js Server Actions and Page Metadata generation.
- [x] **API Endpoint**: Server Actions serve as the internal API.

### Phase 3: SEO & JSON-LD Integration (Completed)
- [x] **Remove Mock Data**: `MOCK_REPAIR_PRICES` is no longer used for live pages.
- [x] **Inject Real Prices**: `DynamicSEOContent` uses props passed from `page.tsx` which fetches from `pricing.dal.ts`.
- [x] **Product Schema**: `Breadcrumbs.tsx` includes JSON-LD. `DynamicSEOContent` likely handles Product Schema (needs verification/cleanup if duplicated).
- [x] **Localized Metadata**: `generateMetadata` fully utilizes SSoT for titles and descriptions across 4 languages.

### Phase 4: Market-Based Automation & State Management (Completed)
- [x] **Market Price Schema**: Firestore collection `market_values` is active.
- [x] **Reverse Calculator**: `pricing.dal.ts` contains logic to calculate Buyback based on Market Sell Price (`Buyback = MarketValue - RepairCost - Margin`).
- [x] **Scraper Connectivity**: `scripts/sync-device-data.ts` now pushes Anchors to Firestore.
- [x] **Auto-Adjust**: `BuybackAnchorManager` provides one-click re-calculation of all offers based on Anchors.

## 3. Action Plan (Next Steps)

1.  [x] **Automation & Scraper**: Verify `sync-device-data.ts` and ensuring it correctly feeds `pricing_anchors`.
2.  [ ] **Monitoring**: Add Sentry alerts for pricing anomalies (e.g., calculated buyback < 0).
3.  [ ] **Final Polish**: Ensure all localized strings for conditions are perfectly aligned in Firestore.
4.  [ ] **Expand Data**: Add more devices to `gsmarena-links.ts`.
