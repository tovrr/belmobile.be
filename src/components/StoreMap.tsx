'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-900/50 dark:bg-slate-900/80 animate-pulse flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bel-blue"></div>
        </div>
    )
});

export default Map;
