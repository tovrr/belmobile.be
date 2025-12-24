import React from 'react';
import { Metadata } from 'next';
import ExpressCourierClient from '../../../components/ExpressCourierClient';

interface PageProps {
    params: Promise<{
        lang: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params;

    const metadataByLang: Record<string, Metadata> = {
        fr: {
            title: "Coursier Express Tour & Taxis | Belmobile Corporate Bridge",
            description: "Vous travaillez à Tour & Taxis ? Récupération et retour de votre GSM le jour même. Service dédié aux employés Gare Maritime.",
        },
        nl: {
            title: "Express Koerier Tour & Taxis | Belmobile Corporate Bridge",
            description: "Werkt u bij Tour & Taxis? Haal- en brengservice voor uw smartphone op dezelfde dag. Exclusief voor medewerkers van Gare Maritime.",
        },
        en: {
            title: "Express Courier Tour & Taxis | Belmobile Corporate Bridge",
            description: "Working at Tour & Taxis? Same-day pick-up and return for your mobile phone. Dedicated service for Gare Maritime employees.",
        }
    };

    const meta = metadataByLang[lang] || metadataByLang.en;
    const baseUrl = 'https://belmobile.be';

    return {
        ...meta,
        alternates: {
            canonical: `${baseUrl}/${lang}/express-courier`,
        },
    };
}

export default function ExpressCourierPage() {
    return <ExpressCourierClient />;
}
