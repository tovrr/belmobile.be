import React, { cache } from 'react';
export const revalidate = 3600; // Revalidate every hour
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TranslationDict } from '../../../../utils/translations';
import { SERVICES } from '../../../../data/services';
import SchemaOrg from '../../../../components/seo/SchemaOrg';
import Hreflang from '../../../../components/seo/Hreflang';
import { LOCATIONS } from '../../../../data/locations';
import { Shop } from '../../../../types';
import { SHOPS } from '../../../../constants';

// import StoreMap from '../../../../components/StoreMap'; // Replaced by dynamic import
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { fetchMergedShops, isShopOpen } from '../../../../utils/shopUtils';

// Lazy Load Heavy Components
const DynamicSEOContent = dynamic(() => import('../../../../components/seo/DynamicSEOContent'), {
    loading: () => <div className="h-96 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />
});
const StoreProductCarousel = dynamic(() => import('../../../../components/stores/StoreProductCarousel'), { ssr: true });

// Client Components (Handle ssr: false internally via wrappers)
import StoreReviews from '../../../../components/stores/StoreReviewsClient';
import StoreGallery from '../../../../components/stores/StoreGalleryClient';
import StoreMap from '../../../../components/stores/StoreMapClient';

interface StorePageProps {
    params: Promise<{
        lang: string;
        slug: string;
    }>;
}

