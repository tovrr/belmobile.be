'use client';

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { motion } from 'framer-motion';
import { BuildingOfficeIcon as BuildingOffice2Icon, RepairIcon as WrenchScrewdriverIcon, DevicePhoneIcon as DevicePhoneMobileIcon, CurrencyEuroIcon, CheckCircleIcon, ArrowRightIcon } from '../ui/BrandIcons';
import Link from 'next/link';
import SchemaMarkup from '../seo/SchemaMarkup';

const BusinessSolutions: React.FC = () => {
    const { t, language } = useLanguage();

    const benefits = [
        {
            icon: WrenchScrewdriverIcon,
            title: t('biz_benefit_priority_title'),
            desc: t('biz_benefit_priority_desc'),
            path: '/repair'
        },
        {
            icon: CurrencyEuroIcon,
            title: t('biz_benefit_pricing_title'),
            desc: t('biz_benefit_pricing_desc'),
            path: '/contact'
        },
        {
            icon: DevicePhoneMobileIcon,
            title: t('biz_benefit_fleet_title'),
            desc: t('biz_benefit_fleet_desc'),
            path: '/buyback'
        },
        {
            icon: BuildingOffice2Icon,
            title: t('biz_benefit_onsite_title'),
            desc: t('biz_benefit_onsite_desc'),
            path: '/express-courier'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-deep-space pt-24 pb-12 px-4 transition-colors duration-300">
            <SchemaMarkup type="organization" />
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-20 animate-fade-in">
                    <span className="text-electric-indigo font-bold tracking-widest uppercase text-sm mb-4 block">
                        {t('biz_hero_badge')}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6">
                        {t('biz_hero_title')}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        {t('biz_hero_subtitle')}
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href={`/${language}/contact?subject=other`}
                            className="px-8 py-4 bg-electric-indigo text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 hover:scale-105 transition-all"
                        >
                            {t('biz_cta_contact')}
                        </Link>
                        <a
                            href="tel:+32484837560"
                            className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                        >
                            {t('biz_cta_call')}
                        </a>
                    </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="h-full"
                        >
                            <Link href={`/${language}${benefit.path}`} className="block h-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-bel-blue/30 transition-all group cursor-pointer">
                                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-bel-blue mb-6 group-hover:scale-110 transition-transform">
                                    <benefit.icon className="h-8 w-8" aria-hidden="true" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    {benefit.title}
                                    <ArrowRightIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-bel-blue" />
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-lg">
                                    {benefit.desc}
                                </p>
                            </Link>
                        </motion.div>
                    ))}


                    {/* NEW: Fleet Management Detail Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 bg-bel-blue text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
                    >
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">{t('biz_fleet_badge')}</span>
                                <h3 className="text-3xl md:text-5xl font-black mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: t('biz_fleet_title') }} />
                                <p className="text-blue-100 text-lg mb-8 max-w-2xl">
                                    {t('biz_fleet_desc')}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                                        <CheckCircleIcon className="h-5 w-5 text-bel-yellow" aria-hidden="true" /> <span>{t('biz_fleet_sla')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                                        <CheckCircleIcon className="h-5 w-5 text-bel-yellow" aria-hidden="true" /> <span>{t('biz_fleet_invoice')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                                        <CheckCircleIcon className="h-5 w-5 text-bel-yellow" aria-hidden="true" /> <span>{t('biz_fleet_loaner')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-auto">
                                <Link
                                    href={`/${language}/express-courier`}
                                    className="px-8 py-6 bg-white text-bel-blue font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-3 whitespace-nowrap"
                                >
                                    {t('biz_fleet_cta')} <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                        {/* Abstract Background for the card */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                    </motion.div>
                </div>

                {/* Trust Section */}
                <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-12">
                            {t('biz_trust_title')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { key: "biz_trust_invoice", icon: CheckCircleIcon },
                                { key: "biz_trust_manager", icon: CheckCircleIcon },
                                { key: "biz_trust_terms", icon: CheckCircleIcon }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <item.icon className="h-12 w-12 text-green-400 mb-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                                    <span className="text-xl font-bold text-white">{t(item.key)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessSolutions;
