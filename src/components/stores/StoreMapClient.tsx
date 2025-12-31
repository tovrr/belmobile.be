'use client';

import dynamic from 'next/dynamic';

const StoreMap = dynamic(() => import('../store/StoreMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
});

export default StoreMap;
