'use client';

import React from 'react';
import { useReviews } from '../../hooks/useReviews';
import { useLanguage } from '../../hooks/useLanguage';
import { StarIcon, ShieldCheckIcon } from '../ui/BrandIcons';

export const TrustBar: React.FC = () => {
    const { stats, loading } = useReviews();
    const { t } = useLanguage();

    if (loading) return (
        <div className="h-[68px] sm:h-[60px] w-full animate-pulse bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800" />
    );

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-5 w-5 text-yellow-400 drop-shadow-sm" />
                    ))}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                        {stats.rating}/5 {t('based_on_reviews')}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {t('google_verified')} • {stats.count.toLocaleString()}+ {t('success_stories')}
                    </span>
                </div>
            </div>

            <div className="h-8 w-px bg-blue-200 dark:bg-blue-800/50 hidden sm:block"></div>

            <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {t('warranty_included')}
                </span>
            </div>
        </div>
    );
};
