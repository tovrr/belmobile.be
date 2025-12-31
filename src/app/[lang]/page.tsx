import React from 'react';
import { Metadata } from 'next';
import HomeClient from '@/components/sections/HomeClient';
import { getReviews } from '@/services/reviewService';

export const revalidate = 3600; // Revalidate every hour

interface PageProps {
    params: Promise<{
        lang: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { lang } = await params;

    // Load translations manually for metadata as this is a server component
    const translations = await import(`@/data/i18n/${lang}.json`).then(m => m.default);

    const baseUrl = 'https://belmobile.be';

    return {
        title: translations.meta_home_title,
        description: translations.meta_home_description,
        alternates: {
            canonical: `${baseUrl}/${lang}`,
            languages: {
                'fr': `${baseUrl}/fr`,
                'nl': `${baseUrl}/nl`,
                'en': `${baseUrl}/en`,
            },
        },
        openGraph: {
            title: translations.meta_home_title,
            description: translations.meta_home_description,
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

export default async function Home({ params }: PageProps) {
    const { lang } = await params;
    const initialReviews = await getReviews(lang);

    return <HomeClient initialReviews={initialReviews} />;
}
