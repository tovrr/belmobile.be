import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getFixedT } from '../../../utils/i18nFixed';
import {
    WrenchScrewdriverIcon,
    CurrencyEuroIcon,
    ShoppingBagIcon,
    CpuChipIcon,
    ServerIcon,
    TruckIcon,
    BuildingOfficeIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

interface PageProps {
    params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('services_hub_meta_title'),
        description: t('services_hub_meta_desc'),
        keywords: t('services_hub_meta_keywords'),
    };
}

export default async function ServicesHubPage({ params }: PageProps) {
    const { lang } = await params;
    const t = getFixedT(lang);

    const services = [
        {
            title: t('service_repair_title'),
            desc: t('service_repair_desc'),
            icon: WrenchScrewdriverIcon,
            link: `/${lang}/repair`,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-500/10'
        },
        {
            title: t('service_buyback_title'),
            desc: t('service_buyback_desc'),
            icon: CurrencyEuroIcon,
            link: `/${lang}/buyback`,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-500/10'
        },
        {
            title: t('service_shop_title'),
            desc: t('service_shop_desc'),
            icon: ShoppingBagIcon,
            link: `/${lang}/products`, // Assuming products is the store
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-500/10'
        },
        {
            title: t('service_microsoldering_title'),
            desc: t('service_microsoldering_desc'),
            icon: CpuChipIcon,
            link: `/${lang}/services/microsoldering`,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-500/10'
        },
        {
            title: t('service_datarecovery_title'),
            desc: t('service_datarecovery_desc'),
            icon: ServerIcon,
            link: `/${lang}/services/data-recovery`,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-500/10'
        },
        {
            title: t('service_courier_title'),
            desc: t('service_courier_desc'),
            icon: TruckIcon,
            link: `/${lang}/express-courier`,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-500/10'
        },
        {
            title: t('service_business_title'),
            desc: t('service_business_desc'),
            icon: BuildingOfficeIcon,
            link: `/${lang}/business`,
            color: 'text-slate-500',
            bg: 'bg-slate-50 dark:bg-slate-500/10'
        },
        {
            title: t('service_students_title'),
            desc: t('service_students_desc'),
            icon: AcademicCapIcon,
            link: `/${lang}/students`,
            color: 'text-pink-500',
            bg: 'bg-pink-50 dark:bg-pink-500/10'
        }
    ];

    return (
        <div className="bg-white dark:bg-slate-950 min-h-screen font-sans pb-20">
            {/* Hero */}
            <div className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6">
                        {t('services_hub_title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        {t('services_hub_subtitle')}
                    </p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <Link
                            key={index}
                            href={service.link}
                            className="group block p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${service.bg} group-hover:scale-110 transition-transform`}>
                                <service.icon className={`w-8 h-8 ${service.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                {service.desc}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="max-w-3xl mx-auto px-4 mt-24 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {t('services_cta_title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    {t('services_cta_desc')}
                </p>
                <Link
                    href={`/${lang}/contact`}
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-slate-900 dark:bg-indigo-600 rounded-full hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                    {t('services_cta_button')}
                </Link>
            </div>
        </div>
    );
}
