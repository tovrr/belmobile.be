'use client';
import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { SEO_CONTENT } from '../constants';
import { CheckCircleIcon, StarIcon } from '@heroicons/react/24/solid';

interface InfoSectionProps {
    step: number;
    type: 'buyback' | 'repair';
    deviceType: string;
    brand: string;
    model: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({ step, type, deviceType, brand, model }) => {
    const { t } = useLanguage();

    // If no brand/model selected, show generic content from constants
    if (!brand) {
        let contentKey = `${type}_step1`;
        if (deviceType) contentKey = `${type}_${deviceType}`;
        const content = SEO_CONTENT[contentKey] || SEO_CONTENT[`${type}_step1`];

        if (!content) return null;

        return (
            <div className="mt-12 mb-8 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-700 p-8 md:p-12 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {t(content.title)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg max-w-3xl mx-auto">
                        {t(content.text)}
                    </p>
                </div>
            </div>
        );
    }

    // Dynamic Content for Specific Brand/Model
    const titleKey = type === 'repair' ? 'seo_repair_title' : 'seo_buyback_title';
    const descKey = type === 'repair' ? 'seo_repair_desc' : 'seo_buyback_desc';

    // Format: "Professional iPhone 13 Repair..."
    // We pass brand and model as args to translation
    const title = t(titleKey).replace('{0}', brand).replace('{1}', model);
    const desc = t(descKey).replace('{0}', brand).replace('{1}', model);

    const feature1Title = t('seo_feature1_title');
    const feature1Desc = t('seo_feature1_desc').replace('{0}', brand).replace('{1}', model);

    const feature2Title = t('seo_feature2_title');
    const feature2Desc = t('seo_feature2_desc').replace('{0}', brand).replace('{1}', model);

    return (
        <div className="mt-12 mb-8 animate-fade-in">
            {/* Main SEO Text Area */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-700 p-8 md:p-12 mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                    {title}
                </h3>
                <p className="text-slate-300 leading-relaxed text-lg mb-8">
                    {desc}
                </p>

                {/* Sub-Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                        <h4 className="font-bold text-xl text-white mb-3 flex items-center">
                            <CheckCircleIcon className="h-6 w-6 text-bel-blue mr-2" />
                            {feature1Title}
                        </h4>
                        <p className="text-slate-400">
                            {feature1Desc}
                        </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                        <h4 className="font-bold text-xl text-white mb-3 flex items-center">
                            <StarIcon className="h-6 w-6 text-bel-yellow mr-2" />
                            {feature2Title}
                        </h4>
                        <p className="text-slate-400">
                            {feature2Desc}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoSection;

