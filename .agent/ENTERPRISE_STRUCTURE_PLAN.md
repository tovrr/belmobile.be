# 🏗️ Belmobile Enterprise Architecture (.agent v2026)

This structure is designed for **Multi-Site Scaling** (10+ Shops) and **high-velocity onboarding**.

```plaintext
.agent/
├── 00_INDEX/                       # [ENTRY POINT] Where to start
│   ├── CONTROL_PANEL.md            # SSoT (Master Index)
│   ├── ONBOARDING.md               # New Hire Guide
│   └── GLOSSARY.md                 # Belmobile Terminology
│
├── 10_STRATEGY/                    # [VISION] The "Why"
│   ├── business/                   # Business Plans
│   │   ├── 2026_STRATEGIC_PLAN.md
│   │   └── MARKETING_PLAN.md
│   └── expansion/                  # Shop Specific Strategy
│       ├── schaerbeek.md
│       ├── anderlecht.md
│       └── molenbeek_b2b.md
│
├── 20_KNOWLEDGE_BASE/              # [WIKI] The "What"
│   ├── technical/                  # Engineering (Aegis)
│   │   ├── CORE_BRAIN.md           # System Architecture
│   │   ├── behavior.md             # Coding Standards
│   │   └── pricing_engine.md       # Logic Explanation
│   ├── operations/                 # Store Ops (Omer)
│   │   └── whatsapp_guide.md
│   └── design/                     # UI/UX
│       └── design-system.md
│
├── 30_WORKFLOWS/                   # [SOPs] The "How-To"
│   ├── dev/                        # For Developers
│   │   ├── component-creation.md
│   │   └── wizard-development.md
│   ├── ops/                        # DevOps / Deployment
│   │   ├── deploy-production.md
│   │   └── deploy-staging.md
│   └── incident/                   # Emergency Guides
│       └── sitemap-recovery.md
│
└── 40_LOGS/                        # [HISTORY] The "When"
    ├── RELEASE_NOTES.md            # Changelog
    └── BOSS_ACTIONS.md             # Omer's Decisions
```

## Why this structure?
1.  **Numbered Folders**: Enforces reading order (Start at 00, understand 10, learn 20, do 30).
2.  **Scalability**: The `10_STRATEGY/expansion/` folder allows adding `namur.md`, `charleroi.md` without polluting the root.
3.  **Role-Based**: Developers stay in `30_WORKFLOWS/dev`, Managers in `20_KNOWLEDGE_BASE/operations`.
