export const DEVICE_IMAGES: Record<string, string> = {
    // Brands
    'apple': '/images/brands/apple.svg',
    'samsung': '/images/brands/samsung.svg',
    'google': '/images/brands/google.svg',
    'huawei': '/images/brands/huawei.svg',
    'oneplus': '/images/brands/oneplus.svg',
    'xiaomi': '/images/brands/xiaomi.svg',
    'oppo': '/images/brands/oppo.svg',
    'motorola': '/images/brands/motorola.svg',
    'realme': '/images/brands/realme_logo.svg',
    'microsoft': '/images/brands/microsoft.svg',
    'lenovo': '/images/brands/lenovo.svg',
    'hp': '/images/brands/hp.svg',
    'dell': '/images/brands/dell.svg',
    'sony': '/images/brands/sony.svg',
    'playstation': '/images/brands/sony.svg',
    'xbox': '/images/brands/xbox.svg',
    'nintendo': '/images/brands/nintendo.svg',

    // Specific Models (Premium Renders)
    'apple-iphone-15-pro': '/images/models/apple-iphone-15-pro.png',
    'samsung-galaxy-s24-ultra': '/images/models/samsung-galaxy-s24-ultra.png',
    'iphone-13': '/images/models/iphone-13.jpg',
    'sony-playstation-5-disc': '/images/models/sony-playstation-5-disc.jpg',
};

// Helper function to get image for brand or model with intelligent generic fallback
export const getDeviceImage = (slug: string, category?: string): string | null => {
    const s = slug.toLowerCase();

    // 1. Try specific model first
    if (DEVICE_IMAGES[s]) return DEVICE_IMAGES[s];

    // 2. Try Category specific generic (New Premium Feature)
    if (category) {
        const cat = category.toLowerCase();
        // Handle variants (e.g. console vs console_home)
        const normalizedCat = cat.startsWith('console') ? (cat.includes('_') ? cat : 'console_home') : cat;

        // We now have beautiful renders for: smartphone, tablet, laptop, console_home, console_portable, smartwatch
        const genericPath = `/images/generics/${normalizedCat}.png`;
        // In a real environment, we'd check if file exists, but here we assume our deployment task worked.
        return genericPath;
    }

    // 3. Fallback to Brand Logo
    const brand = s.split('-')[0];
    return DEVICE_IMAGES[brand] || null;
};
