import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BuybackRepair from '../../../components/BuybackRepair';
import SchemaOrg from '../../../components/seo/SchemaOrg';
import Hreflang from '../../../components/seo/Hreflang';
import { LOCATIONS } from '../../../data/locations';
import { SERVICES } from '../../../data/services';
import { DEVICE_BRANDS } from '../../../data/brands';
import { createSlug, slugToDisplayName } from '../../../utils/slugs';
import { Shop } from '../../../types';
import { DEVICE_TYPES, MOCK_REPAIR_PRICES } from '../../../constants';
import StoreLocator from '../../../components/StoreLocator';
import DynamicSEOContent from '../../../components/seo/DynamicSEOContent';
import { getKeywordsForPage, generateMetaKeywords } from '../../../utils/seo-keywords';

// Helper to find service from slug
const findService = (slug: string, lang: string) => {
    return SERVICES.find(s =>
        s.id === slug ||
        Object.values(s.slugs).includes(slug)
    );
};

// Helper to find location from slug
const findLocation = (slug: string, lang: string) => {
    return LOCATIONS.find(l =>
        l.id === slug ||
        Object.values(l.slugs).includes(slug)
    );
};

// Helper to find device (brand or model) from slug
const findDevice = (slug: string) => {
    // Check brands
    for (const [type, brands] of Object.entries(DEVICE_BRANDS)) {
        const brand = brands.find(b => createSlug(b) === slug);
        if (brand) return { type: 'brand', value: brand, deviceType: type };
    }
    return null;
};

interface PageProps {
    params: Promise<{
        lang: string;
        slug: string[];
    }>;
}

// Helper to parse route params
const parseRouteParams = (slug: string[], lang: string) => {
    const serviceSlug = slug[0];
    const service = findService(serviceSlug, lang);

    if (!service) return null;

    let location = null;
    let device = null;
    let deviceModel = null;
    let deviceCategory: string | null = null;

    const lastSegment = slug[slug.length - 1];
    const possibleLocation = findLocation(lastSegment, lang);

    if (possibleLocation) {
        location = possibleLocation;
        const deviceSegments = slug.slice(1, slug.length - 1);
        if (deviceSegments.length > 0) {
            const segment = deviceSegments[0];
            const foundDevice = findDevice(segment);
            if (foundDevice) {
                device = foundDevice;
                if (deviceSegments.length > 1) {
                    deviceModel = deviceSegments[1];
                }
            } else {
                const foundCategory = DEVICE_TYPES.find(t => t.id === segment);
                if (foundCategory) {
                    deviceCategory = foundCategory.id;
                }
            }
        }
    } else {
        const deviceSegments = slug.slice(1);
        if (deviceSegments.length > 0) {
            const segment = deviceSegments[0];
            const foundDevice = findDevice(segment);
            if (foundDevice) {
                device = foundDevice;
                if (deviceSegments.length > 1) {
                    deviceModel = deviceSegments[1];
                }
            } else {
                const foundCategory = DEVICE_TYPES.find(t => t.id === segment);
                if (foundCategory) {
                    deviceCategory = foundCategory.id;
                }
            }
        }
    }

    return { service, location, device, deviceModel, deviceCategory };
};

