'use client';

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { motion } from 'framer-motion';
import { AcademicCapIcon, BoltIcon, MicroscopeIcon, IdentificationIcon, CheckCircleIcon, ArrowRightIcon, SparklesIcon } from '../ui/BrandIcons';
import Link from 'next/link';
import SchemaMarkup from '../seo/SchemaMarkup';

const TrainingAcademy: React.FC = () => {
    const { t, language } = useLanguage();

    const levels = [
        {
            icon: BoltIcon,
            title: t('acad_level_beginner_title'),
            desc: t('acad_level_beginner_desc'),
            badge: "Week 1-2"
        },
        {
            icon: MicroscopeIcon,
            title: t('acad_level_advanced_title'),
            desc: t('acad_level_advanced_desc'),
            badge: "Week 3-4"
        },
        {
            icon: IdentificationIcon,
            title: t('acad_level_master_title'),
            desc: t('acad_level_master_desc'),
            badge: "Expert only"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-deep-space pt-24 pb-12 px-4 transition-colors duration-300">
            <SchemaMarkup type="organization" />
            <div className="max-w-7xl mx-auto">
                {/* Hero section */}
                <div className="text-center mb-20 relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-citron/10 text-midnight dark:text-cyber-citron rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-cyber-citron/20"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        {t('acad_hero_badge')}
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
                        {t('acad_hero_title')}
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
                        {t('acad_hero_subtitle')}
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href={`/${language}/contact?subject=training`}
                            className="px-10 py-5 bg-midnight dark:bg-cyber-citron text-white dark:text-midnight font-black rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                        >
                            {t('acad_cta_enroll')}
                            <ArrowRightIcon className="w-5 h-5" />
                        </Link>
                        <a
                            href="tel:+3222759867"
                            className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-black rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center"
                        >
                            {t('acad_cta_call')}
                        </a>
                    </div>

                    {/* Abstract elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-linear-to-b from-cyber-citron/5 to-transparent blur-3xl -z-10"></div>
                </div>

                {/* Levels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {levels.map((level, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl group-hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-800 group-hover:border-cyber-citron/30"></div>

                            <div className="relative p-10 flex flex-col h-full">
                                <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 w-fit">
                                    {level.badge}
                                </div>

                                <div className="w-16 h-16 bg-cyber-citron/10 rounded-2xl flex items-center justify-center text-midnight dark:text-cyber-citron mb-8 group-hover:rotate-6 transition-transform">
                                    <level.icon className="h-8 w-8" />
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                                    {level.title}
                                </h3>

                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                    {level.desc}
                                </p>

                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                        <span>Pro equipment access</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                        <span>Personal workbench</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Founder's / Expert Trust Section */}
                <div className="bg-midnight dark:bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
                    <div className="relative z-10">
                        <AcademicCapIcon className="w-16 h-16 text-cyber-citron mx-auto mb-8 animate-bounce-slow" />
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">
                            {t('acad_trust_title')}
                        </h2>
                        <p className="text-cyber-citron font-black text-lg md:text-2xl mb-12 uppercase tracking-widest">
                            {t('acad_slogan_expert')}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { key: "acad_trust_expert", icon: MicroscopeIcon },
                                { key: "acad_trust_practice", icon: BoltIcon },
                                { key: "acad_trust_cert", icon: IdentificationIcon }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                                        <item.icon className="h-10 w-10 text-cyber-citron" />
                                    </div>
                                    <span className="text-2xl font-black text-white">{t(item.key)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 pt-8 border-t border-white/5 max-w-2xl mx-auto">
                            <p className="text-slate-400 italic text-lg leading-relaxed">
                                "Our mission is to pass on the high-level expertise of motherboard repair to the next generation of technicians.
                                In a world that throws away electronics, we teach you how to give them a heart transplant."
                            </p>
                            <div className="mt-6 flex flex-col items-center">
                                <span className="text-white font-black text-xl uppercase tracking-widest">Belmobile Senior Team</span>
                                <span className="text-cyber-citron font-bold text-sm">Master Technicians</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual pattern */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-fabrics.png')] opacity-10 pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};

export default TrainingAcademy;
