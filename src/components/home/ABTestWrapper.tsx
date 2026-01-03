'use client';

import React, { useState, useEffect } from 'react';

interface ABTestWrapperProps {
    variantA: React.ReactNode;
    variantB: React.ReactNode;
}

const STORAGE_KEY = 'ab_homepage_variant_2026';

export default function ABTestWrapper({ variantA, variantB }: ABTestWrapperProps) {
    const [variant, setVariant] = useState<'A' | 'B' | null>(null);

    useEffect(() => {
        // 1. Check URL override
        const params = new URLSearchParams(window.location.search);
        const override = params.get('variant');

        if (override === 'A' || override === 'B') {
            setVariant(override);
            localStorage.setItem(STORAGE_KEY, override);
            return;
        }

        // 2. Check Local Storage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'A' || stored === 'B') {
            setVariant(stored as 'A' | 'B');
            return;
        }

        // 3. Random Assignment
        const newVariant = Math.random() < 0.5 ? 'A' : 'B';
        setVariant(newVariant);
        localStorage.setItem(STORAGE_KEY, newVariant);
    }, []);

    if (!variant) {
        // Prevent hydration mismatch or flash: render nothing or a neutral skeleton
        // Ideally we render Variant A as default but hidden to avoid layout shift?
        // For now, let's just return null or a simple spinner
        return <div className="min-h-screen bg-slate-950" />;
    }

    return (
        <>
            {variant === 'A' ? variantA : variantB}
        </>
    );
}
