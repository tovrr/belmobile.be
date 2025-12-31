'use client';

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import LegalPageLayout from '../common/LegalPageLayout';

import ReactMarkdown from 'react-markdown';

const Warranty: React.FC = () => {
    const { t } = useLanguage();

    return (
        <LegalPageLayout
            title={t('warranty_title')}
            icon={ClipboardDocumentCheckIcon}
        >
            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>
                    {t('warranty_content').replace(/\\n/g, '\n')}
                </ReactMarkdown>
            </div>
        </LegalPageLayout>
    );
};

export default Warranty;
