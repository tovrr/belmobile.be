'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import dynamic from 'next/dynamic';
import Hero from './Hero';

const TrustSignals = dynamic(() => import('./TrustSignals'), {
    loading: () => <div className="h-40" />
});

const BentoServices = dynamic(() => import('./BentoServices'), {
    loading: () => <div className="h-96" />
});



const ReviewsSection = dynamic(() => import('./ReviewsSection'), {
    loading: () => <div className="h-60" />
});

const HomeClient: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="bg-transparent transition-colors duration-300">
            <Hero />
            <h2 className="sr-only">{t('home_trust_section_title')}</h2>
            <TrustSignals />
            <BentoServices />
            <ReviewsSection />
        </div>
    );
};

export default HomeClient;
