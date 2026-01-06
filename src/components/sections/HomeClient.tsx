'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FormattedReview } from '../../services/reviewService';

// Dynamic imports to split bundles (Mobile vs Desktop code)
// This ensures mobile users don't download heavy desktop assets/code and vice-versa.
const AegisHomeClient = dynamic(() => import('../home/aegis/AegisHomeClient'), {
    ssr: true, // We want SSR for SEO since we now have server-side detection
});

const ApolloHomeClient = dynamic(() => import('../home/apollo/ApolloHomeClient'), {
    ssr: true, // We want SSR for SEO since we now have server-side detection
});

interface HomeClientProps {
    initialReviews?: FormattedReview[];
    isMobileServer: boolean;
}

const HomeClient: React.FC<HomeClientProps> = ({ initialReviews = [], isMobileServer }) => {
    // Initialize with server-side detection to allow immediate render (Crucial for LCP)
    const [isMobile, setIsMobile] = useState<boolean>(isMobileServer);

    useEffect(() => {
        const checkMobile = () => {
            // Standard mobile breakpoint: < 768px (MD)
            const isWindowMobile = window.innerWidth < 768;
            // Only update if different to avoid unnecessary re-renders
            if (isWindowMobile !== isMobile) {
                setIsMobile(isWindowMobile);
            }
        };

        // Listen for resize
        window.addEventListener('resize', checkMobile);

        // Check once on mount to correct if UA prediction was wrong (e.g. tablet lying about UA)
        checkMobile();

        return () => window.removeEventListener('resize', checkMobile);
    }, [isMobile]);

    return (
        <>
            {/* 
              HYBRID STRATEGY:
              - Mobile: ApolloHomeClient (Focus: Speed / Conversion)
              - Desktop: AegisHomeClient (Focus: Authority / Trust)
            */}
            {isMobile ? (
                <ApolloHomeClient initialReviews={initialReviews} />
            ) : (
                <AegisHomeClient initialReviews={initialReviews} />
            )}
        </>
    );
};

export default HomeClient;
