
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Locale } from '@/i18n-config';

import { LOCATIONS } from '@/data/locations';
import { SERVICES } from '@/data/services';
import { createSlug, slugToDisplayName } from '@/utils/slugs';
import { Shop } from '@/types';
import { parseRouteParams } from '@/utils/route-parser';
import { generateSeoMetadata, getKeywordsForPage, generateMetaKeywords } from '@/utils/seo-templates';
import { getPriceQuote, getPricingData, PricingQuote } from '@/services/server/pricing.dal';

import BuybackRepair from '@/components/wizard/BuybackRepair';
import Hreflang from '@/components/seo/Hreflang';
import SchemaOrg from '@/components/seo/SchemaOrg';

// --- CONFIG ---
// Enable ISR (1 Hour Cache) to prevent Function Invocation Spikes
export const revalidate = 3600;

// --- DYNAMIC IMPORTS & SKELETONS ---

// StoreLocator: Interactive Map (Heavy) -> Client Only (Wrapped)
import StoreLocatorClient from '@/components/store/StoreLocatorClient';

// DynamicSEOContent: Large text content, below fold -> Lazy
const DynamicSEOContent = dynamic(() => import('@/components/seo/DynamicSEOContent'), {
    loading: () => <div className="h-[600px] w-full bg-white/60 dark:bg-slate-900/60 animate-pulse rounded-3xl" />
});

// LocalPainPoints: Static visually rich section, below fold -> Lazy
const LocalPainPoints = dynamic(() => import('@/components/sections/LocalPainPoints'), {
    loading: () => <div className="h-[400px] w-full bg-transparent animate-pulse rounded-3xl" />
});

