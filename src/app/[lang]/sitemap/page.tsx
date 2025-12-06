'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { SERVICES } from '@/data/services';
import { LOCATIONS } from '@/data/locations';
import { DEVICE_BRANDS } from '@/data/brands';
import { createSlug } from '@/utils/slugs';
import { MapPinIcon, WrenchIcon, ArrowPathIcon, DevicePhoneMobileIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function VisualSitemap() {
    const { language, t } = useLanguage();

    // Grouping logic (simplified for visual representation)
    const mainLinks = [
        { href: `/${language}`, label: t('Home') },
        { href: `/${language}/contact`, label: t('Contact Us') },
        { href: `/${language}/blog`, label: t('Blog') },
        { href: `/${language}/faq`, label: t('FAQ') },
        { href: `/${language}/track-order`, label: t('Track Order') },
    ];

    const legalLinks = [
        { href: `/${language}/terms`, label: t('Terms of Service') },
        { href: `/${language}/privacy`, label: t('Privacy Policy') },
        { href: `/${language}/cookies`, label: t('Cookie Policy') },
        { href: `/${language}/warranty`, label: t('Warranty Info') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
                        {t('Sitemap')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Explore all the pages of Belmobile.be. Find exactly what you are looking for in our comprehensive directory.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Main Navigation */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center mb-6 text-primary dark:text-cyber-citron">
                            <BuildingStorefrontIcon className="h-6 w-6 mr-3" />
                            <h2 className="text-xl font-bold">Main Pages</h2>
                        </div>
                        <ul className="space-y-3">
                            {mainLinks.map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center mb-6 text-primary dark:text-cyber-citron">
                            <WrenchIcon className="h-6 w-6 mr-3" />
                            <h2 className="text-xl font-bold">{t('Services')}</h2>
                        </div>
                        <ul className="space-y-3">
                            {SERVICES.filter(s => s.id !== 'products').map((service) => (
                                <li key={service.id}>
                                    <Link
                                        href={`/${language}/${service.slugs[language as keyof typeof service.slugs]}`}
                                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors block font-medium"
                                    >
                                        {service.name[language as keyof typeof service.name]}
                                    </Link>

                                    {/* Nested Brands for Service */}
                                    <ul className="pl-4 mt-2 space-y-2 border-l-2 border-gray-100 dark:border-white/5">
                                        {Object.entries(DEVICE_BRANDS).map(([type, brands]) => (
                                            brands.slice(0, 5).map(brand => (
                                                <li key={`${service.id}-${brand}`}>
                                                    <Link
                                                        href={`/${language}/${service.slugs[language as keyof typeof service.slugs]}/${createSlug(brand)}`}
                                                        className="text-sm text-gray-500 hover:text-primary dark:hover:text-white transition-colors"
                                                    >
                                                        {brand}
                                                    </Link>
                                                </li>
                                            ))
                                        ))}
                                        <li className="text-sm text-gray-400 italic">...and more</li>
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Locations */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center mb-6 text-primary dark:text-cyber-citron">
                            <MapPinIcon className="h-6 w-6 mr-3" />
                            <h2 className="text-xl font-bold">{t('Locations')}</h2>
                        </div>
                        <ul className="space-y-3">
                            {LOCATIONS.map((location) => (
                                <li key={location.id}>
                                    <Link
                                        href={`/${language}/${language === 'fr' ? 'magasins' : language === 'nl' ? 'winkels' : 'stores'}/${location.slugs[language as keyof typeof location.slugs]}`}
                                        className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors block"
                                    >
                                        {location.name[language as keyof typeof location.name]}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Products & Legal Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* Products (Buyback Categories) */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center mb-6 text-primary dark:text-cyber-citron">
                            <DevicePhoneMobileIcon className="h-6 w-6 mr-3" />
                            <h2 className="text-xl font-bold">{t('Products')} & {t('Buyback')}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-400 mb-3">Smartphones</h3>
                                <ul className="space-y-2">
                                    {DEVICE_BRANDS.smartphone.map(brand => (
                                        <li key={`prod-${brand}`}>
                                            <Link href={`/${language}/${language === 'fr' ? 'produits' : 'products'}`} className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors text-sm">
                                                {brand}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Add more categories if needed */}
                        </div>
                    </div>

                    {/* Legal Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center mb-6 text-primary dark:text-cyber-citron">
                            <ArrowPathIcon className="h-6 w-6 mr-3" />
                            <h2 className="text-xl font-bold">{t('Legal')}</h2>
                        </div>
                        <ul className="space-y-3">
                            {legalLinks.map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
