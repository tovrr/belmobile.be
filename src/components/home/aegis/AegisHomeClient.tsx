'use client';
import React from 'react';
import AegisHero from './AegisHero';
import SchemaMarkup from '../../seo/SchemaMarkup';
import TrustSignals from '../../sections/TrustSignals';
import FAQ from '../../common/FAQ';
import SEOContentBlock from '../../sections/SEOContentBlock';
import ReviewsSection from '../../sections/ReviewsSection';
import BentoServices from '../../sections/BentoServices';
import BrandVideo from '../../sections/BrandVideo';

interface Props { initialReviews?: any[]; }

const AegisHomeClient: React.FC<Props> = ({ initialReviews = [] }) => {
    return (
        <div className="bg-transparent transition-colors duration-300">
            <SchemaMarkup type="organization" />

            {/* 1. The Powerhouse (Desktop Authority) */}
            <AegisHero />

            {/* 2. Service Hub (Visual Grid) */}
            <BentoServices variant="aegis" />

            {/* 2.5 Show the brand action */}
            <BrandVideo />

            {/* 3. Social Proof */}
            <ReviewsSection initialReviews={initialReviews} variant="aegis" />

            {/* 4. Trust & Signals */}
            <TrustSignals variant="aegis" />

            {/* 5. SEO Foundation */}
            <SEOContentBlock variant="aegis" />

            {/* 6. Knowledge Hub */}
            <FAQ variant="aegis" />
        </div>
    );
};

export default AegisHomeClient;
