# Agent Behavior Rules: Legacy Restoration & Maintenance

To ensure stability, continuity, and high performance while maintaining the original Belmobile platform, Antigravity follows these rules:

## 1. Legacy-First Maintenance
- **Stability Over Innovation**: Prioritize the stability of the original architecture. Avoid refactoring large sections of legacy code unless strictly necessary for fixing bugs or implementing requested features.
- **Preserve Aesthetic**: Maintain the original blue/indigo theme and branding unless a design overhaul is explicitly requested for the legacy site.
- **Safe Modifications**: When editing components, ensure that existing dependencies and logic are preserved to prevent regression.

## 2. Platform Integrity
- **Restoration Context**: Acknowledge that the project underwent a Next.js 15 migration attempt which was later reversed to the legacy Next.js 13/14 setup.
- **Backup Awareness**: Maintain awareness of the `modern-platform-backup/` directory, which contains the unsuccessful Next.js 15 migration work for future reference if needed.
- **Environment Consistency**: Avoid introducing modern dependencies (like Tailwind 4 or React 19 specific features) unless the environment is compatible.

## 3. Data Safety
- **Merchant Database**: Be extremely cautious when interacting with Firebase/Firestore. Always verify query logic against the existing schema in `src/config/` or `src/firebase.ts`.
- **Currency Handling**: Continue to use integer-based cents for all financial calculations within the legacy logic to maintain consistency.

## 4. Documentation Continuity
- **Task Tracking**: All future tasks must be logged in `task.md` under the "Legacy Maintenance" phase.
- **Plan Verification**: Always create an `implementation_plan.md` before making changes to critical legacy components (e.g., Shop Locator, Device Wizard).

## 5. Build & Performance
- **Legacy Build Chain**: Use original build commands (`npm run dev`, `npm run build`) and avoid disrupting the existing PostCSS/Tailwind 3 configuration.
- **Snapshotting**: Take manual snapshots before large-scale experiments on legacy files.

## 6. AI-Native Collaboration
- **Artifact-First Workflow**: Always maintain `task.md`, `implementation_plan.md`, and `walkthrough.md`. Use them as the primary source of truth for scope and progress.
- **Proactive Verification**: Automatically run `npm run build` and `tsc` checks after any significant code modification.
- **Agentic Autonomy**: Proactively research the codebase using `grep` and `search` before asking clarifying questions.
- **Transparent Backtracking**: If a technical direction is found to be flawed, document the pivot in the task summary and walkthrough.

## 7. Premium Design Standards
- **Premium Aesthetic**: All new UI elements must follow the "Belmobile Premium" guidelines:
  - **Color**: Use vibrant gradients and the Belmobile blue/indigo palette. Avoid generic CSS colors.
  - **Glassmorphism**: Use subtle backdrop blurs and semi-transparent layers for a modern feeling.
  - **Micro-animations**: Integrate subtle Framer Motion transitions for hovers and state changes.
  - **Mobile-First**: Ensure all new features are touch-optimized and perfectly responsive.
  - **No Placeholders**: Use AI-generated high-fidelity images and icons instead of generic boxes.


