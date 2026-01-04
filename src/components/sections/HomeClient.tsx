'use client';

import React, { useState, useEffect } from 'react';
import { FormattedReview } from '../../services/reviewService';
import AegisHomeClient from '../home/aegis/AegisHomeClient';
import ApolloHomeClient from '../home/apollo/ApolloHomeClient';

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
