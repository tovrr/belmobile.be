'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import LegalPageLayout from './LegalPageLayout';

const Privacy: React.FC = () => {
    const { t } = useLanguage();

    return (
        <LegalPageLayout
            title={t('Privacy Policy')}
            description={t('Your privacy is important to us. This policy explains how we handle your data.')}
            icon={LockClosedIcon}
        >
            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('Data Collection')}</h2>
                <p>{t('We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support.')}</p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('Use of Information')}</h2>
                <p>{t('We use the information we collect to operate, maintain, and improve our services, to process transactions, and to communicate with you.')}</p>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('Data Sharing')}</h2>
                <p>{t('We do not share your personal information with third parties except as described in this policy or with your consent.')}</p>
            </section>
        </LegalPageLayout>
    );
};

export default Privacy;
