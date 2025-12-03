'use client';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { CheckCircleIcon, StarIcon } from '@heroicons/react/24/solid';

interface ConditionGuideProps {
    currentCondition?: 'perfect' | 'very_good' | 'good';
}

const ConditionGuide: React.FC<ConditionGuideProps> = ({ currentCondition = 'good' }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'perfect' | 'very_good' | 'good'>(currentCondition);

    useEffect(() => {
        if (currentCondition) {
            setActiveTab(currentCondition);
        }
    }, [currentCondition]);

    const conditions = ['perfect', 'very_good', 'good'] as const;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-slate-700 mt-12">
            <div className="mb-8 text-center max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('refurbished_intro_title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t('refurbished_intro_text')}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
                {conditions.map((condition) => (
                    <button
                        key={condition}
                        onClick={() => setActiveTab(condition)}
                        className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2 ${activeTab === condition
                                ? 'bg-bel-blue text-white shadow-lg scale-105'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        <StarIcon className={`h-5 w-5 ${activeTab === condition ? 'text-yellow-300' : 'text-gray-400'}`} />
                        <span>{t(`condition_${condition}`)}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 transition-all duration-300">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {t(`condition_${activeTab}`)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t(`condition_${activeTab}_desc`)}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <span className="block font-bold text-gray-900 dark:text-white text-sm">{t('condition_functionality_label')}</span>
                                <span className="text-gray-600 dark:text-gray-400 text-sm">{t(`condition_${activeTab}_functionality`)}</span>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <span className="block font-bold text-gray-900 dark:text-white text-sm">{t('condition_housing_label')}</span>
                                <span className="text-gray-600 dark:text-gray-400 text-sm">{t(`condition_${activeTab}_housing`)}</span>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <span className="block font-bold text-gray-900 dark:text-white text-sm">{t('condition_display_label')}</span>
                                <span className="text-gray-600 dark:text-gray-400 text-sm">{t(`condition_${activeTab}_display`)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <span className="block font-bold text-gray-900 dark:text-white text-sm">{t('condition_battery_label')}</span>
                                <span className="text-gray-600 dark:text-gray-400 text-sm">{t(`condition_${activeTab}_battery`)}</span>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <span className="block font-bold text-gray-900 dark:text-white text-sm">{t('condition_content_label')}</span>
                                <span className="text-gray-600 dark:text-gray-400 text-sm">{t(`condition_${activeTab}_content`)}</span>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <span className="block font-bold text-gray-900 dark:text-white text-sm">{t('condition_packaging_label')}</span>
                                <span className="text-gray-600 dark:text-gray-400 text-sm">{t(`condition_${activeTab}_packaging`)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConditionGuide;

