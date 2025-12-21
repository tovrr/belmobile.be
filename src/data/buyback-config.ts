export const BUYBACK_CONDITION_DEDUCTIONS: Record<string, number> = {
    'new': 0,
    'like-new': 0.15,
    'good': 0.30,
    'fair': 0.50,
    'damaged': 0.75
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
