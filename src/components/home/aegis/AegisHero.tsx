'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../hooks/useLanguage';
import { ArrowRightIcon, StarIcon, BriefcaseIcon, WrenchScrewdriverIcon, ShieldCheckIcon } from '../../ui/BrandIcons';
import { motion } from 'framer-motion';
import FadeIn from '../../ui/FadeIn';
import Button from '../../ui/Button';
import HeroPhone from '../../sections/HeroPhone';

const AegisHero: React.FC = () => {
    const { language, t } = useLanguage();

    const getAegisTitle = () => {
        const titles = {
            en: { t1: "Corporate & Consumer", t2: "Mobile Solutions." },
            fr: { t1: "Solutions Mobiles", t2: "Pro & Particuliers." },
            nl: { t1: "Mobiele Oplossingen", t2: "Zakelijk & Privé." },
            tr: { t1: "Kurumsal & Bireysel", t2: "Mobil Çözümler." }
        };
        // @ts-ignore
        return titles[language] || titles.en;
    };

    const title = getAegisTitle();

    return (
        <section className="relative overflow-hidden bg-slate-50 dark:bg-deep-space pt-12 pb-16 lg:pt-24 lg:pb-32 min-h-[85vh] flex items-center">
            {/* POWER Background Glows - AEGIS Signature */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 1.5 }}
                className="absolute top-0 right-0 w-[800px] h-[800px] bg-electric-indigo/20 dark:bg-electric-indigo/10 rounded-full blur-[120px] -z-10 pointer-events-none"
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left: Content (AEGIS AUTHORITY) */}
                    <div className="text-center lg:text-left z-10">
                        {/* Status Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 mb-8"
                        >
                            <ShieldCheckIcon className="w-4 h-4 text-emerald-500 mr-2" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                {language === 'fr' ? 'Infrastructure Mobile • Bruxelles HQ' :
                                    language === 'nl' ? 'Mobiele Infrastructuur • Brussel HQ' :
                                        language === 'tr' ? 'Mobil Altyapı • Brüksel HQ' :
                                            'Mobile Infrastructure • Brussels HQ'}
                            </span>
                        </motion.div>

                        <h1 className="text-5xl lg:text-[5.5vw] font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white mb-6 font-heading">
                            {title.t1}<br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-electric-indigo to-cyan-400">
                                {title.t2}
                            </span>
                        </h1>

                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-medium">
                            {language === 'fr' ? "Réparation Grade Industriel. Gestion de Flotte Corporate. Reprise Certifiée. L'épicentre de la mobilité bruxelloise." :
                                language === 'nl' ? "Industriële Reparatie. Corporate Vlootbeheer. Gecertificeerde Inkoop. Het mobiele epicentrum van Brussel." :
                                    language === 'tr' ? "Endüstriyel Onarım. Kurumsal Filo Yönetimi. Sertifikalı Geri Alım. Brüksel mobilite merkezi." :
                                        "Industrial Grade Repair. Corporate Fleet Management. Certified Buyback. The mobile infrastructure of Brussels."}
                        </p>

                        {/* Dual Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            {/* Primary: Repair Service */}
                            <Link href={`/${language}/${language === 'fr' ? 'reparation' : language === 'nl' ? 'reparatie' : 'repair'}`} className="w-full sm:w-auto group">
                                <Button variant="cyber" className="w-full h-14 px-10 text-lg shadow-xl shadow-electric-indigo/20 rounded-2xl" icon={<WrenchScrewdriverIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />}>
                                    {language === 'fr' ? 'Réparer Maintenant' : language === 'nl' ? 'Nu Repareren' : language === 'tr' ? 'Hemen Tamir' : 'Repair Now'}
                                </Button>
                            </Link>

                            {/* Secondary: Business */}
                            <Link href={`/${language}/business`} className="w-full sm:w-auto group">
                                <button className="w-full h-14 px-8 rounded-2xl font-bold text-slate-900 bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:border-slate-700 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                    <BriefcaseIcon className="w-5 h-5 text-electric-indigo group-hover:scale-110 transition-transform" />
                                    <span>
                                        {language === 'fr' ? 'Solutions Pro' : language === 'nl' ? 'Business Oplossingen' : language === 'tr' ? 'Kurumsal Çözümler' : 'Business Solutions'}
                                    </span>
                                </button>
                            </Link>
                        </div>

                        {/* Mini Trust Bar */}
                        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-wrap gap-8 justify-center lg:justify-start">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">4.9/5</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Google Reviews</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">30 Min</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg. Repair Time</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visuals (The 3D Phone) */}
                    <div className="hidden md:flex w-full justify-center lg:justify-end relative items-center">
                        <FadeIn delay={0.2} direction="left" className="w-full h-full flex justify-end">
                            <HeroPhone />
                        </FadeIn>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AegisHero;
