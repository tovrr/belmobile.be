---
description: Implementation plan for B2B Fleet Portal (Week 3) featuring Bulk IMEI Upload and Dashboard.
---

# B2B Fleet Portal Implementation Plan (Week 3)

## 🎯 Objective
Empower corporate clients to manage large fleets of devices by implementing a **Dashboard** and **Bulk IMEI Upload** feature. This allows B2B partners (e.g., companies, schools) to get instant quotes for hundreds of devices at once.

## 🏗️ Core Architecture

### 1. The Client Dashboard (`/business/portal`)
- **Structure**: Existing sidebar navigation (`dashboard`, `fleet`, `buyback`, `repairs`, `invoices`).
- **Data Source**: `b2b_inventory` collection in Firestore.
- **Authentication**: `companyId` linking users to their fleet data.

### 2. Bulk Upload Feature (`BulkFleetUploadModal`)
- **Input**: CSV / Excel file containing IMEIs and Models.
- **Processing**: Client-side parsing (PapaParse) to extract data.
- **Pricing**: Batch query to `pricing_anchors` (or `getPricingData`) to fetch current value.
- **Output**: A "Draft Offer" in `b2b_offers` collection.

## 📋 Step-by-Step Plan

### Phase 1: Logic & Validation (CSV Parser)
- [ ] **Dependency**: Install `papaparse` (or check if processed manually).
- [ ] **Upload Handler**: Implement `handleFileUpload` in `BulkFleetUploadModal`.
- [ ] **Validation**: Ensure CSV columns map correctly (`imei`, `model`, `condition` (optional)).

### Phase 2: Pricing Engine Integration
- [ ] **Batch Pricing Action**: Create server action `getBulkQuote(devices[])`.
- [ ] **Logic**: Iterate devices -> Call `getPricingData` -> Sum total value.
- [ ] **Optimization**: Use `Promise.all` but limit concurrency to avoid Firestore quotas.

### Phase 3: Persistence
- [ ] **Save Inventory**: Store uploaded devices in `b2b_inventory`.
- [ ] **Create Offer**: Generate a `b2b_offer` document linked to these devices.

### Phase 4: UI Refinement
- [ ] **Progress Bar**: Show upload status (e.g. "Processing 54/100...").
- [ ] **Error Handling**: Gracefully handle unknown models or bad IMEIs.

## 📝 Data Schema (New)

### `b2b_inventory`
```typescript
interface FleetDevice {
  id: string; // uuid or imei
  companyId: string;
  imei?: string;
  model: string; // "iPhone 13"
  storage: string; // "128GB"
  condition?: string; // "good"
  estimatedValue: number;
  status: 'active' | 'sold' | 'repair_needed';
  addedAt: Timestamp;
}
```

## 🚀 Execution Strategy
1. **Verify** current `BulkFleetUploadModal` placeholder state.
2. **Implement** CSV Parsing + File Reader.
3. **Connect** to Pricing Engine.
4. **Deploy** to Staging for validation.
