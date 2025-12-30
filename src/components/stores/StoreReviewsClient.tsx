'use client';

import dynamic from 'next/dynamic';

const StoreReviews = dynamic(() => import('./StoreReviews'), {
    ssr: false,
    loading: () => <div className="h-40 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl" />
});

export default StoreReviews;
