import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TranslationDict } from '../../../../utils/translations';
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
import { isShopOpen } from '../../../../utils/shopUtils';


interface StorePageProps {
    params: Promise<{
        lang: string;
        slug: string;
    }>;
}

import { SHOPS } from '../../../../constants';

// Helper to fetch shops from Firestore and merge with static LOCATIONS
const getShops = cache(async (): Promise<Shop[]> => {
    let shops: Shop[] = [];
    try {
        const snapshot = await getDocs(collection(db, 'shops'));
        shops = snapshot.docs.map(doc => {
            const shopData = { id: doc.id, ...doc.data() } as unknown as Shop;
            // Override with verified constants for core shops
            const verifiedShop = SHOPS.find(s => s.id === shopData.id);
            const staticInfo = LOCATIONS.find(l => l.id === shopData.id);

            return {
                ...shopData,
                // Ensure zip and slugs are always available from static data if missing in DB
                zip: shopData.zip || staticInfo?.zip,
                slugs: shopData.slugs || staticInfo?.slugs,
                isHub: staticInfo?.isHub || false,
                // Override coordinates/address for specific shops as per previous logic
                ...(verifiedShop && (shopData.id === 'schaerbeek' || shopData.id === 'anderlecht' || shopData.id === 'molenbeek') ? {
                    coords: verifiedShop.coords,
                    address: verifiedShop.address,
                    name: verifiedShop.name
                } : {})
            };
        });
    } catch (error) {
        console.error("Error fetching shops:", error);
    }

    // Merge static LOCATIONS
    const staticShops = LOCATIONS.map(l => ({
        ...l,
        // Do not force 'open' here, let the merging logic handle it
    } as unknown as Shop));

    const combined = [...shops];
    staticShops.forEach(s => {
        const existing = combined.find(c => c.id === s.id);
        if (!existing) {
            combined.push(s);
        } else if (!existing.status) {
            // Keep the status from database if it exists, otherwise use 'open'
            existing.status = 'open';
        }
    });

    return combined;
});

