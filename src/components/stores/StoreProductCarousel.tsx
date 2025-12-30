'use client';

import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useLanguage } from '../../hooks/useLanguage';
import ProductCard from '../ProductCard';
import ProductCardSkeleton from '../ProductCardSkeleton';

interface StoreProductCarouselProps {
    shopId: string | number;
    viewAllLink?: string;
    showHeaderLink?: boolean;
}

const StoreProductCarousel: React.FC<StoreProductCarouselProps> = ({ shopId, viewAllLink, showHeaderLink = true }) => {
    const { products, loadingProducts } = useInventory();
    const { t } = useLanguage();

    // Filter products available at this shop
    const availableProducts = products.filter(product =>
        product.availability && product.availability[shopId] > 0
    );

    if (loadingProducts) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-64 bg-slate-800/50 rounded-xl animate-pulse" />
                    <div className="h-8 w-24 bg-slate-800/50 rounded-xl animate-pulse" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[280px] w-[280px] shrink-0">
                            <ProductCardSkeleton />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth / 2;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (availableProducts.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t('available_products') || 'Shop Deals'}
                    </h2>
                    {/* Navigation Arrows */}
                    <div className="hidden sm:flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-sm"
                            aria-label="Previous products"
                        >
                            <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-sm"
                            aria-label="Next products"
                        >
                            <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
                {viewAllLink && showHeaderLink && (
                    <a
                        href={viewAllLink}
                        className="group flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        {t('view_all_shop_products') || 'View all products'}
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                )}
            </div>

            <div className="relative group">
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
                    {availableProducts.map((product) => (
                        <div key={product.id} className="min-w-[280px] w-[280px] shrink-0 snap-start">
                            <ProductCard product={product} />
                        </div>
                    ))}
                    {viewAllLink && (
                        <div className="min-w-[100px] sm:min-w-[150px] shrink-0 flex items-center justify-center snap-start">
                            <a
                                href={viewAllLink}
                                className="flex flex-col items-center gap-2 text-gray-400 hover:text-bel-blue transition-colors group/more"
                            >
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-700 group-hover/more:border-bel-blue flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">{t('View All')}</span>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreProductCarousel;
