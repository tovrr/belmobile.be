import React from 'react';
import Link from 'next/link';

import { LOCATIONS } from '../../data/locations';
import { PaperAirplaneIcon, SparklesIcon } from '../ui/BrandIcons';
import Input from '../ui/Input';
import FooterLogo from '../ui/FooterLogo';

import FooterSocials from '../footer-components/FooterSocials';
import FooterNewsletter from '../footer-components/FooterNewsletter';
import FooterColumns from '../footer-components/FooterColumns';
import FooterLanguageSwitcher from '../footer-components/FooterLanguageSwitcher';
import { TranslationDict } from '@/utils/translations';

const POPULAR_REPAIRS = [
    { name: 'iPhone 15 Pro Max', brand: 'Apple', model: 'iPhone 15 Pro Max', category: 'smartphone' },
    { name: 'iPhone 14', brand: 'Apple', model: 'iPhone 14', category: 'smartphone' },
    { name: 'iPhone 13', brand: 'Apple', model: 'iPhone 13', category: 'smartphone' },
    { name: 'iPhone 12', brand: 'Apple', model: 'iPhone 12', category: 'smartphone' },
    { name: 'Samsung S23 Ultra', brand: 'Samsung', model: 'Galaxy S23 Ultra', category: 'smartphone' },
    { name: 'Samsung A54', brand: 'Samsung', model: 'Galaxy A54', category: 'smartphone' },
    { name: 'Google Pixel 7', brand: 'Google', model: 'Pixel 7', category: 'smartphone' },
    { name: 'PlayStation 5', brand: 'Sony', model: 'PlayStation 5 (Disc)', category: 'console_home' },
    { name: 'Nintendo Switch OLED', brand: 'Nintendo', model: 'Switch OLED', category: 'console_portable' },
    { name: 'MacBook Air M2', brand: 'Apple', model: 'MacBook Air M2', category: 'laptop' },
    { name: 'iPad 10th Gen', brand: 'Apple', model: 'iPad (10th Gen)', category: 'tablet' },
    { name: 'Xiaomi 13', brand: 'Xiaomi', model: 'Xiaomi 13', category: 'smartphone' },
];

interface FooterProps {
    lang?: string;
    dict?: TranslationDict;
}

