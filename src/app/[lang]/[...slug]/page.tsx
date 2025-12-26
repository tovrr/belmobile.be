import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';

import { SERVICES } from '@/data/services';
import { LOCATIONS, Location } from '@/data/locations';
import { MOCK_REPAIR_PRICES, DEVICE_TYPES } from '@/constants';
import { createSlug, slugToDisplayName } from '@/utils/slugs';
import { getKeywordsForPage, generateMetaKeywords } from '@/utils/seo-keywords';
import { DEVICE_BRANDS } from '@/data/brands';
import { Shop } from '@/types';

import BuybackRepair from '@/components/BuybackRepair';
import DynamicSEOContent from '@/components/seo/DynamicSEOContent';
import LocalPainPoints from '@/components/LocalPainPoints';
import Hreflang from '@/components/seo/Hreflang';
import SchemaOrg from '@/components/seo/SchemaOrg';
import StoreLocator from '@/components/StoreLocator';

interface PageProps {
    params: Promise<{ lang: string; slug: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const findDevice = (slug: string) => {
    for (const [type, brands] of Object.entries(DEVICE_BRANDS)) {
        const found = (brands as string[]).find(b => createSlug(b) === slug);
        if (found) return { value: found, deviceType: type };
    }
    return null;
};

const parseRouteParams = (slug: string[]) => {
    const firstSegment = slug[0];
    const service = SERVICES.find(s => Object.values(s.slugs).includes(firstSegment));

    if (!service) return null;

    let location: Location | undefined;
    let device: { value: string, deviceType: string } | undefined;
    let deviceModel: string | undefined;
    let deviceCategory: string | undefined;

    const segments = [...slug.slice(1)];

    // 1. Check for location (as a standalone segment or suffix)
    if (segments.length > 0) {
        // Try standalone first (e.g., /apple/iphone/molenbeek)
        const last = segments[segments.length - 1];
        const foundLoc = LOCATIONS.find(l => Object.values(l.slugs).includes(last));
        if (foundLoc) {
            location = foundLoc;
            segments.pop();
        } else {
            // Try suffix (e.g., /apple/iphone-molenbeek)
            for (const seg of segments) {
                const foundSuffixLoc = LOCATIONS.find(l =>
                    Object.values(l.slugs).some(s => seg.endsWith(`-${s}`))
                );
                if (foundSuffixLoc) {
                    location = foundSuffixLoc;
                    // Clean the segment where we found the location
                    const locSlug = Object.values(foundSuffixLoc.slugs).find(s => seg.endsWith(`-${s}`));
                    if (locSlug) {
                        const index = segments.indexOf(seg);
                        segments[index] = seg.replace(`-${locSlug}`, '');
                    }
                    break;
                }
            }
        }
    }

    // 2. Parse device/model/category from remaining segments
    if (segments.length > 0) {
        const seg1 = segments[0];
        const foundCat = DEVICE_TYPES.find(d => d.id === seg1);
        if (foundCat) {
            deviceCategory = foundCat.id;
        } else {
            const foundDev = findDevice(seg1);
            if (foundDev) {
                device = foundDev;
                deviceCategory = foundDev.deviceType;
                if (segments.length > 1) {
                    deviceModel = segments[1];
                }
            }
        }
    }

    return { service, location, device, deviceModel, deviceCategory };
};



// Helper functions for Title Generation
const getRepairSuffix = (lang: string, isHomeConsole: boolean, isPortableConsole: boolean) => {
    if (isHomeConsole) {
        if (lang === 'fr') return ': Prix HDMI & Nettoyage';
        if (lang === 'nl') return ': Prijs HDMI & Reiniging';
        return ': HDMI & Cleaning Price';
    }
    if (isPortableConsole) {
        if (lang === 'fr') return ': Prix Écran & Joystick';
        if (lang === 'nl') return ': Prijs Scherm & Joystick';
        return ': Screen & Joystick Price';
    }
    if (lang === 'fr') return ': Prix Écran & Batterie';
    if (lang === 'nl') return ': Prijs Scherm & Batterij';
    return ': Screen & Battery Price';
};

const getBuybackSuffix = (lang: string) => {
    if (lang === 'fr') return ': Meilleur Prix de Reprise';
    if (lang === 'nl') return ': Beste Inruilprijs';
    return ': Best Trade-in Price';
};

const getRepairServicesText = (lang: string, isHomeConsole: boolean, isPortableConsole: boolean) => {
    if (isHomeConsole) {
        if (lang === 'fr') return "la réparation HDMI et le nettoyage";
        if (lang === 'nl') return "HDMI-reparatie en reiniging";
        return "HDMI repair and cleaning";
    }
    if (isPortableConsole) {
        if (lang === 'fr') return "la réparation d'écran et de joystick (drift)";
        if (lang === 'nl') return "schermreparatie en joystick (drift)";
        return "screen & joystick (drift) repair";
    }
    if (lang === 'fr') return "le remplacement d'écran et de batterie";
    if (lang === 'nl') return "scherm- en batterijvervanging";
    return "screen & battery replacement";
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    const routeData = parseRouteParams(slug);

    if (!routeData) return {};

    const { service, location, device, deviceModel, deviceCategory } = routeData;
    const isRepair = service.id === 'repair';

    // Construct Title
    let title = '';
    let description = '';

    // Format the model name properly (convert slug to display name)
    const formattedModel = deviceModel ? slugToDisplayName(deviceModel) : '';
    // Capitalize brand name (e.g., "apple" -> "Apple")
    const formattedBrand = device ? device.value.charAt(0).toUpperCase() + device.value.slice(1) : '';

    // Construct concise Device Name for Titles (prefer Model only if recognizable, else Brand + Model)
    // For major brands like Apple/Samsung, Model name usually suffices (iPhone 13, Galaxy S23)
    // But to be safe and concise: if we have a model, use it. If not, use Brand + 'Device'.
    let displayDeviceName = formattedModel;
    if (!displayDeviceName) {
        displayDeviceName = formattedBrand || (isRepair ? 'Smartphone' : (lang === 'fr' ? 'Appareil' : lang === 'nl' ? 'Toestel' : 'Device'));
    } else {
        // Optimization: If model doesn't start with Brand, we might want to prepend it ONLY if it's generic.
        // But "iPhone", "Galaxy", "Pixel" are strong enough.
        // Let's keep it simple: Use the Model Name as the primary identifier.
        // Example: "iPhone 11" instead of "Apple iPhone 11"
    }

    // Full name for description (can be longer)
    const fullDeviceName = device ? `${formattedBrand} ${formattedModel}`.trim() : displayDeviceName;

    const locationName = location ? location.name.replace('Belmobile ', '') : '';

    // Construct Title & Description using "Golden Formula" & CSV Insights
    // Formula: [Service] [Device] [Location] - [Value Prop]

    // Value Props (Rotated or selected based on priority)
    // Keywords generation
    const keywordsList = getKeywordsForPage(lang, service.id, device?.value, deviceModel || undefined, deviceCategory || undefined);
    const keywords = generateMetaKeywords(keywordsList);

    // Check for Console (Home & Portable) to adjust meta props
    const isHomeConsole = deviceCategory === 'console_home';
    const isPortableConsole = deviceCategory === 'console_portable';



    if (lang === 'fr') {
        if (isRepair) {
            title = `Réparation ${displayDeviceName} ${locationName || 'Bruxelles'} ${getRepairSuffix('fr', isHomeConsole, isPortableConsole)}`;
            description = `Réparation ${displayDeviceName} à ${locationName || 'Bruxelles'}. Découvrez nos tarifs pour ${getRepairServicesText('fr', isHomeConsole, isPortableConsole)}. Service rapide en 30 min, sans rendez-vous. Garantie 1 an.`;
        } else {
            title = `Rachat ${displayDeviceName} ${locationName || 'Bruxelles'} ${getBuybackSuffix('fr')}`;
            description = `Vendez votre ${fullDeviceName} au meilleur prix chez Belmobile à ${locationName || 'Bruxelles'}. Estimation immédiate et paiement cash. Offre de reprise sérieuse et écologique.`;
        }
    } else if (lang === 'nl') {
        if (isRepair) {
            title = `Reparatie ${displayDeviceName} ${locationName || 'Brussel'} ${getRepairSuffix('nl', isHomeConsole, isPortableConsole)}`;
            description = `Reparatie ${displayDeviceName} in ${locationName || 'Brussel'}. Bekijk onze prijzen voor ${getRepairServicesText('nl', isHomeConsole, isPortableConsole)}. Klaar in 30 min, zonder afspraak. 1 jaar garantie.`;
        } else {
            // Updated to "Verkoop uw" (Sell your) for better user intent matching
            title = `Verkoop uw ${displayDeviceName} ${locationName || 'Brussel'} ${getBuybackSuffix('nl')}`;
            description = `Verkoop uw ${fullDeviceName} voor de beste prijs bij Belmobile in ${locationName || 'Brussel'}. Directe schatting en contante betaling.`;
        }
    } else {
        if (isRepair) {
            title = `${displayDeviceName} Repair ${locationName || 'Brussels'} ${getRepairSuffix('en', isHomeConsole, isPortableConsole)}`;
            description = `Professional ${displayDeviceName} repair in ${locationName || 'Brussels'}. Check our prices for ${getRepairServicesText('en', isHomeConsole, isPortableConsole)}. Done in 30 min. 1 Year Warranty.`;
        } else {
            title = `Sell ${displayDeviceName} ${locationName || 'Brussels'} ${getBuybackSuffix('en')}`;
            description = `Sell your ${fullDeviceName} for the best price at Belmobile in ${locationName || 'Brussels'}. Instant quote and cash payment. Eco-friendly recycling.`;
        }
    }

    const baseUrl = 'https://belmobile.be';
    const currentUrl = `${baseUrl}/${lang}/${slug.join('/')}`;

    // Dynamic OG Image Strategy via API Route
    // We construct the URL with title and subtitle params

    // Create a cleaner, punchier title for social media keys
    let ogDisplayTitle = '';
    if (lang === 'fr') ogDisplayTitle = isRepair ? `Réparation ${displayDeviceName}` : `Rachat ${displayDeviceName}`;
    else if (lang === 'nl') ogDisplayTitle = isRepair ? `Reparatie ${displayDeviceName}` : `Verkoop ${displayDeviceName}`;
    else ogDisplayTitle = isRepair ? `${displayDeviceName} Repair` : `Sell ${displayDeviceName}`;

    const ogTitle = encodeURIComponent(ogDisplayTitle);

    // Create a subtitle based on valid props
    const ogSubtitleText = isRepair
        ? (lang === 'fr' ? 'En 30 minutes • Garantie 1 An' : lang === 'nl' ? 'In 30 minuten • 1 Jaar Garantie' : 'Done within 30 minutes • 1 Year Warranty')
        : (lang === 'fr' ? 'Meilleur Prix Garanti • Paiement Cash' : lang === 'nl' ? 'Beste Prijs Garantie • Direct Cash' : 'Best Price Guaranteed • Instant Cash');
    const ogSubtitle = encodeURIComponent(ogSubtitleText);

    // const ogImage = device && device.value ? `${baseUrl}/images/brands/${device.value.toLowerCase()}.jpg` : `${baseUrl}/og-image.jpg`; 
    // Use API Route
    const ogImage = `${baseUrl}/api/og?title=${ogTitle}&subtitle=${ogSubtitle}`;

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: currentUrl,
            languages: {
                // simple construction, could be better
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
            creator: '@belmobile', // Optional
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
    // This allows the wizard to remain "neutral" so the user can choose a specific store (Schaerbeek, etc.) later.
    const initialShop = location && !location.isHub ? location.id : undefined;
    const initialDevice = device ? {
        brand: device.value,
        model: deviceModel || ''
    } : undefined;

    // 4. Construct Hreflang Slugs
    const getSlugForLang = (l: string) => {
        const parts = [];
        if (service) parts.push(service.slugs[l as keyof typeof service.slugs]);
        if (device) parts.push(createSlug(device.value));
        if (deviceModel) parts.push(deviceModel);
        if (location) parts.push(location.slugs[l as keyof typeof location.slugs]);
        return parts.join('/');
    };

    const hreflangSlugs = {
        fr: getSlugForLang('fr'),
        nl: getSlugForLang('nl'),
        en: getSlugForLang('en')
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
    const isRepair = service.id === 'repair';




    // Display Name Logic
    const formattedModel = deviceModel ? slugToDisplayName(deviceModel) : '';
    const formattedBrand = device ? device.value.charAt(0).toUpperCase() + device.value.slice(1) : '';

    let displayDeviceName = formattedModel;
    if (!displayDeviceName) {
        displayDeviceName = formattedBrand || (isRepair ? 'Smartphone' : (lang === 'fr' ? 'Appareil' : lang === 'nl' ? 'Toestel' : 'Device'));
    }

    const locationName = location ? location.name.replace('Belmobile ', '') : '';

    // Helper to format location string with preposition or simple space if needed
    // For titles, often "Title City" is enough. For sentences, "Title in City" needed.
    const titleLocationSuffix = locationName ? ` ${locationName}` : '';

    let pageTitle = '';
    if (lang === 'fr') {
        pageTitle = isRepair ? `Réparation ${displayDeviceName}${titleLocationSuffix}` : `Rachat ${displayDeviceName}${titleLocationSuffix}`;
    } else if (lang === 'nl') {
        pageTitle = isRepair ? `Reparatie ${displayDeviceName}${titleLocationSuffix}` : `Verkoop uw ${displayDeviceName}${titleLocationSuffix}`;
    } else {
        pageTitle = isRepair ? `${displayDeviceName} Repair${titleLocationSuffix}` : `Sell ${displayDeviceName}${titleLocationSuffix}`;
    }



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
            <Hreflang
                slugs={hreflangSlugs}
                baseUrl="https://belmobile.be"
            />
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
                        <StoreLocator
                            shops={hubShops}
                            className="h-[500px] rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700"
                            zoom={12}
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
                        deviceType={formattedModel || formattedBrand || deviceCategory}
                        type={type}
                    />
                </div>
            </div>
        </div>
    );
}
