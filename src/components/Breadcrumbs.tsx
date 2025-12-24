'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from '../hooks/useLanguage';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';
import { DEVICE_TYPES } from '../constants';
import { DEVICE_BRANDS } from '../data/brands';
import { SEARCH_INDEX } from '../data/search-index';
import { createSlug, slugToDisplayName } from '../utils/slugs';
import { useData } from '../hooks/useData';
import { getLocalizedProduct } from '../utils/localization';
import { Product } from '../types';

const getDisplayName = (slug: string, t: (key: string) => string, products: Product[], language: string) => {
    // 0. Check Dynamic Products (Best for casing like "iPhone")
    const product = products.find(p => p.slug === slug);
    if (product) {
        const { name } = getLocalizedProduct(product, language as 'en' | 'fr' | 'nl');
        return product.brand ? `${product.brand} ${name}` : name;
    }

    // 1. Check Device Types
    const deviceType = DEVICE_TYPES.find(dt => dt.id === slug);
    if (deviceType) return t(deviceType.label);

    // 2. Check Brands
    for (const brands of Object.values(DEVICE_BRANDS)) {
        const brandName = brands.find(b => createSlug(b) === slug);
        if (brandName) return brandName;
    }

    // 3. Check Models (using Search Index - Legacy/Static)
    if (SEARCH_INDEX[slug]) {
        return SEARCH_INDEX[slug].model;
    }

    // 4. Check for exact translation match of the slug (e.g. "track-order")
    const translation = t(slug);
    if (translation && translation !== slug) return translation;

    // 5. Fallback to centralized slug utility (strips SEO suffixes and capitalizes)
    return slugToDisplayName(slug);
};

const Breadcrumbs: React.FC = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { language, t } = useLanguage();
    const { products } = useData();

    const pathnames = pathname.split('/').filter(x => x && !['en', 'fr', 'nl'].includes(x));

    if (pathnames.length === 0 && !pathname.endsWith('/')) { // Only show on sub-pages
        return null;
    }



    return (
        <nav aria-label="Breadcrumb" className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
            <div className="w-full max-w-6xl mx-auto px-6">
                <ol className="flex items-center space-x-2 py-3 text-sm">
                    <li>
                        <Link href={`/${language}`} className="text-gray-500 dark:text-gray-400 hover:text-bel-blue dark:hover:text-blue-400 flex items-center transition-colors">
                            <HomeIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </li>
                    {pathnames.map((name, index) => {
                        let routeTo = `/${language}/${pathnames.slice(0, index + 1).join('/')}`;

                        // Preserve query params (category) for Brand level and deeper
                        if (index >= 1 && searchParams.toString()) {
                            routeTo += `?${searchParams.toString()}`;
                        }

                        const isLast = index === pathnames.length - 1;
                        const displayName = getDisplayName(name, t, products, language);

                        return (
                            <li key={name} className="flex items-center">
                                <ChevronRightIcon className="h-4 w-4 text-gray-400 dark:text-gray-600" aria-hidden="true" />
                                <Link
                                    href={routeTo}
                                    className={`ml-2 font-medium transition-colors ${isLast
                                        ? 'text-gray-700 dark:text-white pointer-events-none'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-bel-blue dark:hover:text-blue-400'
                                        }`}
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {displayName}
                                </Link>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </nav>
    );
};

export default Breadcrumbs;
