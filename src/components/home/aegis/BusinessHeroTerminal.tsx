'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../hooks/useLanguage';
import { BriefcaseIcon, WrenchScrewdriverIcon, ShieldCheckIcon, GlobeAltIcon, CpuChipIcon } from '../../ui/BrandIcons';
import { motion } from 'framer-motion';

import StaticClock from '../../ui/StaticClock';

const BusinessHeroTerminal: React.FC = () => {
    const { language } = useLanguage();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault();
                window.location.href = `/${language}/repair`;
            } else if (e.key === 'F2') {
                e.preventDefault();
                window.location.href = `/${language}/business`;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [language]);

    const getAegisTitle = () => {
        const titles = {
            en: { t1: "INFRASTRUCTURE", t2: "TERMINAL" },
            fr: { t1: "TERMINAL", t2: "D'INFRASTRUCTURE" },
            nl: { t1: "INFRASTRUCTUUR", t2: "TERMINAL" },
            tr: { t1: "ALTYAPI", t2: "TERMİNALİ" }
        };
        // @ts-ignore
        return titles[language] || titles.en;
    };

    const title = getAegisTitle();

    return (
        <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 pt-4 pb-8 lg:pt-8 lg:pb-12 min-h-screen lg:min-h-[75vh] flex items-center border-b border-slate-200 dark:border-slate-800">
            {/* Technical Grid Overlay */}
            <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-size-[40px_40px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>

            <div className="container mx-auto px-4 relative">
                <div className="grid grid-cols-12 gap-0 border border-slate-200 dark:border-slate-800 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">

                    {/* 1. System Header / Meta Data */}
                    <div className="col-span-12 p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-100/50 dark:bg-slate-800/50 overflow-hidden whitespace-nowrap">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest leading-none">System.Active</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">Node: BRU-01</span>
                            <span className="text-[10px] font-mono text-slate-400 hidden md:inline">Layer: Aegis_Main</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 font-bold">
                            <StaticClock /> | UTC+1
                        </div>
                    </div>

                    {/* 2. Main Content Area */}
                    <div className="col-span-12 lg:col-span-8 p-6 md:p-12">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mb-6 group cursor-default">
                                <ShieldCheckIcon className="w-3 h-3 text-electric-indigo" />
                                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
                                    Official Infrastructure Partner
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-[72px] font-black tracking-tighter leading-[0.85] text-slate-900 dark:text-white mb-8 uppercase">
                                {title.t1}<br />
                                <span className="text-electric-indigo">
                                    {title.t2}
                                </span>
                            </h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Core.Service</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Industrial Grade Electronics Repair</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">Network.Scope</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Corporate Fleet & Multi-Language Support</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href={`/${language}/repair`} className="group w-full sm:w-auto">
                                    <button className="w-full h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-electric-indigo dark:hover:bg-electric-indigo dark:hover:text-white transition-all rounded-none border-b-2 border-slate-700 dark:border-slate-300 active:border-b-0 active:translate-y-[2px]">
                                        <WrenchScrewdriverIcon className="w-4 h-4" />
                                        Initialize Repair
                                        <span className="opacity-30 font-mono ml-2 hidden sm:inline">[F1]</span>
                                    </button>
                                </Link>
                                <Link href={`/${language}/business`} className="group w-full sm:w-auto">
                                    <button className="w-full h-12 px-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:border-electric-indigo transition-all rounded-none border-b-2 active:border-b-0 active:translate-y-[2px]">
                                        <BriefcaseIcon className="w-4 h-4 text-electric-indigo" />
                                        Business Portal
                                        <span className="opacity-30 font-mono ml-2 hidden sm:inline">[F2]</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 3. Lateral Data Panel (High Density - Adaptive Grid) */}
                    <div className="col-span-12 lg:col-span-4 bg-slate-50/50 dark:bg-slate-800/20 p-6 md:p-8 flex flex-col justify-between overflow-hidden relative border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                        {/* Technical Background Element */}
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <CpuChipIcon className="w-32 h-32" />
                        </div>

                        <div className="space-y-8 relative z-10 w-full">
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-widest border-b border-slate-300 dark:border-slate-700 pb-2 flex justify-between items-center">
                                    Operational.Stats
                                    <span className="text-[10px] text-emerald-500 animate-pulse hidden sm:inline">LIVE_FEED</span>
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-6 md:gap-4">
                                    <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                                        <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">EST. 2011</div>
                                        <div className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-tighter mt-1">Market.Authority</div>
                                    </div>
                                    <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                                        <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">RGPD</div>
                                        <div className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-tighter mt-1">Legal.Compliance</div>
                                    </div>
                                    <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                                        <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">B2B/VAT</div>
                                        <div className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-tighter mt-1">Certified.Entity</div>
                                    </div>
                                    <div className="border-l border-slate-200 dark:border-slate-800 pl-3">
                                        <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">SLA</div>
                                        <div className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-tighter mt-1">Service.Guarantee</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-widest border-b border-slate-300 dark:border-slate-700 pb-2">Active.Zones</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2">
                                    <div className="flex justify-between items-center text-[10px] font-mono border border-slate-200 dark:border-slate-700 p-2.5 bg-white/80 dark:bg-slate-900/80">
                                        <span className="text-slate-500 font-bold">SCHAERBEEK</span>
                                        <span className="text-emerald-500 font-black">ONLINE</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono border border-slate-200 dark:border-slate-700 p-2.5 bg-white/80 dark:bg-slate-900/80">
                                        <span className="text-slate-500 font-bold">ANDERLECHT</span>
                                        <span className="text-emerald-500 font-black">ONLINE</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono border border-slate-200 dark:border-slate-700 p-2.5 bg-white/80 dark:bg-slate-900/80">
                                        <span className="text-slate-500 font-bold">MOLENBEEK / HQ</span>
                                        <span className="text-amber-500 font-black">APPOINTMENT</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-4 border-t border-slate-300 dark:border-slate-700 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span className="flex items-center gap-1.5"><GlobeAltIcon className="w-3 h-3" /> MULTI_LANG_SYS</span>
                            <span className="opacity-50">v4.0.0-AGS</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default BusinessHeroTerminal;
