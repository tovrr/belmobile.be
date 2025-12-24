import TrackOrder from '../../../components/TrackOrder';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const titles: Record<string, string> = {
        en: 'Track Your Order | Belmobile',
        fr: 'Suivre Votre Commande | Belmobile',
        nl: 'Volg Uw Bestelling | Belmobile'
    };
    const descriptions: Record<string, string> = {
        en: 'Track the status of your repair or buyback order at Belmobile.',
        fr: 'Suivez le statut de votre réparation ou commande de rachat chez Belmobile.',
        nl: 'Volg de status van uw reparatie of terugkooporder bij Belmobile.'
    };

    return {
        title: titles[lang] || titles['en'],
        description: descriptions[lang] || descriptions['en'],
    };
}

export function generateStaticParams() {
    return [];
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse" />}>
            <TrackOrder />
        </Suspense>
    );
}

