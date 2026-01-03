'use client';

import React from 'react';
import { useReviews } from '../../hooks/useReviews';
import { useLanguage } from '../../hooks/useLanguage';
import { StarIcon, ShieldCheckIcon } from '../ui/BrandIcons';

interface TrustBarProps {
    type?: 'buyback' | 'repair';
}

export const TrustBar: React.FC<TrustBarProps> = ({ type = 'repair' }) => {
    const { stats, loading } = useReviews();
    const { t } = useLanguage();
    const isBuyback = type === 'buyback';

    if (loading) return (
        <div className="h-[72px] w-full animate-pulse bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800" />
    );

    return (
        <div className={`relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl shadow-sm dark:shadow-none backdrop-blur-md animate-fade-in group ${isBuyback
            ? 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10 dark:border-yellow-500/20'
            : 'border-blue-100 dark:border-white/5 bg-white dark:bg-slate-800/50'
            }`}>
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-linear-to-r opacity-50 group-hover:opacity-100 transition-opacity duration-500 ${isBuyback
                ? 'from-yellow-50/50 via-amber-50/50 to-orange-50/50 dark:from-yellow-500/5 dark:via-amber-500/5 dark:to-orange-500/5'
                : 'from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-500/5 dark:via-indigo-500/5 dark:to-purple-500/5'
                }`} />

            <div className="relative flex items-center gap-4 z-10 w-full sm:w-auto justify-center sm:justify-start">
                <div className="flex -space-x-1 shrink-0">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-yellow-400 rounded-md p-1 shadow-sm transform -rotate-6 first:rotate-0 last:rotate-6">
                            <StarIcon className="h-4 w-4 text-white" />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-base font-black text-gray-900 dark:text-white leading-none">
                            4.9/5 {t('Excellent')}
                        </span>
                        <img
                            src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
                            alt="Google"
                            className="h-3.5 object-contain opacity-80"
                        />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-0.5">
                        {t('based_on_reviews')} • {stats.count.toLocaleString()}+ {t('happy_clients')}
                    </span>
                </div>
            </div>

            <div className="h-px w-full sm:w-px sm:h-10 bg-gray-200 dark:bg-white/10 shrink-0" />

            <div className={`relative z-10 flex items-center gap-3 px-4 py-2 rounded-xl border w-full sm:w-auto justify-center ${isBuyback
                ? 'bg-yellow-100/50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20'
                : 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20'
                }`}>
                <div className={`p-1 rounded-full shrink-0 ${isBuyback ? 'bg-yellow-500' : 'bg-green-500'}`}>
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex flex-col">
                    <span className={`text-xs font-black uppercase tracking-wide leading-none mb-0.5 ${isBuyback ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400'}`}>
                        {isBuyback ? t('Best Price') : t('Warranty')}
                    </span>
                    <span className={`text-[10px] font-medium leading-none ${isBuyback ? 'text-yellow-600/80 dark:text-yellow-500/80' : 'text-green-600/80 dark:text-green-500/80'}`}>
                        {isBuyback ? t('Guaranteed') : `1 ${t('Year Included')}`}
                    </span>
                </div>
            </div>
        </div>
    );
};
