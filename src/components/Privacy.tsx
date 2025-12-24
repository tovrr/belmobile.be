'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import LegalPageLayout from './LegalPageLayout';

const Privacy: React.FC = () => {
    const { t } = useLanguage();

    return (
        <LegalPageLayout
            title={t('privacy_title')}
            description={t('privacy_content').split('\n')[0]} // First line as desc
            icon={LockClosedIcon}
        >
            <div className="prose dark:prose-invert max-w-none">
                {t('privacy_content').split('\n').map((line, index) => (
                    <p key={index} className="mb-4 text-slate-600 dark:text-slate-300">
                        {line}
                    </p>
                ))}
            </div>
        </LegalPageLayout>
    );
};

export default Privacy;
