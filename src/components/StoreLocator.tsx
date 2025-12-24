'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Shop } from '../types';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';
import Link from 'next/link';
import {
    MapPinIcon,
    PhoneIcon,
    ClockIcon,
    BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import SchemaOrg from '../components/seo/SchemaOrg';
import dynamic from 'next/dynamic';
import { isShopOpen } from '../utils/shopUtils';

const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

// Helper to translate hours string
const translateHours = (hours: string, t: (key: string) => string): string => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let translated = hours;

    // Translate days
    days.forEach(day => {
        const regex = new RegExp(`\\b${day}\\b`, 'g');
        translated = translated.replace(regex, t(day));
    });

    // Translate "Closed"
    translated = translated.replace(/\bClosed\b/g, t('Closed'));

    return translated;
};

interface StoreLocatorProps {
    shops?: Shop[];
    className?: string;
    zoom?: number;
}

const StoreLocator: React.FC<StoreLocatorProps> = ({ shops: propShops, className }) => {
    const { shops: contextShops, loadingShops } = useData();
    const shops = propShops || contextShops;
    const { t, language } = useLanguage();
    const [selectedShopId, setSelectedShopId] = useState<number | string | null>(null);
    const [filter, setFilter] = useState<'all' | 'open'>('all');
    const [hoveredShopId, setHoveredShopId] = useState<number | string | null>(null);

    const [expandedHoursId, setExpandedHoursId] = useState<number | string | null>(null);

    // Refs for scrolling to cards
    const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const listContainerRef = useRef<HTMLDivElement>(null);

    const mapCenter: [number, number] = [50.8503, 4.3517]; // Brussels Center

    // Filter logic
    const filteredShops = useMemo(() => {
        if (filter === 'open') {
            return shops.filter(s => s.status === 'open' && isShopOpen(s.openingHours));
        }
        return shops;
    }, [shops, filter]);

    // Scroll to card when selected via map
    useEffect(() => {
        if (selectedShopId && cardRefs.current[selectedShopId]) {
            cardRefs.current[selectedShopId]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    }, [selectedShopId]);

    const handleShopClick = (id: number | string) => {
        setSelectedShopId(id);
    };

    const toggleHours = (e: React.MouseEvent, id: number | string) => {
        e.stopPropagation();
        setExpandedHoursId(expandedHoursId === id ? null : id);
    };

    return (
        <div className={`flex flex-col-reverse lg:flex-row bg-gray-50 dark:bg-deep-space overflow-hidden ${className || 'h-[calc(100vh-64px)]'}`}>
            <SchemaOrg shops={shops} language={language} />

            {/* LEFT SIDE: LIST */}
            <div
                ref={listContainerRef}
                className="w-full lg:w-[450px] xl:w-[500px] flex flex-col border-r border-gray-200 dark:border-white/5 bg-white dark:bg-deep-space z-10 shadow-xl lg:shadow-none h-[50vh] lg:h-full"
            >
                {/* Header & Filters */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-deep-space sticky top-0 z-20">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-extrabold text-bel-dark dark:text-white tracking-tight">{t('Our Stores')}</h1>
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-md text-gray-500 dark:text-gray-400">
                            {t('locations_count', filteredShops.length)}
                        </span>
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${filter === 'all'
                                ? 'bg-white dark:bg-slate-700 text-bel-dark dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            {t('Show All')}
                        </button>
                        <button
                            onClick={() => setFilter('open')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${filter === 'open'
                                ? 'bg-white dark:bg-slate-700 text-bel-blue dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            {t('Open Now')}
                        </button>
                    </div>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                    {loadingShops ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-8 h-8 border-2 border-bel-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('Loading stores...')}</p>
                            <p className="text-xs text-gray-400 mt-2">If this takes too long, please check your connection.</p>
                        </div>
                    ) : shops.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('No stores found.')}</p>
                            <p className="text-xs text-gray-400 mt-2">Please try seeding the database from Admin.</p>
                        </div>
                    ) : filteredShops.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('No stores found matching your filter.')}</p>
                        </div>
                    ) : (
                        filteredShops.map(shop => {
                            const isOpen = shop.status === 'open' ? isShopOpen(shop.openingHours) : false;
                            const isSelected = selectedShopId === shop.id;
                            const isComingSoon = shop.status === 'coming_soon';
                            const isHoursExpanded = expandedHoursId === shop.id;

                            return (
                                <div
                                    key={shop.id}
                                    ref={el => { cardRefs.current[shop.id] = el; }}
                                    onClick={() => handleShopClick(shop.id)}
                                    onMouseEnter={() => setHoveredShopId(shop.id)}
                                    onMouseLeave={() => setHoveredShopId(null)}
                                    className={`
                                    group relative rounded-2xl p-5 transition-all duration-300 cursor-pointer
                                    ${isComingSoon
                                            ? 'border-2 border-dashed border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/30'
                                            : 'border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md hover:-translate-y-0.5'
                                        }
                                    ${isSelected && !isComingSoon ? 'ring-2 ring-bel-blue ring-offset-2 dark:ring-offset-slate-900 shadow-lg' : ''}
                                `}
                                >
                                    {/* Content */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`text-lg font-bold ${isComingSoon ? 'text-gray-500 dark:text-gray-400' : 'text-bel-dark dark:text-white'}`}>
                                                {shop.name}
                                            </h3>

                                            {/* Status Badge */}
                                            <div className="flex flex-col mt-1 mb-3">
                                                {isComingSoon ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 self-start shadow-sm">
                                                        {t('Coming Soon')}
                                                    </span>
                                                ) : shop.status === 'temporarily_closed' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 self-start shadow-sm">
                                                        {t('Temporarily Closed')}
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-sm ${isOpen ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'} self-start`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                        {isOpen ? t('Open Now') : t('Closed')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Icon */}
                                        <div className={`
                                        p-2 rounded-full transition-colors 
                                        ${isSelected ? 'bg-bel-blue text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 group-hover:text-bel-blue'}
                                    `}>
                                            <MapPinIcon className="h-5 w-5" />
                                        </div>
                                    </div>

                                    {isComingSoon ? (
                                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-slate-700">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                {t('We are expanding to')} {shop.name.replace('Belmobile ', '')}. {t('Be the first to own a franchise in this prime location.')}
                                            </p>
                                            <Link
                                                href={`/${language}/franchise`}
                                                className="flex items-center justify-center w-full py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-bel-dark dark:text-white font-bold text-sm hover:bg-bel-yellow hover:border-bel-yellow hover:text-bel-dark transition-colors"
                                            >
                                                <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
                                                {t('Apply for Franchise')}
                                            </Link>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2 mb-5">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                                                    <MapPinIcon className="h-4 w-4 mr-2 shrink-0 mt-0.5 text-gray-400" />
                                                    {shop.address}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                                    <PhoneIcon className="h-4 w-4 mr-2 shrink-0 text-gray-400" />
                                                    {shop.phone}
                                                </p>
                                                <div className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                                                    <ClockIcon className="h-4 w-4 mr-2 shrink-0 mt-0.5 text-gray-400" />
                                                    <div className="flex-1">
                                                        <div
                                                            className="flex justify-between items-start group/hours cursor-pointer"
                                                            onClick={(e) => toggleHours(e, shop.id)}
                                                        >
                                                            <span className="whitespace-pre-line">
                                                                <span className="font-medium text-gray-700 dark:text-gray-200 mr-1">{t('Today')}:</span>
                                                                {(() => {
                                                                    const today = new Intl.DateTimeFormat('en-US', {
                                                                        timeZone: 'Europe/Brussels',
                                                                        weekday: 'short'
                                                                    }).format(new Date());

                                                                    let lines: string[] = [];
                                                                    if (shop.openingHours && Array.isArray(shop.openingHours)) {
                                                                        lines = shop.openingHours;
                                                                    }

                                                                    if (lines.length === 0) return t('Hours not available');

                                                                    const todayLine = lines.find(line => line.includes(today));
                                                                    const hoursOnly = todayLine ? todayLine.replace(today + ':', '').trim() : lines[0];
                                                                    return translateHours(hoursOnly, t);
                                                                })()}
                                                            </span>
                                                            <span className="text-xs text-bel-blue dark:text-blue-400 font-medium ml-2 opacity-0 group-hover/hours:opacity-100 transition-opacity">
                                                                {isHoursExpanded ? t('Show less') : t('See all')}
                                                            </span>
                                                        </div>

                                                        {isHoursExpanded && (
                                                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700 text-xs animate-fade-in-up">
                                                                {(() => {
                                                                    let lines: string[] = [];
                                                                    if (shop.openingHours && Array.isArray(shop.openingHours)) {
                                                                        lines = shop.openingHours;
                                                                    }

                                                                    return lines.map((line, i) => {
                                                                        const brusselsDay = new Intl.DateTimeFormat('en-US', {
                                                                            timeZone: 'Europe/Brussels',
                                                                            weekday: 'short'
                                                                        }).format(new Date());

                                                                        return (
                                                                            <div key={i} className={`py-0.5 ${line.includes(brusselsDay) ? 'font-bold text-bel-blue dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                                                                {translateHours(line, t)}
                                                                            </div>
                                                                        );
                                                                    });
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <a
                                                    href={shop.googleMapUrl || `https://www.google.com/maps?q=${shop.coords.lat},${shop.coords.lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 flex items-center justify-center py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    {t('Directions')}
                                                </a>
                                                <a
                                                    href={`tel:${shop.phone}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 flex items-center justify-center py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    {t('Call')}
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        }))}

                    <div className="p-8 text-center">
                        <p className="text-sm text-gray-400">{t("Don't see your city?")}</p>
                        <Link href={`/${language}/franchise`} className="text-bel-blue dark:text-blue-400 font-bold text-sm hover:underline">
                            {t('Suggest a location')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: MAP */}
            <div className="flex-1 relative h-[50vh] lg:h-full w-full bg-gray-100 dark:bg-slate-800">
                <Map
                    shops={filteredShops}
                    center={mapCenter}
                    zoom={12}
                    selectedShopId={selectedShopId}
                    onMarkerClick={handleShopClick}
                    hoveredShopId={hoveredShopId}
                />
            </div>
        </div>
    );
};

export default StoreLocator;
