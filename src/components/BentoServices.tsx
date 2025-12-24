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

                <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[700px]">

                    {/* Box 1: Repair (Large Vertical) */}
                    <Link prefetch={false} href={`/${language}/${language === 'fr' ? 'reparation' : language === 'nl' ? 'reparatie' : 'repair'}`} className="group relative md:row-span-2 bg-slate-900/60 backdrop-blur-xl rounded-4xl p-8 border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-500" aria-label={t('Expert Repair')}>
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/images/bento/repair_bg.png"
                                alt={t('Expert Repair')}
                                fill
                                className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 blur-[2px] group-hover:blur-0"
                            />
                            <div className="absolute inset-0 bg-linear-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80"></div>
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="bg-blue-500/20 w-14 h-14 rounded-2xl flex items-center justify-center text-electric-indigo mb-8 border border-white/20 group-hover:scale-110 transition-transform duration-500 backdrop-blur-md">
                                <WrenchScrewdriverIcon className="h-7 w-7" />
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-6 leading-tight">{t('Expert Repair')}</h3>
                            <p className="text-lg text-slate-100 mb-8 leading-relaxed font-medium">
                                {t("bento_repair_desc")}
                            </p>
                            <div className="mt-auto">
                                <div className="inline-flex items-center font-bold text-electric-indigo group-hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                                    {t('Get a Quote')} <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Box 2: Buyback (Wide Horizontal) */}
                    <Link prefetch={false} href={`/${language}/${language === 'fr' ? 'rachat' : language === 'nl' ? 'inkoop' : 'buyback'}`} className="group relative md:col-span-2 bg-slate-900/40 backdrop-blur-xl rounded-4xl p-8 border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-500" aria-label={t('Sell Your Device')}>
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/images/hero_phone_bg.png"
                                alt={t('Sell Your Device')}
                                fill
                                className="object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-r from-slate-900/80 via-slate-900/40 to-transparent"></div>
                        </div>
                        <div className="relative z-10 flex flex-col justify-center h-full max-w-md">
                            <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full mb-4 uppercase tracking-wider w-fit border border-green-500/20">{t('Best Price Guaranteed')}</span>
                            <h3 className="text-3xl font-bold text-white mb-4">{t('Sell Your Device')}</h3>
                            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                                {t("bento_buyback_desc")}
                            </p>
                            <div className="flex items-center font-bold text-white group-hover:text-cyber-citron transition-colors">
                                {t('Get Offer')} <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Box 3: Shop (Large Background) */}
                    <Link prefetch={false} href={`/${language}/${language === 'fr' ? 'produits' : language === 'nl' ? 'producten' : 'products'}`} className="group relative bg-slate-900/60 backdrop-blur-xl rounded-4xl p-8 border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-500" aria-label={t('Shop Refurbished')}>
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/images/bento/shop_bg.png"
                                alt={t('bento_shop_alt')}
                                fill
                                className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-end">
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-3">{t('Shop Refurbished')}</h3>
                                <p className="text-base text-slate-300 font-medium mb-6 leading-relaxed line-clamp-2">{t('bento_shop_desc')}</p>
                            </div>
                            <div className="flex items-center font-bold text-cyber-citron">
                                {t('View All Products')} <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Box 4: Business (Premium Background) */}
                    <Link prefetch={false} href={`/${language}/business`} className="group relative bg-slate-900/60 backdrop-blur-xl rounded-4xl p-8 border border-white/10 overflow-hidden hover:shadow-2xl transition-all duration-500" aria-label={t('Business Solutions')}>
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/images/bento/business_bg.png"
                                alt={t('bento_business_alt')}
                                fill
                                className="object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-tr from-slate-900/90 via-slate-900/20 to-transparent"></div>
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-end">
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-3">{t('Business Solutions')}</h3>
                                <p className="text-base text-slate-300 mb-6 leading-relaxed line-clamp-2">{t('bento_business_desc')}</p>
                            </div>
                            <div className="flex items-center font-bold text-white group-hover:text-electric-indigo transition-colors">
                                {t('Contact Us')} <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </Link>

                </div>
            </div>
        </FadeIn>
    );
};

export default BentoServices;
