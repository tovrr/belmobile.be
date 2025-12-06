import Careers from '../../../components/Careers';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const titles: Record<string, string> = {
        en: 'Careers | Belmobile',
        fr: 'Carrières | Belmobile',
        nl: 'Vacatures | Belmobile'
    };
    const descriptions: Record<string, string> = {
        en: 'Join the Belmobile team. Innovative, passionate, and growing.',
        fr: 'Rejoignez l\'équipe Belmobile. Innovant, passionné et en pleine croissance.',
        nl: 'Word lid van het Belmobile-team. Innovatief, gepassioneerd en groeiend.'
    };

    return {
        title: titles[lang] || titles['en'],
        description: descriptions[lang] || descriptions['en'],
    };
}

export function generateStaticParams() {
    return [];
}

export default function CareersPage() {
    return <Careers />;
}
