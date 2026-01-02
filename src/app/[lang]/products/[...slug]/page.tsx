import { permanentRedirect } from 'next/navigation';
import { SEARCH_INDEX } from '@/data/search-index';

interface PageProps {
    params: Promise<{ lang: string; slug: string[] }>;
}

/**
 * SMART PRODUCT REDIRECTOR
 * Shopify URLs: /products/iphone-13-pro-max
 * It cleans legacy product slugs and attempts to match them against our SEARCH_INDEX.
 * If a device is recognized (iPhone, MacBook, etc.), it redirects to the repair page.
 * Otherwise, it falls back to the main products catalog.
 */
export default async function ProductRedirectPage({ params }: PageProps) {
    const { lang, slug } = await params;
    const legacySlug = slug[slug.length - 1].toLowerCase();

    // 0. SPECIFIC MAPPINGS (Top Performers from docs/_products/Pages.csv)
    const directMappings: Record<string, string> = {
        'pc-portable-hp-hq-tre-71025': '/fr/reparation/hp/laptop',
        'apple-macbook-air-a1466-13-3-core-i5-1-4-ghz-ssd-128-gb-ram-8-go-grade-a': '/fr/reparation/apple/macbook-air',
        'pc-tablette-hybride-9-0-klipad-2-en-1-android-7-0': '/fr/reparation/tablet',
        'mini-gsm-bm-m10': '/fr/products',
        'zte-blade-l210-4g-32gb-bleu': '/fr/reparation/zte/blade-l210',
        'gsm-nokia-new-3310-3g': '/fr/reparation/nokia/3310',
        'devis-reservation-iphone-15-pro-max': '/fr/reparation/apple/iphone-15-pro-max'
    };

    if (directMappings[legacySlug]) {
        permanentRedirect(directMappings[legacySlug]);
    }

    // 1. CLEAN SLUG (Products often have very long descriptive slugs in Shopify)
    // We try to find the core model name within the long slug
    const getMatch = (slugToTry: string) => SEARCH_INDEX[slugToTry as keyof typeof SEARCH_INDEX];

    let match = getMatch(legacySlug);
    let matchedSlug = legacySlug;

    if (!match) {
        // Try common patterns: remove brand prefixes if they exist at the start
        const brands = ['samsung-', 'apple-', 'sony-', 'huawei-', 'google-', 'xiaomi-', 'oppo-', 'realme-', 'motorola-', 'nintendo-', 'xbox-'];
        for (const brandPrefix of brands) {
            if (legacySlug.startsWith(brandPrefix)) {
                const stripped = legacySlug.replace(brandPrefix, '');
                const secondMatch = getMatch(stripped);
                if (secondMatch) {
                    match = secondMatch;
                    matchedSlug = stripped;
                    break;
                }
            }
        }
    }

    // 2. FUZZY SEARCH (If no direct match, look for model keywords inside the long slug)
    if (!match) {
        // High-Traffic Keywords from Search Console Data
        if (legacySlug.includes('macbook-air') || legacySlug.includes('a1466')) {
            permanentRedirect(`/${lang}/reparation/apple/macbook-air`);
        }
        if (legacySlug.includes('macbook-pro')) {
            permanentRedirect(`/${lang}/reparation/apple/macbook-pro`);
        }
        if (legacySlug.includes('hq-tre-71025') || legacySlug.includes('elitebook')) {
            permanentRedirect(`/${lang}/reparation/hp/laptop`);
        }
        if (legacySlug.includes('iphone-')) {
            // Extract iphone model if possible
            const iphoneMatch = legacySlug.match(/iphone-(\d+|se|xs|xr|x)/);
            if (iphoneMatch) {
                const model = iphoneMatch[0];
                if (getMatch(model)) {
                    permanentRedirect(`/${lang}/reparation/apple/${model}`);
                }
            }
        }
        if (legacySlug.includes('galaxy-')) {
            const galaxyMatch = legacySlug.match(/galaxy-([as]\d+|s\d+-ultra|note-\d+)/);
            if (galaxyMatch) {
                const model = galaxyMatch[0];
                if (getMatch(model)) {
                    permanentRedirect(`/${lang}/reparation/samsung/${model}`);
                }
            }
        }
    }

    // 3. REDIRECT BASED ON MATCH
    if (match) {
        const brand = match.brand.toLowerCase();
        // For localized product links, we favor sending them to the repair page 
        // as it's the premium landing for that specific model.
        permanentRedirect(`/${lang}/reparation/${brand}/${matchedSlug}`);
    }

    // 4. FINAL FALLBACK: General products page
    // If it's an accessory (cables, boxes) or unrecognized device
    permanentRedirect(`/${lang}/products`);
}
