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

    // Specific Models (Examples - User to populate)
    'iphone-15-pro': '/images/models/iphone-15-pro.jpg',
    // 'iphone-14-pro': removed/broken - will fallback to brand logo
    'iphone-13': '/images/models/iphone-13.jpg',
    // 'samsung-galaxy-s24-ultra': removed/broken - will fallback to brand logo
    // 'macbook-pro-14-m2': removed/broken - will fallback to brand logo
    'sony-playstation-5-disc': '/images/models/sony-playstation-5-disc.jpg',
};

// Helper function to get image for brand or model
export const getDeviceImage = (slug: string): string | null => {
    return DEVICE_IMAGES[slug.toLowerCase()] || null;
};
