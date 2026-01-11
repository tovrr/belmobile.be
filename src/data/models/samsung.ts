export const MODELS = {
    smartphone: {
        // S Series
        'Galaxy S25 Ultra': 1200, 'Galaxy S25+': 950, 'Galaxy S25': 850, 'Galaxy S25 FE': 700, 'Galaxy S25 Edge': 900,
        'Galaxy S24 Ultra': 1000, 'Galaxy S24+': 750, 'Galaxy S24': 650, 'Galaxy S24 FE': 550,
        'Galaxy S23 Ultra': 800, 'Galaxy S23+': 600, 'Galaxy S23': 480, 'Galaxy S23 FE': 400,
        'Galaxy S22 Ultra': 650, 'Galaxy S22+': 450, 'Galaxy S22': 380,
        'Galaxy S21 Ultra': 500, 'Galaxy S21+': 320, 'Galaxy S21': 280, 'Galaxy S21 FE': 250,
        'Galaxy S20 Ultra': 400, 'Galaxy S20+': 250, 'Galaxy S20': 220, 'Galaxy S20 FE': 200,
        'Galaxy S10+': 180, 'Galaxy S10': 160, 'Galaxy S10 Lite': 140, 'Galaxy S10e': 130,
        'Galaxy S9': 120, 'Galaxy S9+': 140, 'Galaxy S8': 100, 'Galaxy S8+': 120, 'Galaxy S7 Edge': 80, 'Galaxy S7': 70,

        // Z Series
        'Galaxy Z Fold7': 1300, 'Galaxy Z Flip7': 900, 'Galaxy Z Flip7 FE': 700,
        'Galaxy Z Fold6': 1100, 'Galaxy Z Flip6': 750,
        'Galaxy Z Fold5': 850, 'Galaxy Z Flip5': 550,
        'Galaxy Z Fold4': 600, 'Galaxy Z Flip4': 400,
        'Galaxy Z Fold3': 450, 'Galaxy Z Flip3': 300,
        'Galaxy Z Flip 5G': 250, 'Galaxy Z Fold2': 350,

        // Note Series
        'Galaxy Note 20 Ultra': 450, 'Galaxy Note 20': 280,
        'Galaxy Note 10+': 250, 'Galaxy Note 10': 200, 'Galaxy Note 10 Lite': 180,
        'Galaxy Note 9': 150, 'Galaxy Note 8': 120,

        // A Series
        'Galaxy A56': 320, 'Galaxy A55': 280, 'Galaxy A54': 220, 'Galaxy A53': 180, 'Galaxy A52s': 160, 'Galaxy A52': 150, 'Galaxy A51': 120, 'Galaxy A50': 100,
        'Galaxy A73': 200, 'Galaxy A72': 180, 'Galaxy A71': 150, 'Galaxy A70': 130,
        'Galaxy A42': 140, 'Galaxy A41': 120, 'Galaxy A40': 100,
        'Galaxy A36': 240, 'Galaxy A35': 200, 'Galaxy A34': 160, 'Galaxy A33': 140, 'Galaxy A32': 130, 'Galaxy A31': 110, 'Galaxy A30': 100,
        'Galaxy A26': 180, 'Galaxy A25': 150, 'Galaxy A24': 120, 'Galaxy A23': 110, 'Galaxy A22': 100, 'Galaxy A21s': 90, 'Galaxy A20e': 80,
        'Galaxy A17': 130, 'Galaxy A16': 110, 'Galaxy A15': 90, 'Galaxy A14': 70, 'Galaxy A13': 60, 'Galaxy A12': 50, 'Galaxy A10': 40,
        'Galaxy A11': 60,
        'Galaxy A04s': 50, 'Galaxy A03s': 40, 'Galaxy A02s': 35,
        'Galaxy A07': 70, 'Galaxy A06': 60, 'Galaxy A05s': 50,
    },
    tablet: {
        'Galaxy Tab S9 Ultra': 800, 'Galaxy Tab S9': 600,
        'Galaxy Tab S8 Ultra': 550, 'Galaxy Tab S8+': 450, 'Galaxy Tab S8': 400,
        'Galaxy Tab S7+': 350, 'Galaxy Tab S7 FE': 250, 'Galaxy Tab S7': 280,
        'Galaxy Tab S6 Lite': 150, 'Galaxy Tab S6': 180,
        'Galaxy Tab A8': 120, 'Galaxy Tab A7': 100
    },
    laptop: {
        'Galaxy Book3 Pro': 1000, 'Galaxy Book3': 700
    },
    smartwatch: {
        'Galaxy Watch 6 Classic': 250, 'Galaxy Watch 6': 180,
        'Galaxy Watch 5 Pro': 150, 'Galaxy Watch 5': 120,
        'Galaxy Watch 4 Classic': 100
    }
};

