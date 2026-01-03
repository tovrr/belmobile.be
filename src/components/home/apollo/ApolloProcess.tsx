'use client';
import React from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import { motion } from 'framer-motion';
import { BoltIcon, CheckCircleIcon, CurrencyEuroIcon } from '../../ui/BrandIcons';

interface ApolloProcessProps {
    mode: 'repair' | 'buyback';
}

const ApolloProcess: React.FC<ApolloProcessProps> = ({ mode }) => {
    const { language } = useLanguage();

    const info = {
        repair: {
            en: [
                { icon: <BoltIcon />, title: "30 Min Repair", desc: "Fast & Certified" },
                { icon: <CheckCircleIcon />, title: "1Y Warranty", desc: "Original Parts" }, // Changed from Euro to Check/Badge concept
                { icon: <CheckCircleIcon />, title: "Official Parts", desc: "Zero stress, 100% reliable" }
            ],
            fr: [
                { icon: <BoltIcon />, title: "Réparation 30m", desc: "Rapide & Certifié" },
                { icon: <CheckCircleIcon />, title: "Pièces d'Origine", desc: "Qualité constructeur" },
                { icon: <CheckCircleIcon />, title: "Garantie 1 An", desc: "Zéro stress, 100% fiable" }
            ],
            nl: [
                { icon: <BoltIcon />, title: "30 Min Reparatie", desc: "Snel & Gecertificeerd" },
                { icon: <CheckCircleIcon />, title: "Originele Onderdelen", desc: "Fabriekskwaliteit" },
                { icon: <CheckCircleIcon />, title: "1 Jaar Garantie", desc: "Geen zorgen, wij fixen" }
            ],
            tr: [
                { icon: <BoltIcon />, title: "30 Dakika Tamir", desc: "Hızlı & Sertifikalı" },
                { icon: <CheckCircleIcon />, title: "Orijinal Parça", desc: "Fabrika kalitesi" },
                { icon: <CheckCircleIcon />, title: "1 Yıl Garanti", desc: "Stres yok, tamir var" }
            ]
        },
        buyback: {
            en: [
                { icon: <BoltIcon />, title: "2 Min Quote", desc: "Instant Offer" },
                { icon: <CurrencyEuroIcon />, title: "Instant Cash", desc: "Same day payment" },
                { icon: <CheckCircleIcon />, title: "Best Price", desc: "Guaranteed" }
            ],
            fr: [
                { icon: <BoltIcon />, title: "Offre en 2min", desc: "Estimation gratuite" },
                { icon: <CurrencyEuroIcon />, title: "Cash Immédiat", desc: "Virement instantané" },
                { icon: <CheckCircleIcon />, title: "Meilleur Prix", desc: "Garanti" }
            ],
            nl: [
                { icon: <BoltIcon />, title: "Offerte in 2min", desc: "Gratis schatting" },
                { icon: <CurrencyEuroIcon />, title: "Direct Cash", desc: "Directe betaling" },
                { icon: <CheckCircleIcon />, title: "Beste Prijs", desc: "Gegarandeerd" }
            ],
            tr: [
                { icon: <BoltIcon />, title: "2 Dk Teklif", desc: "Ücretsiz ekspertiz" },
                { icon: <CurrencyEuroIcon />, title: "Anında Nakit", desc: "Aynı gün ödeme" },
                { icon: <CheckCircleIcon />, title: "En İyi Fiyat", desc: "Garantili" }
            ]
        }
    };

    // @ts-ignore
    const steps = info[mode][language] || info[mode].en;

    return (
        <section className="py-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-3 gap-2">
                    {steps.map((step: any, idx: number) => (
                        <div key={idx} className="flex flex-col items-center text-center p-2 group">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border shadow-sm group-hover:scale-110 transition-transform duration-500 relative overflow-hidden ${mode === 'buyback'
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 text-bel-yellow border-bel-yellow/20'
                                : 'bg-slate-50 dark:bg-slate-950 text-bel-blue border-slate-100 dark:border-slate-800'
                                }`}>
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${mode === 'buyback' ? 'bg-bel-yellow/10' : 'bg-bel-blue/10'}`} />
                                {React.cloneElement(step.icon as React.ReactElement<any>, { className: "w-6 h-6 relative z-10" })}
                            </div>
                            <h4 className="text-[12px] font-black text-slate-900 dark:text-white uppercase leading-tight mb-1 tracking-tighter">{step.title}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none opacity-80">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ApolloProcess;