const Footer: React.FC<FooterProps> = ({ lang = 'en', dict = {} }) => {
    // Simple helper if dict lookup fails
    const t = (key: string) => dict[key] || key;
    const language = lang;

    const createSlug = (text: string) => text.toLowerCase().replace(/\s+/g, '-');

    const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://belmobile.be/#organization",
                "name": "Belmobile.be",
                "url": "https://belmobile.be",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://belmobile.be/belmobile-logo.png",
                    "width": 112,
                    "height": 112
                },
                "description": "Premium buyback, repair, and refurbished devices in Brussels.",
                "email": "info@belmobile.be",
                "sameAs": [
                    "https://www.facebook.com/Belmobile.be",
                    "https://www.instagram.com/belmobile.be",
                    "https://www.youtube.com/@belmobile-rachatreparation3659",
                    "https://www.tiktok.com/@belmobile.be"
                ],
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Brussels",
                    "addressCountry": "BE"
                }
            },
            ...LOCATIONS.filter(l => !l.isHub).map(loc => ({
                "@type": "MobilePhoneStore",
                "parentOrganization": { "@id": "https://belmobile.be/#organization" },
                "name": loc.name,
                "image": loc.photos?.[0] ? `https://belmobile.be${loc.photos[0]}` : "https://belmobile.be/store-placeholder.jpg",
                "telephone": loc.phone,
                "email": loc.email,
                "url": `https://belmobile.be/${language}/stores/${loc.slugs[language as 'en' | 'fr' | 'nl' | 'tr'] || loc.slugs.en}`,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": loc.address,
                    "addressLocality": loc.city,
                    "postalCode": loc.zip,
                    "addressCountry": "BE"
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": loc.coords.lat,
                    "longitude": loc.coords.lng
                },
                "priceRange": "€€",
                "openingHours": loc.openingHours.join(', ')
            }))
        ]
    };

    return (
        <footer className="relative bg-slate-950 text-white pt-16 pb-8 overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />
            {/* Modern Electronic Circuit Background Pattern */}
            <div
                className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23eab308' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
            ></div>

            {/* Gradient Overlay for Sleek Look */}
            <div className="absolute inset-0 z-0 bg-linear-to-t from-slate-950 via-slate-950/90 to-slate-950/40 pointer-events-none"></div>

            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-electric-indigo to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 mb-12">

                    {/* Brand Column (Span 4) */}
                    <div className="col-span-2 lg:col-span-4">
                        <Link
                            href={`/${language}`}
                            className="block mb-6 group"
                            aria-label="Belmobile Home"
                            itemScope
                            itemType="https://schema.org/Organization"
                        >
                            <meta itemProp="name" content="Belmobile" />
                            <meta itemProp="url" content="https://belmobile.be" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 text-cyber-citron" itemProp="logo" itemScope itemType="https://schema.org/ImageObject">
                                    <FooterLogo className="w-full h-full" />
                                    <meta itemProp="url" content="https://belmobile.be/belmobile-logo.png" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-2xl sm:text-3xl tracking-tighter text-white leading-none">
                                        BELMOBILE<span className="text-cyber-citron">.BE</span>
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.33em] text-slate-400 uppercase leading-none mt-1 group-hover:text-cyber-citron transition-colors">
                                        BUYBACK & REPAIR
                                    </span>
                                </div>
                            </div>
                        </Link>
                        <p className="text-slate-400 leading-relaxed mb-8 max-w-sm">
                            {language === 'fr'
                                ? "Redéfinir l'expérience mobile à Bruxelles. Appareils premium, réparations certifiées et solutions de rachat durables."
                                : language === 'nl'
                                    ? "De mobiele ervaring in Brussel herdefiniëren. Premium toestellen, gecertificeerde herstellingen en duurzame overname-oplossingen."
                                    : language === 'tr'
                                        ? t('footer_desc')
                                        : "Redefining the mobile experience in Brussels. Premium devices, certified repairs, and sustainable buyback solutions powered by technology."
                            }
                        </p>

                        <FooterNewsletter />
                        <FooterSocials />
                    </div>

                    <FooterColumns lang={lang} dict={dict} />
                </div>

                {/* Popular Repairs (Integrated with Spacing) */}
                <nav aria-label={t('Popular Repairs')} className="border-t border-white/10 pt-8 mb-8">
                    <h4 className="text-xs font-bold text-cyber-citron uppercase tracking-wider mb-6 text-center md:text-left">
                        {t('Popular Repairs')}
                    </h4>
                    <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {POPULAR_REPAIRS.map((item, index) => (
                            <li key={index}>
                                <Link
                                    href={`/${language}/${language === 'fr' ? 'reparation' : language === 'nl' ? 'reparatie' : language === 'tr' ? 'tamir' : 'repair'}/${createSlug(item.brand)}/${createSlug(item.model)}?category=${item.category}`}
                                    className="text-xs text-slate-500 hover:text-white transition-colors flex items-center group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-cyber-citron mr-2 transition-colors"></span>
                                    {t('Repair')} {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Locations */}
                <nav aria-label={t('Our Stores')} className="border-t border-white/10 pt-8 mb-12">
                    <h4 className="text-xs font-bold text-cyber-citron uppercase tracking-wider mb-6 text-center md:text-left">
                        {t('Our Stores')}
                    </h4>
                    <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {LOCATIONS.map((loc) => (
                            <li key={loc.id}>
                                <Link
                                    href={`/${language}/${language === 'fr' ? 'magasins' : language === 'nl' ? 'winkels' : language === 'tr' ? 'magazalar' : 'stores'}/${loc.slugs[language as 'en' | 'fr' | 'nl' | 'tr'] || loc.slugs.en}`}
                                    className="text-xs text-slate-500 hover:text-white transition-colors flex items-center group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-cyber-citron mr-2 transition-colors"></span>
                                    {loc.city.split('-')[0]}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Proximity Booster: Nearby Areas (SEO Goldmine) */}
                    <h4 className="text-xs font-bold text-cyber-citron uppercase tracking-wider mb-4 mt-8 text-center md:text-left">
                        {language === 'fr' ? 'Zones Desservies (Bruxelles)' : language === 'nl' ? 'Servicegebieden (Brussel)' : language === 'tr' ? 'Hizmet Bölgeleri (Brüksel)' : 'Service Areas (Brussels)'}
                    </h4>
                    <div className="flex flex-wrap gap-x-1.5 gap-y-1 justify-center md:justify-start text-xs text-slate-600 leading-relaxed max-w-4xl">
                        {[
                            'Auderghem', 'Berchem-Sainte-Agathe', 'Bruxelles-Ville', 'Etterbeek', 'Evere',
                            'Forest', 'Ganshoren', 'Ixelles', 'Jette', 'Koekelberg',
                            'Saint-Gilles', 'Saint-Josse-ten-Noode', 'Uccle', 'Watermael-Boitsfort',
                            'Woluwe-Saint-Lambert', 'Woluwe-Saint-Pierre'
                        ].map((commune, index, array) => (
                            <React.Fragment key={commune}>
                                <Link
                                    href={`/${language}/${language === 'fr' ? 'magasins' : language === 'nl' ? 'winkels' : language === 'tr' ? 'magazalar' : 'stores'}?city=${commune.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="hover:text-cyber-citron transition-colors"
                                >
                                    {commune}
                                </Link>
                                {index < array.length - 1 && <span className="text-slate-800">•</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </nav>

                {/* Bottom Bar: Copyright + Controls */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <p>&copy; {new Date().getFullYear()} Belmobile.be. All rights reserved.</p>
                        <span className="hidden md:inline text-slate-700 dark:text-slate-700">|</span>
                        <p className="flex items-center gap-1">
                            Made with <span className="text-red-500 animate-pulse">❤️</span> by <a href="https://devforge.systems" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-bold">Devforge.Systems</a>
                        </p>
                    </div>

                    <div className="flex items-center gap-6 mt-4 md:mt-0 md:pr-24">
                        <Link href={`/${language}/sitemap`} className="hover:text-white transition-colors">{t('Sitemap')}</Link>
                        <FooterLanguageSwitcher currentLang={lang} />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
