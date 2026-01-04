import { MetadataRoute } from 'next';
import { SERVICES } from '../data/services';
import { LOCATIONS } from '../data/locations';
import { createSlug } from '../utils/slugs';
import { MOCK_BLOG_POSTS, MOCK_PRODUCTS } from '../constants';
import { getAllDevices } from '../services/server/pricing.dal';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
            // @ts-ignore
            const slug = service.slugs[lang];
            if (slug) {
                sitemap.push({
                    url: `${BASE_URL}/${lang}/${slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.85,
                });
            }
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
            // @ts-ignore
            const storePath = storeSlugMap[lang] || 'stores';

            sitemap.push({
                url: `${BASE_URL}/${lang}/${storePath}?city=${citySlug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        });
    });

    // 2. DYNAMIC DEVICES (SSOT FROM DB)
    const allDeviceIds = await getAllDevices(); // e.g. ['apple-iphone-13', 'samsung-galaxy-s21', ...]

    // Filter services to just Repair and Buyback for device pages
    const activeServices = SERVICES.filter(s => s.id === 'repair' || s.id === 'buyback');

    for (const service of activeServices) {
        if (service.id === 'products') continue;

        for (const lang of languages) {
            // @ts-ignore
            const serviceSlug = service.slugs[lang];

            // A. Service Home (e.g., /fr/reparation)
            sitemap.push({
                url: `${BASE_URL}/${lang}/${serviceSlug}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            });

            // B. Device Pages
            for (const deviceId of allDeviceIds) {
                // Parse ID: 'apple-iphone-13' -> brand='apple', model='iphone-13'
                const parts = deviceId.split('-');
                if (parts.length < 2) continue;
                const brand = parts[0];
                const model = parts.slice(1).join('-');

                // deviceSlug is the model (e.g. 'iphone-13')
                // URL: /fr/reparation/apple/iphone-13

                const url = `${BASE_URL}/${lang}/${serviceSlug}/${brand}/${model}`;

                sitemap.push({
                    url: url.toLowerCase(),
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.75,
                });

                // C. Location Pages per Device (High value SEO)
                // /fr/reparation/apple/iphone-13/schaerbeek
                for (const location of LOCATIONS) {
                    // @ts-ignore
                    const locationSlug = location.slugs[lang];
                    sitemap.push({
                        url: `${url}/${locationSlug}`.toLowerCase(),
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.65,
                    });
                }
            }
        }
    }

    // 3. Blog
    languages.forEach(lang => {
        sitemap.push({
            url: `${BASE_URL}/${lang}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        });

        MOCK_BLOG_POSTS.forEach(post => {
            // @ts-ignore
            const slug = post.slugs?.[lang] || post.slug || post.id;
            sitemap.push({
                url: `${BASE_URL}/${lang}/blog/${slug}`,
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

    // 4. Other Static Pages
    const staticPages = ['feedback', 'jobs'];
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
