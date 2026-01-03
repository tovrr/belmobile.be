'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import ApolloHero from './ApolloHero';
import ApolloProcess from './ApolloProcess';
import SchemaMarkup from '../../seo/SchemaMarkup';

const TrustSignals = dynamic(() => import('../../sections/TrustSignals'), { loading: () => <div className="h-40" /> });
const SEOContentBlock = dynamic(() => import('../../sections/SEOContentBlock'), { loading: () => <div className="h-40" /> });
const ReviewsSection = dynamic(() => import('../../sections/ReviewsSection'), { loading: () => <div className="h-60" /> });
// Replacing Bento with a simplified list for mobile speed if needed, but Bento is responsive. 
// Let's keep Bento for now but verify it looks good.
const BentoServices = dynamic(() => import('../../sections/BentoServices'), { loading: () => <div className="h-96" /> });
const FAQ = dynamic(() => import('../../common/FAQ'), { loading: () => <div className="h-96" /> });

interface Props { initialReviews?: any[]; }

const ApolloHomeClient: React.FC<Props> = ({ initialReviews = [] }) => {
    // Shared State for the Apollo Engine
    const [mode, setMode] = React.useState<'repair' | 'buyback'>('repair');

    return (
        <div className="bg-transparent transition-colors duration-300">
            <SchemaMarkup type="organization" />

            {/* 1. The Engine (Thumb Driven) */}
            <ApolloHero mode={mode} setMode={setMode} />

            {/* 2. The Explanation (Linear & Simple) */}
            <ApolloProcess mode={mode} />

            {/* 3. Social Proof (Momentum) */}
            <ReviewsSection initialReviews={initialReviews} variant="apollo" />

            {/* 4. Services Grid (Visual Navigation) */}
            <BentoServices variant="apollo" />

            {/* 5. Trust Badges (Reassurance) */}
            <TrustSignals variant="apollo" />

            {/* 6. SEO Footer */}
            <SEOContentBlock variant="apollo" />

            {/* 7. Knowledge Hub */}
            <FAQ variant="apollo" />
        </div>
    );
};

export default ApolloHomeClient;