export async function generateStaticParams() {
    // Return empty array to generate pages on-demand (ISR)
    // This dramatically speeds up build times and avoids static generation errors
    return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    const routeData = parseRouteParams(slug, lang);

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
        displayDeviceName = formattedBrand ? `${formattedBrand} Appareil` : (isRepair ? 'Smartphone' : 'Appareil');
        if (lang === 'nl') displayDeviceName = formattedBrand ? `${formattedBrand} Toestel` : (isRepair ? 'Smartphone' : 'Toestel');
        if (lang === 'en') displayDeviceName = formattedBrand ? `${formattedBrand} Device` : (isRepair ? 'Smartphone' : 'Device');
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
    const valuePropFr = isRepair ? "Prix & RDV 30 min" : "Meilleur Prix & Cash";
    const valuePropNl = isRepair ? "Prijs & Klaar in 30 min" : "Beste Prijs & Cash";
    const valuePropEn = isRepair ? "Price & 30 min Service" : "Best Price & Cash";

    // Keywords generation
    const keywordsList = getKeywordsForPage(lang, service.id, device?.value, deviceModel || undefined, deviceCategory || undefined);
    const keywords = generateMetaKeywords(keywordsList);

    if (lang === 'fr') {
        if (isRepair) {
            title = `Réparation ${displayDeviceName} ${locationName || 'Bruxelles'} - ${valuePropFr}`;
            description = `Réparation professionnelle de votre ${fullDeviceName} chez Belmobile ${locationName || 'à Bruxelles'}. Remplacement écran/batterie en 30 min. Pièces de qualité & Garantie 1 an.`;
        } else {
            title = `Rachat ${displayDeviceName} ${locationName || 'Bruxelles'} - ${valuePropFr}`;
            description = `Vendez votre ${fullDeviceName} au meilleur prix chez Belmobile ${locationName || 'Bruxelles'}. Estimation immédiate et paiement cash. Recyclage éco-responsable.`;
        }
    } else if (lang === 'nl') {
        if (isRepair) {
            title = `Reparatie ${displayDeviceName} ${locationName || 'Brussel'} - ${valuePropNl}`;
            description = `Professionele reparatie van uw ${fullDeviceName} bij Belmobile ${locationName || 'Brussel'}. Scherm/batterij vervangen in 30 min. 1 jaar garantie.`;
        } else {
            title = `Inkoop ${displayDeviceName} ${locationName || 'Brussel'} - ${valuePropNl}`;
            description = `Verkoop uw ${fullDeviceName} voor de beste prijs bij Belmobile ${locationName || 'Brussel'}. Directe schatting en contante betaling.`;
        }
    } else {
        if (isRepair) {
            title = `${displayDeviceName} Repair ${locationName || 'Brussels'} - ${valuePropEn}`;
            description = `Professional repair of your ${fullDeviceName} at Belmobile ${locationName || 'Brussels'}. Screen/battery replacement in 30 min. 1 year warranty.`;
        } else {
            title = `Sell ${displayDeviceName} ${locationName || 'Brussels'} - ${valuePropEn}`;
            description = `Sell your ${fullDeviceName} for the best price at Belmobile ${locationName || 'Brussels'}. Instant quote and cash payment. Eco-friendly recycling.`;
        }
    }

    const baseUrl = 'https://belmobile.be';
    const currentUrl = `${baseUrl}/${lang}/${slug.join('/')}`;
    const ogImage = device && device.value ? `${baseUrl}/images/brands/${device.value.toLowerCase()}.jpg` : `${baseUrl}/og-image.jpg`; // Fallback to generic

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

    const routeData = parseRouteParams(slug, lang);

    if (!routeData) {
        return notFound();
    }

    const { service, location, device, deviceModel } = routeData;

    // Prioritize category from search params if available, otherwise use route data
    const categoryParam = resolvedSearchParams?.category;
    const deviceCategory = typeof categoryParam === 'string' ? categoryParam : (routeData.deviceCategory || device?.deviceType);

    // 3. Construct Props for BuybackRepair
    const type = service.id === 'repair' ? 'repair' : 'buyback';
    const initialShop = location ? location.id : undefined;
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
            coords: l.coordinates,
            status: 'open' as const,
            googleMapUrl: l.googleMapUrl,
            slugs: l.slugs
        }));
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
            />

            <div className="container mx-auto px-4 py-8">

                {/* Hub Map (Only for Hub pages) */}
                {isHub && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                            {lang === 'fr' ? 'Nos magasins à Bruxelles' : lang === 'nl' ? 'Onze winkels in Brussel' : 'Our Stores in Brussels'}
                        </h1>
                        <StoreLocator
                            shops={hubShops}
                            className="h-[500px] rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700"
                            zoom={12}
                        />
                    </div>
                )}

                {/* Main Conversion Tool */}
                <div className="mt-8">
                    <BuybackRepair
                        type={type}
                        initialShop={initialShop}
                        initialDevice={initialDevice}
                        initialCategory={deviceCategory || undefined}
                    />
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
            </div>
        </div>
    );
}
