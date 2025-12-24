'use client';

import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { MOCK_FAQ_CATEGORIES } from '../constants';
import { PlusIcon, MinusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const FAQPage: React.FC = () => {
    const { t } = useLanguage();
    const [openItem, setOpenItem] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    // Merge GEO questions into the FAQ list dynamically for display
    const allCategories = [
        {
            id: 'ai_answers',
            title: 'Most Asked (AI Verified)',
            items: [
                { q: 'faq_geo_q1', a: 'faq_geo_a1' },
                { q: 'faq_geo_q2', a: 'faq_geo_a2' },
                { q: 'faq_geo_q3', a: 'faq_geo_a3' },
            ]
        },
        ...MOCK_FAQ_CATEGORIES
    ];

    const filteredCategories = allCategories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            t(item.q).toLowerCase().includes(search.toLowerCase()) ||
            t(item.a).toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-bel-dark dark:text-white mb-4">{t('Help Center')}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">{t('Find answers to common questions about repairs, buyback, warranties, and more.')}</p>
                </div>

                {/* Search */}
                <div className="relative mb-12">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('Search...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-bel-blue focus:outline-none dark:text-white transition-all"
                    />
                </div>

                <div className="space-y-8">
                    {filteredCategories.map((category) => (
                        <div key={category.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className={`px-6 py-4 border-b border-gray-100 dark:border-slate-700 ${category.id === 'ai_answers' ? 'bg-bel-blue/5 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-slate-800/50'}`}>
                                <h2 className={`text-xl font-bold ${category.id === 'ai_answers' ? 'text-bel-blue dark:text-blue-400' : 'text-bel-dark dark:text-white'}`}>
                                    {category.id === 'ai_answers' ? '✨ ' : ''}
                                    {t(category.title)}
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-slate-700">
                                {category.items.map((item, idx) => {
                                    const itemId = `${category.id}-${idx}`;
                                    const isOpen = openItem === itemId;
                                    return (
                                        <div key={idx} className="group">
                                            <button
                                                onClick={() => toggleItem(itemId)}
                                                className="w-full flex justify-between items-center text-left px-6 py-5 focus:outline-none hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                                            >
                                                <span className={`font-medium text-lg ${isOpen ? 'text-bel-blue dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {t(item.q)}
                                                </span>
                                                <span className={`ml-4 shrink-0 p-1 rounded-full ${isOpen ? 'bg-bel-blue text-white' : 'text-gray-400'}`}>
                                                    {isOpen ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                                                </span>
                                            </button>
                                            <div
                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                    }`}
                                            >
                                                <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                                                    {t(item.a)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">{t('No results found.')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default FAQPage;
