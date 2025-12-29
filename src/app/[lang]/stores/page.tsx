import React from 'react';
import { Metadata } from 'next';
import StoresLayout from '../../../components/stores/StoresLayout';
import SchemaMarkup from '../../../components/SchemaMarkup';

interface PageProps {
    params: Promise<{
        lang: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params;

    const metadataByLang: Record<string, Metadata> = {
        fr: {
            title: "Nos Magasins à Bruxelles - Réparation & Rachat | Belmobile",
            description: "Trouvez le magasin Belmobile le plus proche à Bruxelles (Schaerbeek, Anderlecht). Service professionnel de réparation iPhone/Samsung et rachat cash.",
            keywords: "magasin gsm bruxelles, réparation iphone schaerbeek, réparation samsung anderlecht, rachat gsm bruxelles, adresse belmobile",
        },
        nl: {
            title: "Onze Winkels in Brussel - Reparatie & Inkoop | Belmobile",
            description: "Vind de dichtstbijzijnde Belmobile winkel in Brussel (Schaarbeek, Anderlecht). Professionele iPhone/Samsung reparatie en cash inkoop.",
            keywords: "gsm winkel brussel, iphone reparatie schaarbeek, samsung reparatie anderlecht, gsm verkopen brussel, belmobile adres",
        },
        en: {
            title: "Our Stores in Brussels - Repair & Buyback | Belmobile",
            description: "Find the nearest Belmobile store in Brussels (Schaerbeek, Anderlecht). Professional iPhone/Samsung repair and cash buyback service.",
            keywords: "phone shop brussels, iphone repair schaerbeek, mobile repair shop anderlecht, sell phone brussels, belmobile location",
        }
    };

    const baseMetadata = metadataByLang[lang] || metadataByLang.en;

    return {
        ...baseMetadata,
        alternates: {
            canonical: `https://belmobile.be/${lang}/stores`,
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

export default async function StoresPage({ params }: PageProps) {
    const { lang } = await params;
    const shops = await getShops();
    const pageTitle = lang === 'fr' ? 'Nos Magasins à Bruxelles' : lang === 'nl' ? 'Onze Winkels in Brussel' : 'Our Stores in Brussels';

    return (
        <div className="min-h-screen bg-transparent">
            {/* Inject Schema via SchemaMarkup */}
            <SchemaMarkup type="organization" />

            {/* Hidden H1 for SEO consistency */}
            <h1 className="sr-only">{pageTitle}</h1>

            {/* Full width layout for Map + Sidebar */}
            <StoresLayout lang={lang} initialShops={shops} />
        </div>
    );
}
