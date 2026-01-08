import React from 'react';
import { Metadata } from 'next';
import StoresLayout from '../../../components/stores/StoresLayout';
import SchemaMarkup from '../../../components/seo/SchemaMarkup';

interface PageProps {
    params: Promise<{
        lang: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Coordinate mapping for service areas
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    'ixelles': { lat: 50.8333, lng: 4.3667 },
    'elsene': { lat: 50.8333, lng: 4.3667 },
    'waterloo': { lat: 50.7167, lng: 4.4 },
    'uccle': { lat: 50.8000, lng: 4.3333 },
    'ukkel': { lat: 50.8000, lng: 4.3333 },
    'etterbeek': { lat: 50.8333, lng: 4.3833 },
    'saint-gilles': { lat: 50.8267, lng: 4.3456 },
    'sint-gillis': { lat: 50.8267, lng: 4.3456 },
    'woluwe-saint-lambert': { lat: 50.8500, lng: 4.4333 },
    'sint-lambrechts-woluwe': { lat: 50.8500, lng: 4.4333 },
    'auderghem': { lat: 50.8167, lng: 4.4333 },
    'oudergem': { lat: 50.8167, lng: 4.4333 },
    'forest': { lat: 50.8167, lng: 4.3167 },
    'vorst': { lat: 50.8167, lng: 4.3167 },
    'jette': { lat: 50.8833, lng: 4.3333 },
    'evere': { lat: 50.8667, lng: 4.4000 }
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
    const { lang } = await params;
    const query = await searchParams;
    const cityParam = (query.city || query.municipality || '') as string;
    const city = cityParam ? cityParam.charAt(0).toUpperCase() + cityParam.slice(1) : '';

    const metadataByLang: Record<string, Metadata> = {
        fr: {
            title: city
                ? `Réparation iPhone & Samsung à ${city} - Belmobile`
                : "Nos Magasins à Bruxelles - Réparation & Rachat | Belmobile",
            description: city
                ? `Service de réparation rapide à ${city}. Nos techniciens interviennent pour vos iPhone, Samsung et iPad. Magasins à proximité à Schaerbeek et Anderlecht.`
                : "Trouvez le magasin Belmobile le plus proche à Bruxelles (Schaerbeek, Anderlecht). Service professionnel de réparation iPhone/Samsung et rachat cash.",
            keywords: city
                ? `réparation iphone ${city}, réparation samsung ${city}, magasin gsm ${city}, rachat téléphone ${city}`
                : "magasin gsm bruxelles, réparation iphone schaerbeek, réparation samsung anderlecht, rachat gsm bruxelles, adresse belmobile",
        },
        nl: {
            title: city
                ? `iPhone & Samsung Reparatie in ${city} - Belmobile`
                : "Onze Winkels in Brussel - Reparatie & Inkoop | Belmobile",
            description: city
                ? `Snelle reparatieservice in ${city}. Onze technici helpen u met uw iPhone, Samsung en iPad. Winkels in de buurt in Schaarbeek en Anderlecht.`
                : "Vind de dichtstbijzijnde Belmobile winkel in Brussel (Schaarbeek, Anderlecht). Professionele iPhone/Samsung reparatie en cash inkoop.",
            keywords: city
                ? `iphone reparatie ${city}, samsung reparatie ${city}, gsm winkel ${city}, gsm verkopen ${city}`
                : "gsm winkel brussel, iphone reparatie schaarbeek, samsung reparatie anderlecht, gsm verkopen brussel, belmobile adres",
        },
        en: {
            title: city
                ? `iPhone & Samsung Repair in ${city} - Belmobile`
                : "Our Stores in Brussels - Repair & Buyback | Belmobile",
            description: city
                ? `Fast repair service in ${city}. Expert technicians for iPhone, Samsung, and iPad. Nearby stores in Schaerbeek and Anderlecht.`
                : "Find the nearest Belmobile store in Brussels (Schaerbeek, Anderlecht). Professional iPhone/Samsung repair and cash buyback service.",
            keywords: city
                ? `iphone repair ${city}, samsung repair ${city}, phone shop ${city}, sell phone ${city}`
                : "phone shop brussels, iphone repair schaerbeek, mobile repair shop anderlecht, sell phone brussels, belmobile location",
        }
    };

    const baseMetadata = metadataByLang[lang] || metadataByLang.en;

    return {
        ...baseMetadata,
        alternates: {
            canonical: `https://belmobile.be/${lang}/stores${cityParam ? `?city=${cityParam}` : ''}`,
            languages: {
                'fr': 'https://belmobile.be/fr/magasins',
                'nl': 'https://belmobile.be/nl/winkels',
                'en': 'https://belmobile.be/en/stores'
            }
        }
    };
}

import { getShops } from '../../../services/shopService';

export const revalidate = 3600; // Revalidate every hour

export default async function StoresPage({ params, searchParams }: PageProps) {
    const { lang } = await params;
    const query = await searchParams;
    const cityParam = (query.city || query.municipality || '') as string;

    // Normalize city name for coordinate lookup
    const cityKey = cityParam.toLowerCase();
    const cityCoords = CITY_COORDINATES[cityKey] || null;
    const cityName = cityParam ? cityParam.charAt(0).toUpperCase() + cityParam.slice(1) : undefined;

    const shops = await getShops();

    return (
        <div className="min-h-screen bg-transparent">


            {/* Full width layout for Map + Sidebar */}
            <StoresLayout
                lang={lang}
                initialShops={shops}
                selectedCityName={cityName}
                selectedCityCoords={cityCoords ? [cityCoords.lat, cityCoords.lng] : undefined}
            />
        </div>
    );
}
