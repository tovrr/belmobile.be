import Cookies from '../../../components/Cookies';
import { Metadata } from 'next';
import { getFixedT } from '../../../utils/i18nFixed';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('meta_cookies_title'),
        description: t('meta_cookies_description'),
        robots: {
            index: false,
            follow: true,
        },
    };
}

export function generateStaticParams() {
    return [];
}

export default function CookiesPage() {
    return <Cookies />;
}
