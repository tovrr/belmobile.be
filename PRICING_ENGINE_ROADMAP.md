# Pricing Engine Implementation Checklist & Roadmap

## 1. Current State Assessment
- **Status**: ⚠️ **Fragmented & Disconnected**
- **SSOT**: Missing. Data is split between Firestore (`buyback_pricing`), hardcoded constants (`MOCK_REPAIR_PRICES`), and duplicate utility files (`pricingLogic.ts` vs `pricingCalculator.ts`).
- **Injector**: The Wizard uses `useWizardPricing`, but SEO components use unrelated mock data.
- **Automation**: `price-war-scraper.js` exists but stores data in a siloed `competitor_prices` collection that the app never reads.

## 2. Implementation Checklist

### Phase 1: Standardization & cleanup (Immediate)
- [x] **Refactor Core Logic**: Remove hardcoded magic numbers from calculation logic.
- [ ] **Unified Logic File**: Merge `pricingCalculator.ts` into `pricingLogic.ts` and delete the duplicate.
- [ ] **Config Integration**: Ensure `pricingLogic.ts` imports penalties from `buyback-config.ts`.
- [ ] **Console Logic Preservation**: Ensure the controller counting logic from `pricingLogic.ts` is preserved.

### Phase 2: Centralized API (The SSOT)
- [ ] **Create `PricingService`**: A robust TypeScript service that abstracts data fetching.
    -   `getBuybackQuote(device, condition)`
    -   `getRepairQuote(device, issues)`
    -   `getProductMarketData(device)` (for SEO)
- [ ] **Server-Side Compatibility**: Ensure this service works in Next.js Server Components (App Router) for SEO injection.
- [ ] **API Endpoint**: Create `/api/pricing/quote` for external tools or widget integration.

### Phase 3: SEO & JSON-LD Integration
- [ ] **Remove Mock Data**: Delete `MOCK_REPAIR_PRICES` usage in `DynamicSEOContent.tsx`.
- [ ] **Inject Real Prices**: Use `PricingService` in `DynamicSEOContent.tsx` to fetch real-time repair prices.
- [ ] **Product Schema**: Generate `application/ld+json` **Product** schema with:
    -   `offers.price`: Dynamic from DB.
    -   `offers.priceCurrency`: "EUR".
    -   `offers.availability`: "InStock".
    -   `aggregateRating`: (Optional) Real reviews.

### Phase 4: Market-Based Automation & State Management
- [ ] **Market Price Schema**: specific Firestore collection for `market_values` (Sell Price) instead of `buyback_prices`.
- [ ] **Reverse Calculator**: Update logic to: `Buyback = MarketValue - RepairCost - Margin`.
- [ ] **Scraper Connectivity**: Update `price-war-scraper.js` to write to `market_values`.
- [ ] **Auto-Adjust**: Cloud Function or Cron Job to re-calculate offers when Market Value changes.

## 3. Action Plan (Next Steps)

1.  **Consolidate Logic**: Fix the `pricingLogic.ts` vs `pricingCalculator.ts` duplication immediately.
2.  **State Injection**: Wire `buyback-config.ts` into `pricingLogic.ts`.
3.  **SEO Fix**: Replace `MOCK_REPAIR_PRICES` with a real DB call (or a cached snapshot) to make Google see real prices.
