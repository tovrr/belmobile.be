import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getFixedT } from '../../../utils/i18nFixed';
import {
    HeartIcon,
    SparklesIcon,
    ScaleIcon,
    UserGroupIcon,
    WrenchScrewdriverIcon,
    GlobeEuropeAfricaIcon,
    BoltIcon
} from '@heroicons/react/24/outline';

interface PageProps {
    params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('about_meta_title'),
        description: t('about_meta_desc'),
    };
}

export default async function AboutPage({ params }: PageProps) {
    const { lang } = await params;
    const t = getFixedT(lang);

    const stats = [
        { label: t('about_stat_1'), value: '50k+', icon: WrenchScrewdriverIcon },
        { label: t('about_stat_2'), value: '45k+', icon: UserGroupIcon },
        { label: t('about_stat_3'), value: '1', icon: SparklesIcon }, // 1 Year Warranty
    ];

    const values = [
        {
            title: t('about_value_1_title'),
            desc: t('about_value_1_desc'),
            icon: BoltIcon,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10'
        },
        {
            title: t('about_value_2_title'),
            desc: t('about_value_2_desc'),
            icon: GlobeEuropeAfricaIcon,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10'
        },
        {
            title: t('about_value_3_title'),
            desc: t('about_value_3_desc'),
            icon: ScaleIcon,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10'
        }
    ];

    return (
        <div className="bg-slate-50 dark:bg-black min-h-screen">
            {/* Hero Section */}
            <div className="relative text-white py-24 sm:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900 z-0">
                    <div className="absolute inset-0 bg-linear-to-b from-slate-900/50 to-slate-900/10 z-10" />
                    <Image
                        src="/images/hero_phone_bg.png"
                        alt="Belmobile Team"
                        fill
                        className="object-cover opacity-40"
                        priority
                    />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-6 backdrop-blur-sm">
                        <HeartIcon className="w-4 h-4 text-rose-400" />
                        <span>{t('about_est_date') || "Est. 2011"}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                        {t('about_hero_title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        {t('about_hero_subtitle')}
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="py-20 bg-white dark:bg-zinc-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-6">
                                <span>{t('about_mission_title')}</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                {t('about_mission_desc')}
                            </h2>
                            <div className="prose prose-lg text-slate-600 dark:text-slate-400">
                                <p>
                                    At Belmobile, we believe that technology should serve us without costing the earth.
                                    By providing top-tier repairs and high-quality refurbished devices, we make it easy for you to make the sustainable choice.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="p-6 bg-slate-50 dark:bg-black/50 rounded-2xl border border-slate-100 dark:border-white/5 text-center shadow-sm">
                                    <stat.icon className="w-8 h-8 mx-auto mb-4 text-indigo-500" />
                                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Grid */}
            <div className="py-24 bg-slate-50 dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {t('about_values_title')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((item, index) => (
                            <div key={index} className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.bg}`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                        {t('about_cta_title')}
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
                        {t('about_cta_desc')}
                    </p>
                    <Link
                        href={`/${lang}/contact`}
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95"
                    >
                        {t('about_cta_button')}
                    </Link>
                </div>
            </div>
        </div>
    );
}


