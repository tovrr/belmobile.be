'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { MOCK_FAQ_CATEGORIES } from '../../constants';
import {
    PlusIcon,
    MinusIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
    PhoneIcon,
    WhatsAppIcon,
    EmailIcon,
    MapPinIcon,
    SparklesIcon
} from '../ui/BrandIcons';

import SchemaMarkup from '../seo/SchemaMarkup';
import Image from 'next/image';

const FAQPage: React.FC = () => {
    const { t, language } = useLanguage();
    const [openItem, setOpenItem] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    // Remove AI Verified category as requested
    const allCategories = MOCK_FAQ_CATEGORIES;

    // Flatten all FAQs for Schema Markup (SEO)
    const faqSchemaItems = allCategories.flatMap(cat =>
        cat.items.map(item => ({
            question: t(item.q),
            answer: t(item.a)
        }))
    );

    const filteredCategories = allCategories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            t(item.q).toLowerCase().includes(search.toLowerCase()) ||
            t(item.a).toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    const contactLinks = [
        {
            icon: PhoneIcon,
            title: 'support_call_label',
            value: '+32 2 275 98 67',
            href: 'tel:+3222759867',
            color: 'bg-blue-500'
        },
        {
            icon: WhatsAppIcon,
            title: 'support_whatsapp_label',
            value: 'WhatsApp',
            href: `https://wa.me/32484837560?text=${encodeURIComponent(t('whatsapp_message') || 'Bonjour Belmobile, j\'ai une question :')}`,
            color: 'bg-green-500'
        },
        {
            icon: SparklesIcon,
            title: 'support_chat_label',
            value: 'AI Assistant',
            href: '#chat',
            color: 'bg-purple-500',
            onClick: () => {
                window.dispatchEvent(new CustomEvent('open-ai-chat'));
            }
        },
        {
            icon: EmailIcon,
            title: 'support_email_label',
            value: 'info@belmobile.be',
            href: `/${language}/contact?subject=info`,
            color: 'bg-orange-500'
        },
        {
            icon: MapPinIcon,
            title: 'support_visit_label',
            value: t('support_visit_label'),
            href: `/${language}/stores`,
            color: 'bg-red-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 transition-colors duration-300">
            <SchemaMarkup type="faq" faqItems={faqSchemaItems} />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-bel-dark dark:text-white mb-6 tracking-tight">
                        {t('FAQ')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        {t('Find answers to common questions about repairs, buyback, warranties, and more.')}
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 max-w-7xl mx-auto">
                    {/* Main Content - FAQ List */}
                    <div className="xl:col-span-8 order-1">
                        {/* Search Bar */}
                        <div className="relative mb-10">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-14 pr-4 py-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none focus:ring-2 focus:ring-bel-blue focus:outline-none dark:text-white transition-all text-lg"
                            />
                        </div>

                        <div className="space-y-10">
                            {filteredCategories.map((category) => (
                                <section key={category.id}>
                                    <h2 className="text-2xl font-bold text-bel-dark dark:text-white mb-6 flex items-center">
                                        <span className="w-2 h-8 bg-bel-blue rounded-full mr-4"></span>
                                        {t(category.title)}
                                    </h2>
                                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
                                        {category.items.map((item, idx) => {
                                            const itemId = `${category.id}-${idx}`;
                                            const isOpen = openItem === itemId;
                                            return (
                                                <div key={idx} className="group transition-all">
                                                    <button
                                                        onClick={() => toggleItem(itemId)}
                                                        className="w-full flex justify-between items-center text-left px-8 py-6 focus:outline-none hover:bg-gray-50/80 dark:hover:bg-slate-700/30 transition-colors"
                                                    >
                                                        <span className={`font-semibold text-lg pr-8 ${isOpen ? 'text-bel-blue dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                            {t(item.q)}
                                                        </span>
                                                        <span className={`shrink-0 p-1.5 rounded-xl transition-all ${isOpen ? 'bg-bel-blue text-white rotate-180' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 group-hover:bg-bel-blue/10'}`}>
                                                            {isOpen ? <MinusIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                                                        </span>
                                                    </button>
                                                    <div
                                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100 pb-8' : 'max-h-0 opacity-0'}`}
                                                    >
                                                        <div className="px-8 text-lg text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-slate-700/50 pt-6 bg-blue-50/5 dark:bg-blue-900/5">
                                                            {t(item.a)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}

                            {filteredCategories.length === 0 && (
                                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                                    <div className="mb-4 text-gray-300 dark:text-gray-600">
                                        <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
                                    </div>
                                    <p className="text-xl font-medium text-gray-500 dark:text-gray-400">{t('No results found.')}</p>
                                    <button
                                        onClick={() => setSearch('')}
                                        className="mt-4 text-bel-blue font-semibold hover:underline"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Support Channels */}
                    <aside className="xl:col-span-4 order-2">
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-slate-700 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-bel-blue/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-bel-blue/10 transition-colors"></div>

                                <h3 className="text-2xl font-bold text-bel-dark dark:text-white mb-3">
                                    {t('support_sidebar_title')}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                    {t('support_sidebar_desc')}
                                </p>

                                <div className="space-y-4">
                                    {contactLinks.map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link.href}
                                            onClick={(e) => {
                                                if (link.onClick) {
                                                    e.preventDefault();
                                                    link.onClick();
                                                }
                                            }}
                                            className="flex items-center p-4 rounded-2xl bg-gray-50 dark:bg-slate-700/50 hover:bg-bel-blue hover:text-white group/item transition-all"
                                        >
                                            <div className={`p-3 rounded-xl ${link.color} text-white group-hover/item:bg-white group-hover/item:text-bel-blue transition-colors shadow-lg shadow-gray-200/20 dark:shadow-none`}>
                                                <link.icon className="h-6 w-6" />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-0.5">
                                                    {t(link.title)}
                                                </p>
                                                <p className="font-bold text-lg leading-tight">
                                                    {link.value}
                                                </p>
                                            </div>
                                        </a>
                                    ))}
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-700 text-center">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {t('faq_sidebar_hours')}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-bel-dark p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h4 className="text-xl font-bold mb-4">{t('faq_trust_title')}</h4>
                                    <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                                        {t('faq_trust_desc')}
                                    </p>
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-bel-dark bg-slate-800 overflow-hidden transition-transform group-hover:translate-x-1 shadow-lg ring-2 ring-white/5">
                                                <Image
                                                    src={`/images/avatars/avatar${i}.png`}
                                                    alt={`${t('Technician')} ${i}`}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        ))}
                                        <div className="w-10 h-10 rounded-full border-2 border-bel-dark bg-bel-blue flex items-center justify-center text-xs font-bold transition-transform group-hover:translate-x-1">
                                            +12
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 opacity-10 blur-xl group-hover:opacity-20 transition-opacity">
                                    <SparklesIcon className="w-40 h-40" />
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
