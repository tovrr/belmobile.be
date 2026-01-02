'use client';

import React from 'react';
import { ShieldCheckIcon, ClockIcon, LeafIcon as GlobeEuropeAfricaIcon } from '../ui/BrandIcons';
import { useLanguage } from '../../hooks/useLanguage';
import FadeIn from '../ui/FadeIn';

const TrustSignals: React.FC = () => {
    const { t } = useLanguage();

    const signals = [
        {
            icon: ShieldCheckIcon,
            title: 'trust_warranty',
            desc: 'trust_warranty_desc',
            gradient: 'from-blue-600 to-cyan-500',
            glow: 'shadow-blue-500/20'
        },
        {
            icon: ClockIcon,
            title: 'trust_speed',
            desc: 'trust_speed_desc',
            gradient: 'from-purple-600 to-indigo-500',
            glow: 'shadow-purple-500/20'
        },
        {
            icon: GlobeEuropeAfricaIcon,
            title: 'trust_eco',
            desc: 'trust_eco_desc',
            gradient: 'from-emerald-600 to-teal-500',
            glow: 'shadow-emerald-500/20'
        }
    ];

    return (
        <section className="relative z-20 pt-12 md:pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {signals.map((item, i) => (
                        <FadeIn key={i} delay={0.1 * i} direction="up" distance={20}>
                            <div className="group relative h-full">
                                {/* Large Background Glow */}
                                <div className={`absolute -inset-4 bg-linear-to-r ${item.gradient} rounded-[2.5rem] blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />

                                <div className="relative h-full glass-panel bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/50 dark:border-white/10 shadow-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2">

                                    {/* Abstract Circle in Background */}
                                    <div className={`absolute -right-12 -top-12 w-48 h-48 bg-linear-to-br ${item.gradient} opacity-[0.03] dark:opacity-[0.05] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000`} />

                                    <div className="flex flex-col items-center md:items-start text-center md:text-left h-full">
                                        {/* Icon Container with Animated Gradient Border */}
                                        <div className="relative mb-8">
                                            <div className={`absolute -inset-1 bg-linear-to-tr ${item.gradient} rounded-2xl blur-sm opacity-30 group-hover:opacity-100 transition duration-500`} />
                                            <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 transition-transform duration-500 group-hover:scale-110">
                                                <item.icon className="h-10 w-10 text-slate-900 dark:text-white" />
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                                            {t(item.title)}
                                        </h3>

                                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                                            {t(item.desc)}
                                        </p>

                                        {/* Minimal Bottom Progress Bar Look */}
                                        <div className="mt-auto pt-8 w-full">
                                            <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                <div className={`h-full bg-linear-to-r ${item.gradient} w-0 group-hover:w-full transition-all duration-1000 ease-out`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustSignals;