export const SPECS = {
    // S Series
    'Galaxy S25 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S25+': ['256GB', '512GB'], 'Galaxy S25': ['128GB', '256GB', '512GB'], 'Galaxy S25 FE': ['128GB', '256GB'], 'Galaxy S25 Edge': ['256GB', '512GB'],
    'Galaxy S24 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S24+': ['256GB', '512GB'], 'Galaxy S24': ['128GB', '256GB'], 'Galaxy S24 FE': ['128GB', '256GB'],
    'Galaxy S23 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S23+': ['256GB', '512GB'], 'Galaxy S23': ['128GB', '256GB'], 'Galaxy S23 FE': ['128GB', '256GB'],
    'Galaxy S22 Ultra': ['128GB', '256GB', '512GB', '1TB'], 'Galaxy S22+': ['128GB', '256GB'], 'Galaxy S22': ['128GB', '256GB'],
    'Galaxy S21 Ultra': ['128GB', '256GB', '512GB'], 'Galaxy S21+': ['128GB', '256GB'], 'Galaxy S21': ['128GB', '256GB'], 'Galaxy S21 FE': ['128GB', '256GB'],
    'Galaxy S20 Ultra': ['128GB', '512GB'], 'Galaxy S20+': ['128GB', '512GB'], 'Galaxy S20': ['128GB'], 'Galaxy S20 FE': ['128GB', '256GB'],
    'Galaxy S10+': ['128GB', '512GB', '1TB'], 'Galaxy S10': ['128GB', '512GB'], 'Galaxy S10 Lite': ['128GB', '512GB'], 'Galaxy S10e': ['128GB', '256GB'],

    // Z Series
    'Galaxy Z Fold7': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip7': ['256GB', '512GB'], 'Galaxy Z Flip7 FE': ['256GB', '512GB'],
    'Galaxy Z Fold6': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip6': ['256GB', '512GB'],
    'Galaxy Z Fold5': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip5': ['256GB', '512GB'],
    'Galaxy Z Fold4': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip4': ['128GB', '256GB', '512GB'],
    'Galaxy Z Fold3': ['256GB', '512GB'], 'Galaxy Z Flip3': ['128GB', '256GB'],

    // Note Series
    'Galaxy Note 20 Ultra': ['256GB', '512GB'], 'Galaxy Note 20': ['256GB'],
    'Galaxy Note 10+': ['256GB', '512GB'], 'Galaxy Note 10': ['256GB'], 'Galaxy Note 10 Lite': ['128GB'],

    // A Series
    'Galaxy A56': ['128GB', '256GB'], 'Galaxy A55': ['128GB', '256GB'], 'Galaxy A54': ['128GB', '256GB'], 'Galaxy A53': ['128GB', '256GB'],
    'Galaxy A42': ['128GB'], 'Galaxy A41': ['64GB'], 'Galaxy A40': ['64GB'],
    'Galaxy A36': ['128GB', '256GB'], 'Galaxy A35': ['128GB', '256GB'], 'Galaxy A34': ['128GB', '256GB'], 'Galaxy A33': ['128GB', '256GB'], 'Galaxy A32': ['64GB', '128GB'], 'Galaxy A31': ['64GB', '128GB'], 'Galaxy A30': ['32GB', '64GB'],
    'Galaxy A26': ['128GB', '256GB'], 'Galaxy A25': ['128GB', '256GB'], 'Galaxy A24': ['128GB'], 'Galaxy A23': ['64GB', '128GB'], 'Galaxy A22': ['64GB', '128GB'], 'Galaxy A21s': ['32GB', '64GB'],
    'Galaxy A17': ['64GB', '128GB'], 'Galaxy A16': ['128GB', '256GB'], 'Galaxy A15': ['128GB', '256GB'], 'Galaxy A14': ['64GB', '128GB'],
    'Galaxy A07': ['64GB', '128GB'], 'Galaxy A06': ['64GB', '128GB'], 'Galaxy A05': ['64GB', '128GB'], 'Galaxy A05s': ['64GB', '128GB'],
    'Galaxy A11': ['32GB', '64GB'],

    // Tablets
    'Galaxy Tab S9 Ultra': ['256GB', '512GB', '1TB'],
    'Galaxy Tab S9': ['128GB', '256GB'],

    // Laptops
    'Galaxy Book3 Pro': ['512GB', '1TB'],

    // Watches
    'Galaxy Watch 6': ['40mm', '44mm']
};
