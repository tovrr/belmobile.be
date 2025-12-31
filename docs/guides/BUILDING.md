# 🏗️ FULL_PROJECT_BUILDING: Future Development & Scaling

**Lead Visionary**: Omer Ozkan
**Architectural Guardian**: AEGIS

---

## 🌟 Future Development Strategies

### A. Lead Recovery Engine (LRE)
*Goal: Capture users who leave after providing an email but before confirming.*
1. **Trigger**: Save a "Draft Lead" in Firestore after Step 3 (UserInfo).
2. **Action**: If no "Order" is created within 2 hours, trigger a Brevo automation with a "Magic Link".
3. **Recovery**: Magic Link restores the `WizardContext` from the Firestore Draft.

### B. Admin Dashboard v2 (Technician Portal)
*Goal: Decentralize management.*
1. **Feature**: dedicated mobile-friendly view for shop technicians.
2. **Action**: "One-click" status updates (e.g., "Received", "Repaired", "Picked up").
3. **Security**: Use Firebase Custom Claims for Role-Based Access Control (RBAC).

### C. Partner Widget SDK
*Goal: Expand reach.*
1. **Creation**: Develop a lightweight React/Preact component.
2. **Logic**: Fetch prices from the existing `/api/pricing` endpoint.
3. **Deployment**: Host as a versioned JS bundle that partners can embed via `<script>`.

---

## 🛠️ Step-by-Step Implementation Guide (Standard Workflow)

1. **Define Types**: Always start in `src/types/models.ts`.
2. **Unit Test**: If it's business logic, write a `.test.ts` file in Vitest first.
3. **RSC First**: Build the page as a Server Component. Add `'use client'` only where needed.
4. **Loading States**: Add a `loading.tsx` to prevent CLS.
5. **SEO Check**: Update `seo-templates.ts` for any new dynamic routes.

---

## 🧠 Future Prompting Instruction (PRE-PROMPT)

**Use this prompt when starting a new session with an AI Agent:**

> "I am working on the Belmobile project. 
> 1. Read `FULL_PROJECT_SNAPSHOT.md` to understand the current technical audit and production state.
> 2. Read `FULL_PROJECT_RULES.md` for our 'Strict Types', 'Zero Any', and 'AI Proactivity' standards.
> 3. Your current task is: [INSERT TASK HERE]. 
> 4. Before coding, verify your plan against `FULL_PROJECT_BUILDING.md` to ensure alignment with our long-term scaling strategy."

---

> [!TIP]
> **Next Recommended Task**: Implementation of the **Lead Recovery Engine** to increase ROI from current marketing traffic.
