import React from 'react';
import { Metadata } from 'next';
import Hreflang from '../../../components/seo/Hreflang';
import StoresLayout from '../../../components/stores/StoresLayout';

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
            description: "Trouvez le magasin Belmobile le plus proche à Bruxelles. Service professionnel de réparation et rachat de smartphones. Sans rendez-vous.",
            keywords: "magasin gsm bruxelles, réparation iphone jette, réparation gsm auderghem, belmobile adresse",
        },
        nl: {
            title: "Onze Winkels in Brussel - Reparatie & Inkoop | Belmobile",
            description: "Vind de dichtstbijzijnde Belmobile winkel in Brussel. Professionele reparatie- en inkoopservice voor smartphones. Zonder afspraak.",
            keywords: "gsm winkel brussel, iphone reparatie jette, gsm reparatie oudergem, belmobile adres",
        },
        en: {
            title: "Our Stores in Brussels - Repair & Buyback | Belmobile",
            description: "Find the nearest Belmobile store in Brussels. Professional smartphone repair and buyback service. No appointment needed.",
            keywords: "phone shop brussels, iphone repair, mobile repair shop, belmobile location",
        }
    };

    return metadataByLang[lang] || metadataByLang.en;
}

export default async function StoresPage({ params }: PageProps) {
    const { lang } = await params;

    const hreflangSlugs = {
        fr: 'magasins',
        nl: 'winkels',
        en: 'stores'
    };

    const pageTitle = lang === 'fr' ? 'Nos Magasins à Bruxelles' : lang === 'nl' ? 'Onze Winkels in Brussel' : 'Our Stores in Brussels';

    return (
        <div className="min-h-screen bg-transparent">
            <Hreflang
                slugs={hreflangSlugs}
                baseUrl="https://belmobile.be"
            />

            {/* Hidden H1 for SEO consistency */}
            <h1 className="sr-only">{pageTitle}</h1>

            {/* Full width layout for Map + Sidebar */}
            <StoresLayout lang={lang} />
        </div>
    );
}
