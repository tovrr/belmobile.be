'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Updated to use next/image for optimization
import { ArrowRightIcon, CurrencyEuroIcon } from './ui/BrandIcons';
import { useLanguage } from '../hooks/useLanguage';
import FadeIn from './ui/FadeIn';
import { POPULAR_BUYBACKS } from '../constants';

const PopularBuybacks: React.FC = () => {
    const { t, language } = useLanguage();

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-transparent pointer-events-none" />

            <div className="container mx-auto px-4">
                <FadeIn>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-electric-indigo font-bold tracking-widest text-xs uppercase mb-2 block">
                            {t('Best Price Guaranteed')}
                        </span>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
                            {t('popular_buyback_title')}
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400">
                            {t('bento_buyback_desc')}
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {POPULAR_BUYBACKS.map((device, idx) => (
                        <FadeIn key={device.id} delay={idx * 0.1} className="h-full">
                            <Link
                                href={`/${language}/${language === 'fr' ? 'rachat' : language === 'nl' ? 'inkoop' : 'buyback'}`}
                                className="group block h-full bg-white/50 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-white/5 hover:border-electric-indigo/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1"
                            >
                                <div className="relative h-32 mb-4 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-radial from-electric-indigo/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    {/* Updated to use Next.js Image component */}
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={device.image}
                                            alt={device.name}
                                            fill
                                            className="object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-electric-indigo transition-colors">
                                        {device.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider font-semibold">
                                        {t('Up to')}
                                    </p>
                                    <div className="inline-flex items-center justify-center bg-green-500/10 text-green-600 dark:text-green-400 font-bold px-3 py-1 rounded-full text-lg border border-green-500/20">
                                        <CurrencyEuroIcon className="h-4 w-4 mr-1" />
                                        {device.maxPrice}
                                    </div>
                                </div>
                            </Link>
                        </FadeIn>
                    ))}
                </div>

                <FadeIn delay={0.4} className="text-center mt-12">
                    <Link
                        href={`/${language}/${language === 'fr' ? 'rachat' : language === 'nl' ? 'inkoop' : 'buyback'}`}
                        className="inline-flex items-center text-white bg-electric-indigo hover:bg-electric-indigo/90 focus:ring-4 focus:ring-electric-indigo/30 font-bold rounded-full text-sm px-8 py-4 transition-all hover:scale-105 shadow-lg hover:shadow-electric-indigo/25"
                    >
                        {t('Sell Another Device')}
                        <ArrowRightIcon className="ml-2 -mr-1 w-5 h-5" />
                    </Link>
                </FadeIn>
            </div>
        </section>
    );
};

export default PopularBuybacks;
