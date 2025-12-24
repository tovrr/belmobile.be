import Terms from '../../../components/Terms';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return {
        title: lang === 'fr' ? 'Conditions Générales | Belmobile' : lang === 'nl' ? 'Algemene Voorwaarden | Belmobile' : 'Terms of Service | Belmobile',
        description: 'Terms of Service',
    };
}

export function generateStaticParams() {
    return [];
}

export default function TermsPage() {
    return <Terms />;
}
