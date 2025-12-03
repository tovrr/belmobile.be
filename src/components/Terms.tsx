'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const Terms: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 sm:p-12 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-center mb-8">
                        <div className="bg-bel-blue/10 dark:bg-blue-900/20 p-4 rounded-full text-bel-blue dark:text-blue-400">
                            <ShieldCheckIcon className="h-12 w-12" />
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-bel-dark dark:text-white mb-4">
                        {t('terms_title')}
                    </h1>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-12 text-lg">
                        {t('terms_intro')}
                    </p>

                    <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-bel-dark dark:text-white mb-3">{t('terms_section_1_title')}</h2>
                            <p>{t('terms_section_1_content')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-bel-dark dark:text-white mb-3">{t('terms_section_2_title')}</h2>
                            <p>{t('terms_section_2_content')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-bel-dark dark:text-white mb-3">{t('terms_section_3_title')}</h2>
                            <p>{t('terms_section_3_content')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-bel-dark dark:text-white mb-3">{t('terms_section_4_title')}</h2>
                            <p>{t('terms_section_4_content')}</p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-700 text-center text-sm text-gray-500 dark:text-gray-400">
                        {t('terms_updated')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
