'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../hooks/useLanguage';
import { useData } from '../../hooks/useData';
import { Shop } from '../../types';
import { isShopOpen } from '../../utils/shopUtils';
import { BuildingStorefrontIcon, ArrowRightIcon } from '../ui/BrandIcons';

interface StoresListProps {
    lang: string;
    shops?: Shop[];
    compact?: boolean;
}

const StoresList: React.FC<StoresListProps> = ({ lang, shops: propShops, compact = false }) => {
    const { t } = useLanguage();
    const { shops: contextShops, loading } = useData();
    const shops = propShops || contextShops;

    if (loading && !shops.length) {
        return (
            <div className={compact ? "space-y-4" : "grid grid-cols-1 md:grid-cols-3 gap-8"}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className={`${compact ? 'h-24' : 'h-96'} bg-slate-900/50 rounded-3xl animate-pulse`} />
                ))}
            </div>
        );
    }

    // Filter out shops that might be internal or hidden if needed. 
    // For now, we show all shops from Firestore.
    // We can sort them to put "coming_soon" at the end.
    // Use shops as provided (already sorted by useFirestore priority)
    const sortedShops = [...shops];

    const storePathSegment = {
        fr: 'magasins',
        nl: 'winkels',
        tr: 'magazalar',
        en: 'stores'
    }[lang] || 'stores';

    if (compact) {
        return (
            <div className="space-y-4">
                {sortedShops.map(shop => {
                    const shopSlug = shop.slugs?.[lang] || shop.id;
                    const isOpen = shop.status === 'open' && isShopOpen(shop.openingHours);
                    const isTempClosed = shop.status === 'temporarily_closed';
                    const isSoon = shop.status === 'coming_soon';

                    return (
                        <Link
                            key={shop.id}
                            href={`/${lang}/${storePathSegment}/${shopSlug}`}
                            className="block bg-slate-900/40 p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-white/5 hover:border-bel-blue dark:hover:border-bel-blue group backdrop-blur-md"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-bel-blue transition-colors">
                                        {shop.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {shop.address}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${isOpen
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : isTempClosed
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
                                        : isSoon
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {isOpen ? t('Open Now') : isTempClosed ? t('Temporarily Closed') : isSoon ? t('Coming Soon') : t('Closed')}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center text-xs text-bel-blue font-medium">
                                {t('View Details')}
                                <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sortedShops.map((shop, index) => {
                // Fallback for slugs if missing in old data
                const shopSlug = shop.slugs?.[lang] || shop.id;
                const isOpen = shop.status === 'open' && isShopOpen(shop.openingHours);
                const isTempClosed = shop.status === 'temporarily_closed';
                const isSoon = shop.status === 'coming_soon';

                return (
                    <Link
                        key={shop.id}
                        href={`/${lang}/${storePathSegment}/${shopSlug}`}
                        className="group bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/10"
                    >
                        <div className="h-48 bg-slate-800/50 relative">
                            {/* Placeholder Image - could be replaced with shop.photos[0] if available */}
                            {shop.photos && shop.photos.length > 0 ? (
                                <Image
                                    src={shop.photos[0]}
                                    alt={shop.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={index < 3}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-slate-500 font-bold text-xl">
                                    {shop.name}
                                </div>
                            )}

                            {isSoon && (
                                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                                    {t('Coming Soon')}
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-bel-blue transition-colors">
                                {shop.name}
                            </h2>
                            <p className="text-gray-600 dark:text-slate-300 mb-4">
                                {shop.address}
                                {shop.zip && `, ${shop.zip}`} {shop.city && shop.city}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isOpen
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : isTempClosed
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
                                        : isSoon
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {isOpen ? t('Open Now') : isTempClosed ? t('Temporarily Closed') : isSoon ? t('Coming Soon') : t('Closed')}
                                </span>
                                <span className="text-bel-blue font-semibold flex items-center">
                                    {t('View Details')}
                                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </Link>
                );
            })}

            {/* Service Point CTA Card */}
            <Link
                href={`/${lang}/franchise`}
                className="group relative bg-midnight dark:bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-cyber-citron/20 p-8 flex flex-col items-center justify-center text-center min-h-[384px]"
            >
                <div className="absolute inset-0 bg-linear-to-br from-cyber-citron/10 to-transparent pointer-events-none"></div>

                <div className="w-20 h-20 bg-cyber-citron/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BuildingStorefrontIcon className="w-10 h-10 text-cyber-citron" />
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tighter leading-tight">
                    {t('service_point_slogan')}
                </h2>

                <p className="text-slate-400 font-bold mb-8 max-w-[240px]">
                    Join our network of premium repair experts.
                </p>

                <div className="flex items-center gap-2 text-cyber-citron font-black uppercase tracking-widest text-sm">
                    Learn More <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>

                {/* Visual decoration */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyber-citron/5 rounded-full blur-3xl group-hover:bg-cyber-citron/10 transition-colors"></div>
            </Link>
        </div>
    );
};

export default StoresList;
