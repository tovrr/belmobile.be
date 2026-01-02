## 1. Refining your Senior Dev Prompt
Your French prompt is a great "Strategic Layer." To make it "Operational" for this specific project, I recommend adding these technical constraints:

### Versión Opérationnelle (Additions recommandées) :
> - **Sentry & Observabilité** : Automatise l'ajout de `Sentry.captureException` ou de "breadcrumbs" lors de la manipulation de flux critiques (paiement, wizard).
> - **Compliance Core Web Vitals** : Pour chaque modification d'UI, vérifie proactivement la hiérarchie des balises (H1-H6) et les attributs `priority`/`sizes` de `next/image`.
> - **Enforcement des Patterns** : Détecte l'usage de props pour l'état du Wizard et suggère l'usage de `useWizard` hooks à la place.
> - **Continuité du Cerveau** : Mets à jour `task.md` et `system-memory.md` à chaque fin de tâche majeure sans attendre de confirmation.

## 2. How to Implement it
You have two main places to "inject" this behavior:

### A. Into .cursorrules (Best for behavior)
Add a section `## 🧠 Mental Model (Senior Dev)` at the top of your `.cursorrules`. This ensures every time I "think," I see these rules.

### B. Into project-level instructions (Highest priority)
If you are using a tool that supports a "Project Persona" (like Antigravity's task mode), you can mention: *"Utilise le persona défini dans `proactivity_guide.md` pour toute notre session."*

## 2. The "Ultimate Autonomy" Prompt
Instead of asking for a specific fix, use a prompt that defines the goal and the constraints, then tells me to "drive."

**Template:**
> "I want to [GOAL]. Review the current implementation, identify any bottlenecks or missing features, and implement a production-ready solution. Proactively fix any type errors, update the docs, and run a build to verify stability. Don't stop until the feature is fully verified."

## 3. High-Performance Settings
- **Turbo Workflows**: If you use workflows in `.agent/workflows`, add the `// turbo` annotation above command steps. This allows me to run them without waiting for your click-to-approve (for safe commands).
- **Task Mode Awareness**: When I am in "Task Mode" (with the progress bar), I am designed to be more thorough. Give me complex, multi-step goals rather than small tweaks to keep me in this "deep work" state.

## 4. Proactive Interaction Patterns
- **Ask for "Audit & Fix"**: "Audit the `useData` context for performance issues and fix them proactively."
- **Verification First**: "Implement [Feature], but before you start, find or write a test case to prove it works."

## 5. Current Blockers (Self-Correction)
Right now, I've noticed your `npm run dev` is failing. Instead of waiting for you to notice, I've already started investigating the `next@16` and `@sentry/nextjs` mismatch. This is the level of proactivity you can expect when you give me clear ownership of the build's health.
