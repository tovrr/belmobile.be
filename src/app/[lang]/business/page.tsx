import BusinessSolutions from '../../../components/sections/BusinessSolutions';
import { Metadata } from 'next';
import { getFixedT } from '../../../utils/i18n-server';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);
    const baseUrl = 'https://belmobile.be';

    return {
        title: t('meta_business_title'),
        description: t('meta_business_description'),
        alternates: {
            canonical: `${baseUrl}/${lang}/business`,
            languages: {
                'en': `${baseUrl}/en/business`,
                'fr': `${baseUrl}/fr/business`,
                'nl': `${baseUrl}/nl/business`,
                'tr': `${baseUrl}/tr/is-ortakligi`,
            }
        },
        robots: {
            index: false,
            follow: false,
        },
    };
}

export function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'nl' }, { lang: 'tr' }];
}

export default function BusinessPage() {
    return <BusinessSolutions />;
}
