'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FormattedReview } from '../../services/reviewService';

// Dynamic imports for the variants to split the bundle code
const AegisHomeClient = dynamic(() => import('../home/aegis/AegisHomeClient'), {
    loading: () => <div className="min-h-screen bg-slate-50 dark:bg-deep-space animate-pulse" />
});

const ApolloHomeClient = dynamic(() => import('../home/apollo/ApolloHomeClient'), {
    loading: () => <div className="min-h-screen bg-slate-50 dark:bg-deep-space animate-pulse" />
});

interface HomeClientProps {
    initialReviews?: FormattedReview[];
}

const HomeClient: React.FC<HomeClientProps> = ({ initialReviews = [] }) => {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            // Standard mobile breakpoint: < 768px (MD)
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkMobile();

        // Listen for resize
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Prevent hydration mismatch: render nothing or skeleton until client-side check completes
    if (isMobile === null) {
        return <div className="min-h-screen bg-slate-50 dark:bg-deep-space" />;
    }

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
