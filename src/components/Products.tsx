'use client';

import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { useData } from '../hooks/useData';
import { useShop } from '../hooks/useShop';
import { useLanguage } from '../hooks/useLanguage';
import { MagnifyingGlassIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { useParams } from 'next/navigation';



const Products: React.FC = () => {
    const { products, shops } = useData();
    const { t } = useLanguage();
    const { selectedShop, setSelectedShop } = useShop();
    const [searchTerm, setSearchTerm] = useState('');
    const categories = ['cat_all', 'cat_smartphone', 'cat_tablet', 'cat_computer', 'cat_console', 'cat_smartwatch', 'cat_accessories'];
    const [selectedCategory, setSelectedCategory] = useState('cat_all');
    const [sortOption, setSortOption] = useState<'default' | 'priceAsc' | 'priceDesc'>('default');

    const params = useParams();
    const slug = params.slug as string[] | undefined;

    const deviceName = slug && slug.length > 0
        ? `${slug[0].charAt(0).toUpperCase() + slug[0].slice(1)} ${slug.slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}`
        : 'Smartphone';
    console.log("Device Name for meta:", deviceName);

    // Active shops (open only)
    const activeShops = shops.filter(s => s.status === 'open');

    const filteredProducts = useMemo(() => {
        const result = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase());

            // Map translation keys back to internal category identifiers
            const categoryKeywords: { [key: string]: string } = {
                'cat_all': '',
                'cat_smartphone': 'smartphone',
                'cat_tablet': 'tablet',
                'cat_computer': 'computer',
                'cat_console': 'console',
                'cat_smartwatch': 'smartwatch',
                'cat_accessories': 'accessories'
            };

            const targetCategory = categoryKeywords[selectedCategory];

            const matchesCategory = selectedCategory === 'cat_all' ||
                (product.category && product.category === targetCategory);

            // Shop Availability Filter
            let matchesShop = true;
            if (selectedShop) {
                const stock = product.availability?.[selectedShop.id.toString()] || 0;
                matchesShop = stock > 0;
            }

            return matchesSearch && matchesCategory && matchesShop;
        });

        if (sortOption === 'priceAsc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'priceDesc') {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [products, searchTerm, selectedCategory, sortOption, selectedShop]);

    return (
        <div className="min-h-screen bg-transparent pb-20 transition-colors duration-300">
            {/* Header & Controls */}
            <div className="bg-slate-900/60 backdrop-blur-xl shadow-lg border-b border-white/10 sticky top-0 z-30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-bel-dark dark:text-white tracking-tight">{t('Our Products')}</h1>
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-transparent dark:border-slate-700">{t('items_count', filteredProducts.length)}</span>
                        </div>

                        {/* Mobile: Search & Categories Stack */}
                        <div className="flex flex-col gap-4">

                            {/* Shop Selector Tabs */}
                            <div className="flex overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar space-x-2">
                                <button
                                    onClick={() => setSelectedShop(null)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 border ${!selectedShop
                                        ? 'bg-bel-blue text-white border-bel-blue shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-bel-blue'
                                        }`}
                                >
                                    {t('All Shops')}
                                </button>
                                {activeShops.map(shop => (
                                    <button
                                        key={shop.id}
                                        onClick={() => setSelectedShop(shop)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 border ${selectedShop?.id === shop.id
                                            ? 'bg-bel-blue text-white border-bel-blue shadow-md'
                                            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-bel-blue'
                                            }`}
                                    >
                                        {shop.name}
                                    </button>
                                ))}
                            </div>

                            {/* Search & Sort Row */}
                            <div className="flex gap-3">
                                <div className="relative grow">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-3 border border-white/10 bg-slate-900/50 text-white rounded-xl text-sm focus:ring-2 focus:ring-bel-blue focus:bg-slate-800 transition-all placeholder-gray-400"
                                        placeholder={t('Search...')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="relative shrink-0">
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value as 'default' | 'priceAsc' | 'priceDesc')}
                                        className="appearance-none block w-full pl-3 pr-8 py-3 border border-white/10 bg-slate-900/50 text-white rounded-xl text-sm focus:ring-2 focus:ring-bel-blue focus:bg-slate-800 cursor-pointer font-medium"
                                    >
                                        <option value="default">{t('sort_featured')}</option>
                                        <option value="priceAsc">{t('sort_low_high')}</option>
                                        <option value="priceDesc">{t('sort_high_low')}</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <ArrowsUpDownIcon className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Horizontal Scrollable Categories */}
                            <div className="flex overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar space-x-2 sm:space-x-3">
                                {categories.map(categoryKey => (
                                    <button
                                        key={categoryKey}
                                        onClick={() => setSelectedCategory(categoryKey)}
                                        className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 shrink-0 border ${selectedCategory === categoryKey
                                            ? 'bg-bel-dark dark:bg-white text-white dark:text-slate-900 border-bel-dark dark:border-white shadow-lg'
                                            : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {t(categoryKey)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-white dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <MagnifyingGlassIcon className="h-10 w-10 text-gray-300 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('No products found')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('Try adjusting your search filters or shop selection.')}</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('cat_all'); setSelectedShop(null); }}
                            className="text-bel-blue dark:text-blue-400 font-bold hover:underline"
                        >
                            {t('Clear all filters')}
                        </button>
                    </div>
                )}
            </div>


        </div>
    );
};

export default Products;
