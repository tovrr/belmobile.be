# State of the Art Buyback Logic Audit

## 1. Current Implementation Analysis

### Core Logic (`pricingCalculator.ts`)
- **Method**: Static base price minus hardcoded deductions.
- **Base Price**: Looks up a price by storage capacity in `buyback_pricing` collection. If not found, defaults to max price of that device.
- **Conditions**:
  - `turnsOn` (False): **€0** (Hardcoded)
  - `isUnlocked` (False): **€0** (Hardcoded)
  - `worksCorrectly` (False): **50% deduction** (Hardcoded multiplier)
  - `faceIdWorking` (False): **-€150** (Hardcoded flat fee)
  - `batteryHealth` (Service): Deducts cost of battery repair.
  - `screenState`: Scratches **30% of repair cost**, Cracked **100% of repair cost**.
  - `bodyState`: Scratches **-€20**, Dents **-100% Back Repair**, Bent **-(Back Repair + €40)**.

### Data & Configuration (`buyback-config.ts`)
- **Disconnect Alert**: The file `buyback-config.ts` defines `BUYBACK_CONDITION_DEDUCTIONS` and `BUYBACK_STORAGE_MULTIPLIERS` but **these are completely unused** in the calculator.
- **Storage**: Currently, the DB is expected to contain explicit prices for every storage variant. The `BUYBACK_STORAGE_MULTIPLIERS` (e.g., 1TB = 1.4x) are ignored, meaning if a database record is missing a storage size, it falls back to a generic max price rather than calculating it.

### Competitive Intelligence (`price-war-scraper.js`)
- **Status**: Standalone script.
- **Function**: Scrapes iClinique, FixIt, MisterMinit.
- **Integration**: **None**. The data is saved to `competitor_prices` but `useBuybackPricing` and `pricingCalculator` never read it.
- **Latency**: Scraper is manual/scheduled, not real-time.

---

## 2. Bottlenecks & Critical Flaws

1.  **Hardcoded Business Logic**: Critical condition deductions (-50%, -€150) are buried in code. Changing the FaceID penalty requires a deployment.
2.  **Disconnected Configuration**: The `buyback-config.ts` file acts as a decoy. It looks like configuration but does nothing.
3.  **Binary "Works Correctly"**: The `worksCorrectly` flag is too broad. A broken camera and a broken motherboard both trigger a 50% cut, which is either too harsh for the camera or too generous for the motherboard.
4.  **No Margin Management**: The system assumes the "Base Price" in DB is the "Buyback Price". It does not calculate `Buyback = Sell_Price - Repair - Margin`. This requires manual updating of thousands of DB records whenever market value shifts.
5.  **Zero-Price Traps**: If `turnsOn` is false, price is 0. In "State of the Art" (SOTA) systems, even dead phones have scrap value (screens, rare parts).

---

## 3. "State of the Art" Improvement Architecture

### Phase 1: Dynamic Cleaning (Immediate)
- **Action**: Refactor `pricingCalculator.ts` to actually use `buyback-config.ts`.
- **Benefit**: Centralized control of deductions.

### Phase 2: The "Market-Back" Engine (Recommended)
Instead of storing "Buyback Prices", we should store/scrape **"Market Sell Prices"** and calculate backwards.

**Formula**:
```typescript
BuybackOffer = (MarketSellPrice * GradingMultiplier) - RepairCosts - TargetMargin
```

**New Data Structures**:
1.  **`MarketValue`**: The reference price (Refurbished Grade A retail price).
2.  **`MarginRules`**: e.g., "Min €30 margin, or 20% of value".
3.  **`DeductionMatrix`**: Granular deductions for specific faults (Camera, Speaker, Mic) rather than generic "worksCorrectly".

### Phase 3: Competitive Policing
- **Action**: Integrate `competitor_prices`.
- **Logic**: `RecommendedOffer = Min(MaximumMarginAllowed, CompetitorPrice + €5)`.
- **Goal**: Always beat the local competition by €5 while staying profitable.

## 4. Proposed Immediate Refactor

I propose to immediately refactor `pricingCalculator.ts` to implement **Phase 1**:
1.  Inject `buyback-config.ts` constants.
2.  Prepare the interface for `MarketValue` input.
