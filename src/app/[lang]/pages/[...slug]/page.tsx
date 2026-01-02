import { permanentRedirect } from 'next/navigation';
import { SEARCH_INDEX } from '@/data/search-index';

interface PageProps {
    params: Promise<{ lang: string; slug: string[] }>;
}

/**
 * SMART REDIRECTOR (The Proxy Approach)
 * Handles 1000+ legacy Shopify URLs starting with /pages/
 * Runs only when a /pages/* route is hit, preserving performance.
 */
export default async function LegacyRedirectPage({ params }: PageProps) {
    const { lang, slug } = await params;
    const legacySlug = slug[slug.length - 1].toLowerCase();

    // 1. SPECIFIC MAPPINGS (Top Performers from Search Console CSV)
    const directMappings: Record<string, string> = {
        // Hubs & Services
        'reparation-iphone-bruxelles': '/fr/reparation/apple/iphone-bruxelles',
        'rachat-gsm-bruxelles': '/fr/rachat/bruxelles',
        'rachat-iphone-bruxelles': '/fr/rachat/apple/iphone-bruxelles',
        'rachat-reprise-revendre-cash-appareils-high-tech-bruxelles': '/fr/rachat/bruxelles',
        'reparation-smartphone-bruxelles': '/fr/reparation/bruxelles',
        'magasin-informatique-bruxelles': '/fr/reparation/bruxelles',
        'grossiste-accessoires-gsm-smartphone-tablette-bruxelles': '/fr/services/grossiste',
        'reparation-express-smartphone-tablette-et-ordinateur-a-bruxelles': '/fr/reparation/bruxelles',
        'reparation-imac-macbook': '/fr/reparation/apple/macbook',
        'deblocage-iphone-bruxelles': '/fr/reparation/apple/iphone', // Fallback to iphone
        'rachat-macbook-bruxelles': '/fr/rachat/apple/macbook',
        'reparation-ipad-bruxelles': '/fr/reparation/apple/ipad-bruxelles',

        // Dutch Mappings
        'iphone-11-tarieven-reparatie': '/nl/reparatie/apple/iphone-11',
        'gsm-inkoop-brussel': '/nl/inkoop/brussel',
        'reparatie-nintendo-3ds-2ds-xl-brussel': '/nl/reparatie/nintendo/3ds',
        'reparatie-nintendo-bruxelles': '/nl/reparatie/nintendo/bruxelles',
        'groothandel-gsm-smartphone-tablet-accessoires-brussel': '/nl/business',
    };

    if (directMappings[legacySlug]) {
        permanentRedirect(directMappings[legacySlug]);
    }

    // 2. DETECT SERVICE INTENT
    let service = 'reparation'; // default
    if (lang === 'nl') service = 'reparatie';

    const rachatKeywords = ['rachat', 'revendre', 'recyclage', 'inkoop', 'verkopen', 'reprise'];
    if (rachatKeywords.some(kw => legacySlug.includes(kw))) {
        service = lang === 'nl' ? 'inkoop' : 'rachat';
    }

    // 3. CLEAN SLUG (Remove all legacy prefixes and suffixes)
    let cleanSlug = legacySlug
        // French Prefixes
        .replace(/^(reparation|rachat|revendre|tarifs-reparation|recyclage)-/, '')
        // Dutch Prefixes
        .replace(/^(reparatie|inkoop|verkopen|tarieven-reparatie)-/, '')
        // Common Extensions
        .replace(/-tarieven-reparatie$/, '')
        .replace(/-reparatie-prijs$/, '')
        .replace(/-reparatie$/, '')
        .replace(/-verkopen$/, '')
        .replace(/-inkoop$/, '')
        .replace(/-prix$/, '')
        .replace(/-prijs$/, '')
        .replace(/-bruxelles$/, '')
        .replace(/-brussel$/, '');

    // 4. SEARCH INDEX MATCHING (Resilient Lookups)
    const getMatch = (slugToTry: string) => SEARCH_INDEX[slugToTry as keyof typeof SEARCH_INDEX];

    let match = getMatch(cleanSlug);

    // If no direct match, try stripping the brand name from the slug (Shopify often had brand-model)
    if (!match) {
        const brands = ['samsung-', 'apple-', 'sony-', 'huawei-', 'google-', 'xiaomi-', 'oppo-', 'realme-', 'motorola-', 'nintendo-', 'xbox-'];
        for (const brandPrefix of brands) {
            if (cleanSlug.startsWith(brandPrefix)) {
                const strippedSlug = cleanSlug.replace(brandPrefix, '');
                const secondMatch = getMatch(strippedSlug);
                if (secondMatch) {
                    match = secondMatch;
                    cleanSlug = strippedSlug;
                    break;
                }
            }
        }
    }

    if (match) {
        const brand = match.brand.toLowerCase();
        // Redirect to exact model path
        permanentRedirect(`/${lang}/${service}/${brand}/${cleanSlug}`);
    }

    // 5. HUB FALLBACKS (If model not found, look for location/category)
    if (legacySlug.includes('bruxelles') || legacySlug.includes('brussel') || legacySlug.includes('anderlecht') || legacySlug.includes('schaerbeek')) {
        let city = 'bruxelles';
        if (legacySlug.includes('anderlecht')) city = 'anderlecht';
        if (legacySlug.includes('schaerbeek')) city = 'schaerbeek';
        if (lang === 'nl' && city === 'bruxelles') city = 'brussel';

        permanentRedirect(`/${lang}/${service}/${city}`);
    }

    // 6. FINAL FALLBACK: General service page
    permanentRedirect(`/${lang}/${service}`);
}
