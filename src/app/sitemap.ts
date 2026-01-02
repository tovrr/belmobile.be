import { MetadataRoute } from 'next';
import { SERVICES } from '../data/services';
import { LOCATIONS } from '../data/locations';
import { DEVICE_BRANDS } from '../data/brands';
import { createSlug } from '../utils/slugs';
import { MOCK_BLOG_POSTS, MOCK_PRODUCTS } from '../constants';

// Import Models
import { MODELS as AppleModels } from '../data/models/apple';
import { MODELS as SamsungModels } from '../data/models/samsung';
import { MODELS as GoogleModels } from '../data/models/google';
import { MODELS as HuaweiModels } from '../data/models/huawei';
import { MODELS as OnePlusModels } from '../data/models/oneplus';
import { MODELS as XiaomiModels } from '../data/models/xiaomi';
import { MODELS as OppoModels } from '../data/models/oppo';
import { MODELS as SonyModels } from '../data/models/sony';
import { MODELS as MicrosoftModels } from '../data/models/microsoft';
import { MODELS as LenovoModels } from '../data/models/lenovo';
import { MODELS as HPModels } from '../data/models/hp';
import { MODELS as DellModels } from '../data/models/dell';
import { MODELS as NintendoModels } from '../data/models/nintendo';
import { MODELS as XboxModels } from '../data/models/xbox';

import { MODELS as MotorolaModels } from '../data/models/motorola';
import { MODELS as RealmeModels } from '../data/models/realme';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be';

const MODEL_DATA: Record<string, Record<string, Record<string, number>>> = {
    'apple': AppleModels,
    'samsung': SamsungModels,
    'google': GoogleModels,
    'huawei': HuaweiModels,
    'oneplus': OnePlusModels,
    'xiaomi': XiaomiModels,
    'oppo': OppoModels,
    'sony': SonyModels,
    'microsoft': MicrosoftModels,
    'lenovo': LenovoModels,
    'hp': HPModels,
    'dell': DellModels,
    'nintendo': NintendoModels,
    'xbox': XboxModels,
    'motorola': MotorolaModels,
    'realme': RealmeModels,
};

