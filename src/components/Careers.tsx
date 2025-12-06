'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { motion } from 'framer-motion';
import { SparklesIcon, UserGroupIcon, RocketLaunchIcon, HeartIcon } from '@heroicons/react/24/outline';

const Careers: React.FC = () => {
    const { t } = useLanguage();

    const jobs = [
        {
            title: "Technicien Smartphone (H/F)",
            type: "Full-Time",
            location: "Brussels (Schaerbeek)",
            desc: "Expert en microsoudure et réparation niveau 3. Passionné par Apple et Samsung."
        },
        {
            title: "Sales Advisor",
            type: "Part-Time",
            location: "Brussels (Molenbeek)",
            desc: "Accueillir les clients, conseiller sur les produits et gérer les stocks."
        },
        {
            title: "E-commerce Manager",
            type: "Full-Time",
            location: "Brussels (Hybrid)",
            desc: "Gestion du site web, SEO et campagnes marketing digital."
        }
    ];

    const values = [
        { icon: SparklesIcon, title: "Excellence", desc: "We aim for perfection in every repair." },
        { icon: UserGroupIcon, title: "Team Spirit", desc: "We grow together and support each other." },
        { icon: RocketLaunchIcon, title: "Innovation", desc: "Always learning the latest technologies." },
        { icon: HeartIcon, title: "Passion", desc: "We love what we do and it shows." },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-32 pb-20 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
                <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">

                {/* Hero Section */}
                <div className="text-center mb-20 animate-fade-in">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">
                        {t('Careers')}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 mb-6">
                        {t('Join the Team')}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {t('Build the future of mobile repair with us. We are looking for passionate people.')}
                    </p>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {values.map((value, idx) => (
                        <div key={idx} className="glass-panel dark:bg-slate-900/40 p-8 rounded-2xl border border-white/20 dark:border-white/5 text-center hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                                <value.icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t(value.title)}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t(value.desc)}</p>
                        </div>
                    ))}
                </div>

                {/* Open Positions */}
                <div className="glass-panel dark:bg-slate-900/40 p-8 md:p-12 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-10 text-center">
                        {t('Open Positions')}
                    </h2>

                    <div className="space-y-4">
                        {jobs.map((job, idx) => (
                            <div key={idx} className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-colors border border-transparent hover:border-primary/20 flex flex-col md:flex-row md:items-center justify-between group">
                                <div className="mb-4 md:mb-0">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{job.title}</h3>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-4">
                                        <span>{job.type}</span>
                                        <span>•</span>
                                        <span>{job.location}</span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm max-w-xl">{job.desc}</p>
                                </div>
                                <a
                                    href={`mailto:jobs@belmobile.be?subject=Application: ${job.title}`}
                                    className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform text-center whitespace-nowrap"
                                >
                                    {t('Apply Now')}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Careers;
