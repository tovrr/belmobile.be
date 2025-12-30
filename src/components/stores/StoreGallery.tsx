'use client';

import React, { useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface StoreGalleryProps {
    isHub: boolean;
}

const StoreGallery: React.FC<StoreGalleryProps> = ({ isHub }) => {
    const { t } = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (isHub) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth / 2;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="mt-16 pt-10 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('shop_images')}</h2>
                {/* Desktop Navigation Arrows */}
                <div className="hidden md:flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-sm"
                        aria-label="Previous image"
                    >
                        <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all shadow-sm"
                        aria-label="Next image"
                    >
                        <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory md:grid md:grid-cols-4 md:gap-6 md:pb-0 md:overflow-visible transition-all"
            >
                {[1, 2, 3, 4].map((index) => (
                    <div key={index} className="min-w-[260px] md:min-w-0 w-[85%] md:w-auto shrink-0 snap-center relative h-48 md:h-64 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800/50 border-2 border-dashed border-gray-200 dark:border-white/5 flex flex-col items-center justify-center group">
                        <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('Coming Soon')}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoreGallery;
