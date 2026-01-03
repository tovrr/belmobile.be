'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import AegisHero from './AegisHero';
import SchemaMarkup from '../../seo/SchemaMarkup';

const TrustSignals = dynamic(() => import('../../sections/TrustSignals'), { loading: () => <div className="h-40" /> });
const FAQ = dynamic(() => import('../../common/FAQ'), { loading: () => <div className="h-96" /> });
const SEOContentBlock = dynamic(() => import('../../sections/SEOContentBlock'), { loading: () => <div className="h-40" /> });
const ReviewsSection = dynamic(() => import('../../sections/ReviewsSection'), { loading: () => <div className="h-60" /> });
const BentoServices = dynamic(() => import('../../sections/BentoServices'), { loading: () => <div className="h-96" /> });

interface Props { initialReviews?: any[]; }

const AegisHomeClient: React.FC<Props> = ({ initialReviews = [] }) => {
    return (
        <div className="bg-transparent transition-colors duration-300">
            <SchemaMarkup type="organization" />

            {/* 1. The Powerhouse (Desktop Authority) */}
            <AegisHero />

            {/* 2. Service Hub (Visual Grid) */}
            <BentoServices variant="aegis" />

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
