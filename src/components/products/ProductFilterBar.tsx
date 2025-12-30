'use client';

import React from 'react';
import { Shop } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { MagnifyingGlassIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { SortOption } from '@/hooks/useProductFilters';

interface ProductFilterBarProps {
    searchTerm: string;
    selectedCategory: string;
    sortOption: SortOption;
    selectedShop: Shop | null;
    activeShops: Shop[];
    onSearchChange: (val: string) => void;
    onCategoryChange: (val: string) => void;
    onSortChange: (val: SortOption) => void;
    onShopChange: (shop: Shop | null) => void;
}

const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
    searchTerm,
    selectedCategory,
    sortOption,
    selectedShop,
    activeShops,
    onSearchChange,
    onCategoryChange,
    onSortChange,
    onShopChange
}) => {
    const { t } = useLanguage();
    const categories = ['cat_all', 'cat_smartphone', 'cat_tablet', 'cat_computer', 'cat_console', 'cat_smartwatch', 'cat_accessories'];

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl shadow-lg border-b border-white/10 sticky top-0 z-30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{t('Our Products')}</h1>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Shop Selector Tabs */}
                        <div className="flex overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar space-x-2">
                            <button
                                onClick={() => onShopChange(null)}
                                className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 border ${!selectedShop
                                    ? 'bg-bel-blue text-white border-bel-blue shadow-md'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-bel-blue'
                                    }`}
                            >
                                {t('All Shops')}
                            </button>
                            {activeShops.map((shop: Shop) => (
                                <button
                                    key={shop.id}
                                    onClick={() => onShopChange(shop)}
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
                                    onChange={(e) => onSearchChange(e.target.value)}
                                />
                            </div>
                            <div className="relative shrink-0">
                                <select
                                    value={sortOption}
                                    onChange={(e) => onSortChange(e.target.value as SortOption)}
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
                                    onClick={() => onCategoryChange(categoryKey)}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 shrink-0 border ${selectedCategory === categoryKey
                                        ? 'bg-white text-slate-900 border-white shadow-lg'
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
    );
};

export default ProductFilterBar;
