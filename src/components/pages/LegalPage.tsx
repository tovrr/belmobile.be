'use client';

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { ShieldCheckIcon, DocumentTextIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface LegalPageProps {
    type: 'privacy' | 'cookies' | 'warranty';
}

const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
    const { t } = useLanguage();

    const getIcon = () => {
        switch (type) {
            case 'privacy': return <LockClosedIcon className="h-12 w-12" />;
            case 'cookies': return <DocumentTextIcon className="h-12 w-12" />;
            case 'warranty': return <ShieldCheckIcon className="h-12 w-12" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 sm:p-12 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-center mb-8">
                        <div className="bg-bel-blue/10 dark:bg-blue-900/20 p-4 rounded-full text-bel-blue dark:text-blue-400">
                            {getIcon()}
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-bel-dark dark:text-white mb-4">
                        {t(`${type}_title`)}
                    </h1>

                    <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed mt-12">
                        {t(`${type}_content`).split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
