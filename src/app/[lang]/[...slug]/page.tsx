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
    const languages = ['en', 'fr', 'nl'];
    const serviceSlugs = SERVICES.flatMap(s => Object.values(s.slugs));

    // Base combinations
    const locations = LOCATIONS;
    const deviceTypes = DEVICE_TYPES.map(d => d.id);
    const brands = Object.values(DEVICE_BRANDS).flat();

    // Extract models from MOCK_REPAIR_PRICES
    // ID format: 'brand-model-slug' -> we need to reconstruct what createSlug(model) would be.
    // Actually, MOCK_REPAIR_PRICES ids are like 'apple-iphone-13'.
    // The route parser expects 'apple' and 'iphone-13' as separate segments if 'apple' is the brand.
    const models = MOCK_REPAIR_PRICES.map(p => {
        const parts = p.id.split('-');
        const brand = parts[0];
        const modelSlug = parts.slice(1).join('-');
        return { brand, modelSlug };
    });

    const params: { lang: string; slug: string[] }[] = [];

    // Helper to add param
    const add = (lang: string, parts: string[]) => {
        params.push({ lang, slug: parts });
    };

    for (const lang of languages) {
        // Only generate for Repair and Buyback services
        const targetServices = SERVICES.filter(s => ['repair', 'buyback'].includes(s.id));

        for (const service of targetServices) {
            const sSlug = service.slugs[lang as keyof typeof service.slugs];

            // 1. Service Home: /repair
            add(lang, [sSlug]);

            // 2. Service + Location: /repair/brussels
            for (const loc of locations) {
                const lSlug = loc.slugs[lang as keyof typeof loc.slugs];
                add(lang, [sSlug, lSlug]);
            }

            // 3. Service + Category: /repair/smartphone
            for (const type of deviceTypes) {
                // Determine translated category slug if possible, or just use ID if that's what logic expects.
                // Looking at parseRouteParams: it matches 'segment' against DEVICE_TYPES[i].id.
                // So we use the ID.
                add(lang, [sSlug, type]);

                // Service + Category + Location
                for (const loc of locations) {
                    const lSlug = loc.slugs[lang as keyof typeof loc.slugs];
                    add(lang, [sSlug, type, lSlug]);
                }
            }

            // 4. Service + Brand: /repair/apple
            for (const brand of brands) {
                const bSlug = createSlug(brand);
                add(lang, [sSlug, bSlug]);

                // Service + Brand + Location
                for (const loc of locations) {
                    const lSlug = loc.slugs[lang as keyof typeof loc.slugs];
                    add(lang, [sSlug, bSlug, lSlug]);
                }
            }

            // 5. Service + Model (+ Brand implicit): /repair/apple/iphone-13
            // logic: findDevice(segment[0]) -> Brand. segment[1] -> Model.
            for (const { brand, modelSlug } of models) {
                const bSlug = createSlug(brand); // e.g. 'apple'
                // modelSlug is already slugified in our map above from MOCK_REPAIR_PRICES id

                // Route: /repair/apple/iphone-13
                add(lang, [sSlug, bSlug, modelSlug]);

                // Route: /repair/apple/iphone-13/brussels
                for (const loc of locations) {
                    const lSlug = loc.slugs[lang as keyof typeof loc.slugs];
                    add(lang, [sSlug, bSlug, modelSlug, lSlug]);
                }
            }
        }
    }

    return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    const routeData = parseRouteParams(slug, lang);

    if (!routeData) return {};

    const { service, location, device, deviceModel } = routeData;
    const isRepair = service.id === 'repair';

    // Construct Title
    let title = '';
    let description = '';

    // Format the model name properly (convert slug to display name)
    const formattedModel = deviceModel ? slugToDisplayName(deviceModel) : '';
    // Capitalize brand name (e.g., "apple" -> "Apple")
    const formattedBrand = device ? device.value.charAt(0).toUpperCase() + device.value.slice(1) : '';
    const deviceName = device ? `${formattedBrand} ${formattedModel}`.trim() : (isRepair ? 'Smartphone' : 'Device');
    const locationName = location ? location.name.replace('Belmobile ', '') : '';

    if (lang === 'fr') {
        if (isRepair) {
            title = `Réparation ${deviceName} ${location ? `à ${locationName}` : ''} | Belmobile`;
            description = `Faites réparer votre ${deviceName} chez Belmobile${location ? ` à ${locationName}` : ''}. Service rapide en 30 min, garantie 1 an. Écran, batterie et plus.`;
        } else {
            title = `Rachat ${deviceName} ${location ? `à ${locationName}` : ''} - Meilleur Prix | Belmobile`;
            description = `Vendez votre ${deviceName} au meilleur prix chez Belmobile${location ? ` à ${locationName}` : ''}. Estimation immédiate et paiement cash.`;
        }
    } else if (lang === 'nl') {
        if (isRepair) {
            title = `Reparatie ${deviceName} ${location ? `in ${locationName}` : ''} | Belmobile`;
            description = `Laat uw ${deviceName} repareren bij Belmobile${location ? ` in ${locationName}` : ''}. Snelle service in 30 min, 1 jaar garantie. Scherm, batterij en meer.`;
        } else {
            title = `Inkoop ${deviceName} ${location ? `in ${locationName}` : ''} - Beste Prijs | Belmobile`;
            description = `Verkoop uw ${deviceName} voor de beste prijs bij Belmobile${location ? ` in ${locationName}` : ''}. Directe schatting en contante betaling.`;
        }
    } else {
        if (isRepair) {
            title = `${deviceName} Repair ${location ? `in ${locationName}` : ''} | Belmobile`;
            description = `Get your ${deviceName} repaired at Belmobile${location ? ` in ${locationName}` : ''}. Fast service in 30 min, 1 year warranty. Screen, battery and more.`;
        } else {
            title = `Sell ${deviceName} ${location ? `in ${locationName}` : ''} - Best Price | Belmobile`;
            description = `Sell your ${deviceName} for the best price at Belmobile${location ? ` in ${locationName}` : ''}. Instant quote and cash payment.`;
        }
    }

    return {
        title,
        description,
        alternates: {
            canonical: `https://belmobile.be/${lang}/${slug.join('/')}`
        }
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