// Helper to fetch shops from Firestore and merge with static LOCATIONS (Cached)
const getShops = cache(async (): Promise<Shop[]> => {
    return await fetchMergedShops();
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

    // Prevent favicon.ico from triggering translation load
    if (lang === 'favicon.ico') return {};

    const shop = await findShop(slug);

    if (!shop) {
        return {
            title: 'Store Not Found - Belmobile',
        };
    }

    // Load translations for metadata (Server Side)
    // Ensure we don't try to load invalid languages
    if (!['en', 'fr', 'nl', 'tr'].includes(lang)) return {};
    const translationsDict: TranslationDict = (await import(`../../../../data/i18n/${lang}.json`)).default;
    const t = (key: string) => translationsDict[key] || key;

    const isHub = !!shop.isHub;

    const baseUrl = 'https://belmobile.be';
    const alternates: { [key: string]: string } = {};
    ['en', 'fr', 'nl', 'tr'].forEach(l => {
        alternates[l] = `${baseUrl}/${l}/stores/${shop.slugs?.[l as keyof typeof shop.slugs] || String(shop.id)}`;
    });

    const cityPrefix = lang === 'fr' ? `à ${shop.city}` : `in ${shop.city}`;

    return {
        title: isHub ? (lang === 'fr' ? `Réparation et Rachat de Smartphone à ${shop.city} | Belmobile Expert` : lang === 'nl' ? `Smartphone Reparatie en Inkoop in ${shop.city} | Belmobile Expert` : `Smartphone Repair and Buyback in ${shop.city} | Belmobile Expert`) : `${shop.name} ${cityPrefix} - Belmobile Repair & Buyback`,
        description: isHub ? (lang === 'fr' ? `Belmobile est votre expert local à ${shop.city}. Service de réparation express (iPhone, Samsung) et rachat immédiat au meilleur prix à Schaerbeek, Molenbeek et Anderlecht.` : lang === 'nl' ? `Belmobile is uw lokale expert in ${shop.city}. Snelle reparatie (iPhone, Samsung) en inkoop direct tegen de beste prijs in Schaerbeek, Molenbeek en Anderlecht.` : `Belmobile is your local expert in ${shop.city}. Express repair service (iPhone, Samsung) and immediate buyback at the best price in Schaerbeek, Molenbeek and Anderlecht.`) : `Visit ${shop.name} at ${shop.address}. Expert smartphone repair (screen, battery) and immediate cash buyback in ${shop.city}. No appointment needed.`,
        alternates: {
            canonical: `${baseUrl}/${lang}/stores/${slug}`,
            languages: alternates
        }
    };
}

// Statically generate routes for all shops and languages
export async function generateStaticParams() {
    const shops = await getShops();
    const languages = ['en', 'fr', 'nl', 'tr'];
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


    // Dynamic Links
    const repairService = SERVICES.find(s => s.id === 'repair');
    const buybackService = SERVICES.find(s => s.id === 'buyback');
    const productsService = SERVICES.find(s => s.id === 'products');

    const repairLink = repairService ? `/${lang}/${repairService.slugs[lang as keyof typeof repairService.slugs]}/smartphone/${shop.slugs?.[lang as keyof typeof shop.slugs] || shop.id}` : `/${lang}/reparation`;
    const buybackLink = buybackService ? `/${lang}/${buybackService.slugs[lang as keyof typeof buybackService.slugs]}/smartphone/${shop.slugs?.[lang as keyof typeof shop.slugs] || shop.id}` : `/${lang}/rachat`;
    const productsLink = productsService ? `/${lang}/${productsService.slugs[lang as keyof typeof productsService.slugs]}` : `/${lang}/produits`;

    // Calculate Schaerbeek Link for the Interceptor
    // We get the Schaerbeek shop to find its correct slug for the current lang
    const schaerbeekShop = SHOPS.find(s => s.id === 'schaerbeek');
    const schaerbeekSlug = schaerbeekShop?.slugs?.[lang as keyof typeof schaerbeekShop.slugs] || 'schaerbeek';
    const schaerbeekLink = `/${lang}/stores/${schaerbeekSlug}`;

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
    const isAppointment = shop.openingHours?.some(h => h.toLowerCase().includes('appointment'));
    const isSoon = shop.status === 'coming_soon';
    const isHub = !!shop.isHub;

    return (
        <div className="min-h-screen bg-transparent pb-12">
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
                    lang={lang}
                />
                {/* Gradient Overlay for seamless transition */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-gray-50 dark:from-slate-900 to-transparent pointer-events-none" />
            </div>

            {/* Main Content Container - Overlapping the map on desktop */}
            <div className="container mx-auto px-4 relative z-10 -mt-8 md:-mt-20">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-t-3xl md:rounded-3xl shadow-xl">

                    {/* INTERCEPTOR BANNER */}
                    {!isHub && (isTempClosed || !shop.isPrimary) && (
                        <div className={`p-6 border-b border-white/10 rounded-t-3xl md:rounded-t-3xl ${isTempClosed ? 'bg-amber-500/20' : 'bg-bel-blue/10'}`}>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${isTempClosed ? 'bg-amber-500' : 'bg-bel-blue'} text-white shadow-lg`}>
                                        {isTempClosed ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">
                                            {isTempClosed ? t('interceptor_closed_title') || 'This location is temporarily closed' : t('interceptor_primary_title') || 'Need a faster service?'}
                                        </h4>
                                        <p className="text-sm text-slate-300">
                                            {isTempClosed
                                                ? t('interceptor_closed_desc') || 'Our Schaerbeek shop is only 5 minutes away and open now!'
                                                : t('interceptor_primary_desc') || 'Our Schaerbeek hub has the largest stock and express repair parts available today.'}
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={schaerbeekLink}
                                    className="px-6 py-3 bg-white text-bel-blue font-black rounded-xl hover:scale-105 transition-transform shadow-xl whitespace-nowrap"
                                >
                                    {t('Go to Schaerbeek')} →
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="p-5 md:p-10 relative z-10 bg-transparent rounded-t-3xl md:rounded-none">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
                            {/* Left Column: Info & Actions */}
                            <div className="flex-1 min-w-0">
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
                                            {isOpen ? t('Open Now') : isAppointment ? t('By Appointment') : isTempClosed ? t('Temporarily Closed') : isSoon ? t('Coming Soon') : t('Closed')}
                                        </span>
                                    )}
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                                        {isHub ? (lang === 'fr' ? `Services Belmobile à ${shop.city}` : lang === 'nl' ? `Belmobile diensten in ${shop.city}` : `Belmobile Services in ${shop.city}`) : shop.name}
                                    </h1>

                                    {!isHub && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex text-yellow-400">
                                                {[1, 2, 3, 4, 5].map((star) => {
                                                    const rating = shop.rating || 4.8;
                                                    const fillAmount = Math.max(0, Math.min(1, rating - star + 1));
                                                    return (
                                                        <div key={star} className="relative w-5 h-5">
                                                            <svg className="absolute w-5 h-5 text-gray-300 dark:text-slate-700" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            <div className="absolute overflow-hidden" style={{ width: `${fillAmount * 100}%` }}>
                                                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <span className="text-sm font-bold text-gray-600 dark:text-slate-400 ml-1">
                                                {shop.rating || 4.8} ({shop.reviewCount || 150}+ {t('reviews') || 'reviews'})
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-bel-blue/10 rounded-2xl shrink-0">
                                            <svg className="w-6 h-6 text-bel-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        {!isHub ? (
                                            <div className="text-gray-600 dark:text-slate-300">
                                                <p className="font-bold text-lg leading-tight">{shop.address}</p>
                                            </div>
                                        ) : (
                                            <p className="text-lg text-gray-600 dark:text-slate-300 leading-relaxed max-w-xl">
                                                {lang === 'fr' ? `Expert local à ${shop.city} pour la réparation express et le rachat de vos appareils.` : lang === 'nl' ? `Lokale expert in ${shop.city} voor snelle reparatie en inkoop van uw toestellen.` : `Local expert in ${shop.city} for express repair and buyback of your devices.`}
                                            </p>
                                        )}
                                    </div>

                                    {!isHub && (
                                        <div className="flex gap-3">
                                            <a
                                                href={`tel:${shop.phone}`}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-bel-blue text-white py-3 px-6 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {t('cta_call')}
                                            </a>
                                            <a
                                                href={shop.googleMapUrl || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-gray-900 dark:text-white py-3 px-6 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 border border-gray-200 dark:border-white/10"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" /></svg>
                                                {t('cta_visit')}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Opening Hours (Hidden on desktop) */}
                                {!isHub && (
                                    <div className="lg:hidden mb-12 bg-gray-50 dark:bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">
                                            {t('Opening Hours') || 'Opening Hours'}
                                        </h3>
                                        <ul className="space-y-3 text-sm">
                                            {translatedHours && translatedHours.map((hour, index) => (
                                                <li key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                                                    <span className="text-gray-600 dark:text-slate-300 font-medium">{hour}</span>
                                                </li>
                                            ))}
                                        </ul>
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

                                {/* Services Quick Links */}
                                <div className="mb-12">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white px-2 mb-6">
                                        {t('shop_services_title') || 'Shop Services'}
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <a href={repairLink} className="relative group p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-4xl border border-blue-100 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col items-start overflow-hidden shadow-sm hover:shadow-xl">
                                            <div className="absolute top-4 right-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                                                {t('available_here') || 'Disponible Ici'}
                                            </div>
                                            <div className="w-12 h-12 bg-white dark:bg-blue-800 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-300 group-hover:rotate-12 transition-transform shadow-sm">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{t('ql_repair_title') || t('Repair')}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-3">{t('ql_repair_cta')}</p>
                                            <div className="mt-auto flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                                                {t('cta_quote')} &rarr;
                                            </div>
                                        </a>

                                        <a href={buybackLink} className="relative group p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-4xl border border-emerald-100 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col items-start overflow-hidden shadow-sm hover:shadow-xl">
                                            <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                                                {t('available_here') || 'Disponible Ici'}
                                            </div>
                                            <div className="w-12 h-12 bg-white dark:bg-emerald-800 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-300 group-hover:scale-110 transition-transform shadow-sm">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{t('ql_buyback_title') || t('Buyback')}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-3">{t('ql_buyback_cta')}</p>
                                            <div className="mt-auto flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                                                {t('cta_sell')} &rarr;
                                            </div>
                                        </a>

                                        <a href={productsLink} className="relative group p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-4xl border border-amber-100 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col items-start overflow-hidden shadow-sm hover:shadow-xl">
                                            <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                                                {t('available_here') || 'Disponible Ici'}
                                            </div>
                                            <div className="w-12 h-12 bg-white dark:bg-amber-800 rounded-2xl flex items-center justify-center mb-6 text-amber-600 dark:text-amber-300 group-hover:-rotate-12 transition-transform shadow-sm">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{t('ql_shop_title') || t('Shop')}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-3">{t('ql_shop_cta')}</p>
                                            <div className="mt-auto flex items-center text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                                                {t('cta_stock')} &rarr;
                                            </div>
                                        </a>
                                    </div>
                                </div>

                                {/* Available Products Carousel */}
                                <div className="mb-0 overflow-hidden">
                                    <StoreProductCarousel shopId={shop.id} viewAllLink={productsLink} showHeaderLink={false} />
                                </div>

                                {/* Store Gallery */}
                                <StoreGallery isHub={isHub} />
                            </div>

                            {/* Right Column: Hours & Contact Info - Hidden for Hubs */}
                            {!isHub && (
                                <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24 h-fit space-y-6 lg:mt-6">
                                    {/* Opening Hours Card - Hidden on Mobile */}
                                    <div className="hidden lg:block bg-gray-50 dark:bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">
                                            {t('Opening Hours') || 'Opening Hours'}
                                        </h3>
                                        <ul className="space-y-3 text-sm">
                                            {translatedHours && translatedHours.map((hour, index) => (
                                                <li key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                                                    <span className="text-gray-600 dark:text-slate-300 font-medium">{hour}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Contact Info Card */}
                                    <div className="bg-gray-50 dark:bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">{t('contact_shop_title')}</h3>
                                        <div className="space-y-4">
                                            <a href={`mailto:${shop.email}`} className="flex items-center gap-3 text-gray-600 dark:text-slate-300 hover:text-bel-blue transition-colors group">
                                                <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/5 group-hover:bg-bel-blue group-hover:text-white transition-all">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                                                </div>
                                                <span className="text-sm font-semibold truncate transition-colors">{shop.email}</span>
                                            </a>
                                            <a href={`tel:${shop.phone}`} className="flex items-center gap-3 text-gray-600 dark:text-slate-300 hover:text-bel-blue transition-colors group">
                                                <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/5 group-hover:bg-bel-blue group-hover:text-white transition-all">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                </div>
                                                <span className="text-sm font-semibold transition-colors">{shop.phone}</span>
                                            </a>
                                        </div>
                                    </div>

                                    {/* About Section in Sidebar */}
                                    <div className="bg-gray-50 dark:bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">{t('shop_about_title')}</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed italic font-medium">
                                            {t(`shop_about_${shop.id}`) !== `shop_about_${shop.id}`
                                                ? t(`shop_about_${shop.id}`)
                                                : t('shop_about_generic')}
                                        </p>
                                    </div>

                                    {/* Reviews Card - Interactive Client Component */}
                                    <StoreReviews
                                        rating={shop.rating || 4.8}
                                        reviewCount={shop.reviewCount || 150}
                                        googleMapUrl={shop.googleMapUrl}
                                    />
                                </aside>
                            )}
                        </div>

                    </div>
                </div >

                {/* Dynamic SEO Content - Moved outside the main glass card for better mobile spacing */}
                <div className={`${isHub ? 'mt-8' : 'mt-12'} mb-12`}>
                    <DynamicSEOContent
                        type="store"
                        lang={lang as 'fr' | 'nl' | 'en'}
                        shop={shop}
                    />
                </div>
            </div >
        </div >
    );
}
