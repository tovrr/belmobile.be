---
description: Homepage Layout and Design Alignment Strategy 2026
---

# Homepage Strategy 2026: The "Battle of Philosophies" (A/B Test)

**Objective:** Determine the most effective conversion driver by pitting two distinct design philosophies against each other.

---

## The Contenders

### **Variant A: The "Power Grid" (Aegis Philosophy)**
*   **Core Concept:** **Authority & Segmentation.**
*   **Target:** Mixed traffic (B2B Managers + High-end Consumers).
*   **Layout Strategy:** "Traffic Controller".
*   **Hero:** Abstract, High-Tech. Dual CTAs ("Business" vs "Consumer").
*   **Key Feature:** **Bento Grid**. Allows users to self-select their journey.
*   **Vibe:** Corporate, Premium, "The Infrastructure Partner".
*   **Hypothesis:** Trust and scale drive higher ticket values (B2B contracts, multiple device buybacks).

### **Variant B: The "Speed Funnel" (Apollo Philosophy)**
*   **Core Concept:** **Frictionless Action.**
*   **Target:** Distressed Consumers (Panic Mode).
*   **Layout Strategy:** "Linear Conversion".
*   **Hero:** **Embedded Repair Widget**. No clicking "Repair" button—the dropdowns are *right there* in the hero. "Select Brand -> Select Model -> See Price".
*   **Key Feature:** **Immediate Gratification**. Minimal text, maximum utility.
*   **Vibe:** Urgent, Helpful, "Your Emergency Service".
*   **Hypothesis:** Removing clicks increases conversion rate for single repairs.

---

## 2. Technical Implementation: The `SlotMachine` Component

We will implement a lightweight A/B testing mechanism at the component level.

### A. Architecture
*   **`HomeClient.tsx`** becomes the container.
*   **Mechanism:**
    1.  On load, check `localStorage` for `ab_variant`.
    2.  If none, assign random 'A' or 'B' (50/50 split).
    3.  Store selection in `localStorage` to ensure consistency on reload.
    4.  Render `<HomeVariantA />` or `<HomeVariantB />`.
*   **Dev Override:** Allow forcing a variant via URL parameter: `?variant=A` or `?variant=B`.

### B. Component Breakdown

#### **Variant A Components (`/components/home/variant-a`)**
*   `HeroPower.tsx`: The dual-button, corporate abstract hero.
*   `BentoGrid.tsx`: The modular service selection.
*   `CorporateStrip.tsx`: The B2B dark mode section.

#### **Variant B Components (`/components/home/variant-b`)**
*   `HeroAction.tsx`: Contains the `WizardForm` directly embedded.
*   `LinearProcess.tsx`: "Step 1, 2, 3" hoizontal flow.
*   `ReviewsCarousel.tsx`: Focus on social proof immediately after the form.

---

## 3. Metrics for Success

We will track the following events to declare a winner:

| Metric | Variant A Goal | Variant B Goal |
| :--- | :--- | :--- |
| **B2B Clicks** | High | Low (Expected) |
| **Repair Funnel Start** | Medium | **High** |
| **Bounce Rate** | Low (Engagement) | Low (Relevance) |
| **Time on Page** | Higher (Reading) | Lower (Doing) |

---

## 4. Design Aesthetics (Shared DNA)

To ensure brand consistency despite layout differences, both variants will use:
*   **Colors:** Cyber Citron (`#D4FF00`) & Deep Slate (`#0F172A`).
*   **Typography:** *Inter* / *Outfit*.
*   **Footer:** Shared "Fat Footer" for SEO stability.
## 5. Status: Implemented ✅

**Deployed:** Jan 3, 2026.
**Components:**
*   `src/components/home/ABTestWrapper.tsx` (Logic)
*   `src/components/home/variant-a/` (HeroPower)
*   `src/components/home/variant-b/` (HeroAction, LinearProcess)
*   `src/components/sections/HomeClient.tsx` (Integration)

**Testing:**
*   Default: Random 50/50.
*   Force A: `/?variant=A`
*   Force B: `/?variant=B`
