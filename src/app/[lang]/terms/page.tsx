import Terms from '../../../components/Terms';
import { Metadata } from 'next';
import { getFixedT } from '../../../utils/i18nFixed';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('meta_terms_title'),
        description: t('meta_terms_description'),
        robots: {
            index: false,
            follow: true,
        },
    };
}

export function generateStaticParams() {
    return [];
}

export default function TermsPage() {
    return <Terms />;
}
