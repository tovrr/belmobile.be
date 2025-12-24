'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { motion } from 'framer-motion';
import { TruckIcon, ClockIcon, ShieldCheckIcon, MapPinIcon, DevicePhoneMobileIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const ExpressCourierClient: React.FC = () => {
    const { t, language } = useLanguage();

    const steps = [
        {
            icon: DevicePhoneMobileIcon,
            title: t('courier_step1_title'),
            desc: t('courier_step1_desc')
        },
        {
            icon: TruckIcon,
            title: t('courier_step2_title'),
            desc: t('courier_step2_desc')
        },
        {
            icon: ClockIcon,
            title: t('courier_step3_title'),
            desc: t('courier_step3_desc')
        },
        {
            icon: ShieldCheckIcon,
            title: t('courier_step4_title'),
            desc: t('courier_step4_desc')
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-deep-space pt-24 pb-12 transition-colors duration-300">
            {/* Hero Section */}
            <div className="relative overflow-hidden py-20 lg:py-32 bg-bel-blue/5 dark:bg-bel-blue/10">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest mb-6"
                        >
                            {t('courier_hero_badge')}
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 leading-tight"
                            dangerouslySetInnerHTML={{ __html: t('courier_hero_title') }}
                        />
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto"
                        >
                            {t('courier_hero_subtitle')}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row justify-center gap-4"
                        >
                            <Link
                                href={`/${language}/repair`}
                                className="px-8 py-5 bg-bel-blue text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-lg flex items-center justify-center gap-2"
                            >
                                {t('courier_cta_book')} <ArrowRightIcon className="h-5 w-5" />
                            </Link>
                            <a
                                href="tel:+32484837560"
                                className="px-8 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-700 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-lg"
                            >
                                {t('courier_cta_call')}
                            </a>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-0 w-64 h-64 bg-bel-blue/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* How it Works */}
            <div className="py-24 bg-white dark:bg-deep-space">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">{t('courier_zone_title')}</h2>
                        <p className="text-slate-500 dark:text-slate-400">{t('courier_zone_subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative p-8 rounded-3xl bg-gray-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                            >
                                <div className="absolute -top-4 -left-4 w-10 h-10 bg-bel-blue text-white rounded-full flex items-center justify-center font-black shadow-lg">
                                    {i + 1}
                                </div>
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mb-6 text-bel-blue">
                                    <step.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{step.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Target Area Map Section */}
            <div className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 overflow-hidden relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-bel-blue font-bold uppercase tracking-widest text-sm mb-4 block">{t('courier_hero_badge')}</span>
                            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">{t('courier_zone_title')}</h2>
                            <ul className="space-y-6 mb-10 text-lg">
                                <li className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="p-2 bg-bel-blue/20 rounded-lg shrink-0">
                                        <CheckCircleIcon className="h-6 w-6 text-bel-blue" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-xl">{t('courier_zone_tt_title')}</p>
                                        <p className="text-slate-400 text-sm mt-1">{t('courier_zone_tt_desc')}</p>
                                        <span className="inline-block mt-2 text-xs font-black uppercase text-amber-400 px-2 py-0.5 border border-amber-400/30 rounded">Free / Gratuit / Gratis</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="p-2 bg-bel-blue/20 rounded-lg shrink-0">
                                        <CheckCircleIcon className="h-6 w-6 text-bel-blue" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-xl">{t('courier_zone_bxl_title')}</p>
                                        <p className="text-slate-400 text-sm mt-1">{t('courier_zone_bxl_desc')}</p>
                                        <span className="inline-block mt-2 text-xs font-black uppercase text-amber-400 px-2 py-0.5 border border-amber-400/30 rounded">15€ Flat Fee</span>
                                    </div>
                                </li>
                            </ul>
                            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <p className="text-sm italic opacity-80">
                                    {language === 'fr'
                                        ? "Depuis que notre atelier de Molenbeek est temporairement fermé, nous avons dédié une flotte de coursiers pour réduire la distance. Mêmes techniciens, même qualité, zéro déplacement pour vous."
                                        : language === 'nl'
                                            ? "Sinds onze werkplaats in Molenbeek tijdelijk gesloten is, hebben we een vloot koeriers ingezet om de afstand te overbruggen. Dezelfde technici, dezelfde kwaliteit, nul verplaatsing voor u."
                                            : "Since our Molenbeek workshop is temporarily closed, we've dedicated a courier fleet to bridge the gap. Same technicians, same quality, zero travel for you."
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                            <div className="absolute inset-0 bg-linear-to-br from-bel-blue/20 to-slate-900 border border-white/20 flex flex-col items-center justify-center p-8 text-center">
                                <MapPinIcon className="h-16 w-16 text-bel-blue mb-4 animate-bounce" />
                                <p className="font-bold text-2xl mb-2">Brussels Express Hub</p>
                                <p className="text-slate-400 italic">1030 Schaerbeek ↔ 1000 Brussels Hub</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Final */}
            <div className="py-24 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-8">{t('courier_footer_title')}</h2>
                    <Link
                        href={`/${language}/repair`}
                        className="inline-block px-12 py-6 bg-bel-blue text-white font-black rounded-3xl shadow-2xl hover:scale-105 transition-all text-2xl"
                    >
                        {t('courier_footer_button')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

export default ExpressCourierClient;
