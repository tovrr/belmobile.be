import { MOCK_BLOG_POSTS } from '../constants';

/**
 * Ensures a URL string has a protocol (defaults to https://) and handles potential whitespace.
 */
export function sanitizeUrl(url: string | undefined, defaultUrl: string = 'https://belmobile.be'): string {
    if (!url) return defaultUrl;
    let sanitized = url.trim();
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
        sanitized = `https://${sanitized}`;
    }
    return sanitized;
}

export const SLUG_MAPPINGS: Record<string, Record<string, string>> = {
    products: { en: 'products', fr: 'produits', nl: 'producten', tr: 'urunler' },
    repair: { en: 'repair', fr: 'reparation', nl: 'reparatie', tr: 'tamir' },
    buyback: { en: 'buyback', fr: 'rachat', nl: 'inkoop', tr: 'sat' },
    stores: { en: 'stores', fr: 'magasins', nl: 'winkels', tr: 'magazalar' },
    services: { en: 'services', fr: 'services', nl: 'diensten', tr: 'hizmetler' },
    about: { en: 'about', fr: 'a-propos', nl: 'over-ons', tr: 'hakkimizda' },
    sustainability: { en: 'sustainability', fr: 'durabilite', nl: 'duurzaamheid', tr: 'surdurulebilirlik' },
    students: { en: 'students', fr: 'etudiants', nl: 'studenten', tr: 'ogrenci' },
    courier: { en: 'express-courier', fr: 'coursier-express', nl: 'express-koerier', tr: 'kurye' },
    careers: { en: 'careers', fr: 'carrieres', nl: 'vacatures', tr: 'kariyer' },
    warranty: { en: 'warranty', fr: 'garantie', nl: 'garantie', tr: 'garanti' },
    privacy: { en: 'privacy', fr: 'vie-privee', nl: 'privacy', tr: 'gizlilik' },
    terms: { en: 'terms', fr: 'conditions-generales', nl: 'algemene-voorwaarden', tr: 'kosullar' },
    track: { en: 'track-order', fr: 'suivi-commande', nl: 'bestelling-volgen', tr: 'takip' },
    business: { en: 'business', fr: 'business', nl: 'zakelijk', tr: 'kurumsal' },
    support: { en: 'support', fr: 'support', nl: 'destek', tr: 'destek' },
    franchise: { en: 'franchise', fr: 'devenir-partenaire', nl: 'word-partner', tr: 'franchise' },
    // Redundant keys for direct lookup from localized slugs if needed
    'a-propos': { en: 'about', fr: 'a-propos', nl: 'over-ons' },
    'over-ons': { en: 'about', fr: 'a-propos', nl: 'over-ons' },
    'durabilite': { en: 'sustainability', fr: 'durabilite', nl: 'duurzaamheid' },
    'duurzaamheid': { en: 'sustainability', fr: 'durabilite', nl: 'duurzaamheid' }
};

export function getLocalizedPath(currentPath: string, newLang: 'en' | 'fr' | 'nl' | 'tr', searchParams: string = ''): string {
    // Split path into segments
    const segments = currentPath.split('/').filter(Boolean);

    // Check if first segment is a language code
    if (['en', 'fr', 'nl', 'tr'].includes(segments[0])) {
        segments[0] = newLang;
    } else {
        // Safe fallback if language is missing
        segments.unshift(newLang);
    }

    // Helper to translate a segment if it matches any known term
    const translateSegment = (segment: string) => {
        for (const key in SLUG_MAPPINGS) {
            const terms = SLUG_MAPPINGS[key];
            if (Object.values(terms).includes(segment)) {
                return terms[newLang];
            }
        }
        return segment;
    };

    // Iterate through segments and translate known terms
    for (let i = 0; i < segments.length; i++) {
        segments[i] = translateSegment(segments[i]);
    }

    // Special Handling for Blog Posts (Dynamic Slugs)
    if (segments.includes('blog') && segments.length > segments.indexOf('blog') + 1) {
        const blogIndex = segments.indexOf('blog');
        const currentSlug = segments[blogIndex + 1];
        const post = MOCK_BLOG_POSTS.find(p =>
            p.slug === currentSlug ||
            (p.slugs && Object.values(p.slugs).includes(currentSlug))
        );
        if (post && post.slugs) {
            segments[blogIndex + 1] = post.slugs[newLang] || post.slug;
        }
    }

    const newPath = '/' + segments.join('/');
    return newPath + searchParams;
}
