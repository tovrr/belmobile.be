'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const AIChatAssistant = dynamic(() => import('./AIChatAssistant'), {
    ssr: false,
});

export default function AIChatAssistantWrapper() {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        // Load chat as soon as the main thread is free (idle) 
        // OR after 3 seconds as a fallback
        if ('requestIdleCallback' in window) {
            const idleId = (window as any).requestIdleCallback(() => {
                setTimeout(() => setShouldLoad(true), 1500); // 1.5s after idle
            });
            return () => (window as any).cancelIdleCallback(idleId);
        } else {
            const timeoutId = setTimeout(() => setShouldLoad(true), 3000);
            return () => clearTimeout(timeoutId);
        }
    }, []);

    if (!shouldLoad) return null;

    return <AIChatAssistant />;
}
