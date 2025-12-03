import StoreLocator from '../../../components/StoreLocator';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const titles: Record<string, string> = {
        en: 'Our Stores | Belmobile',
        fr: 'Nos Magasins | Belmobile',
        nl: 'Onze Winkels | Belmobile'
    };
    const descriptions: Record<string, string> = {
        en: 'Find a Belmobile store near you.',
        fr: 'Trouvez un magasin Belmobile près de chez vous.',
        nl: 'Vind een Belmobile winkel bij u in de buurt.'
    };

    return {
        title: titles[lang] || titles['en'],
        description: descriptions[lang] || descriptions['en'],
    };
}

export function generateStaticParams() {
    return [];
}

export default function StoresPage() {
    return <StoreLocator />;
}
