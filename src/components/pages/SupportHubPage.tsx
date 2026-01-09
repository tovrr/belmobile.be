'use client';

import React from 'react';
import Link from 'next/link';
import {
    ChatBubbleLeftRightIcon,
    QuestionMarkCircleIcon,
    MapPinIcon,
    TruckIcon,
    ShieldCheckIcon,
    NewspaperIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../hooks/useLanguage';
import { getLocalizedPath } from '@/utils/i18n-helpers';

interface SupportHubPageProps {
    lang: string;
}

const SupportHubPage: React.FC<SupportHubPageProps> = () => {
    const { t, language } = useLanguage();

    const supportCards = [
        {
            title: t('support_contact_title'),
            description: t('support_contact_desc'),
            icon: ChatBubbleLeftRightIcon,
            href: getLocalizedPath('/contact', language),
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: t('support_faq_title'),
            description: t('support_faq_desc'),
            icon: QuestionMarkCircleIcon,
            href: getLocalizedPath('/faq', language),
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            title: t('support_stores_title'),
            description: t('support_stores_desc'),
            icon: MapPinIcon,
            href: getLocalizedPath('/stores', language),
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            title: t('support_track_title'),
            description: t('support_track_desc'),
            icon: TruckIcon,
            href: getLocalizedPath('/track-order', language),
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
        },
        {
            title: t('support_warranty_title'),
            description: t('support_warranty_desc'),
            icon: ShieldCheckIcon,
            href: getLocalizedPath('/warranty', language),
            color: 'text-red-500',
            bg: 'bg-red-500/10'
        },
        {
            title: t('support_blog_title'),
            description: t('support_blog_desc'),
            icon: NewspaperIcon,
            href: getLocalizedPath('/blog', language),
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-32 pb-20 relative overflow-hidden transition-colors duration-300">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-6">
                        {t('support_hero_title')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        {t('support_hero_subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {supportCards.map((card, index) => (
                        <Link
                            key={index}
                            href={card.href}
                            className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-gray-100 dark:border-slate-800 rounded-2xl p-8 hover:shadow-2xl hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`w-14 h-14 rounded-xl ${card.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon className={`w-7 h-7 ${card.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {card.description}
                            </p>

                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SupportHubPage;
