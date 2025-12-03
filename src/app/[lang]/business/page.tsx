import BusinessSolutions from '../../../components/BusinessSolutions';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const titles: Record<string, string> = {
        en: 'Business Solutions | Belmobile',
        fr: 'Solutions Entreprises | Belmobile',
        nl: 'Zakelijke Oplossingen | Belmobile'
    };
    const descriptions: Record<string, string> = {
        en: 'Belmobile B2B services: Fleet repair, buyback, and refurbished devices for companies in Brussels.',
        fr: 'Services B2B Belmobile : Réparation de flotte, rachat et appareils reconditionnés pour les entreprises à Bruxelles.',
        nl: 'Belmobile B2B-diensten: Vlootreparatie, terugkoop en gereviseerde apparaten voor bedrijven in Brussel.'
    };

    return {
        title: titles[lang] || titles['en'],
        description: descriptions[lang] || descriptions['en'],
    };
}

export function generateStaticParams() {
    return [];
}

export default function BusinessPage() {
    return <BusinessSolutions />;
}