export default function sitemap(): MetadataRoute.Sitemap {
    const sitemap: MetadataRoute.Sitemap = [];
    const languages = ['fr', 'nl', 'en', 'tr'];

    // 1. Static Pages & Home
    languages.forEach(lang => {
        sitemap.push({
            url: `${BASE_URL}/${lang}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        });

        // 1.5 Specialized Services (Microsoldering & Data Recovery & Legal/Support)
        const specializedServices = [
            // Services
            {
                id: 'microsoldering',
                slugs: { en: 'services/microsoldering', fr: 'services/microsoudure', nl: 'services/microsolderen', tr: 'hizmetler/mikrosoldering' }
            },
            {
                id: 'data-recovery',
                slugs: { en: 'services/data-recovery', fr: 'services/recuperation-donnees', nl: 'services/data-recovery', tr: 'hizmetler/veri-kurtarma' }
            },
            {
                id: 'services',
                slugs: { en: 'services', fr: 'services', nl: 'diensten', tr: 'hizmetler' }
            },
            // Business & Corporate
            {
                id: 'business',
                slugs: { en: 'business', fr: 'business', nl: 'zakelijk', tr: 'kurumsal' }
            },
            {
                id: 'franchise',
                slugs: { en: 'franchise', fr: 'franchise', nl: 'franchise', tr: 'franchise' }
            },
            {
                id: 'careers',
                slugs: { en: 'careers', fr: 'carrieres', nl: 'vacatures', tr: 'kariyer' }
            },
            {
                id: 'express-courier',
                slugs: { en: 'express-courier', fr: 'coursier-express', nl: 'express-koerier', tr: 'kurye' }
            },
            {
                id: 'students',
                slugs: { en: 'students', fr: 'etudiants', nl: 'studenten', tr: 'ogrenci' }
            },
            // Company Info
            {
                id: 'about',
                slugs: { en: 'about', fr: 'a-propos', nl: 'over-ons', tr: 'hakkimizda' }
            },
            {
                id: 'training',
                slugs: { en: 'training', fr: 'formation', nl: 'opleiding', tr: 'egitim' }
            },
            {
                id: 'sustainability',
                slugs: { en: 'about/sustainability', fr: 'about/durabilite', nl: 'about/duurzaamheid', tr: 'hakkimizda/surdurulebilirlik' }
            },
            // Support & Tools
            {
                id: 'support',
                slugs: { en: 'support', fr: 'support', nl: 'ondersteuning', tr: 'destek' }
            },
            {
                id: 'track-order',
                slugs: { en: 'track-order', fr: 'suivi-commande', nl: 'bestelling-volgen', tr: 'takip' }
            },
            {
                id: 'stores',
                slugs: { en: 'stores', fr: 'magasins', nl: 'winkels', tr: 'magazalar' }
            },
            {
                id: 'comp-products',
                slugs: { en: 'products', fr: 'produits', nl: 'producten', tr: 'urunler' }
            },
            // Legal Pages
            {
                id: 'warranty',
                slugs: { en: 'warranty', fr: 'garantie', nl: 'garantie', tr: 'garanti' }
            },
            {
                id: 'terms',
                slugs: { en: 'terms', fr: 'conditions-generales', nl: 'algemene-voorwaarden', tr: 'kosullar' }
            },
            {
                id: 'privacy',
                slugs: { en: 'privacy', fr: 'vie-privee', nl: 'privacy', tr: 'gizlilik' }
            },
            {
                id: 'cookies',
                slugs: { en: 'cookies', fr: 'cookies', nl: 'cookies', tr: 'cerezler' }
            },
            {
                id: 'contact',
                slugs: { en: 'contact', fr: 'contact', nl: 'contact', tr: 'iletisim' }
            },
            {
                id: 'faq',
                slugs: { en: 'faq', fr: 'faq', nl: 'faq', tr: 'sss' }
            }
        ];

        specializedServices.forEach(service => {
            sitemap.push({
                url: `${BASE_URL}/${lang}/${service.slugs[lang as keyof typeof service.slugs]}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.85,
            });
        });

        // 1.6 Service Areas (Virtual Location Pages)
        const brusselsCommunes = [
            'Auderghem', 'Berchem-Sainte-Agathe', 'Bruxelles-Ville', 'Etterbeek', 'Evere',
            'Forest', 'Ganshoren', 'Ixelles', 'Jette', 'Koekelberg',
            'Saint-Gilles', 'Saint-Josse-ten-Noode', 'Uccle', 'Watermael-Boitsfort',
            'Woluwe-Saint-Lambert', 'Woluwe-Saint-Pierre'
        ];

        const storeSlugMap = {
            fr: 'magasins',
            nl: 'winkels',
            en: 'stores',
            tr: 'magazalar'
        };

        brusselsCommunes.forEach(commune => {
            const citySlug = commune.toLowerCase().replace(/\s+/g, '-');
            const storePath = storeSlugMap[lang as keyof typeof storeSlugMap] || 'stores';

            sitemap.push({
                url: `${BASE_URL}/${lang}/${storePath}?city=${citySlug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8, // Slightly lower than physical stores
            });
        });
    });

    // 2. Services
    SERVICES.forEach(service => {
        if (service.id === 'products') return; // Skip product category here, handled above or in individual products

        languages.forEach(lang => {
            const serviceSlug = service.slugs[lang as keyof typeof service.slugs];

            // Level 1: Service Home (e.g., /fr/reparation)
            sitemap.push({
                url: `${BASE_URL}/${lang}/${serviceSlug}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            });

            // Level 2: Service + Location (e.g., /fr/reparation/bruxelles)
            LOCATIONS.forEach(location => {
                const locationSlug = location.slugs[lang as keyof typeof location.slugs];
                sitemap.push({
                    url: `${BASE_URL}/${lang}/${serviceSlug}/${locationSlug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.85,
                });
            });

            // Level 3: Service + Brand (Deduplicated)
            // Flatten brands to unique list to prevent duplicate URLs (e.g. Apple appearing in phone & tablet)
            const uniqueBrands = Array.from(new Set(Object.values(DEVICE_BRANDS).flat()));

            uniqueBrands.forEach(brand => {
                const brandSlug = createSlug(brand);

                // Service + Brand (e.g., /fr/reparation/apple)
                sitemap.push({
                    url: `${BASE_URL}/${lang}/${serviceSlug}/${brandSlug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });

                // Service + Brand + Location (e.g., /fr/reparation/apple/bruxelles)
                LOCATIONS.forEach(location => {
                    const locationSlug = location.slugs[lang as keyof typeof location.slugs];
                    sitemap.push({
                        url: `${BASE_URL}/${lang}/${serviceSlug}/${brandSlug}/${locationSlug}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.75,
                    });
                });

                // Level 4: Service + Brand + Model
                // Iterate through ALL categories available for this brand in MODEL_DATA
                const modelsData = MODEL_DATA[brandSlug];
                if (modelsData) {
                    Object.values(modelsData).forEach(categoryModels => {

                        Object.keys(categoryModels).forEach(modelName => {
                            const modelSlug = createSlug(modelName);

                            // Service + Brand + Model (e.g., /fr/reparation/apple/iphone-13)
                            sitemap.push({
                                url: `${BASE_URL}/${lang}/${serviceSlug}/${brandSlug}/${modelSlug}`,
                                lastModified: new Date(),
                                changeFrequency: 'weekly',
                                priority: 0.7,
                            });

                            // Service + Brand + Model + Location (e.g., /fr/reparation/apple/iphone-13/bruxelles)
                            LOCATIONS.forEach(location => {
                                const locationSlug = location.slugs[lang as keyof typeof location.slugs];
                                sitemap.push({
                                    url: `${BASE_URL}/${lang}/${serviceSlug}/${brandSlug}/${modelSlug}/${locationSlug}`,
                                    lastModified: new Date(),
                                    changeFrequency: 'monthly',
                                    priority: 0.6,
                                });
                            });
                        });
                    });
                }
            });
        });
    });

    // 3. Blog
    languages.forEach(lang => {
        sitemap.push({
            url: `${BASE_URL}/${lang}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        });

        MOCK_BLOG_POSTS.forEach(post => {
            sitemap.push({
                url: `${BASE_URL}/${lang}/blog/${post.slugs?.[lang] || post.slug || post.id}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            });
        });
    });

    // 3.5 Individual Products (Refurbished/Sales)
    languages.forEach(lang => {
        const basePath = lang === 'fr' ? 'acheter' : (lang === 'nl' ? 'kopen' : (lang === 'tr' ? 'urunler' : 'buy'));
        MOCK_PRODUCTS.forEach(product => {
            if (product.slug) {
                sitemap.push({
                    url: `${BASE_URL}/${lang}/${basePath}/${product.category}/${product.slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            }
        });
    });

    // 4. Other Static Pages (Jobs/Feedback - whatever wasn't covered above)
    const staticPages = [
        'feedback', 'jobs' // most are now in specializedServices
    ];

    languages.forEach(lang => {
        staticPages.forEach(page => {
            sitemap.push({
                url: `${BASE_URL}/${lang}/${page}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            });
        });
    });

    return sitemap;
}