async function findShop(slug: string): Promise<Shop | undefined> {
    const shops = await getShops();
    return shops.find(s =>
        s.id === slug ||
        (s.slugs && Object.values(s.slugs).includes(slug))
    );
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    const shop = await findShop(slug);

    if (!shop) {
        return {
            title: 'Store Not Found - Belmobile',
        };
    }

    const isHub = !!shop.isHub;

    if (isHub) {
        return {
            title: lang === 'fr' ? `Réparation et Rachat de Smartphone à ${shop.city} | Belmobile Expert` : lang === 'nl' ? `Smartphone Reparatie en Inkoop in ${shop.city} | Belmobile Expert` : `Smartphone Repair and Buyback in ${shop.city} | Belmobile Expert`,
            description: lang === 'fr' ? `Belmobile est votre expert local à ${shop.city}. Service de réparation express (iPhone, Samsung) et rachat immédiat au meilleur prix à Schaerbeek, Molenbeek et Anderlecht.` : lang === 'nl' ? `Belmobile is uw lokale expert in ${shop.city}. Snelle reparatie (iPhone, Samsung) en inkoop direct tegen de beste prijs in Schaerbeek, Molenbeek en Anderlecht.` : `Belmobile is your local expert in ${shop.city}. Express repair service (iPhone, Samsung) and immediate buyback at the best price in Schaerbeek, Molenbeek and Anderlecht.`,
        };
    }

    const cityPrefix = shop.city === 'Schaerbeek' ? '(1030)' : shop.city === 'Molenbeek-Saint-Jean' ? '(1080)' : shop.city === 'Anderlecht' ? '(1070)' : '';

    return {
        title: `${shop.name} ${cityPrefix} - Belmobile Repair & Buyback`,
        description: `Visit ${shop.name} at ${shop.address}. Expert smartphone repair (screen, battery) and immediate cash buyback in ${shop.city}. No appointment needed.`,
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
    const shop = await findShop(slug);

    if (!shop) {
        return notFound();
    }

    const translationsDict: TranslationDict = (await import(`../../../../data/i18n/${lang}.json`)).default;
    const t = (key: string) => translationsDict[key] || key;

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
    const allShops = await getShops();
    const cityShops = allShops.filter(s => {
        if (s.isHub) return false;

        // For Brussels Hub, include all stores in the 10xx ZIP area (Brussels region)
        // We check for startsWith('10') to group them logically
        if (shop.id === 'bruxelles') {
            return s.zip?.startsWith('10');
        }

        return s.city === shop.city;
    });

    const isOpen = shop.status === 'open' && isShopOpen(shop.openingHours);
    const isTempClosed = shop.status === 'temporarily_closed';
    const isSoon = shop.status === 'coming_soon';
    const isHub = !!shop.isHub;

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
            <div className="relative h-[40vh] md:h-[450px] w-full z-0">
                <StoreMap
                    shops={isHub ? cityShops : [shop]}
                    center={[shop.coords?.lat || 50.8503, shop.coords?.lng || 4.3517]}
                    zoom={isHub ? 12 : 16}
                    selectedShopId={isHub ? null : shop.id}
                />
                {/* Gradient Overlay for seamless transition */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-gray-50 dark:from-slate-900 to-transparent pointer-events-none" />
            </div>

            {/* Main Content Container - Overlapping the map on desktop */}
            <div className="container mx-auto px-4 relative z-10 -mt-8 md:-mt-20">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden">

                    {/* Content Section */}
                    <div className="p-5 md:p-10 relative z-10 bg-transparent rounded-t-3xl md:rounded-none">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">

                            {/* Left Column: Info & Actions */}
                            <div className="flex-1">
                                <div className="mb-6">
                                    {!isHub && (
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${isOpen
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : isTempClosed
                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
                                                : isSoon
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {isOpen ? t('Open Now') : isTempClosed ? t('Temporarily Closed') : isSoon ? t('Coming Soon') : t('Closed')}
                                        </span>
                                    )}
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                                        {isHub ? (lang === 'fr' ? `Services Belmobile à ${shop.city}` : lang === 'nl' ? `Belmobile diensten in ${shop.city}` : `Belmobile Services in ${shop.city}`) : shop.name}
                                    </h1>
                                    <p className="text-xl text-gray-600 dark:text-slate-300 flex items-start gap-2 max-w-2xl leading-relaxed">
                                        {!isHub ? (
                                            <>
                                                <svg className="w-6 h-6 text-bel-blue shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>
                                                    {shop.address}<br />
                                                    {shop.zip && `${shop.zip} `}{shop.city}
                                                </span>
                                            </>
                                        ) : (
                                            <span>{lang === 'fr' ? `Expert local à ${shop.city} pour la réparation express et le rachat de vos appareils.` : lang === 'nl' ? `Lokale expert in ${shop.city} voor snelle reparatie en inkoop van uw toestellen.` : `Local expert in ${shop.city} for express repair and buyback of your devices.`}</span>
                                        )}
                                    </p>
                                </div>

                                {/* Action Buttons - Hidden for Hubs since there's no specific phone/directions */}
                                {!isHub && (
                                    <div className="grid grid-cols-2 gap-4 mb-10">
                                        <a
                                            href={`tel:${shop.phone}`}
                                            className="flex items-center justify-center gap-2 bg-bel-blue text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all active:scale-95"
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
                                            className="flex items-center justify-center gap-2 bg-slate-800 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all active:scale-95 border border-white/10"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
                                            </svg>
                                            {t('Directions')}
                                        </a>
                                    </div>
                                )}

                                {/* Hub-specific Store Grid */}
                                {isHub && (
                                    <div className="mb-12">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                            {lang === 'fr' ? 'Nos Magasins à ' : lang === 'nl' ? 'Onze Winkels in ' : 'Our Stores in '}{shop.city}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {cityShops.map((cityShop) => (
                                                <a
                                                    key={cityShop.id}
                                                    href={`/${lang}/stores/${cityShop.slugs?.[lang] || cityShop.id}`}
                                                    className="p-6 bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 hover:border-bel-blue/30 rounded-2xl transition-all group"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-bold text-white group-hover:text-bel-blue transition-colors">{cityShop.name}</h3>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${cityShop.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                            {cityShop.status === 'open' ? t('Open Now') : t('Closed')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-400 mb-4">{cityShop.address}, {cityShop.city}</p>
                                                    <div className="text-bel-blue text-sm font-bold flex items-center gap-1">
                                                        {t('View Details')} <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Services */}
                                <div className="mb-0">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('Quick Links')}</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <a href={repairLink} className="group p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 hover:border-blue-300 transition-all flex flex-col items-center sm:items-start text-center sm:text-left">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-300 group-hover:rotate-12 transition-transform">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('Repair')}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('expert_repair_short') || t('Expert Repair')}</p>
                                        </a>
                                        <a href={buybackLink} className="group p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800 hover:border-green-300 transition-all flex flex-col items-center sm:items-start text-center sm:text-left">
                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-300 group-hover:scale-110 transition-transform">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('Buyback')}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('Device Buyback')}</p>
                                        </a>
                                        <a href={productsLink} className="group p-6 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800 hover:border-purple-300 transition-all flex flex-col items-center sm:items-start text-center sm:text-left">
                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mb-4 text-purple-600 dark:text-purple-300 group-hover:-rotate-12 transition-transform">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('Shop Refurbished') || t('Shop')}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('Premium Devices')}</p>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Hours & Contact Info - Hidden for Hubs */}
                            {!isHub && (
                                <div className="w-full lg:w-80 shrink-0 space-y-6 lg:mt-6">
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
                            )}
                        </div>

                        {/* Photos Section - Only for real shops */}
                        {!isHub && shop.photos && shop.photos.length > 0 && (
                            <div className="mt-16 pt-10 border-t border-gray-100 dark:border-slate-800">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Store Gallery</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {shop.photos.map((photo, index) => (
                                        <div key={index} className="relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-lg group">
                                            <Image
                                                src={photo}
                                                alt={`${shop.name} photo ${index + 1}`}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dynamic SEO Content */}
                        <div className={`${isHub ? 'mt-0' : 'mt-8'}`}>
                            <DynamicSEOContent
                                type="store"
                                lang={lang as 'fr' | 'nl' | 'en'}
                                shop={shop}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
