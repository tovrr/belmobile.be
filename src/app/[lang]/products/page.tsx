import Products from '../../../components/Products';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const titles: Record<string, string> = {
        en: 'Our Products | Belmobile',
        fr: 'Nos Produits | Belmobile',
        nl: 'Onze Producten | Belmobile'
    };
    const descriptions: Record<string, string> = {
        en: 'Browse our selection of high-quality refurbished devices.',
        fr: 'Découvrez notre sélection d\'appareils reconditionnés de haute qualité.',
        nl: 'Bekijk onze selectie van hoogwaardige gereviseerde apparaten.'
    };

    return {
        title: titles[lang] || titles['en'],
        description: descriptions[lang] || descriptions['en'],
    };
}

export function generateStaticParams() {
    return [];
}

export default function ProductsPage() {
    return <Products />;
}
