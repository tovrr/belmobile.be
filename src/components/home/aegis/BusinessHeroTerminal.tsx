'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../hooks/useLanguage';
import { BriefcaseIcon, WrenchScrewdriverIcon, ShieldCheckIcon, GlobeAltIcon, CpuChipIcon } from '../../ui/BrandIcons';
import { motion } from 'framer-motion';

import StaticClock from '../../ui/StaticClock';

const BusinessHeroTerminal: React.FC = () => {
    const { language, t } = useLanguage();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault();
                window.location.href = `/${language}/repair`;
            } else if (e.key === 'F2') {
                e.preventDefault();
                window.location.href = `/${language}/business/portal/login`;
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
        <section className="relative overflow-hidden bg-slate-950 pt-4 pb-8 lg:pt-8 lg:pb-12 min-h-[90vh] lg:min-h-[75vh] flex items-center border-b border-white/5">
            {/* Technical Grid Overlay */}
            <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-size-[60px_60px] opacity-[0.05] pointer-events-none"></div>

            <div className="container mx-auto px-4 relative">
                <div className="grid grid-cols-12 gap-0 border border-white/10 divide-y lg:divide-y-0 lg:divide-x divide-white/10 bg-slate-900/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">

                    {/* 1. System Header / Meta Data */}
                    <div className="col-span-12 p-3 border-b border-white/10 flex justify-between items-center bg-white/5 overflow-hidden whitespace-nowrap">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-emerald-500 animate-[pulse_1s_infinite] shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-[0.2em] leading-none">System.Active</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-[10px] font-mono text-slate-500 hidden sm:inline tracking-tighter">NODE: BRU-01</span>
                                <span className="text-[10px] font-mono text-slate-500 hidden md:inline tracking-tighter">LAYER: Aegis_Main</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 font-bold tracking-widest">
                            <StaticClock /> | UTC+1
                        </div>
                    </div>

                    {/* 2. Main Content Area */}
                    <div className="col-span-12 lg:col-span-8 p-8 md:p-16 lg:p-20 relative">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="max-w-2xl relative z-10">
                            <div className="inline-flex items-center gap-3 px-3 py-1 border border-white/10 bg-white/5 mb-8 group cursor-default transition-all hover:border-white/20">
                                <ShieldCheckIcon className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10px] font-mono font-black text-indigo-300 uppercase tracking-widest leading-none">
                                    Official Infrastructure Partner
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[100px] font-black tracking-[-0.04em] leading-[0.85] text-white mb-10 uppercase break-words">
                                {title.t1}<br />
                                <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-500 via-indigo-400 to-indigo-600 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                    {title.t2}
                                </span>
                            </h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14 border-l border-white/5 pl-8 py-2">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">Core.Service</p>
                                    <p className="text-base font-bold text-slate-300">Industrial Grade Electronics Repair</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">Network.Scope</p>
                                    <p className="text-base font-bold text-slate-300">Corporate Fleet & Multi-Language Support</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href={`/${language}/business/portal/login`} className="group w-full sm:w-auto">
                                    <button className="w-full h-14 px-8 bg-white text-slate-950 font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-500 hover:text-white transition-all rounded-none border-b-4 border-slate-300 hover:border-indigo-700 active:border-b-0 active:translate-y-[4px]">
                                        <WrenchScrewdriverIcon className="w-5 h-5 transition-transform group-hover:rotate-12" />
                                        Initialize Repair
                                        <span className="opacity-30 font-mono ml-4 hidden sm:inline">[F1]</span>
                                    </button>
                                </Link>
                                <Link href={`/${language}/business/portal/login`} className="group w-full sm:w-auto">
                                    <button className="w-full h-14 px-8 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:border-indigo-400 transition-all rounded-none border-b-4 border-indigo-500/30 active:border-b-0 active:translate-y-[4px]">
                                        <BriefcaseIcon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                                        Business Portal
                                        <span className="opacity-30 font-mono ml-4 hidden sm:inline">[F2]</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 3. Lateral Data Panel (High Density) */}
                    <div className="col-span-12 lg:col-span-4 bg-white/2 p-8 md:p-12 flex flex-col justify-between relative border-t lg:border-t-0 border-white/10">
                        {/* Technical Background Element */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                            <CpuChipIcon className="w-48 h-48" />
                        </div>

                        <div className="space-y-12 relative z-10 w-full">
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4 flex justify-between items-center">
                                    Operational.Stats
                                    <span className="text-[10px] text-emerald-500 animate-pulse hidden sm:inline tracking-widest font-black">LIVE_FEED</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-8 md:gap-6">
                                    <div className="border-l-2 border-indigo-500/30 pl-4">
                                        <div className="text-3xl font-black text-white leading-none">EST. 2011</div>
                                        <div className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-tighter mt-2">Market.Authority</div>
                                    </div>
                                    <div className="border-l-2 border-indigo-500/30 pl-4">
                                        <div className="text-3xl font-black text-white leading-none">RGPD</div>
                                        <div className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-tighter mt-2">Legal.Compliance</div>
                                    </div>
                                    <div className="border-l-2 border-indigo-500/30 pl-4">
                                        <div className="text-3xl font-black text-white leading-none">B2B/VAT</div>
                                        <div className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-tighter mt-2">Certified.Entity</div>
                                    </div>
                                    <div className="border-l-2 border-indigo-500/30 pl-4">
                                        <div className="text-3xl font-black text-white leading-none">SLA</div>
                                        <div className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-tighter mt-2">Service.Guarantee</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[11px] font-mono font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Active.Zones</h4>
                                <div className="space-y-3">
                                    {[
                                        { name: 'SCHAERBEEK', status: 'ONLINE', color: 'emerald' },
                                        { name: 'ANDERLECHT', status: 'ONLINE', color: 'emerald' },
                                        { name: 'MOLENBEEK / HQ', status: 'APPOINTMENT', color: 'amber' }
                                    ].map((zone, i) => (
                                        <div key={i} className="flex justify-between items-center text-[10px] font-mono border border-white/5 p-4 bg-white/5 hover:bg-white/10 transition-colors cursor-crosshair">
                                            <span className="text-slate-400 font-black tracking-widest uppercase">{zone.name}</span>
                                            <span className={`text-${zone.color}-500 font-black tracking-wide`}>{zone.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500 font-black">
                            <span className="flex items-center gap-2 group cursor-help">
                                <GlobeAltIcon className="w-4 h-4 text-indigo-500 group-hover:rotate-180 transition-transform duration-700" />
                                <span className="opacity-50">MULTI_LANG_SYS</span>
                            </span>
                            <span className="opacity-20 flex items-center gap-1">
                                <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                                v4.0.0-AGS
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BusinessHeroTerminal;
