import React from 'react';
import { Metadata } from 'next';
import HomeClient from '../../components/HomeClient';

interface PageProps {
    params: Promise<{
        lang: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params;

    const metadataByLang: Record<string, Metadata> = {
        fr: {
            title: "Réparation Professionnelle iPhone & Smartphone Bruxelles | Belmobile",
            description: "Service de réparation professionnelle pour votre iPhone, iPad ou Samsung à Bruxelles. Remplacement d'écran et batterie en 30 min. Garantie 1 an.",
            keywords: "réparation iphone bruxelles, réparation ecran iphone, magasin gsm bruxelles, rachat iphone, belmobile",
        },
        nl: {
            title: "Professionele iPhone & Smartphone Reparatie Brussel | Belmobile",
            description: "Professionele reparatieservice voor uw iPhone, iPad of Samsung in Brussel. Scherm en batterij vervangen in 30 minuten. 1 jaar garantie.",
            keywords: "iphone reparatie brussel, scherm vervangen, gsm winkel brussel, iphone verkopen, belmobile",
        },
        en: {
            title: "Professional iPhone & Smartphone Repair Brussels | Belmobile",
            description: "Professional repair service for your iPhone, iPad or Samsung in Brussels. Screen and battery replacement in 30 minutes. 1 year warranty.",
            keywords: "iphone repair brussels, screen repair, phone shop brussels, sell iphone, belmobile",
        }
    };

    const meta = metadataByLang[lang] || metadataByLang.en;
    const baseUrl = 'https://belmobile.be';

    return {
        ...meta,
        alternates: {
            canonical: `${baseUrl}/${lang}`,
            languages: {
                'fr': `${baseUrl}/fr`,
                'nl': `${baseUrl}/nl`,
                'en': `${baseUrl}/en`,
            },
        },
        openGraph: {
            title: meta.title ?? '',
            description: meta.description ?? '',
            url: `${baseUrl}/${lang}`,
            siteName: 'Belmobile',
            locale: lang,
            type: 'website',
            images: [
                {
                    url: `${baseUrl}/og-image.jpg`,
                    width: 1200,
                    height: 630,
                    alt: 'Belmobile',
                }
            ],
        },
    };
}

export default function Home() {
    return <HomeClient />;
}
