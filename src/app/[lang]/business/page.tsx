import BusinessSolutions from '../../../components/BusinessSolutions';
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
        title: translations.meta_business_title,
        description: translations.meta_business_description,
        alternates: {
            canonical: `${baseUrl}/${lang}/business`,
            languages: {
                'en': `${baseUrl}/en/business`,
                'fr': `${baseUrl}/fr/business`,
                'nl': `${baseUrl}/nl/business`,
            }
        },
    };
}

export function generateStaticParams() {
    return [];
}

export default function BusinessPage() {
    return <BusinessSolutions />;
}
