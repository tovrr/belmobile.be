import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/solid';

interface LocationServiceBlockProps {
    city: string;
    lang: string;
}

const LocationServiceBlock: React.FC<LocationServiceBlockProps> = ({ city, lang }) => {
    if (!city) return null;

    const normalizedCity = city.charAt(0).toUpperCase() + city.slice(1);

    const templates = {
        fr: {
            title: `Services de Réparation Experts à ${normalizedCity}`,
            intro: `Vous habitez à **${normalizedCity}** ? Sans vous déplacer loin, profitez de l'expertise Belmobile. Nous couvrons tous les quartiers de ${normalizedCity} pour des réparations rapides et certifiées.`,
            servicesTitle: `Nos interventions fréquentes à ${normalizedCity} :`,
            services: [
                "Remplacement d'écran iPhone (Original / Compatible)",
                "Changement batterie Samsung Galaxy",
                "Diagnostic MacBook & Laptop",
                "Récupération de données complexes"
            ],
            cta: `Visitez notre atelier le plus proche ou réservez un coursier depuis ${normalizedCity}.`,
            ctaButton: "Voir les options de réparation"
        },
        nl: {
            title: `Expert Reparatie Diensten in ${normalizedCity}`,
            intro: `Woont u in **${normalizedCity}**? U hoeft niet ver te reizen voor de expertise van Belmobile. Wij dekken alle wijken van ${normalizedCity} voor snelle en gecertificeerde reparaties.`,
            servicesTitle: `Onze veelvoorkomende interventies in ${normalizedCity}:`,
            services: [
                "iPhone Schermvervanging (Origineel / Compatibel)",
                "Samsung Galaxy Batterij vervangen",
                "MacBook & Laptop Diagnose",
                "Complexe Gegevensherstel"
            ],
            cta: `Bezoek onze dichtstbijzijnde winkel of boek een koerier vanuit ${normalizedCity}.`,
            ctaButton: "Bekijk reparatie-opties"
        },
        en: {
            title: `Expert Phone Repair in ${normalizedCity}`,
            intro: `Live in **${normalizedCity}**? You don't need to travel far for Belmobile's expertise. We cover all neighborhoods in ${normalizedCity} for fast, certified repairs.`,
            servicesTitle: `Popular services in ${normalizedCity}:`,
            services: [
                "iPhone Screen/Battery Replacement",
                "Samsung Galaxy Repair",
                "MacBook Diagnostics",
                "Complex Data Recovery"
            ],
            cta: `Visit our nearest workshop (short drive from ${normalizedCity}) or book a courier pickup.`,
            ctaButton: "See Repair Options"
        },
        tr: {
            title: `${normalizedCity} Uzman Telefon Tamiri`,
            intro: `**${normalizedCity}** bölgesinde mi yaşıyorsunuz? Belmobile kalitesi size çok yakın. ${normalizedCity} genelinde hızlı ve garantili tamir hizmeti sunuyoruz.`,
            servicesTitle: `${normalizedCity} bölgesinde sıkça yaptığımız işlemler:`,
            services: [
                "iPhone Ekran/Batarya Değişimi",
                "Samsung Galaxy Tamiri",
                "MacBook Arıza Tespiti",
                "Veri Kurtarma Hizmetleri"
            ],
            cta: `En yakın şubemizi ziyaret edin veya ${normalizedCity} adresinizden kurye çağırın.`,
            ctaButton: "Tamir Seçeneklerini Gör"
        }
    };

    const content = templates[lang as keyof typeof templates] || templates.en;

    return (
        <div className="mt-6 mb-8 p-6 rounded-2xl bg-slate-800/50 backdrop-blur-md border border-slate-700/50 relative overflow-hidden group">

            {/* Background Glow Effect */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-bel-blue/10 rounded-full blur-3xl group-hover:bg-bel-blue/20 transition-all duration-700"></div>

            <div className="relative z-10">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-bel-blue" />
                    {content.title}
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: content.intro }} />

                <div className="mb-6">
                    <h3 className="text-xs font-bold text-cyber-citron uppercase tracking-wider mb-3">
                        {content.servicesTitle}
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {content.services.map((service, idx) => (
                            <li key={idx} className="flex items-center text-xs text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-bel-blue mr-2"></span>
                                {service}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-slate-400 mb-3 italic">{content.cta}</p>
                    <Link
                        href={`/${lang}/repair`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-bel-blue hover:bg-bel-blue-dark px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                    >
                        {content.ctaButton}
                        <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LocationServiceBlock;
