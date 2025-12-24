'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { motion } from 'framer-motion';
import { BuildingOffice2Icon, WrenchScrewdriverIcon, DevicePhoneMobileIcon, CurrencyEuroIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const BusinessSolutions: React.FC = () => {
    const { t, language } = useLanguage();

    const benefits = [
        {
            icon: WrenchScrewdriverIcon,
            title: "Priority Repair Service",
            desc: "Skip the queue with our dedicated B2B repair line. Most repairs completed within 1 hour."
        },
        {
            icon: CurrencyEuroIcon,
            title: "Exclusive B2B Pricing",
            desc: "Get special volume discounts on repairs and refurbished devices for your fleet."
        },
        {
            icon: DevicePhoneMobileIcon,
            title: "Fleet Management",
            desc: "We buy back your old company devices at top market rates, helping you upgrade cost-effectively."
        },
        {
            icon: BuildingOffice2Icon,
            title: "On-Site Service",
            desc: "For large fleets, we can arrange pick-up and drop-off or even on-site repairs (Brussels area)."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-deep-space pt-24 pb-12 px-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-20 animate-fade-in">
                    <span className="text-electric-indigo font-bold tracking-widest uppercase text-sm mb-4 block">
                        {t('For Companies')}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6">
                        {t('Mobile Solutions for Business')}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        {t('Keep your team connected with our professional repair and fleet management services. Fast, reliable, and cost-effective.')}
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <a
                            href="mailto:b2b@belmobile.be"
                            className="px-8 py-4 bg-electric-indigo text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 hover:scale-105 transition-all"
                        >
                            {t('Contact B2B Team')}
                        </a>
                        <a
                            href="tel:+32484837560"
                            className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                        >
                            {t('Call Us')}
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
                            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-bel-blue/30 transition-all"
                        >
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-bel-blue mb-6">
                                <benefit.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                {t(benefit.title)}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-lg">
                                {t(benefit.desc)}
                            </p>
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
                                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">Pro Fleet Management</span>
                                <h3 className="text-3xl md:text-5xl font-black mb-6 leading-tight">Managing 50+ devices? <br /> We have a portal for that.</h3>
                                <p className="text-blue-100 text-lg mb-8 max-w-2xl">
                                    Our Schaerbeek hub handles large-scale deployments, device end-of-life recycling, and 24h express repairs for corporate fleets. Get a dedicated account manager and a 10% lifetime discount on parts.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                                        <CheckCircleIcon className="h-5 w-5 text-bel-yellow" /> <span>24h Express SLA</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                                        <CheckCircleIcon className="h-5 w-5 text-bel-yellow" /> <span>Monthly Invoicing</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                                        <CheckCircleIcon className="h-5 w-5 text-bel-yellow" /> <span>Loaner Devices</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-auto">
                                <Link
                                    href={`/${language}/express-courier`}
                                    className="px-8 py-6 bg-white text-bel-blue font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-3 whitespace-nowrap"
                                >
                                    Explore Corporate Bridge <ArrowRightIcon className="h-5 w-5" />
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
                            {t('Why Partner with Belmobile?')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                "Official Invoice & VAT",
                                "Dedicated Account Manager",
                                "Flexible Payment Terms"
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <CheckCircleIcon className="h-12 w-12 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-xl font-bold text-white">{t(item)}</span>
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
