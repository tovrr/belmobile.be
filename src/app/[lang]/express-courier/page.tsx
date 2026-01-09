import React from 'react';
import { Metadata } from 'next';
import ExpressCourierClient from '../../../components/features/ExpressCourierClient';

interface PageProps {
    params: Promise<{
        lang: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params;

    // Support all four languages
    const currentLang = ['en', 'fr', 'nl', 'tr'].includes(lang) ? lang : 'fr';

    // Load translations manually for metadata as this is a server component
    const translations = await import(`../../../../src/data/i18n/${currentLang}.json`).then(m => m.default);

    const baseUrl = 'https://belmobile.be';

    return {
        title: translations.courier_meta_title,
        description: translations.courier_meta_description,
        alternates: {
            canonical: `${baseUrl}/${currentLang}/express-courier`,
            languages: {
                'en': `${baseUrl}/en/express-courier`,
                'fr': `${baseUrl}/fr/express-courier`,
                'nl': `${baseUrl}/nl/express-courier`,
                'tr': `${baseUrl}/tr/express-courier`,
            }
        },
    };
}

export default function ExpressCourierPage() {
    return <ExpressCourierClient />;
}
