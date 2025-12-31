import Privacy from '../../../components/pages/Privacy';
import { Metadata } from 'next';
import { getFixedT } from '../../../utils/i18n-server';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('meta_privacy_title'),
        description: t('meta_privacy_description'),
        robots: {
            index: false,
            follow: true,
        },
    };
}

export function generateStaticParams() {
    return [];
}

export default function PrivacyPage() {
    return <Privacy />;
}
