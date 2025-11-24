
import React from 'react';
import { DEVICE_CATALOG, REPAIR_ISSUES } from '../constants';
import { useLanguage } from '../hooks/useLanguage';
import { Link } from 'react-router-dom';

// Helper to calculate price (simplified version of BuybackRepair logic)
const getPrice = (modelName: string, issueId: string, brand: string, type: string = 'smartphone') => {
    const modelValue = DEVICE_CATALOG[type]?.[brand]?.[modelName] || 200;
    const issue = REPAIR_ISSUES.find(i => i.id === issueId);
    if (!issue) return 0;

    let tierMultiplier = 1;
    if (modelValue > 800) tierMultiplier = 2.5;
    else if (modelValue > 400) tierMultiplier = 1.8;
    else if (modelValue > 200) tierMultiplier = 1.2;

    return Math.round(issue.base * tierMultiplier);
};

const PriceTable: React.FC = () => {
    const { t, language } = useLanguage();
    
    const popularModels = [
        { brand: 'Apple', model: 'iPhone 15' },
        { brand: 'Apple', model: 'iPhone 14' },
        { brand: 'Apple', model: 'iPhone 13 Pro Max' },
        { brand: 'Apple', model: 'iPhone 13 Pro' },
        { brand: 'Apple', model: 'iPhone 13' },
        { brand: 'Samsung', model: 'Galaxy S24' },
        { brand: 'Samsung', model: 'Galaxy S23' },
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
                                const screenPrice = getPrice(item.model, 'screen', item.brand);
                                const batteryPrice = getPrice(item.model, 'battery', item.brand);
                                const portPrice = getPrice(item.model, 'charging', item.brand);
                                
                                return (
                                    <tr key={idx} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">{item.model}</td>
                                        <td className="p-4 text-bel-blue dark:text-blue-400 font-bold">€{screenPrice}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">€{Math.round(screenPrice * 1.6)}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">€{batteryPrice}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">€{portPrice}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                <div className="text-center mt-8">
                    <Link to={`/${language}/repair`} className="text-bel-blue dark:text-blue-400 font-bold hover:underline">
                        {t('View Full Price List')} &rarr;
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PriceTable;
