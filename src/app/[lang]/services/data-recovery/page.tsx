import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
    ShieldCheckIcon,
    ServerStackIcon,
    CpuChipIcon,
    DocumentMagnifyingGlassIcon,
    CurrencyEuroIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { getFixedT } from '../../../../utils/i18nFixed';

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('datarecovery_meta_title'),
        description: t('datarecovery_meta_desc'),
    };
}

export default async function DataRecoveryPage({ params }: Props) {
    const { lang } = await params;
    const t = getFixedT(lang);

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
                <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:mask-[linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
                <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                        <CheckBadgeIcon className="w-4 h-4" />
                        {t('datarecovery_trust_badge')}
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-extrabold dark:text-white tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 pb-2">
                        {t('datarecovery_hero_title')}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        {t('datarecovery_hero_subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={`/${lang}/contact`}
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-bel-blue rounded-2xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        >
                            {t('datarecovery_cta')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: t('datarecovery_feature_1_title'), desc: t('datarecovery_feature_1_desc'), icon: CpuChipIcon },
                            { title: t('datarecovery_feature_2_title'), desc: t('datarecovery_feature_2_desc'), icon: CurrencyEuroIcon },
                            { title: t('datarecovery_feature_3_title'), desc: t('datarecovery_feature_3_desc'), icon: ServerStackIcon },
                            { title: t('datarecovery_feature_4_title'), desc: t('datarecovery_feature_4_desc'), icon: ShieldCheckIcon },
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-bel-blue/30 transition-colors group">
                                <feature.icon className="w-10 h-10 text-bel-blue mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-20 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-3xl lg:text-4xl font-bold text-center text-slate-900 dark:text-white mb-16">
                        {t('datarecovery_process_title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 font-mono">
                        {[
                            { title: t('datarecovery_step_1_title'), desc: t('datarecovery_step_1_desc') },
                            { title: t('datarecovery_step_2_title'), desc: t('datarecovery_step_2_desc') },
                            { title: t('datarecovery_step_3_title'), desc: t('datarecovery_step_3_desc') },
                            { title: t('datarecovery_step_4_title'), desc: t('datarecovery_step_4_desc') },
                        ].map((step, idx) => (
                            <div key={idx} className="relative">
                                <div className="text-number text-9xl font-bold text-slate-200 dark:text-slate-800 absolute -top-10 -left-6 -z-10 pointer-events-none select-none">
                                    {idx + 1}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 pl-4 border-l-4 border-bel-blue">
                                    {step.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 pl-4">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
                        {t('datarecovery_faq_title')}
                    </h2>
                    <div className="space-y-6">
                        {[
                            { q: t('datarecovery_faq_1_q'), a: t('datarecovery_faq_1_a') },
                            { q: t('datarecovery_faq_2_q'), a: t('datarecovery_faq_2_a') },
                            { q: t('datarecovery_faq_3_q'), a: t('datarecovery_faq_3_a') },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-start gap-2">
                                    <span className="text-bel-blue">Q.</span> {item.q}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 pl-6 border-l-2 border-slate-200 dark:border-slate-700">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 bg-linear-to-b from-slate-900 to-slate-950 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6">{t('datarecovery_hero_title')}</h2>
                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">{t('datarecovery_hero_subtitle')}</p>
                    <Link
                        href={`/${lang}/contact`}
                        className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-slate-900 transition-all bg-white rounded-2xl hover:bg-gray-100 hover:scale-105"
                    >
                        {t('datarecovery_cta')}
                    </Link>
                </div>
            </section>
        </main>
    );
}
