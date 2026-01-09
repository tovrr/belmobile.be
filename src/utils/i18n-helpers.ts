import { MOCK_BLOG_POSTS } from '../constants';
import { SERVICES } from '../data/services';

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

// 1. Static Mappings for non-service pages
export const STATIC_SLUG_MAPPINGS: Record<string, Record<string, string>> = {
    services: { en: 'services', fr: 'services', nl: 'diensten', tr: 'hizmetler' },
    products: { en: 'products', fr: 'produits', nl: 'producten', tr: 'urunler' }, // Can overlap with service if not careful
    stores: { en: 'stores', fr: 'magasins', nl: 'winkels', tr: 'magazalar' },
    about: { en: 'about', fr: 'a-propos', nl: 'over-ons', tr: 'hakkimizda' },
    sustainability: { en: 'sustainability', fr: 'durabilite', nl: 'duurzaamheid', tr: 'surdurulebilirlik' },
    students: { en: 'students', fr: 'etudiants', nl: 'studenten', tr: 'ogrenciler' },
    courier: { en: 'express-courier', fr: 'coursier-express', nl: 'express-koerier', tr: 'ekspres-kurye' },
    careers: { en: 'careers', fr: 'carrieres', nl: 'vacatures', tr: 'kariyer' },
    contact: { en: 'contact', fr: 'contact', nl: 'contact', tr: 'iletisim' },
    faq: { en: 'faq', fr: 'faq', nl: 'faq', tr: 'sss' },
    warranty: { en: 'warranty', fr: 'garantie', nl: 'garantie', tr: 'garanti' },
    privacy: { en: 'privacy', fr: 'vie-privee', nl: 'privacy', tr: 'gizlilik' },
    cookies: { en: 'cookies', fr: 'politique-cookies', nl: 'cookiebeleid', tr: 'cerez-politikasi' },
    terms: { en: 'terms', fr: 'conditions-generales', nl: 'algemene-voorwaarden', tr: 'kosullar' },
    track: { en: 'track-order', fr: 'suivi-commande', nl: 'bestelling-volgen', tr: 'siparis-takip' },
    business: { en: 'business', fr: 'business', nl: 'zakelijk', tr: 'kurumsal' },
    support: { en: 'support', fr: 'support', nl: 'destek', tr: 'destek' },
    franchise: { en: 'franchise', fr: 'franchise', nl: 'franchise', tr: 'bayilik' },
    training: { en: 'training', fr: 'formation', nl: 'opleiding', tr: 'egitim' },
    blog: { en: 'blog', fr: 'blog', nl: 'blog', tr: 'blog' },
    repair: { en: 'repair', fr: 'reparation', nl: 'reparatie', tr: 'onarim' },
    buyback: { en: 'buyback', fr: 'rachat', nl: 'inkoop', tr: 'geri-alim' },
    'data-recovery': { en: 'data-recovery', fr: 'recuperation-donnees', nl: 'data-recovery', tr: 'veri-kurtarma' },
    microsoldering: { en: 'microsoldering', fr: 'microsoudure', nl: 'microsolderen', tr: 'mikro-lehimleme' },
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
        // 1. Check Dynamic Services (SSOT)
        for (const service of SERVICES) {
            if (Object.values(service.slugs).includes(segment)) {
                // @ts-ignore
                return service.slugs[newLang];
            }
        }

        // 2. Check Static Mappings
        for (const key in STATIC_SLUG_MAPPINGS) {
            const terms = STATIC_SLUG_MAPPINGS[key];
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
