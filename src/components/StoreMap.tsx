'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import BrandLoader from './ui/BrandLoader';

const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-900/50 dark:bg-slate-900/80 animate-pulse flex items-center justify-center">
            <BrandLoader />
        </div>
    )
});

export default Map;
