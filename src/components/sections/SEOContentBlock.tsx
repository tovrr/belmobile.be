'use client';

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface SEOContentBlockProps {
    variant?: 'aegis' | 'apollo';
}

const SEOContentBlock: React.FC<SEOContentBlockProps> = ({ variant = 'aegis' }) => {
    const { t, language } = useLanguage();

    const isFr = language === 'fr';
    const isNl = language === 'nl';
    const isTr = language === 'tr';

    return (
        <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="container mx-auto px-4 text-center max-w-4xl">

                {/* Hiding purely generic titles visually but keeping them for semantic structure if needed, 
                    but here we want visible SEO text that users actually read. */}

                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
                    {isFr ? "Spécialiste de la réparation mobile à Bruxelles" :
                        isNl ? "Specialist in mobiele reparatie in Brussel" :
                            isTr ? "Brüksel'in Telefon Tamir Uzmanı" :
                                "Smartphone Repair Specialist in Brussels"}
                </h2>

                <div className="prose prose-lg dark:prose-invert mx-auto text-slate-600 dark:text-slate-400 leading-relaxed">
                    <p>
                        {isFr ? (
                            <>
                                Chez <strong>Belmobile</strong>, nous redéfinissons les standards de la réparation électronique.
                                Situés au cœur de <strong>Schaerbeek</strong> et <strong>Anderlecht</strong>, ainsi qu'à notre siège de <strong>Molenbeek (Tour & Taxis)</strong>, nos laboratoires certifiés redonnent vie à vos appareils
                                (iPhone, Samsung, iPad, MacBook) en moins de 30 minutes.
                            </>
                        ) : isNl ? (
                            <>
                                Bij <strong>Belmobile</strong> herdefiniëren we de normen voor elektronische reparatie.
                                Gelegen in het hart van <strong>Schaerbeek</strong> en <strong>Anderlecht</strong>, en in ons hoofdkantoor in <strong>Molenbeek (Tour & Taxis)</strong>, brengen onze gecertificeerde laboratoria uw apparaten
                                (iPhone, Samsung, iPad, MacBook) in minder dan 30 minuten weer tot leven.
                            </>
                        ) : isTr ? (
                            <>
                                <strong>Belmobile</strong> olarak, telefon tamiri standartlarını yeniden belirliyoruz.
                                <strong>Schaerbeek</strong>, <strong>Anderlecht</strong> ve <strong>Molenbeek (Tour & Taxis)</strong> HQ şubelerimizde, iPhone, Samsung ve tüm diğer cihazlarınızı,
                                verilerinizi silmeden ve orijinal parça garantisiyle 30 dakikada onarıyoruz. Brüksel'in en güvenilir Türk telefoncusu olarak hizmetinizdeyiz.
                            </>
                        ) : (
                            <>
                                At <strong>Belmobile</strong>, we redefine the standards of electronic repair.
                                Located in the heart of <strong>Brussels</strong> (Schaerbeek, Anderlecht & Molenbeek HQ), our certified labs bring your devices
                                (iPhone, Samsung, iPad, MacBook) back to life in under 30 minutes.
                            </>
                        )}
                    </p>

                    <p className="mt-6">
                        {isFr ? (
                            <>
                                Que ce soit pour un <strong>écran cassé</strong>, une batterie défectueuse ou une récupération de données complexe (microsoudure),
                                nous offrons une <strong>garantie d'un an</strong> sur toutes nos interventions. Ne laissez pas un téléphone endommagé ralentir votre quotidien.
                            </>
                        ) : isNl ? (
                            <>
                                Of het nu gaat om een <strong>gebarsten scherm</strong>, een defecte batterij of complexe gegevensherstel (microsolderen),
                                wij bieden <strong>één jaar garantie</strong> op al onze interventies. Laat een beschadigde telefoon uw dagelijkse leven niet vertragen.
                            </>
                        ) : isTr ? (
                            <>
                                <strong>Kırık ekran</strong>, bitik batarya veya anakart arızası fark etmez.
                                Yapılan her işleme <strong>1 Yıl Garanti</strong> veriyoruz. Teknik servisimiz sadece parça değiştirmez, cihazınızın ömrünü uzatır.
                                Ayrıca eski cihazlarınızı değerinde nakit alıyoruz.
                            </>
                        ) : (
                            <>
                                Whether it's a <strong>cracked screen</strong>, a faulty battery, or complex data recovery (microsoldering),
                                we offer a <strong>1-year warranty</strong> on all our services. Don't let a damaged phone slow down your daily life.
                            </>
                        )}
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {[
                        { label: isTr ? "Orijinal Parça" : "Original Parts", val: "100%" },
                        { label: isTr ? "Mutlu Müşteri" : "Happy Clients", val: "10k+" },
                        { label: isTr ? "Yıllık Tecrübe" : "Years Exp.", val: "12+" },
                        { label: isTr ? "Garanti" : "Warranty", val: "1 Year" },
                    ].map((stat, i) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <div className={`text-2xl font-black ${variant === 'apollo' ? 'text-cyber-citron' : 'text-electric-indigo'}`}>{stat.val}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default SEOContentBlock;
