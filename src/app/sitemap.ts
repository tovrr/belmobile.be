
import { MetadataRoute } from 'next';
import { SERVICES } from '../data/services';
import { LOCATIONS } from '../data/locations';
import { getAllDevices } from '../services/server/pricing.dal';
import { MOCK_BLOG_POSTS, MOCK_PRODUCTS } from '../constants';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be';
const LANGUAGES = ['fr', 'nl', 'en', 'tr'] as const;
type Locale = typeof LANGUAGES[number];

const HIGH_PRIORITY_KEYWORDS = [
    'iphone-13', 'iphone-14', 'iphone-15', 'iphone-16',
    'galaxy-s22', 'galaxy-s23', 'galaxy-s24', 'pixel-7', 'pixel-8'
];

/**
 * STRATEGIC SITEMAP GENERATOR
 * Roles: SEO Optimization, Hreflang Alternates Management, Performance.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemap: MetadataRoute.Sitemap = [];

    // --- 1. HARMONIZED STATIC PAGES (Aligned with Middleware) ---
    const pages = [
        { id: 'home', priority: 1.0, changeFreq: 'daily', slugs: { en: '', fr: '', nl: '', tr: '' } },
        { id: 'about', priority: 0.8, changeFreq: 'monthly', slugs: { en: 'about', fr: 'a-propos', nl: 'over-ons', tr: 'hakkimizda' } },
        { id: 'services', priority: 0.8, changeFreq: 'weekly', slugs: { en: 'services', fr: 'services', nl: 'diensten', tr: 'hizmetler' } },
        { id: 'business', priority: 0.8, changeFreq: 'weekly', slugs: { en: 'business', fr: 'business', nl: 'zakelijk', tr: 'kurumsal' } },
        { id: 'stores', priority: 0.8, changeFreq: 'weekly', slugs: { en: 'stores', fr: 'magasins', nl: 'winkels', tr: 'magazalar' } },
        { id: 'contact', priority: 0.8, changeFreq: 'monthly', slugs: { en: 'contact', fr: 'contact', nl: 'contact', tr: 'iletisim' } },
        { id: 'track', priority: 0.7, changeFreq: 'daily', slugs: { en: 'track-order', fr: 'suivre-commande', nl: 'volg-bestelling', tr: 'siparis-takip' } },
        { id: 'faq', priority: 0.7, changeFreq: 'weekly', slugs: { en: 'faq', fr: 'faq', nl: 'veelgestelde-vragen', tr: 'sss' } },
        { id: 'careers', priority: 0.6, changeFreq: 'monthly', slugs: { en: 'careers', fr: 'carrieres', nl: 'vacatures', tr: 'kariyer' } },

        // Legal (Low Priority 0.3)
        { id: 'privacy', priority: 0.3, changeFreq: 'yearly', slugs: { en: 'privacy', fr: 'politique-de-confidentialite', nl: 'privacybeleid', tr: 'gizlilik-politikasi' } },
        { id: 'terms', priority: 0.3, changeFreq: 'yearly', slugs: { en: 'terms', fr: 'conditions-generales', nl: 'algemene-voorwaarden', tr: 'kullanim-sartlari' } },
        { id: 'cookies', priority: 0.3, changeFreq: 'yearly', slugs: { en: 'cookies', fr: 'politique-cookies', nl: 'cookiebeleid', tr: 'cerez-politikasi' } },
    ];

    pages.forEach(page => {
        LANGUAGES.forEach(lang => {
            const relSlug = page.slugs[lang];
            const url = `${BASE_URL}/${lang}${relSlug ? '/' + relSlug : ''}`;

            sitemap.push({
                url,
                lastModified: new Date(),
                changeFrequency: page.changeFreq as any,
                priority: page.priority,
                alternates: {
                    languages: Object.fromEntries(
                        LANGUAGES.map(l => [l, `${BASE_URL}/${l}${page.slugs[l] ? '/' + page.slugs[l] : ''}`])
                    )
                }
            });
        });
    });

    // --- 2. DYNAMIC DEVICES (The "Money" Calculator Pages) ---
    // High Priority: 1.0 (Same as Home)
    const deviceIds = await getAllDevices();

    // Sort devices: Priority > Recent > Others
    deviceIds.sort((a, b) => {
        const aPrio = HIGH_PRIORITY_KEYWORDS.some(k => a.includes(k));
        const bPrio = HIGH_PRIORITY_KEYWORDS.some(k => b.includes(k));
        if (aPrio && !bPrio) return -1;
        if (!aPrio && bPrio) return 1;
        return a.localeCompare(b);
    });

    const serviceTypes = [
        { id: 'repair', slugs: { fr: 'reparation', nl: 'reparatie', en: 'repair', tr: 'onarim' } },
        { id: 'buyback', slugs: { fr: 'rachat', nl: 'inkoop', en: 'buyback', tr: 'geri-alim' } }
    ];

    for (const service of serviceTypes) {
        for (const deviceId of deviceIds) {
            const [brand, ...modelParts] = deviceId.split('-');
            if (!brand || modelParts.length === 0) continue;
            const model = modelParts.join('-');

            const isPriority = HIGH_PRIORITY_KEYWORDS.some(k => deviceId.includes(k));
            const priority = isPriority ? 1.0 : 0.8;

            LANGUAGES.forEach(lang => {
                const serviceSlug = service.slugs[lang];
                const url = `${BASE_URL}/${lang}/${serviceSlug}/${brand}/${model}`.toLowerCase();

                sitemap.push({
                    url,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: priority, // Strategic: High value for crawler
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${service.slugs[l]}/${brand}/${model}`.toLowerCase()])
                        )
                    }
                });

                // Location-specific landing pages for devices (e.g. Repair iPhone 13 Brussels)
                for (const location of LOCATIONS) {
                    const locSlug = location.slugs[lang];
                    sitemap.push({
                        url: `${url}/${locSlug}`.toLowerCase(),
                        lastModified: new Date(),
                        changeFrequency: 'monthly',
                        priority: isPriority ? 0.9 : 0.7, // Slightly lower than main device page
                        alternates: {
                            languages: Object.fromEntries(
                                LANGUAGES.map(l => [
                                    l,
                                    `${BASE_URL}/${l}/${service.slugs[l]}/${brand}/${model}/${location.slugs[l]}`.toLowerCase()
                                ])
                            )
                        }
                    });
                }
            });
        }
    }

    // --- 3. BLOG & PRODUCTS ---
    LANGUAGES.forEach(lang => {
        // Blog Index
        sitemap.push({
            url: `${BASE_URL}/${lang}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
            alternates: {
                languages: Object.fromEntries(LANGUAGES.map(l => [l, `${BASE_URL}/${l}/blog`]))
            }
        });

        // Blog Posts
        MOCK_BLOG_POSTS.forEach(post => {
            const currentSlug = (post.slugs as any)?.[lang] || post.slug || post.id;
            sitemap.push({
                url: `${BASE_URL}/${lang}/blog/${currentSlug}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
                alternates: {
                    languages: Object.fromEntries(
                        LANGUAGES.map(l => [l, `${BASE_URL}/${l}/blog/${(post.slugs as any)?.[l] || post.slug || post.id}`])
                    )
                }
            });
        });

        // Buying Products (Path aligned with middleware if needed, here constant)
        const productsPath = { fr: 'produits', nl: 'producten', tr: 'urunler', en: 'products' };
        MOCK_PRODUCTS.forEach(product => {
            if (product.slug) {
                sitemap.push({
                    url: `${BASE_URL}/${lang}/${productsPath[lang]}/${product.category}/${product.slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${productsPath[l]}/${product.category}/${product.slug}`])
                        )
                    }
                });
            }
        });
    });

    return sitemap;
}
