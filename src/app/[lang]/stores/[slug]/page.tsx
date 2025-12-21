import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { translations } from '../../../../utils/translations';
import { SERVICES } from '../../../../data/services';
import SchemaOrg from '../../../../components/seo/SchemaOrg';
import Hreflang from '../../../../components/seo/Hreflang';
import { LOCATIONS } from '../../../../data/locations';
import { Shop } from '../../../../types';

// import StoreMap from '../../../../components/StoreMap'; // Replaced by dynamic import
import { db } from '../../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import DynamicSEOContent from '../../../../components/seo/DynamicSEOContent';
import Image from 'next/image';
import StoreMap from '../../../../components/StoreMap';


interface StorePageProps {
    params: Promise<{
        lang: string;
        slug: string;
    }>;
}

// Helper to fetch shops from Firestore and merge with static LOCATIONS
const getShops = cache(async (): Promise<Shop[]> => {
    let shops: Shop[] = [];
    try {
        const snapshot = await getDocs(collection(db, 'shops'));
        shops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Shop));
    } catch (error) {
        console.error("Error fetching shops:", error);
    }

    // Merge static LOCATIONS
    const staticShops = LOCATIONS.map(l => ({
        ...l,
        status: 'open',
    } as unknown as Shop));

    const combined = [...shops];
    staticShops.forEach(s => {
        if (!combined.find(c => c.id === s.id)) {
            combined.push(s);
        }
    });

    return combined;
});

async function findShop(slug: string, lang: string): Promise<Shop | undefined> {
    const shops = await getShops();
    return shops.find(s =>
        s.id === slug ||
        (s.slugs && Object.values(s.slugs).includes(slug))
    );
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    const shop = await findShop(slug, lang);

    if (!shop) {
        return {
            title: 'Store Not Found - Belmobile',
        };
    }

    return {
        title: `${shop.name} - Belmobile`,
        description: `Visit ${shop.name} at ${shop.address}. Expert repair and buyback services.`,
    };
}

// Statically generate routes for all shops and languages
export async function generateStaticParams() {
    const shops = await getShops();
    const languages = ['en', 'fr', 'nl'];
    const params: { lang: string; slug: string }[] = [];

    shops.forEach(shop => {
        languages.forEach(lang => {
            // Use specific slug for language if available, otherwise fallback to ID
            const slug = shop.slugs?.[lang as keyof typeof shop.slugs] || String(shop.id);
            params.push({ lang, slug });
        });
    });

    return params;
}

