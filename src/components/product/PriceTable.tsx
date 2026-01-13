'use client';

import React from 'react';
import { REPAIR_ISSUES, STATIC_REPAIR_PRICES } from '../../constants';
import { useLanguage } from '../../hooks/useLanguage';
import { useData } from '../../hooks/useData';
import { createSlug } from '../../utils/slugs';
import Link from 'next/link';

// Approximate values for popular models to determine tier
const POPULAR_MODEL_VALUES: Record<string, number> = {
    'iPhone 15': 900,
    'iPhone 14': 700,
    'iPhone 13 Pro Max': 800,
    'iPhone 13 Pro': 700,
    'iPhone 13': 600,
    'Galaxy S24': 800,
    'Galaxy S23': 600,
};

// Helper to calculate price (simplified version of BuybackRepair logic)
const getPrice = (modelName: string, issueId: string) => {
    const modelValue = POPULAR_MODEL_VALUES[modelName] || 200;
    const issue = REPAIR_ISSUES.find(i => i.id === issueId);
    if (!issue) return 0;

    let tierMultiplier = 1;
    if (modelValue > 800) tierMultiplier = 2.5;
    else if (modelValue > 400) tierMultiplier = 1.8;
    else if (modelValue > 200) tierMultiplier = 1.2;

    return Math.round(issue.base * tierMultiplier);
};

const PriceTable: React.FC = () => {
    const { t } = useLanguage();
    const { repairPrices } = useData();

    const popularModels = [
        { brand: 'Apple', model: 'iPhone 15' },
        { brand: 'Apple', model: 'iPhone 14' },
        { brand: 'Apple', model: 'iPhone 13' },
        { brand: 'Apple', model: 'iPhone 12' },
        { brand: 'Apple', model: 'iPhone 11' },
        { brand: 'Samsung', model: 'Galaxy S24' },
        { brand: 'Samsung', model: 'Galaxy S23' },
        { brand: 'Samsung', model: 'Galaxy S22' },
        { brand: 'Samsung', model: 'Galaxy A55' },
    ];

    return (
        <section className="py-16 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-bel-dark dark:text-white mb-4">{t('Repair Pricing')}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{t('Transparent pricing for our most popular repairs.')}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full max-w-4xl mx-auto text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-slate-700">
                                <th className="p-4 font-bold text-gray-900 dark:text-white">{t('Model')}</th>
                                <th className="p-4 font-bold text-gray-900 dark:text-white">{t('Screen (Compatible)')}</th>
                                <th className="p-4 font-bold text-gray-900 dark:text-white">{t('Screen (Original)')}</th>
                                <th className="p-4 font-bold text-gray-900 dark:text-white">{t('Battery')}</th>
                                <th className="p-4 font-bold text-gray-900 dark:text-white">{t('Charging Port')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {popularModels.map((item, idx) => {
                                const slug = createSlug(`${item.brand} ${item.model}`);
                                const pricing = repairPrices.find(p => p.id === slug);
                                const fallback = STATIC_REPAIR_PRICES.find(p => p.id === slug);

                                // Use dynamic price if available, otherwise fallback to estimate
                                // Fix: Check override -> fallback -> generic
                                const screenPrice = pricing?.screen_generic ?? fallback?.screen_generic ?? getPrice(item.model, 'screen');
                                const screenOriginalPrice = pricing?.screen_original ?? fallback?.screen_original ?? Math.round(screenPrice * 1.6);

                                // Battery and Port now use source data
                                const batteryPrice = pricing?.battery ?? fallback?.battery ?? getPrice(item.model, 'battery');
                                const portPrice = pricing?.charging ?? fallback?.charging ?? getPrice(item.model, 'charging');

                                return (
                                    <tr key={idx} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">{item.model}</td>
                                        <td className="p-4 text-bel-blue dark:text-blue-400 font-bold">€{screenPrice}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">€{screenOriginalPrice}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">€{batteryPrice}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">€{portPrice}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="text-center mt-8">
                    <Link href={`/${t('lang')}/${t('lang') === 'fr' ? 'reparation' : t('lang') === 'nl' ? 'reparatie' : 'repair'}`} className="text-bel-blue dark:text-blue-400 font-bold hover:underline">
                        {t('View Full Price List')} &rarr;
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PriceTable;

