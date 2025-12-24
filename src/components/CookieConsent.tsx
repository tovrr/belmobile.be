'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { motion, AnimatePresence } from 'framer-motion';

const CookieConsent: React.FC = () => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Add a small delay for better UX (don't pop up immediately on load)
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setIsVisible(false);
        // Notify the app that consent was updated
        window.dispatchEvent(new Event('cookie_consent_updated'));
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'declined');
        setIsVisible(false);
        // Ensure analytics are disabled
        // window.gtag('consent', 'update', { 'analytics_storage': 'denied' });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                >
                    <div className="max-w-4xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 md:flex md:items-center md:justify-between gap-6">
                        <div className="flex-1 mb-6 md:mb-0">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {t('cookie_consent_title')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                {t('cookie_consent_text')}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 min-w-[300px]">
                            <button
                                onClick={handleDecline}
                                className="px-6 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-sm"
                            >
                                {t('cookie_decline')}
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-6 py-2.5 rounded-xl bg-bel-blue hover:bg-bel-blue/90 text-white font-bold shadow-lg shadow-bel-blue/20 transition-all hover:scale-105 active:scale-95 text-sm"
                            >
                                {t('cookie_accept_all')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
