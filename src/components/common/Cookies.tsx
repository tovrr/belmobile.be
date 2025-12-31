'use client';

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { SparklesIcon } from '@heroicons/react/24/outline'; // Best approximate for Cookie
import LegalPageLayout from './LegalPageLayout';

const Cookies: React.FC = () => {
    const { t } = useLanguage();

    return (
        <LegalPageLayout
            title={t('cookies_title')}
            description={t('cookies_content').split('\n')[0]}
            icon={SparklesIcon}
        >
            <div className="prose dark:prose-invert max-w-none">
                {t('cookies_content').split('\n').map((line, index) => (
                    <p key={index} className="mb-4 text-slate-600 dark:text-slate-300">
                        {line}
                    </p>
                ))}
            </div>
        </LegalPageLayout>
    );
};

export default Cookies;
