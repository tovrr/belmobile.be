export const createSlug = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/\+/g, '-plus')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Convert a slug back to a display name
 * Examples: 'iphone-14-plus' -> 'iPhone 14 Plus', 'galaxy-s23' -> 'Galaxy S23'
 */
export const slugToDisplayName = (slug: string): string => {
    if (!slug) return '';

    const SPECIAL_CASES: Record<string, string> = {
        'iphone': 'iPhone',
        'ipad': 'iPad',
        'imac': 'iMac',
        'ipod': 'iPod',
        'iwatch': 'iWatch',
        'oneplus': 'OnePlus',
        'oppo': 'OPPO',
        'lg': 'LG',
        'htc': 'HTC',
        'zenfone': 'ZenFone',
        'rog': 'ROG',
        'se': 'SE',
        'xr': 'XR',
        'xs': 'XS',
        'fe': 'FE',
        'ps4': 'PS4',
        'ps5': 'PS5',
        'xbox': 'Xbox',
        'ultra': 'Ultra',
        'active': 'Active',
    };

    return slug.toLowerCase()
        // Remove common SEO suffixes from legacy URLs
        .replace(/-prix$/, '')
        .replace(/-price$/, '')
        .replace(/-prijs$/, '')
        .replace(/-bruxelles$/, '')
        .replace(/-brussels$/, '')
        .replace(/-brussel$/, '')
        .replace(/-molenbeek$/, '')
        .replace(/-schaerbeek$/, '')
        .replace(/-anderlecht$/, '')
        .replace(/-liedts$/, '')
        .replace(/-belm$/, '')
        .replace(/-reparation$/, '')
        .replace(/-belgique$/, '')
        .replace(/-achat$/, '')
        .replace(/-scherm$/, '')
        .replace(/-ecran$/, '')
        .replace(/-screen$/, '')
        .replace(/-batterie$/, '')
        .replace(/-batterij$/, '')
        .replace(/-battery$/, '')
        .split(/[- ]+/) // Handles both dashes and spaces
        .map((word) => {
            if (!word) return '';
            const lowerWord = word.toLowerCase();

            // Check special cases map (Apple, OnePlus, OPPO, etc.)
            if (SPECIAL_CASES[lowerWord]) {
                return SPECIAL_CASES[lowerWord];
            }

            // Capitalize first letter of each word
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .filter(Boolean)
        .join(' ');
};
