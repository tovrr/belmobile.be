'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { SERVICES } from '@/data/services';
import { LOCATIONS } from '@/data/locations';
import { DEVICE_BRANDS } from '@/data/brands';
import { createSlug } from '@/utils/slugs';
import {
    MapPinIcon,
    WrenchIcon,
    ArrowPathIcon,
    DevicePhoneMobileIcon,
    BuildingStorefrontIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    QuestionMarkCircleIcon,
    HomeIcon,
    EnvelopeIcon,
    NewspaperIcon,
    CurrencyEuroIcon,
    CpuChipIcon,
    ServerIcon
} from '@heroicons/react/24/outline';

export default function VisualSitemap() {
    const { language, t } = useLanguage();

    const mainLinks = [
        { href: `/${language}`, label: t('Home'), icon: HomeIcon },
        { href: `/${language}/contact`, label: t('Contact Us'), icon: EnvelopeIcon },
        { href: `/${language}/blog`, label: t('Blog'), icon: NewspaperIcon },
        { href: `/${language}/faq`, label: t('FAQ'), icon: QuestionMarkCircleIcon },
        { href: `/${language}/track-order`, label: t('Track Order'), icon: ArrowPathIcon },
    ];

    const legalLinks = [
        { href: `/${language}/terms`, label: t('Terms of Service'), icon: DocumentTextIcon },
        { href: `/${language}/privacy`, label: t('Privacy Policy'), icon: ShieldCheckIcon },
        { href: `/${language}/cookies`, label: t('Cookie Policy'), icon: DocumentTextIcon },
        { href: `/${language}/warranty`, label: t('Warranty Info'), icon: ShieldCheckIcon },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-24 relative overflow-hidden">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 2.24 5 5 2.24 5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%236366f1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
            ></div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-gray-900 dark:text-white">
                        {t('Sitemap')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Explore all the pages of Belmobile.be. Find exactly what you are looking for in our comprehensive directory.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* Column 1: Main & Legal (Span 4) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Main Navigation */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-indigo-500/5 ring-1 ring-gray-100 dark:ring-white/5 hover:shadow-indigo-500/10 transition-all">
                            <div className="flex items-center mb-6">
                                <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-bel-blue flex items-center justify-center mr-4">
                                    <HomeIcon className="h-6 w-6" />
                                </span>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Main Pages')}</h2>
                            </div>
                            <ul className="space-y-4">
                                {mainLinks.map((link, idx) => (
                                    <li key={idx}>
                                        <Link href={link.href} className="flex items-center group">
                                            <link.icon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-bel-blue transition-colors" />
                                            <span className="text-gray-600 dark:text-gray-400 group-hover:text-bel-blue dark:group-hover:text-white font-medium transition-colors group-hover:translate-x-1 duration-200">
                                                {link.label}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-indigo-500/5 ring-1 ring-gray-100 dark:ring-white/5 hover:shadow-indigo-500/10 transition-all">
                            <div className="flex items-center mb-6">
                                <span className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mr-4">
                                    <DocumentTextIcon className="h-6 w-6" />
                                </span>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Legal')}</h2>
                            </div>
                            <ul className="space-y-4">
                                {legalLinks.map((link, idx) => (
                                    <li key={idx}>
                                        <Link href={link.href} className="flex items-center group">
                                            <link.icon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                            <span className="text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-white font-medium transition-colors group-hover:translate-x-1 duration-200">
                                                {link.label}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Column 2: Services & Repairs (Span 8) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Buyback & Repair Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Buyback */}
                            <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <CurrencyEuroIcon className="w-32 h-32 transform rotate-12" />
                                </div>
                                <div className="relative z-10 w-full h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center mb-6">
                                            <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mr-4 backdrop-blur-sm">
                                                <CurrencyEuroIcon className="h-6 w-6 text-white" />
                                            </span>
                                            <h2 className="text-2xl font-bold text-white">{t('Buyback')}</h2>
                                        </div>
                                        <p className="text-blue-100 mb-6">{t('sitemap_buyback_desc')}</p>
                                    </div>
                                    <Link
                                        href={`/${language}/${language === 'fr' ? 'rachat' : language === 'nl' ? 'inkoop' : 'buyback'}`}
                                        className="inline-flex items-center font-bold text-white hover:text-white/80 transition-colors"
                                    >
                                        {t('start_selling')} <ArrowPathIcon className="h-4 w-4 ml-2" />
                                    </Link>
                                </div>
                            </div>

                            {/* Repair */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-indigo-500/5 ring-1 ring-gray-100 dark:ring-white/5 hover:shadow-indigo-500/10 transition-all flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center mb-6">
                                        <span className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center mr-4">
                                            <WrenchIcon className="h-6 w-6" />
                                        </span>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Repair')}</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Smartphones</h3>
                                            <ul className="space-y-1">
                                                {DEVICE_BRANDS.smartphone.slice(0, 4).map(brand => (
                                                    <li key={brand}>
                                                        <Link href={`/${language}/${language === 'fr' ? 'reparation' : language === 'nl' ? 'reparatie' : 'repair'}/${createSlug(brand)}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors block">
                                                            {brand}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">{t('Consoles')} & {t('Misc')}</h3>
                                            <ul className="space-y-1">
                                                <li className="text-sm text-gray-600 dark:text-gray-400">PlayStation</li>
                                                <li className="text-sm text-gray-600 dark:text-gray-400">Nintendo</li>
                                                <li className="text-sm text-gray-600 dark:text-gray-400">Xbox</li>
                                                <li className="text-sm text-gray-600 dark:text-gray-400">Apple Watch</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={`/${language}/${language === 'fr' ? 'reparation' : language === 'nl' ? 'reparatie' : 'repair'}`}
                                    className="inline-flex items-center font-bold text-green-600 hover:text-green-700 transition-colors"
                                >
                                    {t('view_all_repairs')} <ArrowPathIcon className="h-4 w-4 ml-2" />
                                </Link>
                            </div>
                        </div>

                        {/* Other Services */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-indigo-500/5 ring-1 ring-gray-100 dark:ring-white/5 hover:shadow-indigo-500/10 transition-all">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider opacity-60 ml-2">{t('other_services_title')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Link
                                    href={language === 'fr' ? '/fr/services/recuperation-donnees' : language === 'nl' ? '/nl/services/data-recovery' : `/${language}/services/data-recovery`}
                                    className="group p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <ServerIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transaction-colors">{t('Data Recovery')}</span>
                                    </div>
                                </Link>
                                <Link
                                    href={language === 'fr' ? '/fr/services/microsoudure' : language === 'nl' ? '/nl/services/microsolderen' : `/${language}/services/microsoldering`}
                                    className="group p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors border border-transparent hover:border-orange-200 dark:hover:border-orange-800/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <CpuChipIcon className="h-6 w-6 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                        <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transaction-colors">{t('Microsoldering')}</span>
                                    </div>
                                </Link>
                                <Link
                                    href={`/${language}/students`}
                                    className="group p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-gray-400 group-hover:text-emerald-500 transition-colors text-lg">-10%</span>
                                        <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transaction-colors">{t('Student Offers')}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Stores */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-indigo-500/5 ring-1 ring-gray-100 dark:ring-white/5 hover:shadow-indigo-500/10 transition-all">
                            <div className="flex items-center mb-6">
                                <span className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center mr-4">
                                    <BuildingStorefrontIcon className="h-6 w-6" />
                                </span>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Our Stores')}</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {LOCATIONS.filter(l => !l.isHub).map((location) => (
                                    <Link
                                        key={location.id}
                                        href={`/${language}/${language === 'fr' ? 'magasins' : language === 'nl' ? 'winkels' : 'stores'}/${location.slugs[language as keyof typeof location.slugs]}`}
                                        className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-white/5 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all group"
                                    >
                                        <MapPinIcon className="h-5 w-5 text-gray-400 group-hover:text-amber-500 mr-3 transition-colors" />
                                        <div>
                                            <span className="block font-bold text-gray-800 dark:text-gray-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors text-sm">
                                                {location.name}
                                            </span>
                                            <span className="text-xs text-gray-500 group-hover:text-amber-600/70">{location.city}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
