import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { AcademicCapIcon, BoltIcon, CurrencyEuroIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { getFixedT } from '../../../utils/i18n-server';

// Icon Fallbacks
function CheckBadgeIcon(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>
}

interface PageProps {
    params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('students_meta_title'),
        description: t('students_meta_desc'),
    };
}

export default async function StudentPage({ params }: PageProps) {
    const { lang } = await params;
    const t = getFixedT(lang);

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-sans">
            {/* Hero with vibrant gradient */}
            <div className="relative pt-24 pb-16 overflow-hidden bg-linear-to-br from-indigo-600 to-purple-700 text-white clip-path-slant">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/grid-pattern.svg')]"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between relative z-10">
                    <div className="md:w-1/2 mb-10 md:mb-0">
                        <div className="inline-block bg-yellow-400 text-slate-900 font-black px-4 py-2 rounded-lg -rotate-2 mb-6 shadow-lg shadow-yellow-500/50">
                            {t('students_discount_label')}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                            {t('students_hero_title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-lg">
                            {t('students_hero_subtitle')}
                        </p>
                        <div className="flex gap-4">
                            <Link href={`/${lang}/repair`} className="px-8 py-4 bg-white text-indigo-600 rounded-full font-bold hover:bg-indigo-50 transition-all shadow-xl hover:scale-105 active:scale-95">
                                {t('students_cta_repair')}
                            </Link>
                        </div>
                    </div>
                    {/* Visual Element (Abstract or Student Image placeholder) */}
                    <div className="md:w-1/2 flex justify-center relative">
                        <div className="w-80 h-80 bg-white/10 rounded-full absolute -top-10 -right-10 blur-3xl"></div>
                        <div className="relative bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <AcademicCapIcon className="w-40 h-40 text-yellow-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-2 transition-transform">
                        <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                            <BoltIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('students_benefit_1_title')}</h3>
                        <p className="text-slate-500">{t('students_benefit_1_desc')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-2 transition-transform">
                        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                            <CurrencyEuroIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('students_benefit_2_title')}</h3>
                        <p className="text-slate-500">{t('students_benefit_2_desc')}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 hover:-translate-y-2 transition-transform">
                        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                            <CheckBadgeIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('students_benefit_3_title')}</h3>
                        <p className="text-slate-500">{t('students_benefit_3_desc')}</p>
                    </div>
                </div>
            </div>

            {/* Universities Marquee/Grid */}
            <div className="py-16 bg-slate-100 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-500 uppercase tracking-widest mb-12">{t('students_universities_title')}</h2>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
                        {/* Placeholder text for Unis - In real project, use Logos */}
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-400"><MapPinIcon className="w-5 h-5" /> {t('students_uni_ulb')}</div>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-400"><MapPinIcon className="w-5 h-5" /> {t('students_uni_vub')}</div>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-400"><MapPinIcon className="w-5 h-5" /> {t('students_uni_sl')}</div>
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-400"><MapPinIcon className="w-5 h-5" /> {t('students_uni_erasme')}</div>
                    </div>
                </div>
            </div>

            {/* CTA Bottom */}
            <div className="py-24 text-center">
                <Link href={`/${lang}/buyback`} className="inline-block text-slate-500 hover:text-indigo-600 underline underline-offset-4 decoration-2">
                    {t('students_cta_buy')}
                </Link>
            </div>

        </div>
    );
}
