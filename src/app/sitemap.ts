
import { MetadataRoute } from 'next';
import { LOCATIONS } from '../data/locations';
import { STATIC_BLOG_POSTS, STATIC_PRODUCTS, DEVICE_TYPES, SEO_CONTENT } from '../constants';
import { STATIC_SLUG_MAPPINGS } from '../utils/i18n-helpers';
import { MASTER_DEVICE_LIST } from '../data/master-device-list';
import { getAllDevices } from '../services/server/pricing.dal';
import { getDeviceImage } from '../data/deviceImages';

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

// Helper to get simple image URL for device pages (Next.js sitemap strictly requires strings)
const getSitemapImage = (deviceId: string, isRepair: boolean): string | undefined => {
    // Try to get specific device image
    const imagePath = getDeviceImage(deviceId);
    if (!imagePath || imagePath === '/favicon.svg') return undefined;

    // Return absolute URL
    return `${BASE_URL}${imagePath}`;
};

// Helper to get static page image URL from SEO_CONTENT
const getStaticPageImage = (pageId: string): string | undefined => {
    // Mapping page IDs to SEO_CONTENT keys
    const mapping: Record<string, string> = {
        'repair-home': 'repair_step1',
        'buyback-home': 'buyback_step1',
        'business': 'buyback_step1', // Fallback
        'about': 'repair_step1', // Fallback
    };

    // Direct match or mapped match
    const key = mapping[pageId] || pageId;
    const content = SEO_CONTENT[key];

    if (content?.image) {
        // Ensure absolute URL
        return content.image.startsWith('http')
            ? content.image
            : `${BASE_URL}${content.image}`;
    }
    return undefined;
};

