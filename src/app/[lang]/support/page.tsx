import { Metadata } from 'next';
import { getFixedT } from '@/utils/i18nFixed';
import SupportHubPage from '@/components/SupportHubPage';

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('meta_support_title'),
        description: t('meta_support_description'),
        keywords: t('meta_support_keywords'),
        alternates: {
            canonical: `https://belmobile.be/${lang}/support`,
            languages: {
                'en': `https://belmobile.be/en/support`,
                'fr': `https://belmobile.be/fr/support`,
                'nl': `https://belmobile.be/nl/support`,
            }
        },
    };
}

export default async function Page({ params }: Props) {
    const { lang } = await params;
    return <SupportHubPage lang={lang} />;
}
