'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-100 dark:bg-slate-700 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default Map;