export default async function StoreProfilePage({ params }: StorePageProps) {
    const { lang, slug } = await params;
    const shop = await findShop(slug, lang);

    if (!shop) {
        return notFound();
    }

    const t = (key: string) => translations[lang as 'en' | 'fr' | 'nl']?.[key] || key;

    const hreflangSlugs = {
        fr: shop.slugs?.fr || String(shop.id),
        nl: shop.slugs?.nl || String(shop.id),
        en: shop.slugs?.en || String(shop.id)
    };

    // Dynamic Links
    const repairService = SERVICES.find(s => s.id === 'repair');
    const buybackService = SERVICES.find(s => s.id === 'buyback');
    const productsService = SERVICES.find(s => s.id === 'products');

    const repairLink = repairService ? `/${lang}/${repairService.slugs[lang as keyof typeof repairService.slugs]}/smartphone/${shop.slugs?.[lang as keyof typeof shop.slugs] || shop.id}` : `/${lang}/reparation`;
    const buybackLink = buybackService ? `/${lang}/${buybackService.slugs[lang as keyof typeof buybackService.slugs]}/smartphone/${shop.slugs?.[lang as keyof typeof shop.slugs] || shop.id}` : `/${lang}/rachat`;
    const productsLink = productsService ? `/${lang}/${productsService.slugs[lang as keyof typeof productsService.slugs]}` : `/${lang}/produits`;

    // Helper to translate opening hours
    const translateHours = (hours: string[]) => {
        if (!hours) return [];
        return hours.map(h => {
            let translated = h;
            if (lang === 'fr') {
                translated = translated.replace('Mon', 'Lun').replace('Tue', 'Mar').replace('Wed', 'Mer').replace('Thu', 'Jeu').replace('Fri', 'Ven').replace('Sat', 'Sam').replace('Sun', 'Dim').replace('Closed', 'Fermé');
            } else if (lang === 'nl') {
                translated = translated.replace('Mon', 'Ma').replace('Tue', 'Di').replace('Wed', 'Wo').replace('Thu', 'Do').replace('Fri', 'Vr').replace('Sat', 'Za').replace('Sun', 'Zo').replace('Closed', 'Gesloten');
            }
            return translated;
        });
    };

    const translatedHours = translateHours(shop.openingHours);

    return (
        <div className="min-h-screen bg-transparent pb-12">
            <Hreflang
                slugs={hreflangSlugs}
                baseUrl={process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be'}
            />
            <SchemaOrg
                shop={shop}
                language={lang}
            />

            {/* Hero Map Section - Full Width */}
            <div className="relative h-[40vh] md:h-[500px] w-full z-0">
                <StoreMap
                    shops={[shop]}
                    center={[shop.coords?.lat || 50.8503, shop.coords?.lng || 4.3517]}
                    zoom={16}
                    selectedShopId={shop.id}
                />
                {/* Gradient Overlay for seamless transition */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-gray-50 dark:from-slate-900 to-transparent pointer-events-none" />
            </div>

            {/* Main Content Container - Overlapping the map on desktop */}
            <div className="container mx-auto px-4 relative z-10 -mt-8 md:-mt-20">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden">

                    {/* Content Section */}
                    <div className="p-5 md:p-10 relative z-10 -mt-4 md:mt-0 bg-transparent rounded-t-3xl md:rounded-none">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">

                            {/* Left Column: Info & Actions */}
                            <div className="flex-1">
                                <div className="mb-6">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${shop.status === 'open'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {shop.status === 'open' ? t('Open Now') : t('Coming Soon')}
                                    </span>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                                        {shop.name}
                                    </h1>
                                    <p className="text-lg text-gray-600 dark:text-slate-300 flex items-start gap-2">
                                        <svg className="w-6 h-6 text-bel-blue shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>
                                            {shop.address}<br />
                                            {shop.zip && `${shop.zip} `}{shop.city}
                                        </span>
                                    </p>
                                </div>

                                {/* Action Buttons - Critical for Mobile */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <a
                                        href={`tel:${shop.phone}`}
                                        className="flex items-center justify-center gap-2 bg-bel-blue text-white py-3.5 px-6 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all active:scale-95"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {t('Call')}
                                    </a>
                                    <a
                                        href={shop.googleMapUrl || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 bg-slate-800 text-white py-3.5 px-6 rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all active:scale-95 border border-white/10"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
                                        </svg>
                                        {t('Directions')}
                                    </a>
                                </div>

                                {/* Services */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('Services')}</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <a href={repairLink} className="group p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 hover:border-blue-300 transition-all">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-3 text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{t('Repair')}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('expert_repair_short') || t('Expert Repair')}</p>
                                        </a>
                                        <a href={buybackLink} className="group p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800 hover:border-green-300 transition-all">
                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-3 text-green-600 dark:text-green-300 group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{t('Buyback')}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('Device Buyback')}</p>
                                        </a>
                                        <a href={productsLink} className="group p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800 hover:border-purple-300 transition-all">
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mb-3 text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{t('Shop Refurbished') || t('Shop')}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('Premium Devices')}</p>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Hours & Contact Info */}
                            <div className="w-full lg:w-80 shrink-0 space-y-6">
                                {/* Opening Hours Card */}
                                <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/10">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {t('chat_demo_hours') ? t('Opening Hours') || 'Opening Hours' : 'Opening Hours'}
                                    </h3>
                                    <ul className="space-y-3 text-sm">
                                        {translatedHours && translatedHours.map((hour, index) => (
                                            <li key={index} className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-slate-600 last:border-0 last:pb-0">
                                                <span className="text-gray-600 dark:text-slate-300">{hour}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Contact Info Card */}
                                <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/10">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">{t('Contact')}</h3>
                                    <div className="space-y-4">
                                        <a href={`mailto:${shop.email}`} className="flex items-center gap-3 text-gray-600 dark:text-slate-300 hover:text-bel-blue transition-colors">
                                            <div className="w-8 h-8 bg-white dark:bg-slate-600 rounded-full flex items-center justify-center shadow-sm">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                            <span className="truncate">{shop.email}</span>
                                        </a>
                                        <a href={`tel:${shop.phone}`} className="flex items-center gap-3 text-gray-600 dark:text-slate-300 hover:text-bel-blue transition-colors">
                                            <div className="w-8 h-8 bg-white dark:bg-slate-600 rounded-full flex items-center justify-center shadow-sm">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            </div>
                                            <span>{shop.phone}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Photos Section */}
                        {shop.photos && shop.photos.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Gallery</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {shop.photos.map((photo, index) => (
                                        <div key={index} className="relative h-40 md:h-56 rounded-2xl overflow-hidden shadow-sm group">
                                            <Image
                                                src={photo}
                                                alt={`${shop.name} photo ${index + 1}`}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dynamic SEO Content */}
                        <DynamicSEOContent
                            type="store"
                            lang={lang as 'fr' | 'nl' | 'en'}
                            shop={shop}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
