# Agent Behavior Rules: Operational Excellence & Growth

To ensure scalability, conversion, and business growth on the Belmobile platform, Antigravity follows these high-performance operational rules:

## 1. Growth-First Mentality
- **Conversion Optimization**: Prioritize features that reduce friction (e.g., Lead Restoration, Magic Links).
- **Leak-Proof Leads**: Every potential customer interaction (email blur) must be captured as a lead with a 30-day GDPR-compliant retention.
- **Urgency & Retaining**: Implement time-sensitive guarantees in communication to recover abandoned quotes.

## 2. Operational Intelligence (Admin Dash)
- **Data over Logic**: Always trust stored Firestore data (`price`, `status`) for reporting, never re-calculate complex logic on the fly in the dashboard.
- **Audit Logging**: Every sensitive change (price override, status flip) MUST be accompanied by an audit entry with the Admin's ID and timestamp.
- **Actionable Reporting**: BI tools must provide "Actionable insights" (e.g., which category has the lowest conversion rate) rather than just raw numbers.

## 3. Automated Communication
- **The 3-Day Rule**: Automated review requests must be scheduled exactly 3 days after an order is marked as "Completed".
- **Satisfaction Gating**: Preserve the legacy logic where low ratings (<4) are kept private (alerting admins) and high ratings (4+) are directed to Google Business Profile.
- **Shared Templates**: Use `src/utils/emailTemplates.ts` for ALL transactional HTML generation to ensure branding consistency.

## 4. Platform Architectural Sovereignty
- **Nex.js 16 + React 19**: This is a cutting-edge canary build. Do NOT use deprecated React hooks or Next.js 13/14 patterns unless they are required for legacy compatibility.
- **Proxy-Only Middleware**: Usage of `middleware.ts` is strictly forbidden. Use `src/proxy.ts` (exporting a `proxy` function) for all interceptors.
- **Zero-Regression Builds**: ALWAYS perform `npm run build` before considering a task "done". Local linting is secondary to build success.

## 5. Modern Design Philosophy
- **Belmobile Premium**: Stick to the HSL-tailored blue/indigo gradients and glassmorphism (`backdrop-blur-md`).
- **Responsive Maximization**: In the Wizard, prioritize mobile screen real estate. Use `p-3` vs `p-8` logic to ensure the "Next" button is always reachable.
- **Interactive Micro-feedback**: Use Framer Motion and confetti-triggering (only on success) to delight users.

## 6. AI-Native Collaboration & Memory
- **Artifact Hygiene**: Maintain `task.md` with "URGENT" tagging. reference `.agent/system-memory.md` to avoid context drift.
- **Autonomous Research**: Research the exact Firestore path or API route via `grep` before implementation.
- **Recursive Improvement**: If you encounter a recurring issue (e.g., image loading), fix the root cause (e.g., `next.config.ts`) rather than the symptom.

## 7. GDPR & Privacy Standards
- **Lead Expiry**: Every lead record MUST have an `expiresAt` field.
- **State Protection**: Magic links should be salted or use signed tokens to prevent state enumeration.
- **Private Internal Notes**: Admin notes are strictly internal and must never be exposed to clients via the Tracking API.
