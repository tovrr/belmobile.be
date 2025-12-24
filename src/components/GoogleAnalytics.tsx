'use client';

import React, { useEffect, useState } from 'react';
import { GoogleAnalytics as GAModule } from '@next/third-parties/google';

const GoogleAnalytics = () => {
    const [consentGiven, setConsentGiven] = useState(false);

    useEffect(() => {
        // 1. Check if already accepted
        const currentConsent = localStorage.getItem('cookie_consent');
        if (currentConsent === 'accepted') {
            setConsentGiven(true);
        }

        // 2. Listen for new consent
        const handleConsentUpdate = () => {
            if (localStorage.getItem('cookie_consent') === 'accepted') {
                setConsentGiven(true);
            }
        };

        window.addEventListener('cookie_consent_updated', handleConsentUpdate);
        return () => window.removeEventListener('cookie_consent_updated', handleConsentUpdate);
    }, []);

    // 3. Only render the GA script if consent is true
    if (!consentGiven) return null;

    return <GAModule gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />;
};

export default GoogleAnalytics;
