'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Only used for linking, not hook logic
import { ArrowRightIcon } from '@heroicons/react/24/outline';

import { Product, Shop } from '../types';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';
import { useProductFilters } from '../hooks/useProductFilters';

import ProductFilterBar from './products/ProductFilterBar';
import ProductGrid from './products/ProductGrid';

interface ProductsProps {
    lang: string;
    initialProducts?: Product[];
    searchParams?: { [key: string]: string | string[] | undefined };
}

const Products: React.FC<ProductsProps> = ({ lang, initialProducts = [], searchParams = {} }) => {
    const { t } = useLanguage();

    const { products: liveProducts, shops, loadingProducts } = useData() as {
        products: Product[],
        shops: Shop[],
        loadingProducts: boolean
    };

    const products = liveProducts.length > 0 ? liveProducts : initialProducts;
    const activeShops = (shops || []).filter(s => s.status === 'open');

    // Use Custom Hook for Logic
    const {
        searchTerm,
        selectedCategory,
        sortOption,
        selectedShop,
        filteredProducts,
        setSearchTerm,
        setSelectedCategory,
        setSortOption,
        setSelectedShop,
        clearFilters
    } = useProductFilters({ products, searchParams });

    return (
        <div className="min-h-screen bg-transparent pb-20 transition-colors duration-300">
            {/* Filter Bar */}
            <ProductFilterBar
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                sortOption={sortOption}
                selectedShop={selectedShop}
                activeShops={activeShops}
                onSearchChange={setSearchTerm}
                onCategoryChange={setSelectedCategory}
                onSortChange={setSortOption}
                onShopChange={setSelectedShop}
            />

            {/* Product Grid */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProductGrid
                    products={filteredProducts}
                    loading={loadingProducts}
                    onClearFilters={clearFilters}
                />
            </div>

            {/* Internal Linking / CTA Section */}
            <div className="container mx-auto px-4 py-12 border-t border-slate-200 dark:border-slate-800 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                        href={`/${lang}/buyback`}
                        className="group relative overflow-hidden rounded-ui-lg bg-slate-900 dark:bg-slate-800 p-8 flex flex-col justify-center min-h-[200px]"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-electric-indigo/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-electric-indigo/30 transition-all"></div>
                        <div className="relative z-10">
                            <span className="text-electric-indigo font-bold uppercase tracking-wider text-xs mb-2 block">{t('Trade-in')}</span>
                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-electric-indigo transition-colors flex items-center gap-2">
                                {t('Sell Your Old Device')}
                                <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </h3>
                            <p className="text-slate-400 max-w-md">{t('Get the best price for your current smartphone and upgrade for less.')}</p>
                        </div>
                    </Link>

                    <Link
                        href={`/${lang}/repair`}
                        className="group relative overflow-hidden rounded-ui-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 flex flex-col justify-center min-h-[200px] hover:border-bel-blue/50 transition-all shadow-sm hover:shadow-lg"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-bel-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-bel-blue/20 transition-all"></div>
                        <div className="relative z-10">
                            <span className="text-bel-blue font-bold uppercase tracking-wider text-xs mb-2 block">{t('Repair Service')}</span>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-bel-blue transition-colors flex items-center gap-2">
                                {t('Broken Device?')}
                                <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md">{t('Don\'t need a new one? We can fix your current device in 30 minutes.')}</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Products;
