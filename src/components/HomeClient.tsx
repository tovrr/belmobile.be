import React from 'react';
import dynamic from 'next/dynamic';
import Hero from './Hero';

const TrustSignals = dynamic(() => import('./TrustSignals'), {
    loading: () => <div className="h-40" />
});

const BentoServices = dynamic(() => import('./BentoServices'), {
    loading: () => <div className="h-96" />
});

const HomeClient: React.FC = () => {
    return (
        <div className="bg-transparent transition-colors duration-300">
            <Hero />
            <TrustSignals />
            <BentoServices />
        </div>
    );
};

export default HomeClient;