/**
 * ELITE SEO SITEMAP GENERATOR
 * Includes multilingual alternates, brand silos, prioritized weighting, and IMAGE METADATA.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemapEntries: any[] = [];
    const lastmodStatic = new Date('2026-01-12').toISOString(); // Stable date for authority pages

    try {
        // 1. Static Pages (High Priority Infrastructure)
        const pages = [
            { id: 'home', priority: 1.0, changeFreq: 'daily', slugs: { en: '', fr: '', nl: '', tr: '' } },
            { id: 'services', priority: 0.9, changeFreq: 'weekly', slugs: STATIC_SLUG_MAPPINGS.services },
            { id: 'stores', priority: 0.9, changeFreq: 'weekly', slugs: STATIC_SLUG_MAPPINGS.stores },
            { id: 'about', priority: 0.6, changeFreq: 'monthly', slugs: STATIC_SLUG_MAPPINGS.about },
            { id: 'sustainability', priority: 0.8, changeFreq: 'monthly', slugs: STATIC_SLUG_MAPPINGS.sustainability },
            { id: 'contact', priority: 0.6, changeFreq: 'monthly', slugs: STATIC_SLUG_MAPPINGS.contact },
            { id: 'business', priority: 0.9, changeFreq: 'weekly', slugs: STATIC_SLUG_MAPPINGS.business },
            { id: 'franchise', priority: 0.8, changeFreq: 'monthly', slugs: STATIC_SLUG_MAPPINGS.franchise },
            { id: 'formation', priority: 0.8, changeFreq: 'monthly', slugs: STATIC_SLUG_MAPPINGS.training },
            { id: 'express-courier', priority: 0.8, changeFreq: 'monthly', slugs: STATIC_SLUG_MAPPINGS.courier },
            { id: 'faq', priority: 0.7, changeFreq: 'monthly', slugs: STATIC_SLUG_MAPPINGS.faq },
            { id: 'track-order', priority: 0.7, changeFreq: 'daily', slugs: STATIC_SLUG_MAPPINGS.track },
            { id: 'warranty', priority: 0.5, changeFreq: 'yearly', slugs: STATIC_SLUG_MAPPINGS.warranty },
            { id: 'repair-home', priority: 0.9, changeFreq: 'weekly', slugs: STATIC_SLUG_MAPPINGS.repair },
            { id: 'buyback-home', priority: 0.9, changeFreq: 'weekly', slugs: STATIC_SLUG_MAPPINGS.buyback },
            { id: 'blog-index', priority: 0.7, changeFreq: 'weekly', slugs: STATIC_SLUG_MAPPINGS.blog },
            { id: 'catalogue', priority: 0.8, changeFreq: 'weekly', slugs: STATIC_SLUG_MAPPINGS.products },
        ];

        pages.forEach(page => {
            const staticImage = getStaticPageImage(page.id);

            LANGUAGES.forEach(lang => {
                const relSlug = page.slugs[lang];
                const entry: any = {
                    url: `${BASE_URL}/${lang}${relSlug ? '/' + relSlug : ''}`,
                    lastModified: lastmodStatic,
                    changeFrequency: page.changeFreq as any,
                    priority: page.priority,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}${page.slugs[l] ? '/' + page.slugs[l] : ''}`])
                        )
                    }
                };
                if (staticImage) entry.images = [staticImage]; // Inject static image
                sitemapEntries.push(entry);
            });
        });

        // 2. Store Profiles (Local SEO Pillars)
        const storesPath = STATIC_SLUG_MAPPINGS.stores;
        LOCATIONS.forEach(loc => {
            LANGUAGES.forEach(lang => {
                const locSlug = loc.slugs[lang] || loc.id;
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}/${storesPath[lang]}/${locSlug}`,
                    lastModified: lastmodStatic,
                    changeFrequency: 'weekly',
                    priority: 0.9,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${storesPath[l]}/${loc.slugs[l] || loc.id}`])
                        )
                    }
                });
            });
        });

        // 3. Blog Posts (Content Authority)
        STATIC_BLOG_POSTS.forEach(post => {
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
        STATIC_PRODUCTS.forEach(product => {
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

        // 4. Dynamic Devices & Brand Silos (Hybrid Engine)
        // Fetches ALL IDs from DB + Master List
        const allDeviceIds = await getAllDevices();

        // Fast Lookups for Metadata
        const masterMap = new Map(MASTER_DEVICE_LIST.map(d => [d.id, d]));

        const uniqueBrands = new Set<string>();
        const brandCategorySilos = new Set<string>(); // "apple-smartphone", "samsung-tablet" etc.

        const repairPath = STATIC_SLUG_MAPPINGS.repair;
        const buybackPath = STATIC_SLUG_MAPPINGS.buyback;

        for (const deviceId of allDeviceIds) {
            const [brand, ...modelParts] = deviceId.split('-');

            // Validation: Skip malformed IDs (e.g. just "apple", empty strings)
            if (!brand || modelParts.length === 0) continue;

            uniqueBrands.add(brand);
            const model = modelParts.join('-');

            // Priority Logic: Check Master List for 'releaseYear'
            const masterData = masterMap.get(deviceId);
            if (masterData?.type) {
                brandCategorySilos.add(`${brand}|${masterData.type}`);
            }

            // High Priority if 2021+ (Lowered from 2023 to include iPhone 13, S21 etc)
            const isLatest = (masterData?.releaseYear || 0) >= 2021;
            const priority = isLatest ? 1.0 : 0.8;

            // Get Image Data
            const repImage = getSitemapImage(deviceId, true);
            const buyImage = getSitemapImage(deviceId, false);

            LANGUAGES.forEach(lang => {
                const repBase = `${BASE_URL}/${lang}/${repairPath[lang]}/${brand}/${model}`.toLowerCase();
                const buyBase = `${BASE_URL}/${lang}/${buybackPath[lang]}/${brand}/${model}`.toLowerCase();

                // 4.1 Repair Model
                const repEntry: any = {
                    url: repBase,
                    lastModified: lastmodStatic,
                    changeFrequency: 'weekly',
                    priority: priority,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${repairPath[l]}/${brand}/${model}`.toLowerCase()])
                        )
                    }
                };
                if (repImage) repEntry.images = [repImage]; // Inject image
                sitemapEntries.push(repEntry);

                // 4.2 Buyback Model
                const buyEntry: any = {
                    url: buyBase,
                    lastModified: lastmodStatic,
                    changeFrequency: 'weekly',
                    priority: priority,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${buybackPath[l]}/${brand}/${model}`.toLowerCase()])
                        )
                    }
                };
                if (buyImage) buyEntry.images = [buyImage]; // Inject image
                sitemapEntries.push(buyEntry);

                // 4.3 Local Optimized Landing Pages (Neighborhood Authority)
                if (isLatest) {
                    for (const location of LOCATIONS) {
                        const locSlug = location.slugs[lang];

                        // Local Repair
                        sitemapEntries.push({
                            url: `${repBase}/${locSlug}`.toLowerCase(),
                            lastModified: lastmodStatic,
                            changeFrequency: 'monthly',
                            priority: 0.9,
                            alternates: {
                                languages: Object.fromEntries(
                                    LANGUAGES.map(l => [
                                        l,
                                        `${BASE_URL}/${l}/${repairPath[l]}/${brand}/${model}/${location.slugs[l]}`.toLowerCase()
                                    ])
                                )
                            }
                        });

                        // Local Buyback
                        sitemapEntries.push({
                            url: `${buyBase}/${locSlug}`.toLowerCase(),
                            lastModified: lastmodStatic,
                            changeFrequency: 'monthly',
                            priority: 0.9,
                            alternates: {
                                languages: Object.fromEntries(
                                    LANGUAGES.map(l => [
                                        l,
                                        `${BASE_URL}/${l}/${buybackPath[l]}/${brand}/${model}/${location.slugs[l]}`.toLowerCase()
                                    ])
                                )
                            }
                        });
                    }
                }
            });
        }

        // 5. Brand Silos & Category Silos (The "Authority" Headers)
        uniqueBrands.forEach(brand => {
            LANGUAGES.forEach(lang => {
                // Repair Brand
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}/${repairPath[lang]}/${brand}`.toLowerCase(),
                    lastModified: lastmodStatic,
                    changeFrequency: 'weekly',
                    priority: 0.9,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${repairPath[l]}/${brand}`.toLowerCase()])
                        )
                    }
                });
                // Buyback Brand
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}/${buybackPath[lang]}/${brand}`.toLowerCase(),
                    lastModified: lastmodStatic,
                    changeFrequency: 'weekly',
                    priority: 0.9,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${buybackPath[l]}/${brand}`.toLowerCase()])
                        )
                    }
                });
            });
        });

        // 6. Brand-Category Silos
        brandCategorySilos.forEach(siloKey => {
            const [brand, catId] = siloKey.split('|');
            const category = DEVICE_TYPES.find((d: any) => d.id === catId);
            if (!category) return;

            LANGUAGES.forEach(lang => {
                const catSlug = category.aliases?.[0] || category.id;

                // Repair Brand Category
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}/${repairPath[lang]}/${brand}/${catSlug}`.toLowerCase(),
                    lastModified: lastmodStatic,
                    changeFrequency: 'weekly',
                    priority: 0.8,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => {
                                const lCat = DEVICE_TYPES.find((d: any) => d.id === catId);
                                const lSlug = lCat?.aliases?.[0] || catId;
                                return [l, `${BASE_URL}/${l}/${repairPath[l]}/${brand}/${lSlug}`.toLowerCase()];
                            })
                        )
                    }
                });

                // Buyback Brand Category
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}/${buybackPath[lang]}/${brand}/${catSlug}`.toLowerCase(),
                    lastModified: lastmodStatic,
                    changeFrequency: 'weekly',
                    priority: 0.8,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => {
                                const lCat = DEVICE_TYPES.find((d: any) => d.id === catId);
                                const lSlug = lCat?.aliases?.[0] || catId;
                                return [l, `${BASE_URL}/${l}/${buybackPath[l]}/${brand}/${lSlug}`.toLowerCase()];
                            })
                        )
                    }
                });
            });
        });

        // 7. Local Service Silos
        LOCATIONS.forEach(loc => {
            LANGUAGES.forEach(lang => {
                const locSlug = loc.slugs[lang];

                // Local Repair Service page
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}/${repairPath[lang]}/${locSlug}`.toLowerCase(),
                    lastModified: lastmodStatic,
                    changeFrequency: 'weekly',
                    priority: 0.9,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${repairPath[l]}/${loc.slugs[l]}`.toLowerCase()])
                        )
                    }
                });

                // Local Buyback Service page
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}/${buybackPath[lang]}/${locSlug}`.toLowerCase(),
                    lastModified: lastmodStatic,
                    changeFrequency: 'weekly',
                    priority: 0.9,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${buybackPath[l]}/${loc.slugs[l]}`.toLowerCase()])
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