interface PageProps {
    params: Promise<{ lang: Locale; slug: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    console.log('[MetadataDebug] Params:', { lang, slug });
    const routeData = parseRouteParams(slug);
    console.log('[MetadataDebug] RouteData:', routeData ? 'Found' : 'Null', routeData?.service?.id);

    if (!routeData) {
        // EMERGENCY FALLBACK for SEO: If route parser fails but we identify the service keyword
        const s0 = slug?.[0]?.toLowerCase();
        let fallbackService: 'buyback' | 'repair' | undefined;

        if (['rachat', 'inkoop', 'buyback', 'geri-alim'].includes(s0)) fallbackService = 'buyback';
        else if (['reparation', 'reparatie', 'repair', 'onarim'].includes(s0)) fallbackService = 'repair';

        if (fallbackService) {
            console.log('[Metadata] Triggering Fallback for:', s0);
            const { title, description, ogTitle, ogSubtitle } = generateSeoMetadata({
                lang: lang as 'fr' | 'nl' | 'en' | 'tr',
                serviceId: fallbackService,
                locationName: '' // Will default based on lang
            });
            // We need to construct the fallback return object manually or factor out the return logic
            // To keep it simple, we duplicate the minimal return here
            return {
                title,
                description,
                openGraph: { title: ogTitle, description: ogSubtitle, url: `https://belmobile.be/${lang}/${slug.join('/')}` },
                robots: { index: true, follow: true }
            };
        }
        return {};
    }

    const { service, location, device, deviceModel, deviceCategory } = routeData;

    // FETCH REAL PRICING FOR SEO (CTR BOOSTER)
    let price: number | undefined;
    let pricing: PricingQuote | null = null;
    if (device && deviceModel) {
        try {
            const deviceSlug = createSlug(`${device.value} ${deviceModel}`);
            pricing = await getPriceQuote(deviceSlug);

            if (service.id === 'repair' && pricing?.repair) {
                // Find lowest repair price (e.g. Battery often cheapest, or Screen Generic)
                const prices = Object.values(pricing.repair).filter(v => typeof v === 'number' && v > 0) as number[];
                if (prices.length > 0) price = Math.min(...prices);
            } else if (service.id === 'buyback' && pricing?.buyback) {
                // Find highest buyback price (Up to X)
                price = pricing.buyback.maxPrice;
            }
        } catch (e) {
            console.error("[SEO Page] Pricing fetch failed:", e);
        }
    }

    // Use 'city' if available (e.g. "Schaerbeek") instead of "Liedts" (from "Belmobile Liedts")
    const locationName = location ? (location.city || location.name.replace('Belmobile ', '')) : '';
    const { title, description, ogTitle, ogSubtitle } = generateSeoMetadata({
        lang: lang as 'fr' | 'nl' | 'en' | 'tr',
        serviceId: service.id as 'repair' | 'buyback',
        deviceValue: device?.value,
        deviceModel: deviceModel,
        deviceCategory: deviceCategory,
        locationName: locationName,
        isHomeConsole: deviceCategory === 'console_home',
        isPortableConsole: deviceCategory === 'console_portable',
        price: price // Inject Dynamic Price
    });

    // Keywords generation
    const keywordsList = getKeywordsForPage(lang, service.id, device?.value, deviceModel || undefined, deviceCategory || undefined);
    const keywords = generateMetaKeywords(keywordsList);

    const baseUrl = 'https://belmobile.be';

    // BUILD NORMALIZED LOCALIZED ALTERNATES & CANONICAL
    // Canonical URL (without location)
    const serviceSlug = service.slugs[lang as 'fr' | 'nl' | 'en' | 'tr'] || service.id;
    const devicePart = device ? `/${createSlug(device.value)}` : '';
    const modelPart = deviceModel ? `/${createSlug(deviceModel)}` : '';
    const canonicalUrl = `${baseUrl}/${lang}/${serviceSlug}${devicePart}${modelPart}`;

    // Language Alternates
    const languages: Record<string, string> = {
        'x-default': `${baseUrl}/fr`, // Main market
    };

    const LOCALES = ['fr', 'nl', 'en', 'tr'] as const;

    LOCALES.forEach(locale => {
        const sSlug = service.slugs[locale as 'fr' | 'nl' | 'en' | 'tr'] || service.id;
        let path = `/${locale}/${sSlug}`;
        if (device) path += `/${createSlug(device.value)}`;
        if (deviceModel) path += `/${createSlug(deviceModel)}`;
        languages[locale] = `${baseUrl}${path}`;
    });

    // Dynamic OG Image Strategy
    const ogTitleEncoded = encodeURIComponent(ogTitle);
    const ogSubtitleEncoded = encodeURIComponent(ogSubtitle);
    const ogImage = `/api/og?title=${ogTitleEncoded}&subtitle=${ogSubtitleEncoded}`;
    const currentUrl = languages[lang] || canonicalUrl;

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                ...languages,
            }
        },
        openGraph: {
            title,
            description,
            url: currentUrl,
            siteName: 'Belmobile',
            locale: lang,
            type: 'website',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
            creator: '@belmobile',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export default async function DynamicLandingPage({ params, searchParams }: PageProps) {
    const { lang, slug } = await params;
    const resolvedSearchParams = await searchParams;

    // Filter out asset paths that might have fallen through
    if (slug.some(s => ['cdn', 'checkouts', 'images', 'assets', 'static'].includes(s))) {
        return notFound();
    }

    const routeData = parseRouteParams(slug);
    if (!routeData) {
        return notFound();
    }
    const { service, location, device, deviceModel, deviceCategory } = routeData;

    // FETCH REAL PRICING FOR PAGE (CTR BOOSTER)
    let pricing: PricingQuote | null = null;
    if (device && deviceModel) {
        try {
            const deviceSlug = createSlug(`${device.value} ${deviceModel}`);
            pricing = await getPriceQuote(deviceSlug);
        } catch (e) {
            console.error("[SEO Page] Pricing fetch failed:", e);
        }
    }

    // Fix for Hub Pages: Do not pass the Hub ID (e.g., 'bruxelles') as initialShop.
    // This allows the wizard to remain "neutral" so the user can choose a specific storeS (Schaerbeek, etc.) later.
    const initialShop = location && !location.isHub ? location.id : undefined;

    // Magic Link Overrides
    const urlBrand = typeof resolvedSearchParams?.brand === 'string' ? resolvedSearchParams.brand : undefined;
    const urlModel = typeof resolvedSearchParams?.model === 'string' ? slugToDisplayName(resolvedSearchParams.model) : undefined;
    const urlStep = typeof resolvedSearchParams?.step === 'string' ? parseInt(resolvedSearchParams.step) : undefined;
    const urlEmail = typeof resolvedSearchParams?.email === 'string' ? resolvedSearchParams.email : undefined;

    const initialDevice = (device || urlBrand) ? {
        brand: urlBrand || device?.value || '',
        model: urlModel || deviceModel || ''
    } : undefined;

    // FETCH DETAILED PRICING FOR WIZARD HYDRATION (SSOT RESTORATION)
    let wizardPricingData: any = null;
    let deviceSlugForWizard = '';
    let realCategory: string | undefined;

    if (device && deviceModel) {
        try {
            deviceSlugForWizard = createSlug(`${device.value} ${deviceModel}`);
            const rawPricing = await getPricingData(deviceSlugForWizard);

            if (rawPricing?.metadata?.category) {
                realCategory = rawPricing.metadata.category;
            }

            // Map to WizardState['pricingData']
            wizardPricingData = {
                repairPrices: rawPricing.repair,
                buybackPrices: rawPricing.buyback,
                deviceImage: rawPricing.metadata?.imageUrl || null,
                isLoading: false,
                loadedForModel: deviceSlugForWizard
            };
        } catch (e) {
            console.error("[SEO Page] Wizard Pricing fetch failed:", e);
        }
    }

    // Prioritize category from search params if available, otherwise use route data, fallback to Real Category from DB
    const categoryParam = resolvedSearchParams?.category;
    let finalDeviceCategory = routeData.deviceCategory || (typeof categoryParam === 'string' ? categoryParam : device?.deviceType);

    // AEGIS FIX: If the route parser guessed 'smartphone' (default) but the pricing DB says it's something else (e.g. smartwatch), TRUST THE DB.
    if (realCategory && realCategory !== 'smartphone' && finalDeviceCategory === 'smartphone') {
        finalDeviceCategory = realCategory;
    }

    // 3. Construct Props for BuybackRepair
    const type = service.id === 'repair' ? 'repair' : 'buyback';

    const initialWizardProps = {
        deviceType: finalDeviceCategory || undefined,
        selectedBrand: initialDevice?.brand,
        selectedModel: initialDevice?.model,
        customerEmail: urlEmail,
        step: urlStep,
        pricingData: wizardPricingData || undefined // Inject Hydration
    };

    // Cast location to Shop to satisfy SchemaOrg props
    const shopForSchema = location as unknown as Shop;

    // 5. Handle Brussels Hub View Logic
    const isHub = location?.isHub;
    let hubShops: Shop[] = [];

    if (isHub) {
        // Filter shops for Brussels (Schaerbeek, Molenbeek, Anderlecht)
        hubShops = LOCATIONS.filter(l => ['schaerbeek', 'molenbeek', 'anderlecht'].includes(l.id)).map(l => ({
            id: l.id,
            name: l.name,
            address: l.address,
            phone: l.phone,
            email: l.email,
            openingHours: l.openingHours,
            coords: l.coords,
            status: 'open' as const,
            googleMapUrl: l.googleMapUrl,
            slugs: l.slugs
        }));
    }

    // 6. Generate Page Title (H1)
    // Reuse the same logic as Metadata for consistency
    const locationName = location ? (location.city || location.name.replace('Belmobile ', '')) : '';
    const { title: pageTitle } = generateSeoMetadata({
        lang: lang as 'fr' | 'nl' | 'en' | 'tr',
        serviceId: service.id as 'repair' | 'buyback',
        deviceValue: device?.value,
        deviceModel: deviceModel,
        deviceCategory: finalDeviceCategory,
        locationName: locationName,
        isHomeConsole: finalDeviceCategory === 'console_home',
        isPortableConsole: finalDeviceCategory === 'console_portable'
    });

    // Calculate minPrice for SchemaOrg from REAL DATA
    let minPrice: number | undefined;
    if (pricing) {
        if (service.id === 'repair' && pricing.repair) {
            const prices = Object.values(pricing.repair).filter(v => typeof v === 'number' && v > 0) as number[];
            if (prices.length > 0) minPrice = Math.min(...prices);
        } else if (service.id === 'buyback' && pricing.buyback) {
            minPrice = pricing.buyback.maxPrice;
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 transition-colors duration-500">
            <SchemaOrg
                shop={shopForSchema}
                language={lang}
                service={service}
                device={device?.value}
                deviceModel={deviceModel || undefined}
                price={minPrice}
            />

            <div className="container mx-auto px-1 sm:px-4 py-8">

                {/* Hub Map & Store Grid (Only for Hub pages like Brussels) */}
                {isHub && (
                    <div className="mb-12">
                        <div className="max-w-4xl mx-auto text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                                {lang === 'fr' ? 'Nos magasins à Bruxelles' : lang === 'nl' ? 'Onze winkels in Brussel' : 'Our Stores in Brussels'}
                            </h2>
                            <p className="text-gray-600 dark:text-slate-400">
                                {lang === 'fr'
                                    ? 'Trouvez l\'expert Belmobile le plus proche de chez vous pour une réparation rapide.'
                                    : lang === 'nl'
                                        ? 'Vind de dichtstbijzijnde Belmobile expert voor een snelle reparatie.'
                                        : 'Find the nearest Belmobile expert for a fast repair.'}
                            </p>
                        </div>

                        <StoreLocatorClient
                            shops={hubShops}
                            className="h-[400px] md:h-[500px] rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700/50 mb-8"
                            zoom={11}
                            center={[50.8503, 4.3517]}
                        />

                        {/* Store Grid for Hubs - Making it feel like a real store page */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {hubShops.map((shop) => (
                                <div key={shop.id} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 p-6 rounded-3xl hover:border-bel-blue/50 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-bel-blue transition-colors">
                                            {shop.name.replace('Belmobile ', '')}
                                        </h3>
                                        <span className="text-[10px] font-bold px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg uppercase">
                                            {lang === 'fr' ? 'Ouvert' : 'Open'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-6 line-clamp-2">
                                        {shop.address}
                                    </p>
                                    <a
                                        href={`/${lang}/stores/${shop.slugs?.[lang as 'fr' | 'nl' | 'en'] || shop.id}`}
                                        className="inline-flex items-center text-sm font-bold text-bel-blue hover:gap-2 transition-all"
                                    >
                                        {lang === 'fr' ? 'Voir le magasin' : 'Winkel bekijken'} <span className="ml-1">→</span>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Invisible H1 for SEO ("The Hack") */}
                <h1 className="sr-only">{pageTitle}</h1>

                <div className="mt-4">
                    <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 dark:bg-slate-800 rounded-2xl" />}>
                        <BuybackRepair
                            type={type}
                            initialShop={initialShop}
                            initialDevice={initialDevice}
                            initialCategory={finalDeviceCategory || undefined}
                            initialWizardProps={initialWizardProps}
                        />
                    </Suspense>
                </div>

                {/* Dynamic SEO Content (Bottom) */}
                <DynamicSEOContent
                    type={type}
                    lang={lang as 'fr' | 'nl' | 'en' | 'tr'}
                    location={location || undefined}
                    service={service}
                    brand={device?.value}
                    model={deviceModel || undefined}
                    deviceType={finalDeviceCategory}
                    priceQuote={pricing}
                />

                {/* Local Pain Points (Anxiety Reducers) - Moved to bottom as requested */}
                <div className="mt-0 mb-8">
                    <LocalPainPoints
                        lang={lang as 'fr' | 'nl' | 'en' | 'tr'}
                        locationName={locationName || (lang === 'fr' ? 'Bruxelles' : lang === 'nl' ? 'Brussel' : 'Brussels')}
                        deviceType={deviceModel || device?.value || finalDeviceCategory}
                        type={type}
                    />
                </div>
            </div>
        </div>
    );
}
