export const BUYBACK_CONDITION_DEDUCTIONS: Record<string, number> = {
    // General Condition (Legacy/Fallback)
    'new': 0,
    'like-new': 0.15,
    'good': 0.30,
    'fair': 0.50,
    'damaged': 0.75,

    // Functional
    'works-issue': 0.50, // 50% deduction if worksCorrectly is false

    // Screen State
    'screen-scratches': 0.30, // 30% of repair cost
    'screen-cracked': 1.0,    // 100% of repair cost

    // Body State
    'body-scratches': 20,     // Flat fee €20
    'body-dents': 1.0,        // 100% of Back Repair cost
    'body-bent': 40           // Back Repair + €40
};

export const BUYBACK_PENALTIES = {
    FACE_ID_ISSUE: 150,
    NO_POWER: 0,           // Multiplier (Price = 0)
    LOCKED: 0,             // Multiplier (Price = 0)
    HYDROGEL_ADDON: 15,
    COURIER_BRUSSELS: 15
};

export const BUYBACK_STORAGE_MULTIPLIERS: Record<string, number> = {
    '16GB': 0.7,
    '32GB': 0.8,
    '64GB': 0.9,
    '128GB': 1.0,
    '256GB': 1.1,
    '512GB': 1.25,
    '1TB': 1.4,
    '2TB': 1.6,
    '4TB': 1.8,
    '8TB': 2.0
};

