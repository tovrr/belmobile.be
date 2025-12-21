'use client';

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { motion } from 'framer-motion';
import { UserGroupIcon, WrenchScrewdriverIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const Jobs: React.FC = () => {
    const { t } = useLanguage();

    const jobs = [
        {
            title: "jobs_role_sales",
            desc: "jobs_role_sales_desc",
            icon: ShoppingBagIcon,
            details: ["jobs_contract_type", "jobs_experience"]
        },
        {
            title: "jobs_role_tech",
            desc: "jobs_role_tech_desc",
            icon: WrenchScrewdriverIcon,
            details: ["jobs_contract_type", "jobs_experience"]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-24 pb-12 px-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-20 animate-fade-in">
                    <span className="text-bel-blue font-bold tracking-widest uppercase text-sm mb-4 block">
                        {t('Careers')}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6">
                        {t('Join the Team')}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        {t('jobs_intro')}
                    </p>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {jobs.map((job, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl hover:shadow-2xl hover:border-bel-blue/30 transition-all"
                        >
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-bel-blue mb-6">
                                <job.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                {t(job.title)}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                                {t(job.desc)}
                            </p>
                            <div className="space-y-2 mb-8">
                                {job.details.map((detail, i) => (
                                    <div key={i} className="flex items-center text-slate-500 dark:text-slate-400">
                                        <UserGroupIcon className="h-5 w-5 mr-2" />
                                        <span>{t(detail)}</span>
                                    </div>
                                ))}
                            </div>
                            <a
                                href="mailto:jobs@belmobile.be"
                                className="inline-block w-full text-center px-6 py-3 bg-bel-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                            >
                                {t('jobs_apply')}
                            </a>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <div className="bg-slate-900 rounded-[3rem] p-12 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white mb-6">
                            {t('jobs_send_cv')} jobs@belmobile.be
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;
