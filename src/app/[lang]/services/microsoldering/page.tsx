import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CpuChipIcon, BoltIcon, WrenchScrewdriverIcon, ShieldCheckIcon, PlusSmallIcon, MinusSmallIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { getFixedT } from '../../../../utils/i18nFixed';

interface PageProps {
    params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('microsoldering_meta_title'),
        description: t('microsoldering_meta_desc'),
    };
}

export default async function MicrosolderingPage({ params }: PageProps) {
    const { lang } = await params;
    const t = getFixedT(lang);

    // Icon fallbacks
    const WifiIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" /></svg>;
    const EyeIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
    const BeakerIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-1.023-7.757-2.187-2.618-1.326-3.235-4.493-1.428-5.275L5 14.5" /></svg>;

    const faqItems = [
        { q: t('microsoldering_faq_1_q'), a: t('microsoldering_faq_1_a') },
        { q: t('microsoldering_faq_2_q'), a: t('microsoldering_faq_2_a') },
        { q: t('microsoldering_faq_3_q'), a: t('microsoldering_faq_3_a') },
        { q: t('microsoldering_faq_4_q'), a: t('microsoldering_faq_4_a') }
    ];

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
            {/* Hero Section */}
            <div className="relative text-white py-24 sm:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900 z-0">
                    <div className="absolute inset-0 bg-linear-to-b from-indigo-900/50 to-slate-900/90 z-10" />
                    <Image
                        src="/images/bento/motherboard_bg.png"
                        alt="Microsoldering Lab"
                        fill
                        className="object-cover opacity-30"
                        priority
                    />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6 backdrop-blur-sm">
                        <CpuChipIcon className="w-4 h-4" />
                        <span>Level 3 Repair Center</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                        {t('microsoldering_hero_title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                        {t('microsoldering_hero_subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href={`/${lang}/contact`} className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-900 bg-amber-400 rounded-full hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95">
                            <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                            {t('microsoldering_cta')}
                        </Link>
                    </div>

                    {/* Trust Signals */}
                    <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-slate-300 text-sm font-medium border-t border-white/10 pt-8">
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-white/5 rounded-2xl mb-2">
                                <CpuChipIcon className="w-6 h-6 text-amber-400" />
                            </div>
                            <span className="uppercase tracking-wider opacity-80">{t('microsoldering_trust_1')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-white/5 rounded-2xl mb-2">
                                <ShieldCheckIcon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="uppercase tracking-wider opacity-80">{t('microsoldering_trust_2')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-white/5 rounded-2xl mb-2">
                                <BoltIcon className="w-6 h-6 text-amber-400" />
                            </div>
                            <span className="uppercase tracking-wider opacity-80">{t('microsoldering_trust_3')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid - Dark + Glassmorphism */}
            <div className="py-24 bg-slate-900 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl relative inline-block">
                            <span className="relative z-10">{t('microsoldering_features_title')}</span>
                            <span className="absolute bottom-1 left-0 right-0 h-3 bg-amber-500/20 -rotate-1 rounded-full z-0"></span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: t('microsoldering_feature_1_title'), desc: t('microsoldering_feature_1_desc'), icon: BoltIcon, color: "text-amber-400" },
                            { title: t('microsoldering_feature_2_title'), desc: t('microsoldering_feature_2_desc'), icon: WifiIcon, color: "text-blue-400" },
                            { title: t('microsoldering_feature_3_title'), desc: t('microsoldering_feature_3_desc'), icon: EyeIcon, color: "text-emerald-400" },
                            { title: t('microsoldering_feature_4_title'), desc: t('microsoldering_feature_4_desc'), icon: BeakerIcon, color: "text-indigo-400" },
                        ].map((feature, i) => (
                            <div key={i} className="group relative bg-slate-800/50 border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-2xl hover:shadow-indigo-500/10">
                                <div className={`w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Process Section */}
            <div className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">{t('microsoldering_process_title')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-linear-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent z-0"></div>

                        {[
                            { step: 1, title: t('microsoldering_step_1_title'), desc: t('microsoldering_step_1_desc') },
                            { step: 2, title: t('microsoldering_step_2_title'), desc: t('microsoldering_step_2_desc') },
                            { step: 3, title: t('microsoldering_step_3_title'), desc: t('microsoldering_step_3_desc') },
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-xl mb-6 relative group">
                                    <span className="text-4xl font-black text-amber-500/20 absolute group-hover:text-amber-500/40 transition-colors">0{item.step}</span>
                                    <CpuChipIcon className="w-8 h-8 text-slate-600 dark:text-slate-400 group-hover:text-amber-500 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 max-w-xs">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-24 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-16">{t('microsoldering_faq_title')}</h2>
                    <div className="space-y-4">
                        {faqItems.map((item, i) => (
                            <FAQItem key={i} question={item.q} answer={item.a} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    return (
        <details className="group bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 dark:text-white">
                <h3 className="font-bold text-lg">{question}</h3>
                <ChevronDownIcon className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" />
            </summary>
            <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>{answer}</p>
            </div>
        </details>
    );
}

// Icon fallbacks since I might miss imports
function WifiIcon(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" /></svg>;
}

function EyeIcon(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
}

function BeakerIcon(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-1.023-7.757-2.187-2.618-1.326-3.235-4.493-1.428-5.275L5 14.5" /></svg>
}
