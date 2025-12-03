import Blog from '../../../components/Blog';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const titles: Record<string, string> = {
        en: 'Blog - Latest News & Tips | Belmobile',
        fr: 'Blog - Dernières Nouvelles & Conseils | Belmobile',
        nl: 'Blog - Laatste Nieuws & Tips | Belmobile'
    };
    const descriptions: Record<string, string> = {
        en: 'Stay updated with the latest mobile tech news, repair tips, and sustainability guides from Belmobile.',
        fr: 'Restez informé des dernières nouvelles technologiques mobiles, conseils de réparation et guides de durabilité de Belmobile.',
        nl: 'Blijf op de hoogte van het laatste mobiele tech-nieuws, reparatietips en duurzaamheidsgidsen van Belmobile.'
    };

    return {
        title: titles[lang] || titles['en'],
        description: descriptions[lang] || descriptions['en'],
    };
}

export function generateStaticParams() {
    return [];
}

export default function BlogPage() {
    return <Blog />;
}
