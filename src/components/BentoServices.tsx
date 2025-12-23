'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WrenchScrewdriverIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../hooks/useLanguage';
import FadeIn from './ui/FadeIn';

const BentoServices: React.FC = () => {
    const { language, t } = useLanguage();

    return (
        <FadeIn className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-electric-indigo font-bold tracking-widest text-xs uppercase mb-2 block">{t('Our Expertise')}</span>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">{t('Our Services')}</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400">{t('Professional solutions for all your mobile needs.')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[600px]">

                    {/* Box 1: Repair (Large Vertical) */}
                    <Link prefetch={false} href={`/${language}/${language === 'fr' ? 'reparation' : language === 'nl' ? 'reparatie' : 'repair'}`} className="group relative md:row-span-2 bg-slate-900/60 backdrop-blur-xl rounded-4xl p-8 border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-blue-500/20"></div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-2xl flex items-center justify-center text-electric-indigo mb-6">
                                <WrenchScrewdriverIcon className="h-7 w-7" />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('Expert Repair')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                {t("Fast, reliable repairs for screens, batteries, and more. We use premium parts to ensure your device feels brand new.")}
                            </p>
                            <div className="mt-auto">
                                <div className="relative w-full h-48">
                                    <Image
                                        src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=600&auto=format&fit=crop"
                                        alt="Professional smartphone repair technician working on a device"
                                        fill
                                        className="object-cover rounded-2xl opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                                <div className="mt-6 flex items-center font-bold text-electric-indigo">
                                    {t('Get a Quote')} <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Box 2: Buyback (Wide Horizontal) */}
                    <Link prefetch={false} href={`/${language}/${language === 'fr' ? 'rachat' : language === 'nl' ? 'inkoop' : 'buyback'}`} className="group relative md:col-span-2 bg-slate-900/60 backdrop-blur-xl rounded-4xl p-8 border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <div className="absolute inset-0 bg-linear-to-r from-slate-900 to-slate-800 z-0"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between h-full gap-8">
                            <div className="flex-1">
                                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">{t('Best Price Guaranteed')}</span>
                                <h3 className="text-3xl font-bold text-white mb-4">{t('Sell Your Device')}</h3>
                                <p className="text-slate-400 mb-6 max-w-md">
                                    {t("Get an instant quote for your old device. We offer competitive prices and immediate payment.")}
                                </p>
                                <div className="flex items-center font-bold text-white group-hover:text-cyber-citron transition-colors">
                                    {t('Get Offer')} <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                            <div className="w-full md:w-1/2">
                                <div className="relative w-full h-48">
                                    <Image
                                        src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800&auto=format&fit=crop"
                                        alt="Belmobile device buyback program for smartphones and tablets"
                                        fill
                                        className="object-cover rounded-2xl opacity-90 group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Box 3: Shop (Small) */}
                    <Link prefetch={false} href={`/${language}/${language === 'fr' ? 'produits' : language === 'nl' ? 'producten' : 'products'}`} className="group relative bg-cyber-citron rounded-4xl p-8 overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('Shop Refurbished')}</h3>
                                <p className="text-slate-800/80 text-sm font-medium">{t('Save up to 40%')}</p>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm group-hover:bg-white/40 transition-colors">
                                    <ArrowRightIcon className="h-6 w-6 text-slate-900" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Box 4: Business (Small) */}
                    <Link prefetch={false} href={`/${language}/business`} className="group relative bg-slate-900/60 backdrop-blur-xl rounded-4xl p-8 border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('Business')}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('Corporate solutions')}</p>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <ArrowRightIcon className="h-6 w-6 text-slate-300 group-hover:text-electric-indigo transition-colors" />
                            </div>
                        </div>
                    </Link>

                </div>
            </div>
        </FadeIn>
    );
};

export default BentoServices;
