'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '../ProductCard';
import ProductCardSkeleton from '../ProductCardSkeleton';
import { Product } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ProductGridProps {
    products: Product[];
    loading: boolean;
    onClearFilters: () => void;
}

const ITEMS_PER_PAGE = 12;

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, onClearFilters }) => {
    const { t } = useLanguage();
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // Reset pagination when filter results change (products array reference changes)
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [products]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    };

    const visibleProducts = products.slice(0, visibleCount);
    const hasMore = visibleCount < products.length;

    if (loading && products.length === 0) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-20 animate-fade-in-up">
                <div className="bg-white dark:bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 dark:border-slate-700">
                    <MagnifyingGlassIcon className="h-10 w-10 text-gray-300 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('No products found')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">{t('Try adjusting your search filters or shop selection.')}</p>
                <button
                    onClick={onClearFilters}
                    className="text-bel-blue dark:text-blue-400 font-bold hover:underline transition-all"
                >
                    {t('Clear all filters')}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {visibleProducts.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        priority={index < 4} // Priority for top 4 items
                    />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleLoadMore}
                        className="group relative px-8 py-3 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-700 dark:text-white shadow-sm hover:shadow-md hover:border-bel-blue dark:hover:border-blue-500 transition-all active:scale-95"
                    >
                        {t('Load More')} ({products.length - visibleCount} {t('remaining')})
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
