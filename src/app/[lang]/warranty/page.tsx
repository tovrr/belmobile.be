import Warranty from '../../../components/pages/Warranty';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return {
        title: lang === 'fr' ? 'Garantie | Belmobile' : lang === 'nl' ? 'Garantie | Belmobile' : 'Warranty Info | Belmobile',
        description: 'Warranty Information',
    };
}

export function generateStaticParams() {
    return [];
}

export default function WarrantyPage() {
    return <Warranty />;
}
