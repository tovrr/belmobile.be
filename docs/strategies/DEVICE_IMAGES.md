# Device Image Strategy 2026: Scalable & Premium

## The Problem
We support 1800+ device models. Sourcing, hosting, and managing 1800+ individual JPGs is:
1.  **Operationally Expense:** Hard to maintain.
2.  **Performance Heavy:** Increases build/bandwidth.
3.  **Inconsistent:** Hard to find photos with identical lighting/angles for all models.

## The "Market Leader" Solution: CSS/SVG Composition
Instead of static photos, we use **Dynamic React Components** (`<DeviceVisual />`) to render the device programmatically.

### Why this is better:
1.  **Zero Assets:** No JPGs to download.
2.  **Infinite Resolution:** SVGs look perfect on 4K/8K screens.
3.  **Consistency:** Every device has the exact same "Power" aesthetic.
4.  **Flexibility:** We can change the color of the device dynamically based on user selection.

### Implementation Logic
We classify devices into **Form Factors**:
1.  **`FormFactor.Notch`**: iPhone X -> iPhone 14 (Standard)
2.  **`FormFactor.Island`**: iPhone 14 Pro -> iPhone 17
3.  **`FormFactor.Bezel`**: iPhone SE / Older
4.  **`FormFactor.HolePunch`**: Samsung S20 -> S24
5.  **`FormFactor.Fold`**: Z Fold / Pixel Fold

### Data Structure Update
We add metadata to `src/data/models/*.ts`:
```typescript
'iPhone 17 Pro': {
    price: 1050,
    specs: [...],
    visual: { type: 'island', cameras: 3, finish: 'titanium' } // <--- This drives the visual
}
```

## Fallback Strategy (Hybrid)
If we cannot implement CSS visuals immediately:
1.  **Series-Based Mapping**:
    Instead of looking for `iphone-13-pro-max.jpg`, the code looks for **`iphone-13-pro-series.jpg`**.
    *   All iPhone 13 variants share 1 image.
    *   Reduces asset count from ~1800 to ~200.

## Action Plan
1.  **Phase 1 (Immediate):** Implement **Series-Based Fallback** in `<DeviceImage />` component.
2.  **Phase 2 (Next Sprint):** Build `<DeviceVisual />` component for top 20 popular models (Apple/Samsung) to wow users.
