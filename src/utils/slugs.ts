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
        .split('-')
        .map((word, index) => {
            // Special case for Apple products: iPhone, iPad, iMac, iPod, iWatch
            if (index === 0 && word.toLowerCase().startsWith('i') && word.length > 1) {
                // Check if it's an Apple product (iphone, ipad, imac, ipod, iwatch)
                const lowerWord = word.toLowerCase();
                if (['iphone', 'ipad', 'imac', 'ipod', 'iwatch'].includes(lowerWord)) {
                    return 'i' + word.charAt(1).toUpperCase() + word.slice(2);
                }
            }
            // Capitalize first letter of each word
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
};
