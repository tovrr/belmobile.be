'use client';

import React from 'react';
import { useData } from '../../hooks/useData';
import StoresList from './StoresList';
import dynamic from 'next/dynamic';

// Dynamically import StoreMap with no SSR because Leaflet requires window
const StoreMap = dynamic(() => import('./StoreMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[400px] bg-transparent flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bel-blue"></div>
        </div>
    )
});

interface StoresLayoutProps {
    lang: string;
}

const StoresLayout: React.FC<StoresLayoutProps> = ({ lang }) => {
    const { shops, loading } = useData();

    if (loading && !shops.length) {
        return (
            <div className="flex flex-col-reverse lg:flex-row h-[calc(100vh-80px)] bg-transparent">
                <div className="w-full lg:w-1/3 xl:w-1/4 p-4">
                    <div className="h-20 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse mb-4" />
                    <div className="h-20 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse mb-4" />
                    <div className="h-20 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                </div>
                <div className="w-full lg:w-2/3 xl:w-3/4 bg-slate-900/50 animate-pulse" />
            </div>
        );
    }

    // Filter out shops that are not meant to be shown if necessary
    // For now, filtering out the Hub if it's marked as isHub (assuming we only want physical stores)
    // But user might want to see the hub too. Let's keep all for now or filter based on status.
    const displayShops = shops;

    return (
        <div className="flex flex-col-reverse lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
            {/* Sidebar List - Scrollable */}
            <div className="w-full lg:w-1/3 xl:w-1/4 bg-slate-900/60 backdrop-blur-xl overflow-y-auto border-r border-white/10 flex-1 lg:h-auto">
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4 px-2 text-gray-900 dark:text-white">Locations</h2>
                    <StoresList lang={lang} shops={displayShops} compact={true} />
                </div>
            </div>

            {/* Map Area - Fixed height on mobile, full height on desktop */}
            <div className="w-full lg:w-2/3 xl:w-3/4 h-[40vh] lg:h-auto relative z-0 shrink-0">
                <StoreMap shops={displayShops} lang={lang} />
            </div>
        </div>
    );
};

export default StoresLayout;
