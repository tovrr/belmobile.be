'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import LegalPageLayout from './LegalPageLayout';

const Warranty: React.FC = () => {
    const { t } = useLanguage();

    return (
        <LegalPageLayout
            title={t('warranty_title')}
            description={t('warranty_content').split('\n')[0]}
            icon={ClipboardDocumentCheckIcon}
        >
            <div className="prose dark:prose-invert max-w-none">
                {t('warranty_content').split('\n').map((line, index) => (
                    <p key={index} className="mb-4 text-slate-600 dark:text-slate-300">
                        {line}
                    </p>
                ))}
            </div>
        </LegalPageLayout>
    );
};

export default Warranty;
