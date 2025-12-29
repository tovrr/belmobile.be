import Products from '../../../components/Products';
import { Metadata } from 'next';
import { getProducts } from '../../../services/productService';

export const revalidate = 3600; // Revalidate every hour

type Props = {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

    const keywords: Record<string, string> = {
        en: 'refurbished iphone, buy used samsung, macbook belgium, second hand smartphone brussels, cheap iphone 13',
        fr: 'iphone reconditionné, acheter samsung occasion, macbook belgique, smartphone pas cher bruxelles, iphone 13 occasion',
        nl: 'refurbished iphone, tweedehands samsung kopen, macbook belgie, goedkope smartphone brussel, iphone 13 occasie'
    };

    return {
        title: titles[lang] || titles['en'],
        description: descriptions[lang] || descriptions['en'],
        keywords: keywords[lang] || keywords['en'],
        alternates: {
            canonical: `https://belmobile.be/${lang}/products`,
        }
    };
}

export function generateStaticParams() {
    return [];
}

export default async function ProductsPage({ params, searchParams }: Props) {
    const { lang } = await params;
    const initialProducts = await getProducts();
    const resolvedSearchParams = await searchParams;

    return <Products lang={lang} initialProducts={initialProducts} searchParams={resolvedSearchParams} />;
}
