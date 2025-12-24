import Cookies from '../../../components/Cookies';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return {
        title: lang === 'fr' ? 'Politique des Cookies | Belmobile' : lang === 'nl' ? 'Cookiebeleid | Belmobile' : 'Cookie Policy | Belmobile',
        description: 'Cookie Policy',
    };
}

export function generateStaticParams() {
    return [];
}

export default function CookiesPage() {
    return <Cookies />;
}
