import Privacy from '../../../components/Privacy';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return {
        title: lang === 'fr' ? 'Politique de Confidentialité | Belmobile' : lang === 'nl' ? 'Privacybeleid | Belmobile' : 'Privacy Policy | Belmobile',
        description: 'Privacy Policy',
    };
}

export function generateStaticParams() {
    return [];
}

export default function PrivacyPage() {
    return <Privacy />;
}
