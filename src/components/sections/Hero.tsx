'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../hooks/useLanguage';
import { ArrowRightIcon, StarIcon } from '../ui/BrandIcons';
import { motion } from 'framer-motion';
import Image from 'next/image';
import FadeIn from '../ui/FadeIn';
import Button from '../ui/Button';

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

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

                    {/* Right: 3D Visual */}
                    <FadeIn direction="right" duration={0.8} delay={0.4} className="relative lg:h-[600px] flex items-center justify-center perspective-1000 mt-12 lg:mt-0">
                        {/* Phone Container - Aspect 9/16 */}
                        <div className="relative w-full max-w-[280px] sm:max-w-[300px] aspect-9/16 rounded-[2.5rem] bg-linear-to-br from-slate-900 to-black p-3 shadow-2xl transform rotate-y-12 hover:rotate-y-0 transition-transform duration-700 ease-out border-4 border-slate-800">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20"></div>
                            <div className="w-full h-full rounded-4xl overflow-hidden bg-slate-800 relative">
                                <Image
                                    src="/images/iphone-repair-schaerbeek-brussels-belmobile.webp"
                                    alt={t('Broken iPhone Screen Repair Brussels')}
                                    width={500}
                                    height={600}
                                    priority
                                    className="relative z-20 w-full max-w-[280px] sm:max-w-md mx-auto drop-shadow-2xl animate-fade-in-up"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-electric-indigo/50 to-transparent flex flex-col justify-end p-6">
                                    {/* Abstract UI Elements */}
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl mb-4 transform translate-y-4 animate-float">
                                        <div className="justify-between items-center mb-2 hidden md:flex">
                                            <div className="h-2 w-16 bg-white/50 rounded-full"></div>
                                            <div className="h-2 w-8 bg-green-400 rounded-full"></div>
                                        </div>
                                        <div className="h-4 w-24 bg-white rounded-full mb-2"></div>
                                        <div className="h-3 w-16 bg-white/50 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Badge: Best Price (Top Right) */}
                        <div
                            className="absolute -right-2 sm:-right-8 top-16 bg-white dark:bg-slate-800 p-2 sm:p-4 rounded-ui shadow-xl shadow-cyber-citron/20 animate-float border border-slate-100 dark:border-slate-700 z-30"
                            style={{ animationDelay: '1s' }}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="bg-cyber-citron/10 p-1.5 sm:p-2 rounded-lg text-cyber-citron">
                                    <span className="font-black text-base sm:text-x">€</span>
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-xs text-slate-500 uppercase font-black">{t('Best Price')}</p>
                                    <p className="text-[10px] sm:text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">{t('Guaranteed')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Badge: Repair Time (Bottom Left) */}
                        <div
                            className="absolute -left-2 sm:-left-8 bottom-24 bg-white dark:bg-slate-800 p-2 sm:p-4 rounded-ui shadow-xl shadow-electric-indigo/20 animate-float border border-slate-100 dark:border-slate-700 z-30"
                            style={{ animationDelay: '2s' }}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="bg-electric-indigo/10 p-1.5 sm:p-2 rounded-lg text-electric-indigo">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label={t('Repair Time')}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-xs text-slate-500 uppercase font-black">{t('Repair Time')}</p>
                                    <p className="text-[10px] sm:text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">{t('< 30 Mins')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Badge: Warranty (Top Left) */}
                        <div
                            className="absolute -left-4 sm:-left-12 top-40 bg-white dark:bg-slate-800 p-2 sm:p-4 rounded-ui shadow-xl shadow-electric-indigo/20 animate-float border border-slate-100 dark:border-slate-700 z-20"
                            style={{ animationDelay: '3s' }}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="bg-electric-indigo/10 p-1.5 sm:p-2 rounded-lg text-electric-indigo">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label={t('trust_warranty')}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-xs text-slate-500 uppercase font-black">{t('trust_warranty')}</p>
                                    <p className="text-[10px] sm:text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">{t('badge_warranty_time')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Badge: Eco (Bottom Right) */}
                        <div
                            className="absolute -right-4 sm:-right-10 bottom-40 bg-white dark:bg-slate-800 p-2 sm:p-4 rounded-ui shadow-xl shadow-cyber-citron/20 animate-float border border-slate-100 dark:border-slate-700 z-20"
                            style={{ animationDelay: '4s' }}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="bg-cyber-citron/10 p-1.5 sm:p-2 rounded-lg text-cyber-citron">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label={t('trust_eco')}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-xs text-slate-500 uppercase font-black">{t('trust_eco')}</p>
                                    <p className="text-[10px] sm:text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">100%</p>
                                </div>
                            </div>
                        </div>

                        {/* Badge: Social Proof (New Floating Badge) */}
                        <div
                            className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-white dark:bg-slate-800 p-2 sm:p-4 rounded-ui shadow-xl shadow-green-500/20 animate-float border border-slate-100 dark:border-slate-700 z-30 hidden lg:block"
                            style={{ animationDelay: '5s' }}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="bg-green-100 dark:bg-green-900/30 p-1.5 sm:p-2 rounded-lg text-green-600 dark:text-green-400">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Devices Saved"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-black">{t('repaired_today')}</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">
                                        {/* Simple client-side random number for demo, ideally fetched from API */}
                                        <span suppressHydrationWarning>{Math.floor(Math.random() * (15 - 5 + 1)) + 5}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}

export default Hero;
