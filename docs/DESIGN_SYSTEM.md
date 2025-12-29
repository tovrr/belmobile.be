# Belmobile Design System: The Geometric DNA

Act as: Senior Brand Systems Architect & UI Engineer.
Foundation: Logo Geometric Logic + Medical-Tech Intersection.

## 1. Geometric Logic (The Core DNA)
*Derived from the 'b' Phone Chassis and 'Medical Plus' geometry.*

| Token | Rule | System Value |
| :--- | :--- | :--- |
| **Corner Radius** | 20% of smallest dimension | `12px` (Standard) / `24px` (Large) |
| **Stroke Weight** | 10% of object scale | `2px` (UI Base) / `4px` (Display) |
| **Border Logic** | Solid, consistent weight | `var(--ui-stroke)` solid `var(--midnight)` |

## 2. Color Architecture
*Functional palette harmonized with Brand Yellow.*

| Token | Role | Hex | Application |
| :--- | :--- | :--- | :--- |
| **Action** | Primary Brand Power | `#EAB308` | Buttons, Active States, CTAs |
| **Midnight** | Legibility & Authority | `#0F172A` | Primary Text, Dark Backgrounds |
| **Cloud** | Spatial Breathing | `#F8FAFC` | Light Backgrounds, Subtle Sub-surfaces |
| **Alert** | Medical Criticality | `#DC2626` | Errors, Danger, Critical Updates |
| **Glass** | Technical Clarity | `rgba(255,255,255,0.7)` | Headers, Overlays, Modals |

## 3. Iconography Suite
*Design Language: 'Rounded-End' / Stroke 2px / 24px Viewbox.*

**Icons defined for the system:**
1.  **Home**: Rounded frame with central dot.
2.  **User**: Circle + open arc (same radius as 'b' loop).
3.  **Settings**: Interlocking circles with stroke weight matching logo 'b'.
4.  **Calendar**: Square with rounded corners (`12px` equivalent).
5.  **Heart-rate**: Pulse wave using `10%` stroke weight.
6.  **Repair**: Wrench with `Rounded-End` caps.
7.  **Buyback**: Recycle arrows with geometric precision.
8.  **Store**: Map pin with 'Medical Plus' cutout.
9.  **Battery**: Rectangle with `radius: 4px`.
10. **Signal**: Concentric arcs.
11. **Check**: Geometric 45-degree angle.
12. **Close**: 'X' with `stroke-linecap: round`.

## 4. Animation Specifications
*The 'Slow Pulse' of the Favicon.*

| Token | Name | Behavior | Specs |
| :--- | :--- | :--- | :--- |
| **Pulse** | `medical-pulse` | Slow opacity & scale breathing | `3s / ease-in-out / infinite` |
| **Interaction** | `breath` | Subtle growth on hover | `0.4s / ease-out / scale 1.05` |

## 5. Favicon Implementation Logic
- **Loader**: The 'Medical Plus' favicon centered with `medical-pulse`.
- **Success**: The favicon rotating into a 'Check' state.
- **Micro-Identity**: Used as the avatar fallback for users.

---

## Technical Core (CSS Variables)

```css
:root {
  /* Brand DNA */
  --brand-yellow: #EAB308;
  --brand-red: #DC2626;
  
  /* System UI - Derived Geometry */
  --ui-radius: 12px;
  --ui-radius-lg: 24px;
  --ui-stroke: 2px;
  
  /* Palette */
  --midnight: #0F172A;
  --cloud: #F8FAFC;
  --text-main: var(--midnight);
  --bg-subtle: var(--cloud);

  /* Animation */
  --medical-pulse: pulse-breath 3s ease-in-out infinite;
}

@keyframes pulse-breath {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}
```
