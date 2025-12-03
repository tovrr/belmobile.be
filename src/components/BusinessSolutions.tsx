'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { motion } from 'framer-motion';
import { BuildingOffice2Icon, WrenchScrewdriverIcon, DevicePhoneMobileIcon, CurrencyEuroIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const BusinessSolutions: React.FC = () => {
    const { t } = useLanguage();

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
                </div>

                {/* Trust Section */}
                <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
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
                                    <CheckCircleIcon className="h-12 w-12 text-green-400 mb-4" />
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
