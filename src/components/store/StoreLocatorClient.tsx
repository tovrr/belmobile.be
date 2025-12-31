'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Shop } from '@/types';

interface StoreLocatorProps {
    shops?: Shop[];
    className?: string;
    zoom?: number;
    center?: [number, number];
}

const StoreLocator = dynamic<StoreLocatorProps>(() => import('./StoreLocator'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-gray-100 dark:bg-slate-800 animate-pulse rounded-2xl border border-gray-200 dark:border-slate-700" />
});

import { MapProps } from './Map';

export default function StoreLocatorClient(props: MapProps) {
    return <StoreLocator {...props} />;
}
