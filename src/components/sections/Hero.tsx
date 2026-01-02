'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../hooks/useLanguage';
import { ArrowRightIcon, StarIcon } from '../ui/BrandIcons';
import { motion } from 'framer-motion';
import Image from 'next/image';
import FadeIn from '../ui/FadeIn';
import Button from '../ui/Button';
import HeroPhone from './HeroPhone';

const Hero: React.FC = () => {
    const { language, t } = useLanguage();

    return (
        <div className="relative overflow-hidden bg-gray-50 dark:bg-deep-space pt-10 pb-20 lg:pt-20 lg:pb-32">
            {/* Ambient Background Glows */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute top-0 left-1/4 -translate-x-1/2 w-[800px] h-[800px] bg-cyber-citron/10 dark:bg-cyber-citron/5 rounded-full blur-[120px] -z-10 pointer-events-none"
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-electric-indigo/10 dark:bg-electric-indigo/5 rounded-full blur-[100px] -z-10 pointer-events-none"
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-8 items-center">

                    {/* Left: Content */}
                    <div className="text-center lg:text-left z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-8"
                        >
                            <span className="flex h-2.5 w-2.5 rounded-full bg-cyber-citron mr-3 animate-medical-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide">{t('New iPhone 17 Series Available')}</span>
                        </motion.div>

                        <h1
                            className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white mb-8 font-heading"
                        >
                            {t('Your One-Stop')} <br />
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-electric-indigo via-electric-violet to-cyan-400">
                                {t('Mobile Shop')}
                            </span>
                        </h1>

                        <p
                            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 font-light"
                        >
                            {t("From the latest devices to expert repairs and buybacks, we've got you covered.")}
                        </p>

                        <div
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                        >
                            <Link
                                href={`/${language}/${language === 'fr' ? 'rachat' : language === 'nl' ? 'inkoop' : 'buyback'}`}
                                className="w-full sm:w-auto"
                            >
                                <Button variant="cyber" className="w-full" icon={<ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}>
                                    {t('Sell Your Device')}
                                </Button>
                            </Link>

                            <Link
                                href={`/${language}/${language === 'fr' ? 'reparation' : language === 'nl' ? 'reparatie' : 'repair'}`}
                                className="w-full sm:w-auto"
                            >
                                <Button variant="outline" className="w-full bg-white dark:bg-slate-800">
                                    {t('Repair Your Device')}
                                </Button>
                            </Link>
                        </div>

                        {/* Social Proof */}
                        <div
                            className="mt-12 flex items-center justify-center lg:justify-start space-x-6"
                        >
                            <div className="flex -space-x-3">
                                <Image
                                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 object-cover"
                                    src="/images/avatars/avatar1.png"
                                    alt="Belmobile review user 1"
                                    width={40}
                                    height={40}
                                />
                                <Image
                                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 object-cover"
                                    src="/images/avatars/avatar2.png"
                                    alt="Belmobile review user 2"
                                    width={40}
                                    height={40}
                                />
                                <Image
                                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 object-cover"
                                    src="/images/avatars/avatar3.png"
                                    alt="Belmobile review user 3"
                                    width={40}
                                    height={40}
                                />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex text-cyber-citron">
                                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4" />)}
                                </div>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('happy_customers')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Hero Image / Visuals */}
                    <FadeIn delay={0} direction="left" className="w-full flex justify-center lg:justify-end relative h-[600px] lg:h-auto items-center">
                        <HeroPhone />
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}

export default Hero;
