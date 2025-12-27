'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import dynamic from 'next/dynamic';
import Hero from './Hero';
import SchemaMarkup from './SchemaMarkup';

const TrustSignals = dynamic(() => import('./TrustSignals'), {
    loading: () => <div className="h-40" />
});

const BentoServices = dynamic(() => import('./BentoServices'), {
    loading: () => <div className="h-96" />
});



import { FormattedReview } from '../services/reviewService';

const ReviewsSection = dynamic(() => import('./ReviewsSection'), {
    loading: () => <div className="h-60" />
});

interface HomeClientProps {
    initialReviews?: FormattedReview[];
}

const HomeClient: React.FC<HomeClientProps> = ({ initialReviews = [] }) => {
    const { t } = useLanguage();

    return (
        <div className="bg-transparent transition-colors duration-300">
            <SchemaMarkup type="organization" />
            <Hero />
            <h2 className="sr-only">{t('home_trust_section_title')}</h2>
            <TrustSignals />
            <BentoServices />
            <ReviewsSection initialReviews={initialReviews} />
        </div>
    );
};

export default HomeClient;
