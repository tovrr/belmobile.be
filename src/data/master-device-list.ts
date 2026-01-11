export interface DeviceDefinition {
    id: string; // The internal slug (e.g. 'apple-iphone-13')
    name: string; // Display Name (e.g. 'iPhone 13')
    gsmArenaId?: string; // The numeric ID for reliable scraping (e.g. '11103')
    brand: 'apple' | 'samsung' | 'google' | 'huawei' | 'oneplus' | 'xiaomi' | 'oppo' | 'microsoft' | 'sony' | 'nintendo';
    type: 'smartphone' | 'tablet' | 'smartwatch' | 'console_home' | 'console_portable';
    releaseYear?: number;
    defaultStorages?: number[]; // GB capacities (e.g. [128, 256, 512])
}

export const MASTER_DEVICE_LIST: DeviceDefinition[] = [
    // --- APPLE IPHONE 17 SERIES (Future Proofing) ---
    { id: 'apple-iphone-17-pro-max', name: 'iPhone 17 Pro Max', brand: 'apple', type: 'smartphone', releaseYear: 2025, defaultStorages: [256, 512, 1024] },
    { id: 'apple-iphone-17-pro', name: 'iPhone 17 Pro', brand: 'apple', type: 'smartphone', releaseYear: 2025, defaultStorages: [128, 256, 512, 1024] },
    { id: 'apple-iphone-air', name: 'iPhone Air', brand: 'apple', type: 'smartphone', releaseYear: 2025, defaultStorages: [128, 256, 512] },
    { id: 'apple-iphone-17', name: 'iPhone 17', brand: 'apple', type: 'smartphone', releaseYear: 2025, defaultStorages: [128, 256, 512] },

    // --- APPLE IPHONE 16 SERIES ---
    { id: 'apple-iphone-16-pro-max', name: 'iPhone 16 Pro Max', gsmArenaId: '13315', brand: 'apple', type: 'smartphone', releaseYear: 2024, defaultStorages: [256, 512, 1024] },
    { id: 'apple-iphone-16-pro', name: 'iPhone 16 Pro', gsmArenaId: '13314', brand: 'apple', type: 'smartphone', releaseYear: 2024, defaultStorages: [128, 256, 512, 1024] },
    { id: 'apple-iphone-16-plus', name: 'iPhone 16 Plus', gsmArenaId: '13316', brand: 'apple', type: 'smartphone', releaseYear: 2024, defaultStorages: [128, 256, 512] },
    { id: 'apple-iphone-16', name: 'iPhone 16', gsmArenaId: '13313', brand: 'apple', type: 'smartphone', releaseYear: 2024, defaultStorages: [128, 256, 512] },
    { id: 'apple-iphone-16e', name: 'iPhone 16e', gsmArenaId: '13550', brand: 'apple', type: 'smartphone', releaseYear: 2025, defaultStorages: [128, 256, 512] },

    // --- APPLE IPHONE 15 SERIES ---
    { id: 'apple-iphone-15-pro-max', name: 'iPhone 15 Pro Max', gsmArenaId: '12548', brand: 'apple', type: 'smartphone', releaseYear: 2023, defaultStorages: [256, 512, 1024] },
    { id: 'apple-iphone-15-pro', name: 'iPhone 15 Pro', gsmArenaId: '12557', brand: 'apple', type: 'smartphone', releaseYear: 2023, defaultStorages: [128, 256, 512, 1024] },
    { id: 'apple-iphone-15-plus', name: 'iPhone 15 Plus', gsmArenaId: '12558', brand: 'apple', type: 'smartphone', releaseYear: 2023, defaultStorages: [128, 256, 512] },
    { id: 'apple-iphone-15', name: 'iPhone 15', gsmArenaId: '12559', brand: 'apple', type: 'smartphone', releaseYear: 2023, defaultStorages: [128, 256, 512] },

    // --- APPLE IPHONE 14 SERIES ---
    { id: 'apple-iphone-14-pro-max', name: 'iPhone 14 Pro Max', gsmArenaId: '11773', brand: 'apple', type: 'smartphone', releaseYear: 2022, defaultStorages: [128, 256, 512, 1024] },
    { id: 'apple-iphone-14-pro', name: 'iPhone 14 Pro', gsmArenaId: '11860', brand: 'apple', type: 'smartphone', releaseYear: 2022, defaultStorages: [128, 256, 512, 1024] },
    { id: 'apple-iphone-14-plus', name: 'iPhone 14 Plus', gsmArenaId: '11862', brand: 'apple', type: 'smartphone', releaseYear: 2022, defaultStorages: [128, 256, 512] },
    { id: 'apple-iphone-14', name: 'iPhone 14', gsmArenaId: '11861', brand: 'apple', type: 'smartphone', releaseYear: 2022, defaultStorages: [128, 256, 512] },

    // --- APPLE IPHONE 13 SERIES ---
    { id: 'apple-iphone-13-pro-max', name: 'iPhone 13 Pro Max', gsmArenaId: '11089', brand: 'apple', type: 'smartphone', releaseYear: 2021, defaultStorages: [128, 256, 512, 1024] },
    { id: 'apple-iphone-13-pro', name: 'iPhone 13 Pro', gsmArenaId: '11102', brand: 'apple', type: 'smartphone', releaseYear: 2021, defaultStorages: [128, 256, 512, 1024] },
    { id: 'apple-iphone-13', name: 'iPhone 13', gsmArenaId: '11103', brand: 'apple', type: 'smartphone', releaseYear: 2021, defaultStorages: [128, 256, 512] },
    { id: 'apple-iphone-13-mini', name: 'iPhone 13 mini', gsmArenaId: '11104', brand: 'apple', type: 'smartphone', releaseYear: 2021, defaultStorages: [128, 256, 512] },

    // --- APPLE IPHONE 12 SERIES (Base models start at 64GB) ---
    { id: 'apple-iphone-12-pro-max', name: 'iPhone 12 Pro Max', gsmArenaId: '10237', brand: 'apple', type: 'smartphone', releaseYear: 2020, defaultStorages: [128, 256, 512] },
    { id: 'apple-iphone-12-pro', name: 'iPhone 12 Pro', gsmArenaId: '10508', brand: 'apple', type: 'smartphone', releaseYear: 2020, defaultStorages: [128, 256, 512] },
    { id: 'apple-iphone-12', name: 'iPhone 12', gsmArenaId: '10509', brand: 'apple', type: 'smartphone', releaseYear: 2020, defaultStorages: [64, 128, 256] },
    { id: 'apple-iphone-12-mini', name: 'iPhone 12 mini', gsmArenaId: '10510', brand: 'apple', type: 'smartphone', releaseYear: 2020, defaultStorages: [64, 128, 256] },

    // --- APPLE IPHONE 11 SERIES ---
    { id: 'apple-iphone-11-pro-max', name: 'iPhone 11 Pro Max', gsmArenaId: '9846', brand: 'apple', type: 'smartphone', releaseYear: 2019, defaultStorages: [64, 256, 512] },
    { id: 'apple-iphone-11-pro', name: 'iPhone 11 Pro', gsmArenaId: '9847', brand: 'apple', type: 'smartphone', releaseYear: 2019, defaultStorages: [64, 256, 512] },
    { id: 'apple-iphone-11', name: 'iPhone 11', gsmArenaId: '9848', brand: 'apple', type: 'smartphone', releaseYear: 2019, defaultStorages: [64, 128, 256] },

    // --- LEGACY IPHONES ---
    { id: 'apple-iphone-xs-max', name: 'iPhone XS Max', gsmArenaId: '9319', brand: 'apple', type: 'smartphone', releaseYear: 2018, defaultStorages: [64, 256, 512] },
    { id: 'apple-iphone-xs', name: 'iPhone XS', gsmArenaId: '9318', brand: 'apple', type: 'smartphone', releaseYear: 2018, defaultStorages: [64, 256, 512] },
    { id: 'apple-iphone-xr', name: 'iPhone XR', gsmArenaId: '9320', brand: 'apple', type: 'smartphone', releaseYear: 2018, defaultStorages: [64, 128, 256] },
    { id: 'apple-iphone-x', name: 'iPhone X', gsmArenaId: '8858', brand: 'apple', type: 'smartphone', releaseYear: 2017, defaultStorages: [64, 256] },
    { id: 'apple-iphone-8-plus', name: 'iPhone 8 Plus', gsmArenaId: '8131', brand: 'apple', type: 'smartphone', releaseYear: 2017, defaultStorages: [64, 128, 256] },
    { id: 'apple-iphone-8', name: 'iPhone 8', gsmArenaId: '8573', brand: 'apple', type: 'smartphone', releaseYear: 2017, defaultStorages: [64, 128, 256] },
    { id: 'apple-iphone-se-2022', name: 'iPhone SE (2022)', gsmArenaId: '11410', brand: 'apple', type: 'smartphone', releaseYear: 2022, defaultStorages: [64, 128, 256] },
    { id: 'apple-iphone-se-2020', name: 'iPhone SE (2020)', gsmArenaId: '10170', brand: 'apple', type: 'smartphone', releaseYear: 2020, defaultStorages: [64, 128, 256] },

    // --- SAMSUNG GALAXY S SERIES ---
    { id: 'samsung-galaxy-s25-ultra', name: 'Galaxy S25 Ultra', brand: 'samsung', type: 'smartphone', releaseYear: 2025, defaultStorages: [256, 512, 1024] },
    { id: 'samsung-galaxy-s25-plus', name: 'Galaxy S25+', brand: 'samsung', type: 'smartphone', releaseYear: 2025, defaultStorages: [256, 512] },
    { id: 'samsung-galaxy-s25-edge', name: 'Galaxy S25 Edge', brand: 'samsung', type: 'smartphone', releaseYear: 2025, defaultStorages: [128, 256, 512] },
    { id: 'samsung-galaxy-s25', name: 'Galaxy S25', brand: 'samsung', type: 'smartphone', releaseYear: 2025, defaultStorages: [128, 256, 512] },
    { id: 'samsung-galaxy-s25-fe', name: 'Galaxy S25 FE', brand: 'samsung', type: 'smartphone', releaseYear: 2025, defaultStorages: [128, 256, 512] },
    { id: 'samsung-galaxy-s24-ultra', name: 'Galaxy S24 Ultra', gsmArenaId: '12771', brand: 'samsung', type: 'smartphone', releaseYear: 2024, defaultStorages: [256, 512, 1024] },
    { id: 'samsung-galaxy-s24-plus', name: 'Galaxy S24+', gsmArenaId: '12772', brand: 'samsung', type: 'smartphone', releaseYear: 2024, defaultStorages: [256, 512] },
    { id: 'samsung-galaxy-s24', name: 'Galaxy S24', gsmArenaId: '12773', brand: 'samsung', type: 'smartphone', releaseYear: 2024, defaultStorages: [128, 256, 512] },
    { id: 'samsung-galaxy-s24-fe', name: 'Galaxy S24 FE', gsmArenaId: '13303', brand: 'samsung', type: 'smartphone', releaseYear: 2024, defaultStorages: [128, 256, 512] },

    { id: 'samsung-galaxy-s23-ultra', name: 'Galaxy S23 Ultra', gsmArenaId: '12024', brand: 'samsung', type: 'smartphone', releaseYear: 2023, defaultStorages: [256, 512, 1024] },
    { id: 'samsung-galaxy-s23-plus', name: 'Galaxy S23+', gsmArenaId: '12083', brand: 'samsung', type: 'smartphone', releaseYear: 2023, defaultStorages: [256, 512] },
    { id: 'samsung-galaxy-s23', name: 'Galaxy S23', gsmArenaId: '12082', brand: 'samsung', type: 'smartphone', releaseYear: 2023, defaultStorages: [128, 256, 512] },
    { id: 'samsung-galaxy-s23-fe', name: 'Galaxy S23 FE', gsmArenaId: '12520', brand: 'samsung', type: 'smartphone', releaseYear: 2023, defaultStorages: [128, 256] },

    { id: 'samsung-galaxy-s22-ultra', name: 'Galaxy S22 Ultra', gsmArenaId: '11251', brand: 'samsung', type: 'smartphone', releaseYear: 2022, defaultStorages: [128, 256, 512] },
    { id: 'samsung-galaxy-s22-plus', name: 'Galaxy S22+', gsmArenaId: '11252', brand: 'samsung', type: 'smartphone', releaseYear: 2022, defaultStorages: [128, 256] },
    { id: 'samsung-galaxy-s22', name: 'Galaxy S22', gsmArenaId: '11253', brand: 'samsung', type: 'smartphone', releaseYear: 2022, defaultStorages: [128, 256] },

    { id: 'samsung-galaxy-s21-ultra', name: 'Galaxy S21 Ultra', gsmArenaId: '10596', brand: 'samsung', type: 'smartphone', releaseYear: 2021, defaultStorages: [128, 256, 512] },
    { id: 'samsung-galaxy-s21-plus', name: 'Galaxy S21+', gsmArenaId: '10625', brand: 'samsung', type: 'smartphone', releaseYear: 2021, defaultStorages: [128, 256] },
    { id: 'samsung-galaxy-s21', name: 'Galaxy S21', gsmArenaId: '10626', brand: 'samsung', type: 'smartphone', releaseYear: 2021, defaultStorages: [128, 256] },
    { id: 'samsung-galaxy-s21-fe', name: 'Galaxy S21 FE', gsmArenaId: '10954', brand: 'samsung', type: 'smartphone', releaseYear: 2022, defaultStorages: [128, 256] },

    // --- SAMSUNG GALAXY A SERIES ---
    { id: 'samsung-galaxy-a55', name: 'Galaxy A55 5G', gsmArenaId: '12824', brand: 'samsung', type: 'smartphone', releaseYear: 2024, defaultStorages: [128, 256] },
    { id: 'samsung-galaxy-a54', name: 'Galaxy A54 5G', gsmArenaId: '12070', brand: 'samsung', type: 'smartphone', releaseYear: 2023, defaultStorages: [128, 256] },
    { id: 'samsung-galaxy-a53', name: 'Galaxy A53 5G', gsmArenaId: '11268', brand: 'samsung', type: 'smartphone', releaseYear: 2022, defaultStorages: [128, 256] },
    { id: 'samsung-galaxy-a52s', name: 'Galaxy A52s 5G', gsmArenaId: '11039', brand: 'samsung', type: 'smartphone', releaseYear: 2021, defaultStorages: [128, 256] },

    { id: 'samsung-galaxy-a35', name: 'Galaxy A35 5G', gsmArenaId: '12705', brand: 'samsung', type: 'smartphone', releaseYear: 2024, defaultStorages: [128, 256] },
    { id: 'samsung-galaxy-a34', name: 'Galaxy A34 5G', gsmArenaId: '12074', brand: 'samsung', type: 'smartphone', releaseYear: 2023, defaultStorages: [128, 256] },

    { id: 'samsung-galaxy-a15', name: 'Galaxy A15', gsmArenaId: '12637', brand: 'samsung', type: 'smartphone', releaseYear: 2023, defaultStorages: [128, 256] },
    { id: 'samsung-galaxy-a14', name: 'Galaxy A14', gsmArenaId: '12151', brand: 'samsung', type: 'smartphone', releaseYear: 2023, defaultStorages: [64, 128] },

    // --- GOOGLE PIXEL SERIES ---
    { id: 'google-pixel-10-pro-xl', name: 'Pixel 10 Pro XL', brand: 'google', type: 'smartphone', releaseYear: 2025, defaultStorages: [256, 512, 1024] },
    { id: 'google-pixel-10-pro', name: 'Pixel 10 Pro', brand: 'google', type: 'smartphone', releaseYear: 2025, defaultStorages: [128, 256, 512, 1024] },
    { id: 'google-pixel-10', name: 'Pixel 10', brand: 'google', type: 'smartphone', releaseYear: 2025, defaultStorages: [128, 256] },
    { id: 'google-pixel-9-pro-fold', name: 'Pixel 9 Pro Fold', gsmArenaId: '13149', brand: 'google', type: 'smartphone', releaseYear: 2024, defaultStorages: [256, 512] },
    { id: 'google-pixel-9-pro-xl', name: 'Pixel 9 Pro XL', gsmArenaId: '13218', brand: 'google', type: 'smartphone', releaseYear: 2024, defaultStorages: [128, 256, 512, 1024] },
    { id: 'google-pixel-9-pro', name: 'Pixel 9 Pro', gsmArenaId: '13219', brand: 'google', type: 'smartphone', releaseYear: 2024, defaultStorages: [128, 256, 512, 1024] },
    { id: 'google-pixel-9', name: 'Pixel 9', gsmArenaId: '13220', brand: 'google', type: 'smartphone', releaseYear: 2024, defaultStorages: [128, 256] },
    { id: 'google-pixel-9a', name: 'Pixel 9a', brand: 'google', type: 'smartphone', releaseYear: 2025, defaultStorages: [128, 256] },
    { id: 'google-pixel-fold', name: 'Pixel Fold', gsmArenaId: '12265', brand: 'google', type: 'smartphone', releaseYear: 2023, defaultStorages: [256, 512] },

    // --- IPADS ---
    { id: 'apple-ipad-pro-13-(2024)', name: 'iPad Pro 13 (2024)', gsmArenaId: '12929', brand: 'apple', type: 'tablet', releaseYear: 2024, defaultStorages: [256, 512, 1024, 2048] },
    { id: 'apple-ipad-pro-11-(2024)', name: 'iPad Pro 11 (2024)', gsmArenaId: '12984', brand: 'apple', type: 'tablet', releaseYear: 2024, defaultStorages: [256, 512, 1024, 2048] },
    { id: 'apple-ipad-pro-12.9-(2022)', name: 'iPad Pro 12.9 (2022)', gsmArenaId: '11942', brand: 'apple', type: 'tablet', releaseYear: 2022, defaultStorages: [128, 256, 512, 1024, 2048] },
    { id: 'apple-ipad-pro-11-(2022)', name: 'iPad Pro 11 (2022)', gsmArenaId: '11943', brand: 'apple', type: 'tablet', releaseYear: 2022, defaultStorages: [128, 256, 512, 1024, 2048] },

    { id: 'apple-ipad-air-13-(2024)', name: 'iPad Air 13 (2024)', gsmArenaId: '12999', brand: 'apple', type: 'tablet', releaseYear: 2024, defaultStorages: [128, 256, 512, 1024] },
    { id: 'apple-ipad-air-11-(2024)', name: 'iPad Air 11 (2024)', gsmArenaId: '13000', brand: 'apple', type: 'tablet', releaseYear: 2024, defaultStorages: [128, 256, 512, 1024] },
    { id: 'apple-ipad-air-(2022)', name: 'iPad Air (2022)', gsmArenaId: '11400', brand: 'apple', type: 'tablet', releaseYear: 2022, defaultStorages: [64, 256] },

    { id: 'apple-ipad-10.9-(2022)', name: 'iPad 10.9 (2022)', gsmArenaId: '11941', brand: 'apple', type: 'tablet', releaseYear: 2022, defaultStorages: [64, 256] },
    { id: 'apple-ipad-10.2-(2021)', name: 'iPad 10.2 (2021)', gsmArenaId: '11105', brand: 'apple', type: 'tablet', releaseYear: 2021, defaultStorages: [64, 256] },

    { id: 'apple-ipad-mini-(2024)', name: 'iPad mini (2024)', gsmArenaId: '13551', brand: 'apple', type: 'tablet', releaseYear: 2024, defaultStorages: [128, 256, 512] },
    { id: 'apple-ipad-mini-(2021)', name: 'iPad mini (2021)', gsmArenaId: '11106', brand: 'apple', type: 'tablet', releaseYear: 2021, defaultStorages: [64, 256] },
    { id: 'apple-ipad-mini-(2019)', name: 'iPad mini (2019)', gsmArenaId: '9637', brand: 'apple', type: 'tablet', releaseYear: 2019, defaultStorages: [64, 256] },

    // --- GAME CONSOLES (Elite SEO) ---
    { id: 'sony-playstation-5-pro', name: 'PlayStation 5 Pro', brand: 'sony', type: 'console_home', releaseYear: 2024, defaultStorages: [2048] },
    { id: 'sony-playstation-5-slim', name: 'PlayStation 5 Slim', brand: 'sony', type: 'console_home', releaseYear: 2023, defaultStorages: [1024] },
    { id: 'sony-playstation-5', name: 'PlayStation 5', brand: 'sony', type: 'console_home', releaseYear: 2020, defaultStorages: [825] },
    { id: 'sony-playstation-portal', name: 'PlayStation Portal', brand: 'sony', type: 'console_portable', releaseYear: 2023, defaultStorages: [0] },

    { id: 'microsoft-xbox-series-x', name: 'Xbox Series X', brand: 'microsoft', type: 'console_home', releaseYear: 2020, defaultStorages: [1024] },
    { id: 'microsoft-xbox-series-s', name: 'Xbox Series S', brand: 'microsoft', type: 'console_home', releaseYear: 2020, defaultStorages: [512, 1024] },

    { id: 'nintendo-switch-oled', name: 'Nintendo Switch OLED', brand: 'nintendo', type: 'console_portable', releaseYear: 2021, defaultStorages: [64] },
    { id: 'nintendo-switch-v2', name: 'Nintendo Switch v2', brand: 'nintendo', type: 'console_portable', releaseYear: 2019, defaultStorages: [32] },
    { id: 'nintendo-switch-lite', name: 'Nintendo Switch Lite', brand: 'nintendo', type: 'console_portable', releaseYear: 2019, defaultStorages: [32] },
];
