
import { MetadataRoute } from 'next';
import { LOCATIONS } from '../data/locations';
import { getAllDevices } from '../services/server/pricing.dal';
import { MOCK_BLOG_POSTS, MOCK_PRODUCTS } from '../constants';

// --- CONFIGURATION ---
const getBaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be';
    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }
    return url.replace(/\/$/, ''); // Remove trailing slash
};
const BASE_URL = getBaseUrl();
const LANGUAGES = ['fr', 'nl', 'en', 'tr'] as const;

// Priority Keywords for SEO Weighting
const HIGH_PRIORITY_KEYWORDS = [
    'iphone-12', 'iphone-14', 'iphone-15', 'iphone-16',
    'galaxy-s', 'ps5', 'pixel-8'
];

/**
 * ELITE SEO SITEMAP GENERATOR
 * Includes multilingual alternates, brand silos, and prioritized weighting.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemapEntries: MetadataRoute.Sitemap = [];
    const lastmodStatic = new Date('2026-01-05').toISOString(); // Stable date for authority pages

    try {
        // 1. Static Pages (High Priority Infrastructure)
        const pages = [
            { id: 'home', priority: 1.0, changeFreq: 'daily', slugs: { en: '', fr: '', nl: '', tr: '' } },
            { id: 'services', priority: 0.9, changeFreq: 'weekly', slugs: { en: 'services', fr: 'services', nl: 'diensten', tr: 'hizmetler' } },
            { id: 'stores', priority: 0.9, changeFreq: 'weekly', slugs: { en: 'stores', fr: 'magasins', nl: 'winkels', tr: 'magazalar' } },
            { id: 'about', priority: 0.6, changeFreq: 'monthly', slugs: { en: 'about', fr: 'a-propos', nl: 'over-ons', tr: 'hakkimizda' } },
            { id: 'contact', priority: 0.6, changeFreq: 'monthly', slugs: { en: 'contact', fr: 'contact', nl: 'contact', tr: 'iletisim' } },
        ];

        pages.forEach(page => {
            LANGUAGES.forEach(lang => {
                const relSlug = page.slugs[lang];
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}${relSlug ? '/' + relSlug : ''}`,
                    lastModified: lastmodStatic,
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

        // 2. Blog Posts (Content Authority)
        MOCK_BLOG_POSTS.forEach(post => {
            LANGUAGES.forEach(lang => {
                const currentSlug = (post.slugs as any)?.[lang] || post.slug || post.id;
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}/blog/${currentSlug}`,
                    lastModified: lastmodStatic,
                    changeFrequency: 'monthly',
                    priority: 0.5,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/blog/${(post.slugs as any)?.[l] || post.slug || post.id}`])
                        )
                    }
                });
            });
        });

        // 3. Products
        const productsPath = { fr: 'produits', nl: 'producten', tr: 'urunler', en: 'products' };
        MOCK_PRODUCTS.forEach(product => {
            if (product.slug) {
                LANGUAGES.forEach(lang => {
                    sitemapEntries.push({
                        url: `${BASE_URL}/${lang}/${productsPath[lang]}/${product.category}/${product.slug}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.7,
                        alternates: {
                            languages: Object.fromEntries(
                                LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${productsPath[l]}/${product.category}/${product.slug}`])
                            )
                        }
                    });
                });
            }
        });

        // 4. Dynamic Devices & Brand Silos
        const allDevices = await getAllDevices();
        const repairConfig = { slugs: { fr: 'reparation', nl: 'reparatie', en: 'repair', tr: 'onarim' } };
        const buybackConfig = { slugs: { fr: 'rachat', nl: 'inkoop', en: 'buyback', tr: 'geri-alim' } };

        const uniqueBrands = new Set<string>();

        for (const deviceId of allDevices) {
            const [brand, ...modelParts] = deviceId.split('-');
            if (!brand || modelParts.length === 0) continue;
            uniqueBrands.add(brand);

            const model = modelParts.join('-');
            const isPriority = HIGH_PRIORITY_KEYWORDS.some(k => deviceId.includes(k));
            const priority = isPriority ? 1.0 : 0.8;

            LANGUAGES.forEach(lang => {
                const repUrl = `${BASE_URL}/${lang}/${repairConfig.slugs[lang]}/${brand}/${model}`.toLowerCase();

                // Repair Model
                sitemapEntries.push({
                    url: repUrl,
                    lastModified: new Date(),
                    changeFrequency: 'daily',
                    priority: priority,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${repairConfig.slugs[l]}/${brand}/${model}`.toLowerCase()])
                        )
                    }
                });

                // Buyback Model
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}/${buybackConfig.slugs[lang]}/${brand}/${model}`.toLowerCase(),
                    lastModified: new Date(),
                    changeFrequency: 'daily',
                    priority: priority,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${buybackConfig.slugs[l]}/${brand}/${model}`.toLowerCase()])
                        )
                    }
                });

                // Local Optimized Landing Pages (Priority Only)
                if (isPriority) {
                    for (const location of LOCATIONS) {
                        const locSlug = location.slugs[lang];
                        sitemapEntries.push({
                            url: `${repUrl}/${locSlug}`.toLowerCase(),
                            lastModified: lastmodStatic,
                            changeFrequency: 'monthly',
                            priority: 0.9,
                            alternates: {
                                languages: Object.fromEntries(
                                    LANGUAGES.map(l => [
                                        l,
                                        `${BASE_URL}/${l}/${repairConfig.slugs[l]}/${brand}/${model}/${location.slugs[l]}`.toLowerCase()
                                    ])
                                )
                            }
                        });
                    }
                }
            });
        }

        // 5. Brand Silos (The "Authority" Headers)
        uniqueBrands.forEach(brand => {
            LANGUAGES.forEach(lang => {
                // Repair Brand
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}/${repairConfig.slugs[lang]}/${brand}`.toLowerCase(),
                    lastModified: lastmodStatic,
                    changeFrequency: 'weekly',
                    priority: 0.9,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${repairConfig.slugs[l]}/${brand}`.toLowerCase()])
                        )
                    }
                });
                // Buyback Brand
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}/${buybackConfig.slugs[lang]}/${brand}`.toLowerCase(),
                    lastModified: lastmodStatic,
                    changeFrequency: 'weekly',
                    priority: 0.9,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${buybackConfig.slugs[l]}/${brand}`.toLowerCase()])
                        )
                    }
                });
            });
        });

        return sitemapEntries;

    } catch (error) {
        console.error('[Sitemap] Critical Error:', error);
        return [{ url: `${BASE_URL}/error`, lastModified: new Date() }];
    }
}
