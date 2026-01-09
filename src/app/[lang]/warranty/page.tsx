import Warranty from '../../../components/pages/Warranty';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return {
        title: lang === 'fr' ? 'Garantie | Belmobile' : lang === 'nl' ? 'Garantie | Belmobile' : lang === 'tr' ? 'Garanti | Belmobile' : 'Warranty Info | Belmobile',
        description: lang === 'tr' ? 'Garanti Bilgisi' : 'Warranty Information',
    };
}

export function generateStaticParams() {
    return [];
}

export default function WarrantyPage() {
    return <Warranty />;
}
