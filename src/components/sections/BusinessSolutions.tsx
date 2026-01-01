'use client';

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import SchemaMarkup from '../seo/SchemaMarkup';
import {
    BuildingOfficeIcon as BuildingOffice2Icon,
    RepairIcon as WrenchScrewdriverIcon,
    DevicePhoneIcon as DevicePhoneMobileIcon,
    CurrencyEuroIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    ComputerDesktopIcon,
    GlobeAltIcon,
    RocketLaunchIcon,
    ClockIcon,
    ChartBarIcon,
    BanknotesIcon
} from '../ui/BrandIcons';
import TrustedPartnersCloud from './TrustedPartnersCloud';

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
            path: '/contact?subject=business'
        },
        {
            icon: BuildingOffice2Icon,
            title: t('biz_benefit_onsite_title'),
            desc: t('biz_benefit_onsite_desc'),
            path: '/express-courier'
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#020202] pt-24 pb-20 px-4 transition-colors duration-300 overflow-hidden">
            <SchemaMarkup type="organization" />

            {/* Ambient Background Effects - More sophisticated for 2026 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] -left-[5%] w-[50%] h-[50%] bg-cyber-citron/10 rounded-full blur-[140px] animate-pulse"></div>
                <div className="absolute bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '3s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-40 mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Hero Section - 2026 Visionary Style */}
                <div className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-cyber-citron text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-xl"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-citron opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-citron"></span>
                        </span>
                        {t('biz_hero_badge')}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white mb-10 tracking-[ -0.05em] leading-[0.85]"
                    >
                        {t('biz_hero_title')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-xl md:text-3xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-tight mb-16 font-medium"
                    >
                        {t('biz_hero_subtitle')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row justify-center gap-8"
                    >
                        <Link
                            href={`/${language}/contact?subject=other`}
                            className="group relative px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-2xl shadow-2xl hover:scale-[1.05] active:scale-95 transition-all overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-4 text-lg">
                                {t('biz_cta_contact')}
                                <ArrowRightIcon className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                            </span>
                        </Link>
                        <a
                            href="tel:+32484837560"
                            className="px-12 py-6 bg-white/40 dark:bg-white/5 text-slate-900 dark:text-white border-2 border-slate-900/10 dark:border-white/10 font-black rounded-2xl hover:bg-white/60 dark:hover:bg-white/10 transition-all backdrop-blur-3xl flex items-center gap-4 text-lg"
                        >
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            {t('biz_cta_call')}
                        </a>
                    </motion.div>
                </div>

                <TrustedPartnersCloud title={t('biz_trust_title')} />

                {/* AI & Infrastructure Section - NEW VISION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative p-12 rounded-[3.5rem] bg-linear-to-br from-slate-900 to-black border border-white/10 shadow-3xl overflow-hidden group"
                    >
                        {/* Mesh gradient background */}
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-cyber-citron/40 via-transparent to-blue-500/40"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-cyber-citron mb-10 border border-white/20">
                                <RocketLaunchIcon className="w-8 h-8" />
                            </div>
                            <span className="text-cyber-citron text-xs font-black tracking-widest uppercase mb-4 block">{t('biz_ai_label')}</span>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-none">{t('biz_ai_title')}</h2>
                            <p className="text-slate-400 text-xl leading-relaxed mb-8">
                                {t('biz_ai_desc')}
                            </p>
                            <div className="flex gap-4">
                                <div className="h-2 w-16 bg-cyber-citron rounded-full"></div>
                                <div className="h-2 w-16 bg-white/20 rounded-full group-hover:bg-cyber-citron/50 transition-colors"></div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative p-12 rounded-[3.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-3xl overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-10 border border-blue-500/20">
                                <GlobeAltIcon className="w-8 h-8" />
                            </div>
                            <span className="text-blue-500 text-xs font-black tracking-widest uppercase mb-4 block">{t('biz_infra_label')}</span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-none">{t('biz_infra_title')}</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed mb-8">
                                {t('biz_infra_desc')}
                            </p>
                            <div className="flex gap-4">
                                <div className="h-2 w-16 bg-blue-500 rounded-full"></div>
                                <div className="h-2 w-16 bg-slate-200 dark:bg-white/20 rounded-full group-hover:bg-blue-500/50 transition-colors"></div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Main Offerings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/${language}${benefit.path}`} className="group relative block h-full bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 hover:border-cyber-citron/50 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-cyber-citron/5">
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400 mb-8 group-hover:bg-cyber-citron group-hover:text-midnight group-hover:scale-110 transition-all duration-500 border border-transparent group-hover:border-cyber-citron/20">
                                        <benefit.icon className="h-7 w-7" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
                                        {benefit.desc}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* SAAS & Portal Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
                    {/* Belmobile OS Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2 relative bg-linear-to-br from-indigo-700 to-violet-900 rounded-[4rem] p-12 md:p-20 overflow-hidden group shadow-3xl shadow-indigo-600/20"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

                        <div className="relative z-10">
                            <span className="px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 inline-block text-white border border-white/20">{t('biz_saas_badge')}</span>
                            <h2 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-[ -0.04em] leading-[0.9]">{t('biz_saas_title')}</h2>
                            <p className="text-indigo-100 text-2xl mb-12 max-w-2xl leading-tight font-medium opacity-90">
                                {t('biz_saas_desc')}
                            </p>
                            <button className="group px-10 py-5 bg-white text-indigo-950 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-4 text-xl">
                                {t('biz_saas_cta')}
                                <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>

                        {/* Visual for SaaS Dashboard */}
                        <div className="absolute right-[-5%] bottom-[-5%] w-[55%] aspect-video bg-slate-950/80 rounded-tl-[3rem] border-t-4 border-l-4 border-white/10 backdrop-blur-3xl hidden md:block group-hover:rotate-[-2deg] group-hover:translate-y-[-20px] transition-all duration-1000 shadow-[ -20px_-20px_100px_rgba(0,0,0,0.5)]">
                            <div className="p-10">
                                <div className="flex gap-4 mb-10">
                                    <div className="w-8 h-8 bg-cyber-citron rounded-lg animate-pulse"></div>
                                    <div className="flex-1 space-y-3 pt-1">
                                        <div className="w-32 h-2 bg-white/20 rounded-full"></div>
                                        <div className="w-24 h-2 bg-white/10 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="aspect-video bg-white/5 rounded-2xl border border-white/10"></div>
                                    <div className="aspect-video bg-white/10 rounded-2xl border border-white/10 scale-110 translate-x-4 shadow-2xl"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Dedicated Portal Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-12 rounded-[4rem] relative overflow-hidden flex flex-col justify-between group shadow-xl hover:shadow-3xl transition-all duration-500"
                    >
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-blue-500 text-white rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                                <ComputerDesktopIcon className="h-8 w-8" />
                            </div>
                            <span className="text-blue-500 text-xs font-black tracking-widest uppercase mb-4 block">{t('biz_portal_badge')}</span>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-none group-hover:text-blue-500 transition-colors uppercase">{t('biz_portal_title')}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed font-medium">
                                {t('biz_portal_desc')}
                            </p>
                        </div>
                        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/10">
                            <Link href={`/${language}/contact`} className="flex items-center gap-4 text-midnight dark:text-white font-black text-lg uppercase group/link">
                                {t('biz_saas_cta')}
                                <div className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center group-hover/link:bg-cyber-citron group-hover/link:text-midnight transition-all">
                                    <ArrowRightIcon className="h-5 w-5" />
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Fleet Management Showcase */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative bg-slate-950 p-12 md:p-24 rounded-[5rem] mb-32 overflow-hidden shadow-4xl"
                >
                    <div className="absolute inset-0 bg-linear-to-br from-midnight via-slate-900 to-midnight opacity-50"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-cyber-citron/50 to-transparent"></div>

                    <div className="relative z-20 flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyber-citron/10 border border-cyber-citron/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 text-cyber-citron">
                                <span className="w-2 h-2 rounded-full bg-cyber-citron"></span>
                                {t('biz_fleet_badge')}
                            </div>
                            <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-[ -0.05em] leading-[0.85]" dangerouslySetInnerHTML={{ __html: t('biz_fleet_title') }} />
                            <p className="text-2xl text-slate-400 mb-12 max-w-2xl leading-tight font-medium">
                                {t('biz_fleet_desc')}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { text: t('biz_fleet_sla'), color: 'bg-emerald-500' },
                                    { text: t('biz_fleet_invoice'), color: 'bg-blue-500' },
                                    { text: t('biz_fleet_loaner'), color: 'bg-indigo-500' },
                                    { text: t('biz_trust_manager'), color: 'bg-violet-500' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.08]">
                                        <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}></div>
                                        <span className="font-black text-white uppercase tracking-tighter text-lg">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-16">
                                <Link
                                    href={`/${language}/contact?subject=business`}
                                    className="inline-flex items-center gap-4 px-10 py-5 bg-cyber-citron text-midnight font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl text-xl uppercase tracking-tighter"
                                >
                                    {t('biz_fleet_cta')}
                                    <ArrowRightIcon className="w-6 h-6" />
                                </Link>
                            </div>
                        </div>

                        {/* Stat Badges */}
                        <div className="w-full lg:w-96 flex flex-col gap-8">
                            <div className="bg-cyber-citron p-12 rounded-[4rem] text-midnight transform rotate-3 hover:rotate-0 transition-all duration-700 shadow-2xl relative group/stat">
                                <div className="absolute top-8 right-10 opacity-20 group-hover/stat:rotate-45 transition-transform"><RocketLaunchIcon className="w-16 h-16" /></div>
                                <div className="text-7xl font-black mb-2 tracking-tighter leading-none">24H</div>
                                <div className="text-lg font-black uppercase tracking-widest opacity-80 leading-none">SLA Resolution</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-3xl p-12 rounded-[4rem] text-white border border-white/10 transform -rotate-3 hover:rotate-0 transition-all duration-700 shadow-2xl relative">
                                <div className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-4">{t('biz_green_badge')}</div>
                                <div className="text-3xl font-black leading-tight mb-4">{t('biz_green_title')}</div>
                                <p className="text-slate-400 text-sm font-bold leading-relaxed">{t('biz_green_desc')}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Dashboard Experience Section */}
                <div className="mb-32">
                    <div className="text-center mb-24">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-slate-100 dark:bg-white/5 px-6 py-2 rounded-full text-slate-500 dark:text-cyber-citron font-black text-[10px] uppercase tracking-[0.4em] mb-8 inline-block shadow-sm"
                        >
                            {t('biz_portal_preview_label')}
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-[ -0.04em] leading-[0.9]"
                        >
                            {t('biz_portal_preview_title')}
                        </motion.h2>
                    </div>

                    <div className="relative perspective-2000">
                        {/* Ambient Glow */}
                        <div className="absolute -inset-20 bg-cyber-citron/20 blur-[150px] rounded-full opacity-30 animate-pulse pointer-events-none"></div>

                        <motion.div
                            initial={{ opacity: 0, rotateX: 20, y: 100 }}
                            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                            className="relative bg-slate-900 rounded-[4.5rem] p-4 lg:p-10 border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden group"
                        >
                            <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10">
                                <Image
                                    src="/images/b2b-dashboard-preview.png"
                                    alt="Belmobile OS Dashboard Preview"
                                    fill
                                    className="object-cover group-hover:scale-[1.02] transition-transform duration-2000"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>
                            </div>
                        </motion.div>

                        {/* Floating Feature Badges */}
                        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { key: 'biz_portal_preview_feature1', icon: ClockIcon, color: 'from-blue-500 to-indigo-600' },
                                { key: 'biz_portal_preview_feature2', icon: ChartBarIcon, color: 'from-cyber-citron to-yellow-500' },
                                { key: 'biz_portal_preview_feature3', icon: BanknotesIcon, color: 'from-emerald-500 to-teal-600' }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + (idx * 0.1) }}
                                    className="relative group/badge overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] flex items-center gap-6 hover:translate-y-[-10px] transition-all duration-500 hover:shadow-2xl"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center text-midnight shadow-lg group-hover/badge:scale-110 transition-transform duration-500`}>
                                        <feature.icon className="w-8 h-8" />
                                    </div>
                                    <span className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{t(feature.key)}</span>

                                    <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-cyber-citron/5 rounded-full blur-xl group-hover/badge:bg-cyber-citron/20 transition-all"></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Trust Footer - Minimalist 2026 */}
                <div className="py-32 border-t border-slate-100 dark:border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-slate-400">
                        <div className="text-center md:text-left">
                            <h4 className="text-midnight dark:text-white text-2xl font-black mb-2 uppercase tracking-tighter">{t('biz_trust_title')}</h4>
                            <p className="font-medium">Scaling the future of mobility since 2012.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-12 font-black text-lg uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
                            <span className="hover:text-cyber-citron cursor-default">SLA Certified</span>
                            <span className="hover:text-blue-500 cursor-default">VAT Compliant</span>
                            <span className="hover:text-indigo-500 cursor-default">Security Level 4</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessSolutions;
