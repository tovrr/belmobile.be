
import { MetadataRoute } from 'next';
import { LOCATIONS } from '../data/locations';
import { getAllDevices } from '../services/server/pricing.dal';
import { MOCK_BLOG_POSTS, MOCK_PRODUCTS } from '../constants';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be';
const LANGUAGES = ['fr', 'nl', 'en', 'tr'] as const;

const HIGH_PRIORITY_KEYWORDS = [
    'iphone-12', 'iphone-13', 'iphone-14', 'iphone-15', 'iphone-16',
    'galaxy-s', 'galaxy-a', 'playstation-5', 'ps5',
    'pixel-7', 'pixel-8'
];

export async function generateSitemaps() {
    return [
        { id: 'static' },
        { id: 'blog' },
        { id: 'products' },
        { id: 'repair' },
        { id: 'buyback' }
    ];
}

export default async function sitemap(props: any): Promise<MetadataRoute.Sitemap> {
    // Next.js 15/16 defensive extraction: props and its fields can be Promises
    const resolvedProps = await props;
    const resolvedId = await (resolvedProps?.id);

    const sitemapId = (resolvedId || 'static').toString().replace('.xml', '');
    const sitemapEntries: MetadataRoute.Sitemap = [];

    // --- 1. STATIC PAGES ---
    if (sitemapId === 'static') {
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
            { id: 'franchise', priority: 0.6, changeFreq: 'monthly', slugs: { en: 'franchise', fr: 'franchise', nl: 'franchise', tr: 'bayilik' } },
            { id: 'privacy', priority: 0.3, changeFreq: 'yearly', slugs: { en: 'privacy', fr: 'politique-de-confidentialite', nl: 'privacybeleid', tr: 'gizlilik-politikasi' } },
            { id: 'terms', priority: 0.3, changeFreq: 'yearly', slugs: { en: 'terms', fr: 'conditions-generales', nl: 'algemene-voorwaarden', tr: 'kullanim-sartlari' } },
            { id: 'cookies', priority: 0.3, changeFreq: 'yearly', slugs: { en: 'cookies', fr: 'politique-cookies', nl: 'cookiebeleid', tr: 'cerez-politikasi' } },
        ];

        pages.forEach(page => {
            LANGUAGES.forEach(lang => {
                const relSlug = page.slugs[lang];
                sitemapEntries.push({
                    url: `${BASE_URL}/${lang}${relSlug ? '/' + relSlug : ''}`,
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
    }

    // --- 2. BLOG ---
    if (sitemapId === 'blog') {
        LANGUAGES.forEach(lang => {
            sitemapEntries.push({
                url: `${BASE_URL}/${lang}/blog`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
                alternates: { languages: Object.fromEntries(LANGUAGES.map(l => [l, `${BASE_URL}/${l}/blog`])) }
            });

            MOCK_BLOG_POSTS.forEach(post => {
                const currentSlug = (post.slugs as any)?.[lang] || post.slug || post.id;
                sitemapEntries.push({
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
        });
    }

    // --- 3. PRODUCTS ---
    if (sitemapId === 'products') {
        const productsPath = { fr: 'produits', nl: 'producten', tr: 'urunler', en: 'products' };
        LANGUAGES.forEach(lang => {
            sitemapEntries.push({
                url: `${BASE_URL}/${lang}/${productsPath[lang]}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
                alternates: { languages: Object.fromEntries(LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${productsPath[l]}`])) }
            });

            MOCK_PRODUCTS.forEach(product => {
                if (product.slug) {
                    sitemapEntries.push({
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
    }

    // --- 4. REPAIR & BUYBACK ---
    if (sitemapId === 'repair' || sitemapId === 'buyback') {
        const allDeviceIds = await getAllDevices();
        const config = sitemapId === 'repair'
            ? { slugs: { fr: 'reparation', nl: 'reparatie', en: 'repair', tr: 'onarim' } }
            : { slugs: { fr: 'rachat', nl: 'inkoop', en: 'buyback', tr: 'geri-alim' } };

        for (const deviceId of allDeviceIds) {
            const [brand, ...modelParts] = deviceId.split('-');
            if (!brand || modelParts.length === 0) continue;
            const model = modelParts.join('-');

            const isPriority = HIGH_PRIORITY_KEYWORDS.some(k => deviceId.includes(k));
            const priority = isPriority ? 1.0 : 0.8;

            LANGUAGES.forEach(lang => {
                const serviceSlug = config.slugs[lang];
                const url = `${BASE_URL}/${lang}/${serviceSlug}/${brand}/${model}`.toLowerCase();

                sitemapEntries.push({
                    url,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: priority,
                    alternates: {
                        languages: Object.fromEntries(
                            LANGUAGES.map(l => [l, `${BASE_URL}/${l}/${config.slugs[l]}/${brand}/${model}`.toLowerCase()])
                        )
                    }
                });

                if (sitemapId === 'repair') {
                    for (const location of LOCATIONS) {
                        const locSlug = location.slugs[lang];
                        sitemapEntries.push({
                            url: `${url}/${locSlug}`.toLowerCase(),
                            lastModified: new Date(),
                            changeFrequency: 'monthly',
                            priority: isPriority ? 0.9 : 0.7,
                            alternates: {
                                languages: Object.fromEntries(
                                    LANGUAGES.map(l => [
                                        l,
                                        `${BASE_URL}/${l}/${config.slugs[l]}/${brand}/${model}/${location.slugs[l]}`.toLowerCase()
                                    ])
                                )
                            }
                        });
                    }
                }
            });
        }
    }

    return sitemapEntries;
}
