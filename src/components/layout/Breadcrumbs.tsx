'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from '../../hooks/useLanguage';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';
import { DEVICE_TYPES } from '../../constants';
import { DEVICE_BRANDS } from '../../data/brands';
import { SEARCH_INDEX } from '../../data/search-index';
import { createSlug, slugToDisplayName } from '../../utils/slugs';
import { useData } from '../../hooks/useData';
import { getLocalizedProduct } from '../../utils/localization';
import { Product } from '../../types';
// SSoT Import
import { STATIC_SLUG_MAPPINGS } from '../../utils/i18n-helpers';
import { SERVICES } from '../../data/services';

// Helper to translate segments utilizing SSoT
const getDisplayName = (slug: string, t: (key: string) => string, products: Product[], language: string) => {
    // 0. Check SERVICES (SSOT for Services)
    const service = SERVICES.find(s => Object.values(s.slugs).includes(slug));
    if (service) {
        return service.name[language as 'en' | 'fr' | 'nl' | 'tr'] || service.name.en;
    }

    // 0.1 Check Static Mappings (Priority for standard routes)
    for (const key in STATIC_SLUG_MAPPINGS) {
        const translations = STATIC_SLUG_MAPPINGS[key];
        const isMatch = Object.values(translations).includes(slug);

        if (isMatch) {
            const canonicalKey = Object.keys(STATIC_SLUG_MAPPINGS).find(k => Object.values(STATIC_SLUG_MAPPINGS[k]).includes(slug));
            if (canonicalKey) {
                const translated = t(canonicalKey);
                if (translated && translated !== canonicalKey) return translated;
            }
        }
    }

    // 1. Check Dynamic Products (Best for casing like "iPhone")
    const product = products.find(p => p.slug === slug);
    if (product) {
        const { name } = getLocalizedProduct(product, language as 'en' | 'fr' | 'nl');
        return product.brand ? `${product.brand} ${name}` : name;
    }

    // 2. Check Device Types
    const deviceType = DEVICE_TYPES.find(dt => dt.id === slug);
    if (deviceType) return t(deviceType.label);

    // 3. Check Brands
    for (const brands of Object.values(DEVICE_BRANDS)) {
        const brandName = brands.find(b => createSlug(b) === slug);
        if (brandName) return brandName;
    }

    // 4. Check Models (using Search Index - Legacy/Static)
    if (SEARCH_INDEX[slug]) {
        return SEARCH_INDEX[slug].model;
    }

    // 5. Check for exact translation match of the slug or its canonical
    const translation = t(slug);
    if (translation && translation !== slug) return translation;

    // 6. Fallback to centralized slug utility (strips SEO suffixes and capitalizes)
    return slugToDisplayName(slug);
};

const Breadcrumbs: React.FC = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { language, t } = useLanguage();
    const { products } = useData();

    // Filter out empty strings and locale prefix
    const pathnames = pathname.split('/').filter(x => x && !['en', 'fr', 'nl', 'tr'].includes(x));

    if (pathnames.length === 0 && !pathname.endsWith('/')) {
        // Only show on sub-pages
        return null;
    }

    // Generate crumbs list for rendering and JSON-LD
    const crumbs: any[] = [];
    let hasShownCategory = false;

    pathnames.forEach((name, index) => {
        const isLast = index === pathnames.length - 1;
        const displayName = getDisplayName(name, t, products, language);
        const slug = name.toLowerCase();

        // Check if this segment is a Category
        const isCategory = DEVICE_TYPES.some(dt =>
            dt.id === slug ||
            createSlug(dt.id) === slug ||
            dt.aliases?.some(alias => alias.toLowerCase() === slug)
        );
        if (isCategory) hasShownCategory = true;

        // --- SMART INJECTION ---
        // If this is NOT a category, but the NEXT segment is a known Brand (and we haven't shown category yet),
        // we might want to inject the category now for better context.
        // OR: If THIS is a brand, and we haven't shown a category, inject it BEFORE the brand.
        if (!isCategory && !hasShownCategory && index >= 1) {
            let autoCat: string | null = null;

            // 1. Try to infer category from the NEXT segment (Model) if available
            // This prevents "iPad" (Tablet) being labeled as "Smartphone" just because Apple makes both.
            if (index + 1 < pathnames.length) {
                const nextSlug = pathnames[index + 1].toLowerCase();
                if (SEARCH_INDEX[nextSlug] && SEARCH_INDEX[nextSlug].category) {
                    autoCat = SEARCH_INDEX[nextSlug].category;
                }
            }

            // 2. Fallback: Check if this is a brand and use default category
            if (!autoCat) {
                for (const [catId, brands] of Object.entries(DEVICE_BRANDS)) {
                    if ((brands as string[]).some(b => createSlug(b) === slug)) {
                        autoCat = catId;
                        break;
                    }
                }
            }

            if (autoCat) {
                const catType = DEVICE_TYPES.find(dt => dt.id === autoCat);
                if (catType) {
                    const serviceUrl = `/${language}/${pathnames[0]}`; // The service level (e.g. /rachat)
                    crumbs.push({
                        name: t(catType.label),
                        url: `${serviceUrl}?category=${autoCat}`,
                        isLast: false,
                        isVirtual: true
                    });
                    hasShownCategory = true;
                }
            }
        }

        let routeTo = `/${language}/${pathnames.slice(0, index + 1).join('/')}`;

        // Preserve query params (category, etc) for ALL levels to maintain wizard context
        if (searchParams.toString()) {
            routeTo += `?${searchParams.toString()}`;
        }

        crumbs.push({
            name: displayName,
            url: routeTo,
            isLast
        });
    });

    // Determine Base URL (Fixed for Consistency & Hydration Match)
    const baseUrl = 'https://belmobile.be';

    // JSON-LD Construction
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": t('Home') || "Home",
                "item": `${baseUrl}/${language}`
            },
            ...crumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 2,
                "name": crumb.name,
                "item": `${baseUrl}${crumb.url.split('?')[0]}` // Strip query params for canonical ID usually
            }))
        ]
    };

    return (
        <nav aria-label="Breadcrumb" className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
            {/* JSON-LD Injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="w-full max-w-6xl mx-auto px-6">
                <ol className="flex items-center space-x-2 py-3 text-sm overflow-x-auto whitespace-nowrap no-scrollbar">
                    <li className="shrink-0">
                        <Link href={`/${language}`} className="text-gray-500 dark:text-gray-400 hover:text-bel-blue dark:hover:text-blue-400 flex items-center transition-colors">
                            <HomeIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </li>
                    {crumbs.map((crumb) => (
                        <li key={crumb.url} className="flex items-center shrink-0">
                            <ChevronRightIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" aria-hidden="true" />
                            <Link
                                href={crumb.url}
                                className={`ml-2 font-medium transition-colors ${crumb.isLast
                                    ? 'text-gray-700 dark:text-white pointer-events-none'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-bel-blue dark:hover:text-blue-400'
                                    }`}
                                aria-current={crumb.isLast ? 'page' : undefined}
                            >
                                {crumb.name}
                            </Link>
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    );
};

export default Breadcrumbs;
