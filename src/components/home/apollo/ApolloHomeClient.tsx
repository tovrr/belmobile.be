'use client';
import React from 'react';
import ApolloHero from './ApolloHero';
import ApolloProcess from './ApolloProcess';
import SchemaMarkup from '../../seo/SchemaMarkup';
import TrustSignals from '../../sections/TrustSignals';
import SEOContentBlock from '../../sections/SEOContentBlock';
import ReviewsSection from '../../sections/ReviewsSection';
import BentoServices from '../../sections/BentoServices';
import FAQ from '../../common/FAQ';

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
