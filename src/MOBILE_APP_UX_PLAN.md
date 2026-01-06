# 📱 Mobile-First UX Enhancement Plan ("App-Like" Experience)

**Version**: 1.0.0
**Status**: DRAFT (Pending Approval)
**Objective**: Reduce the gap between the Next.js web application and a native mobile app, focusing on tactility, smoothness, and installability.

---

## 🧠 Phase 1: Tactile Feedback (The "Feel")
*High Impact, Low Effort. Makes the UI feel responsive and physical.*

### 1.1 Haptic Feedback Engine (`useHaptic`)
Mobile web interactions often feel "dead". Simple vibration patterns confirm actions without visual clutter.

*   **Action**: Create a custom hook `useHaptic()`.
*   **Touchpoints**:
    *   Selecting a device brand/model (Light tap).
    *   Completing a wizard step (Medium tap).
    *   Adding to cart / Saving a quote (Success pattern).
    *   Error modal appearing (Warning vibration).
*   **Tech**: `navigator.vibrate()`.

### 1.2 "Press" Physics (CSS Active States)
Native buttons shrink or dim *instantly* when touched. Web buttons often wait for the `click` event (up to 300ms lag).

*   **Action**: Implement a global utility class `.active-press` in `globals.css`.
*   **Implementation**: `@apply active:scale-95 transition-transform duration-75;`
*   **Touchpoints**:
    *   All "Next/Back" buttons.
    *   wizard choice cards (Brand/Model selectors).
    *   Mobile Bottom Bar toggle.
    *   Chat bubble toggle.

---

## 🖐️ Phase 2: Mobile Input Intelligence
*Medium Impact, Low Effort. Reduces frustration.*

### 2.1 Keyboard Optimization
Prevent the "wrong keyboard" syndrome.
*   **Action**: Audit all `<input>` fields.
*   **Changes**:
    *   Search Bar: `enterKeyHint="search"`.
    *   Email fields: `inputMode="email"`, `autoComplete="email"`.
    *   Phone fields: `inputMode="tel"`, `autoComplete="tel"`.
    *   Postal Code: `inputMode="numeric"`.

### 2.2 Viewport Stability
Prevent the UI from "squashing" when the keyboard opens on Android.
*   **Action**: Update `viewport` metadata in `layout.tsx` to include `interactive-widget=resizes-content` (or `overlays-content` depending on desired behavior).

---

## 📲 Phase 3: Installability (PWA)
*High Impact, Medium Effort. Drive retention.*

### 3.1 iOS Install Prompt (`IOSInstallBridge`)
iOS Safari does *not* automatically prompt users to install PWAs. We need a custom UI.
*   **Action**: Create a `components/pwa/IOSInstallPrompt.tsx`.
*   **Logic**:
    1.  Detects iOS (`/iphone|ipad|ipod/.test(userAgent)`).
    2.  Check if running in standalone mode (`window.navigator.standalone`).
    3.  If iOS + NOT standalone + Visited > 2 times: Show a bottom sheet instructing user to "Share -> Add to Home Screen".

### 3.2 Splash Screen & Icons
Remove the "white flash" on startup.
*   **Action**: Update `layout.tsx` metadata with specific `apple-touch-startup-image` links (requires generating these assets).
*   **Refinement**: Ensure `manifest.json` `background_color` matches the app's dark mode theme to avoid flashes.

### 3.3 Offline Shell (Service Worker)
*   **Action**: Install `next-pwa` or configure a simple SW to cache the "App Shell" (Header, Footer, Sidebar).
*   **Benefit**: App opens instantly even on flaky 4G/5G.

---

## 🎨 Phase 4: Smoothness (Transitions)
*Medium Impact, Medium Effort. Removes "Web Blink".*

### 4.1 Page Transitions
*   **Action**: Use `framer-motion`'s `<AnimatePresence mode="wait">` wrapper in `template.tsx` (Next.js App Router specific).
*   **Effect**: Routes fade/slide into each other instead of hard refreshing.

### 4.2 Skeleton Polish
*   **Action**: Review `loading.tsx` and ensure skeletons match the *exact* height of the images they replace to prevent layout shift (CLS).
