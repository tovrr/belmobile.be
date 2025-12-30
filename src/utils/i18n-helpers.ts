import { MOCK_BLOG_POSTS } from '../constants';

export const SLUG_MAPPINGS: Record<string, Record<string, string>> = {
    products: { en: 'products', fr: 'produits', nl: 'producten' },
    repair: { en: 'repair', fr: 'reparation', nl: 'reparatie' },
    buyback: { en: 'buyback', fr: 'rachat', nl: 'inkoop' },
    stores: { en: 'stores', fr: 'magasins', nl: 'winkels' },
    services: { en: 'services', fr: 'services', nl: 'diensten' },
    about: { en: 'about', fr: 'a-propos', nl: 'over-ons' },
    sustainability: { en: 'sustainability', fr: 'durabilite', nl: 'duurzaamheid' },
    students: { en: 'students', fr: 'etudiants', nl: 'studenten' },
    courier: { en: 'express-courier', fr: 'coursier-express', nl: 'express-koerier' },
    careers: { en: 'careers', fr: 'carrieres', nl: 'vacatures' },
    warranty: { en: 'warranty', fr: 'garantie', nl: 'garantie' },
    privacy: { en: 'privacy', fr: 'vie-privee', nl: 'privacy' },
    terms: { en: 'terms', fr: 'conditions-generales', nl: 'algemene-voorwaarden' },
    track: { en: 'track-order', fr: 'suivi-commande', nl: 'bestelling-volgen' },
    business: { en: 'business', fr: 'business', nl: 'zakelijk' },
    support: { en: 'support', fr: 'support', nl: 'ondersteuning' },
    franchise: { en: 'franchise', fr: 'devenir-partenaire', nl: 'word-partner' },
    // Redundant keys for direct lookup from localized slugs if needed
    'a-propos': { en: 'about', fr: 'a-propos', nl: 'over-ons' },
    'over-ons': { en: 'about', fr: 'a-propos', nl: 'over-ons' },
    'durabilite': { en: 'sustainability', fr: 'durabilite', nl: 'duurzaamheid' },
    'duurzaamheid': { en: 'sustainability', fr: 'durabilite', nl: 'duurzaamheid' }
};

export function getLocalizedPath(currentPath: string, newLang: 'en' | 'fr' | 'nl', searchParams: string = ''): string {
    // Split path into segments
    const segments = currentPath.split('/').filter(Boolean);

    // Check if first segment is a language code
    if (['en', 'fr', 'nl'].includes(segments[0])) {
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
