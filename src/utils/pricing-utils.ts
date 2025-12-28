/**
 * Standardizes a device ID/slug to ensure consistency across the database and frontend.
 * Removes common suffixes, handles brand normalization, and de-duplicates brand prefixes.
 */
export const standardizeDeviceId = (id: string): string => {
    if (!id) return '';

    let clean = id.toLowerCase()
        .replace(/-reparation$/, '')
        .replace(/-prix$/, '')
        .replace(/[^a-z0-9]+/g, '-') // Convert spaces/special to hyphens
        .replace(/^-+|-+$/g, ''); // Trim hyphens

    // Brand normalizing
    if (clean.startsWith('iphone')) clean = 'apple-' + clean;
    if (clean.startsWith('ipad')) clean = 'apple-' + clean;
    if (clean.startsWith('galaxy-s') || clean.startsWith('galaxy-a')) clean = 'samsung-' + clean;
    if (clean.startsWith('nintendo') && !clean.includes('switch')) clean = 'nintendo-switch';
    if (clean.startsWith('nintendo') && !clean.includes('switch')) clean = 'nintendo-switch';
    if (clean === 'switch' || clean === 'switch-lite' || clean === 'switch-oled') clean = 'nintendo-' + clean;
    if (clean.startsWith('playstation') || clean.startsWith('ps4') || clean.startsWith('ps5')) clean = 'sony-' + clean;

    // De-duplicate brands
    const brands = ['apple', 'samsung', 'google', 'huawei', 'nintendo', 'sony', 'microsoft', 'xiaomi', 'oppo', 'realme', 'motorola'];
    for (const brand of brands) {
        const doublePrefix = `${brand}-${brand}-`;
        if (clean.startsWith(doublePrefix)) {
            clean = clean.replace(doublePrefix, `${brand}-`);
        }
    }
    return clean;
};

/**
 * Normalizes device categories to standard display labels.
 */
export const normalizeCategoryLabel = (cat: string, brand?: string): string => {
    const fCat = cat.toLowerCase();
    let displayCat = fCat.charAt(0).toUpperCase() + fCat.slice(1);

    if (fCat === 'console_home' || fCat === 'console') displayCat = 'Home Console';
    if (brand === 'Nintendo' && fCat === 'console') displayCat = 'Portable Console';
    if (brand === 'Sony' && fCat === 'console_portable') displayCat = 'Portable Console';
    if (fCat === 'console_portable') displayCat = 'Portable Console';

    return displayCat;
};
