---
description: How to extend or modify the Buyback/Repair Wizard
---

# Wizard Development Workflow

The Belmobile Wizard (`BuybackRepair.tsx`) uses a decentralized architecture based on React Context and custom hooks. Follow these patterns to maintain high integrity.

## 1. Central State (`WizardContext.tsx`)
All wizard state lives here.
- To add a new field, update the `WizardState` interface and the initial state.
- Add a corresponding action to the `WizardAction` union.

## 2. Navigation & Logic (`useWizardActions.ts`)
- Use `handleNext` and `handleBack` for step navigation.
- Selection logic (switching brands/models) should be encapsulated here.

## 3. Pricing & Estimates (`useWizardPricing.ts`)
- All pricing math MUST reside in this hook.
- It consumes `usePublicPricing` for dynamic data from Firestore.
- Supports both Buyback (deductions) and Repair (additive) logic.

## 4. Components (`src/components/wizard/steps/`)
- Each step is a standalone component.
- Steps should consume context via `useWizard()`.
- Use `StepWrapper` for animations (Framer Motion).
- Use `StepIndicator` for the progress breadcrumbs.

## 5. Mobile Responsiveness
- **Padding**: Use `p-3 sm:p-6 lg:p-8` for the main orchestrator container.
- **Rounding**: Use `rounded-2xl sm:rounded-3xl` for cards.
- **Summary**: `renderMobileSummary()` is used in `StepUserInfo` to show a sticky summary on small screens.

## 6. Order Submission (`orderService.ts`)
- All "side effects" (Firebase, PDF, Email) happen here.
- Do NOT put business logic inside the component.
