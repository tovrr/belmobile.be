'use client';

import React from 'react';
import { useData } from '../../hooks/useData';
import StoresList from './StoresList';
import LocationServiceBlock from './LocationServiceBlock';
import dynamic from 'next/dynamic';
import BrandLoader from '../ui/BrandLoader';

// Dynamically import StoreMap with no SSR because Leaflet requires window
const StoreMap = dynamic(() => import('../store/StoreMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[400px] bg-transparent flex items-center justify-center">
            <BrandLoader />
        </div>
    )
});

import { Shop } from '../../types/models';

interface StoresLayoutProps {
    lang: string;
    initialShops?: Shop[];
    selectedCityName?: string;
    selectedCityCoords?: [number, number];
}

const StoresLayout: React.FC<StoresLayoutProps> = ({
    lang,
    initialShops = [],
    selectedCityName,
    selectedCityCoords
}) => {
    const { shops: liveShops, loading } = useData();

    // Prefer liveShops if available, else initialShops
    const shops = liveShops.length > 0 ? liveShops : initialShops;

    if (loading && !shops.length) {
        return (
            <div className="flex flex-col-reverse lg:flex-row h-[calc(100vh-80px)] bg-transparent">
                <div className="w-full lg:w-1/3 xl:w-1/4 p-4">
                    <div className="h-20 bg-gray-100 dark:bg-slate-800 rounded-ui animate-pulse mb-4" />
                    <div className="h-20 bg-gray-100 dark:bg-slate-800 rounded-ui animate-pulse mb-4" />
                    <div className="h-20 bg-gray-100 dark:bg-slate-800 rounded-ui animate-pulse" />
                </div>
                <div className="w-full lg:w-2/3 xl:w-3/4 bg-slate-900/50 animate-pulse" />
            </div>
        );
    }

    // Filter out shops that are not meant to be shown if necessary
    const displayShops = shops;

    return (
        <div className="flex flex-col-reverse lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
            {/* Sidebar List - Scrollable */}
            <div className="w-full lg:w-1/3 xl:w-1/4 bg-slate-900/60 backdrop-blur-xl overflow-y-auto border-r border-white/10 flex-1 lg:h-auto">
                <div className="p-4">
                    {selectedCityName ? (
                        <div className="mb-6 bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl">
                            <h1 className="text-xl font-bold text-white mb-1">
                                {lang === 'fr' ? `Réparation à ${selectedCityName}` :
                                    lang === 'nl' ? `Reparatie in ${selectedCityName}` :
                                        `Repair in ${selectedCityName}`}
                            </h1>
                            <p className="text-sm text-blue-200">
                                {lang === 'fr' ? "Nos experts sont à proximité." :
                                    lang === 'nl' ? "Onze experts zijn dichtbij." :
                                        "Our experts are nearby."}
                            </p>
                        </div>
                    ) : (
                        <h2 className="text-xl font-bold mb-4 px-2 text-gray-900 dark:text-white">Locations</h2>
                    )}

                    <StoresList lang={lang} shops={displayShops} compact={true} />

                    {/* Dynamic Service Area Content */}
                    {selectedCityName && (
                        <LocationServiceBlock city={selectedCityName} lang={lang} />
                    )}
                </div>
            </div>

            {/* Map Area - Fixed height on mobile, full height on desktop */}
            <div className="w-full lg:w-2/3 xl:w-3/4 h-[40vh] lg:h-auto relative z-0 shrink-0">
                <StoreMap
                    shops={displayShops}
                    lang={lang}
                    center={selectedCityCoords} // Pass the city coordinates as center
                    zoom={selectedCityCoords ? 14 : undefined} // Zoom in if city selected
                />
            </div>
        </div>
    );
};

export default StoresLayout;
