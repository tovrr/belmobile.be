'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import LegalPageLayout from './LegalPageLayout';

const Warranty: React.FC = () => {
    const { t } = useLanguage();

    return (
        <LegalPageLayout
            title={t('Warranty Information')}
            description={t('Details about our product and repair warranties.')}
            icon={ClipboardDocumentCheckIcon}
        >
            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('Repair Warranty')}</h2>
                <p>{t('We offer a 1-year warranty on all our repairs. This covers defects in parts and workmanship.')}</p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('Device Warranty')}</h2>
                <p>{t('Refurbished devices come with a 1-year warranty. Brand new devices come with the standard manufacturer warranty (usually 2 years).')}</p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('Exclusions')}</h2>
                <p>{t('The warranty does not cover accidental damage, such as water damage or cracked screens caused by drops.')}</p>
            </section>
        </LegalPageLayout>
    );
};

export default Warranty;
