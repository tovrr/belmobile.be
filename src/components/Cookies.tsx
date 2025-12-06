'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { SparklesIcon } from '@heroicons/react/24/outline'; // Best approximate for Cookie
import LegalPageLayout from './LegalPageLayout';

const Cookies: React.FC = () => {
    const { t } = useLanguage();

    return (
        <LegalPageLayout
            title={t('Cookie Policy')}
            description={t('How we use cookies and similar technologies.')}
            icon={SparklesIcon}
        >
            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('What are Cookies?')}</h2>
                <p>{t('Cookies are small text files that are stored on your device when you visit a website. They help us remember your preferences and improve your experience.')}</p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('Types of Cookies We Use')}</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>{t('Essential Cookies')}:</strong> {t('Necessary for the website to function.')}</li>
                    <li><strong>{t('Analytics Cookies')}:</strong> {t('Help us understand how visitors interact with the site.')}</li>
                    <li><strong>{t('Marketing Cookies')}:</strong> {t('Used to deliver relevant advertisements.')}</li>
                </ul>
            </section>
        </LegalPageLayout>
    );
};

export default Cookies;
