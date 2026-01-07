---
description: Create a new React Component following the Project Architecture
---

# Component Creation Protocol

This workflow ensures that every new component adheres to the project's strict modular architecture and type safety rules.

## 1. 📍 Determine the Correct Location
**Do not** place files in `src/components` root. Choose a semantic subfolder:

- **`src/components/ui/`**: Primitive, reusable UI elements (Buttons, Inputs, Cards). *No business logic.*
- **`src/components/layout/`**: Structural elements (Header, Footer, Sidebar).
- **`src/components/common/`**: Shared logic used across multiple pages (FAQ, Providers).
- **`src/components/features/`**: Domain-specific features (TrackOrder, ReservationModal).
- **`src/components/sections/`**: Large page sections (Hero, BentoServices).
- **`src/components/pages/`**: Full page compositions.
- **`src/components/store/`**: Map and Store locator specific.
- **`src/components/product/`**: Product display logic.
- **`src/components/wizard/`**: Buyback/Repair wizard steps.

## 2. 📝 Define the Interface First
**Before writing the component implementation**, define its props interface.

- If it's a shared model (e.g., `Shop`, `Product`), use `src/types/models.ts`.
- If it's a UI prop text (e.g., `ButtonProps`), define it in `src/types/ui.ts` OR colocate it in the component file if it's private.
- **Refuse to use `any`**.

## 3. 🦴 Consider Loading States
Will this component be used in a dynamic route or fetch data?

- **Yes**: Create a skeleton for it or ensure it handles `loading` prop gracefully.
- **Example**: `ProductCardSkeleton.tsx` for `ProductCard.tsx`.

## 4. ✍️ Implementation Template

```tsx
'use client'; // Use only if interactive (useState, useEffect, event handlers)

import React from 'react';
import { cn } from '@/utils/cn'; // If styling merge is needed

interface MyComponentProps {
    title: string;
    className?: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, className }) => {
    return (
        <div className={cn("p-4 border rounded-ui", className)}>
            <h1>{title}</h1>
        </div>
    );
};

export default MyComponent;
```

## 5. 🔍 Verification
After creating the component:
1. Run `npx tsc --noEmit` to ensure no import/type errors.
2. Verify it is imported using the correct relative path (e.g., `../../ui/Button`).
