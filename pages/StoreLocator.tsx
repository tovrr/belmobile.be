
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { Shop } from '../types';
import Map from '../components/Map';
import { useLanguage } from '../hooks/useLanguage';
import { Link } from 'react-router-dom';
import { 
    MapPinIcon, 
    PhoneIcon, 
    ClockIcon, 
    BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

// Helper to check if shop is open based on Brussels Time
const isShopOpen = (hoursString: string): boolean => {
    if (hoursString.includes('Coming Soon') || (hoursString.includes('Closed') && !hoursString.includes(':'))) return false;

    // 1. Get Brussels Time using Intl for robustness across browsers/timezones
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Brussels',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    });

    const parts = formatter.formatToParts(new Date());
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;

    const currentDay = getPart('weekday'); // "Mon", "Tue", etc.
    const currentHourStr = getPart('hour');
    const currentMinuteStr = getPart('minute');
    
    if (!currentDay || !currentHourStr || !currentMinuteStr) return false;

    const currentHour = parseFloat(currentHourStr) + parseFloat(currentMinuteStr) / 60;

    // 2. Check for explicit closing days
    // We split the string by lines and check if today is mentioned in a "Closed" line
    const lines = hoursString.split('\n');
    const isExplicitlyClosed = lines.some(line => line.includes(currentDay!) && line.toLowerCase().includes('closed'));
    
    if (isExplicitlyClosed) return false;

    // 3. Friday Specific Logic (Prayer Break: 12:30 - 14:30)
    // Shops are usually 10:30-12:30 AND 14:30-19:00 on Fridays
    if (currentDay === 'Fri') {
        const isMorningShift = currentHour >= 10.5 && currentHour < 12.5;
        const isAfternoonShift = currentHour >= 14.5 && currentHour < 19; // Until 19:00
        return isMorningShift || isAfternoonShift;
    }

    // 4. Standard Hours (10:30 - 19:00)
    // If today isn't explicitly closed and it's not Friday, we check the standard range.
    if (currentHour >= 10.5 && currentHour < 19) {
        return true;
    }
    
    return false;
};

const StoreLocator: React.FC = () => {
    const { shops } = useData();
    const { t, language } = useLanguage();
    const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
    const [filter, setFilter] = useState<'all' | 'open'>('all');
    const [hoveredShopId, setHoveredShopId] = useState<number | null>(null);
    
    // Refs for scrolling to cards
    const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const listContainerRef = useRef<HTMLDivElement>(null);

    const mapCenter: [number, number] = [50.8503, 4.3517]; // Brussels Center

    // Filter logic
    const filteredShops = useMemo(() => {
        if (filter === 'open') {
            return shops.filter(s => s.status === 'open' && isShopOpen(s.hours));
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

    const handleShopClick = (id: number) => {
        setSelectedShopId(id);
    };

    return (
        <div className="flex flex-col-reverse lg:flex-row h-[calc(100vh-64px)] bg-gray-50 dark:bg-slate-900 overflow-hidden">
            
            {/* LEFT SIDE: LIST */}
            <div 
                ref={listContainerRef}
                className="w-full lg:w-[450px] xl:w-[500px] flex flex-col border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 z-10 shadow-xl lg:shadow-none h-[50vh] lg:h-full"
            >
                {/* Header & Filters */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
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
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                                filter === 'all' 
                                    ? 'bg-white dark:bg-slate-700 text-bel-dark dark:text-white shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            {t('Show All')}
                        </button>
                        <button 
                            onClick={() => setFilter('open')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                                filter === 'open' 
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
                    {filteredShops.map(shop => {
                        const isOpen = shop.status === 'open' ? isShopOpen(shop.hours) : false;
                        const isSelected = selectedShopId === shop.id;
                        const isComingSoon = shop.status === 'coming_soon';

                        return (
                            <div 
                                key={shop.id}
                                ref={el => cardRefs.current[shop.id] = el}
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
                                        <div className="flex items-center mt-1 mb-3">
                                            {isComingSoon ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                                                    {t('Coming Soon')}
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center text-xs font-bold ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                                    <span className={`w-2 h-2 rounded-full mr-2 ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
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
                                            to={`/${language}/franchise`}
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
                                                <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-gray-400" />
                                                {shop.address}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                                <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                                                {shop.phone}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                                                <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-gray-400" />
                                                <span className="whitespace-pre-line line-clamp-1 hover:line-clamp-none transition-all">{shop.hours.split('\n')[0]}...</span>
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <a 
                                                href={`https://www.google.com/maps?q=${shop.coords.lat},${shop.coords.lng}`} 
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
                    })}
                    
                    <div className="p-8 text-center">
                        <p className="text-sm text-gray-400">{t("Don't see your city?")}</p>
                        <Link to={`/${language}/franchise`} className="text-bel-blue dark:text-blue-400 font-bold text-sm hover:underline">
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
