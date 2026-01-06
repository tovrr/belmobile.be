import React from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
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
    const locales = ['fr', 'nl', 'en', 'tr'];
    const currentLang = locales.includes(lang) ? lang : 'fr';

    // Load translations manually for metadata as this is a server component
    const translations = await import(`@/data/i18n/${currentLang}.json`).then(m => m.default);

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
                'tr': `${baseUrl}/tr`,
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
    // DEBUG: Disable reviews to fix homepage load
    // const initialReviews = await getReviews(lang);
    const initialReviews: any[] = [];

    // Server-side mobile detection for LCP optimization
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    return <HomeClient initialReviews={initialReviews} isMobileServer={isMobile} />;
}
