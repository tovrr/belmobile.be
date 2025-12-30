'use client';

import React, { useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface StoreReviewsProps {
    rating: number;
    reviewCount: number;
    googleMapUrl?: string;
}

const StoreReviews: React.FC<StoreReviewsProps> = ({ rating, reviewCount, googleMapUrl }) => {
    const { t, language } = useLanguage();
    const lang = language;
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const reviews = [
        { name: 'Thomas D.', text: lang === 'fr' ? 'Service ultra rapide !' : lang === 'nl' ? 'Supersnelle service!' : 'Super fast service!', rating: 5 },
        { name: 'Sarah L.', text: lang === 'fr' ? 'Accueil au top.' : lang === 'nl' ? 'Geweldige ontvangst.' : 'Great welcome.', rating: 5 },
        { name: 'Mehdi K.', text: lang === 'fr' ? 'Réparation en 30 min.' : lang === 'nl' ? 'Reparatie in 30 min.' : 'Repair in 30 min.', rating: 5 },
        { name: 'Julie M.', text: lang === 'fr' ? 'Je recommande.' : lang === 'nl' ? 'Ik raad het aan.' : 'Highly recommend.', rating: 5 },
    ];

    return (
        <div className="bg-slate-800/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 dark:border-white/5 relative group/card">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-3xl text-gray-900 dark:text-white">{t('shop_reviews_title')}</h3>
                <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <button
                        onClick={() => scroll('left')}
                        className="w-9 h-9 rounded-full bg-white/50 hover:bg-white dark:bg-slate-700/50 dark:hover:bg-slate-600 flex items-center justify-center transition-all shadow-sm"
                        aria-label="Previous review"
                    >
                        <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-9 h-9 rounded-full bg-white/50 hover:bg-white dark:bg-slate-700/50 dark:hover:bg-slate-600 flex items-center justify-center transition-all shadow-sm"
                        aria-label="Next review"
                    >
                        <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex w-full overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide mb-6 transition-all"
            >
                {reviews.map((r, i) => (
                    <div key={i} className="min-w-full w-full snap-center bg-white dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col justify-between shadow-sm">
                        <div className="flex text-yellow-400 text-xs mb-1">★★★★★</div>
                        <p className="text-xs text-gray-600 dark:text-slate-300 italic mb-2 line-clamp-3">"{r.text}"</p>
                        <div className="flex items-center gap-1.5 mt-auto">
                            <div className="w-5 h-5 rounded-full bg-bel-blue/10 text-bel-blue flex items-center justify-center text-[8px] font-bold">
                                {r.name.charAt(0)}
                            </div>
                            <span className="text-[10px] font-bold text-gray-900 dark:text-white truncate">{r.name}</span>
                        </div>
                    </div>
                ))}
            </div>

            <a
                href={googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
                <svg className="w-5 h-5 text-bel-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                {t('write_review')}
            </a>
        </div>
    );
};

export default StoreReviews;
