import Franchise from '../../../components/Franchise';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const titles: Record<string, string> = {
        en: 'Franchise Opportunities | Belmobile',
        fr: 'Opportunités de Franchise | Belmobile',
        nl: 'Franchisemogelijkheden | Belmobile'
    };
    const descriptions: Record<string, string> = {
        en: 'Join the Belmobile network. Open your own mobile repair shop.',
        fr: 'Rejoignez le réseau Belmobile. Ouvrez votre propre magasin de réparation mobile.',
        nl: 'Word lid van het Belmobile-netwerk. Open uw eigen mobiele reparatiewinkel.'
    };

    return {
        title: titles[lang] || titles['en'],
        description: descriptions[lang] || descriptions['en'],
    };
}

export function generateStaticParams() {
    return [];
}

export default function FranchisePage() {
    return <Franchise />;
}
