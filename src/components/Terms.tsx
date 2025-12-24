'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import LegalPageLayout from './LegalPageLayout';

const Terms: React.FC = () => {
    const { t } = useLanguage();

    return (
        <LegalPageLayout
            title={t('terms_title')}
            description={t('terms_intro')}
            icon={ShieldCheckIcon}
            lastUpdated="2024-01-01"
        >
            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('terms_section_1_title')}</h2>
                <p>{t('terms_section_1_content')}</p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('terms_section_2_title')}</h2>
                <p>{t('terms_section_2_content')}</p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('terms_section_3_title')}</h2>
                <p>{t('terms_section_3_content')}</p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('terms_section_4_title')}</h2>
                <p>{t('terms_section_4_content')}</p>
            </section>
        </LegalPageLayout>
    );
};

export default Terms;
