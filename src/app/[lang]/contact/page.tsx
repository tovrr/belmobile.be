import Contact from '../../../components/Contact';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;

    // Load translations manually for metadata as this is a server component
    const translations = await import(`../../../../src/data/i18n/${lang}.json`).then(m => m.default);

    const baseUrl = 'https://belmobile.be';

    return {
        title: translations.meta_contact_title,
        description: translations.meta_contact_description,
        alternates: {
            canonical: `${baseUrl}/${lang}/contact`,
            languages: {
                'en': `${baseUrl}/en/contact`,
                'fr': `${baseUrl}/fr/contact`,
                'nl': `${baseUrl}/nl/contact`,
            }
        },
    };
}

export function generateStaticParams() {
    return [];
}

export default function ContactPage() {
    return <Contact />;
}
