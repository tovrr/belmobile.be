import { Suspense } from 'react';
import Contact from '../../../components/pages/Contact';
import { Metadata } from 'next';
import { getFixedT } from '../../../utils/i18n-server';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('meta_contact_title'),
        description: t('meta_contact_description'),
        keywords: t('meta_contact_keywords'),
        alternates: {
            canonical: `https://belmobile.be/${lang}/contact`,
            languages: {
                'en': `https://belmobile.be/en/contact`,
                'fr': `https://belmobile.be/fr/contact`,
                'nl': `https://belmobile.be/nl/contact`,
            }
        },
    };
}

export function generateStaticParams() {
    return [];
}

export default function ContactPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-deep-space animate-pulse" />}>
            <Contact />
        </Suspense>
    );
}
