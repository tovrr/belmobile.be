import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { GlobeEuropeAfricaIcon, ArrowPathRoundedSquareIcon, ScaleIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { getFixedT } from '@/utils/i18n-server';

interface PageProps {
    params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('sustainability_meta_title'),
        description: t('sustainability_meta_desc'),
    };
}

export default async function SustainabilityPage({ params }: PageProps) {
    const { lang } = await params;
    const t = getFixedT(lang);

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen font-sans">
            {/* Hero Section with Earthy Tones */}
            <div className="relative py-24 sm:py-32 overflow-hidden bg-emerald-950">
                <div className="absolute inset-0 opacity-20">
                    {/* Abstract Nature Pattern */}
                    <svg className="h-full w-full text-emerald-900" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                    </svg>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-semibold mb-8 uppercase tracking-widest">
                        <GlobeEuropeAfricaIcon className="w-5 h-5" />
                        <span>Sustainability First</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                        {t('sustainability_hero_title')}
                    </h1>
                    <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto mb-12">
                        {t('sustainability_hero_subtitle')}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16 border-t border-emerald-500/30 pt-12">
                        <div className="text-center">
                            <div className="text-4xl font-extrabold text-emerald-400 mb-2">{t('sustainability_stat_1_val')}</div>
                            <div className="text-sm uppercase tracking-wider text-emerald-200">{t('sustainability_stat_1_label')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-extrabold text-white mb-2">{t('sustainability_stat_2_val')}</div>
                            <div className="text-sm uppercase tracking-wider text-emerald-200">{t('sustainability_stat_2_label')}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-extrabold text-emerald-400 mb-2">{t('sustainability_stat_3_val')}</div>
                            <div className="text-sm uppercase tracking-wider text-emerald-200">{t('sustainability_stat_3_label')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manifesto Section */}
            <div className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-800">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                        <ScaleIcon className="w-8 h-8 text-emerald-600" />
                        {t('sustainability_manifesto_title')}
                    </h2>
                    <div className="prose prose-lg dark:prose-invert text-slate-600 dark:text-slate-300">
                        <p className="mb-6">{t('sustainability_manifesto_p1')}</p>
                        <p>{t('sustainability_manifesto_p2')}</p>
                    </div>
                </div>
            </div>

            {/* Circular Economy Diagram */}
            <div className="py-16 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-16">{t('sustainability_cycle_title')}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Arrows (Desktop Only) */}
                        <div className="hidden md:block absolute top-12 left-[30%] right-[30%] h-0.5 bg-emerald-500/20"></div>

                        <div className="flex flex-col items-center relative z-10">
                            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border-2 border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-600">
                                <ArrowPathRoundedSquareIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('sustainability_cycle_1_title')}</h3>
                            <p className="text-slate-500 max-w-xs">{t('sustainability_cycle_1_desc')}</p>
                        </div>

                        <div className="flex flex-col items-center relative z-10">
                            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border-2 border-blue-500/20 flex items-center justify-center mb-6 text-blue-600">
                                <CheckBadgeIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('sustainability_cycle_2_title')}</h3>
                            <p className="text-slate-500 max-w-xs">{t('sustainability_cycle_2_desc')}</p>
                        </div>

                        <div className="flex flex-col items-center relative z-10">
                            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border-2 border-emerald-900/10 flex items-center justify-center mb-6 text-slate-600">
                                <GlobeEuropeAfricaIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('sustainability_cycle_3_title')}</h3>
                            <p className="text-slate-500 max-w-xs">{t('sustainability_cycle_3_desc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="py-24 text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{t('sustainability_cta_title')}</h2>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href={`/${lang}/repair`} className="px-8 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/30">
                        {t('sustainability_cta_btn_repair')}
                    </Link>
                    <Link href={`/${lang}/buyback`} className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        {t('sustainability_cta_btn_sell')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
