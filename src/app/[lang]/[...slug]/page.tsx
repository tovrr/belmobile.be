import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

import { LOCATIONS } from '@/data/locations';
import { MOCK_REPAIR_PRICES } from '@/constants';
import { createSlug, slugToDisplayName } from '@/utils/slugs';
import { Shop } from '@/types';
import { parseRouteParams } from '@/utils/route-parser';
import { generateSeoMetadata, getKeywordsForPage, generateMetaKeywords } from '@/utils/seo-templates';

import BuybackRepair from '@/components/wizard/BuybackRepair';
import Hreflang from '@/components/seo/Hreflang';
import SchemaOrg from '@/components/seo/SchemaOrg';

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
    params: Promise<{ lang: string; slug: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    const routeData = parseRouteParams(slug);

    if (!routeData) return {};

    const { service, location, device, deviceModel, deviceCategory } = routeData;

    // Use 'city' if available (e.g. "Schaerbeek") instead of "Liedts" (from "Belmobile Liedts")
    const locationName = location ? (location.city || location.name.replace('Belmobile ', '')) : '';
    const { title, description, ogTitle, ogSubtitle } = generateSeoMetadata({
        lang: lang as 'fr' | 'nl' | 'en',
        serviceId: service.id as 'repair' | 'buyback',
        deviceValue: device?.value,
        deviceModel: deviceModel,
        deviceCategory: deviceCategory,
        locationName: locationName,
        isHomeConsole: deviceCategory === 'console_home',
        isPortableConsole: deviceCategory === 'console_portable'
    });

    // Keywords generation
    const keywordsList = getKeywordsForPage(lang, service.id, device?.value, deviceModel || undefined, deviceCategory || undefined);
    const keywords = generateMetaKeywords(keywordsList);

    const baseUrl = 'https://belmobile.be';
    const currentUrl = `${baseUrl}/${lang}/${slug.join('/')}`;

    // Dynamic OG Image Strategy
    const ogTitleEncoded = encodeURIComponent(ogTitle);
    const ogSubtitleEncoded = encodeURIComponent(ogSubtitle);
    const ogImage = `/api/og?title=${ogTitleEncoded}&subtitle=${ogSubtitleEncoded}`;

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: currentUrl,
            languages: {
                'en': `${baseUrl}/en/${slug.join('/')}`,
                'fr': `${baseUrl}/fr/${slug.join('/')}`,
                'nl': `${baseUrl}/nl/${slug.join('/')}`,
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

export default async function DynamicLandingPage({ params, searchParams }: PageProps & { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
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

    const { service, location, device, deviceModel } = routeData;

    // Prioritize category from search params if available, otherwise use route data
    const categoryParam = resolvedSearchParams?.category;
    const deviceCategory = typeof categoryParam === 'string' ? categoryParam : (routeData.deviceCategory || device?.deviceType);

    // 3. Construct Props for BuybackRepair
    const type = service.id === 'repair' ? 'repair' : 'buyback';
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

    const initialWizardProps = {
        deviceType: deviceCategory || undefined,
        selectedBrand: initialDevice?.brand,
        selectedModel: initialDevice?.model,
        customerEmail: urlEmail,
        step: urlStep
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
        lang: lang as 'fr' | 'nl' | 'en',
        serviceId: service.id as 'repair' | 'buyback',
        deviceValue: device?.value,
        deviceModel: deviceModel,
        deviceCategory: deviceCategory,
        locationName: locationName,
        isHomeConsole: deviceCategory === 'console_home',
        isPortableConsole: deviceCategory === 'console_portable'
    });

    // Calculate minPrice for SchemaOrg
    let minPrice: number | undefined;
    if (device && deviceModel && service.id === 'repair') {
        const pricingSlug = createSlug(`${device.value} ${deviceModel}`);
        const pricing = MOCK_REPAIR_PRICES.find(p => p.id === pricingSlug);
        if (pricing) {
            const prices = Object.values(pricing).filter(v => typeof v === 'number' && v > 0) as number[];
            if (prices.length > 0) {
                minPrice = Math.min(...prices);
            }
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

                {/* Hub Map (Only for Hub pages) */}
                {isHub && (
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                            {lang === 'fr' ? 'Nos magasins à Bruxelles' : lang === 'nl' ? 'Onze winkels in Brussel' : 'Our Stores in Brussels'}
                        </h2>
                        <StoreLocatorClient
                            shops={hubShops}
                            className="h-[500px] rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700"
                            zoom={12}
                            center={[50.8503, 4.3517]}
                        />
                    </div>
                )}

                {/* Invisible H1 for SEO ("The Hack") */}
                <h1 className="sr-only">{pageTitle}</h1>

                <div className="mt-8">
                    <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 dark:bg-slate-800 rounded-2xl" />}>
                        <BuybackRepair
                            type={type}
                            initialShop={initialShop}
                            initialDevice={initialDevice}
                            initialCategory={deviceCategory || undefined}
                            initialWizardProps={initialWizardProps}
                        />
                    </Suspense>
                </div>

                {/* Dynamic SEO Content (Bottom) */}
                <DynamicSEOContent
                    type={type}
                    lang={lang as 'fr' | 'nl' | 'en'}
                    location={location || undefined}
                    service={service}
                    brand={device?.value}
                    model={deviceModel || undefined}
                    deviceType={deviceCategory}
                />

                {/* Local Pain Points (Anxiety Reducers) - Moved to bottom as requested */}
                <div className="mt-12 mb-8">
                    <LocalPainPoints
                        lang={lang as 'fr' | 'nl' | 'en'}
                        locationName={locationName || (lang === 'fr' ? 'Bruxelles' : lang === 'nl' ? 'Brussel' : 'Brussels')}
                        deviceType={deviceModel || device?.value || deviceCategory}
                        type={type}
                    />
                </div>
            </div>
        </div>
    );
}
