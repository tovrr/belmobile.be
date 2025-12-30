'use client';

import dynamic from 'next/dynamic';

const StoreGallery = dynamic(() => import('./StoreGallery'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl" />
});

export default StoreGallery;
