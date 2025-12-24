import Jobs from '../../../components/Jobs';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const titles: Record<string, string> = {
        en: 'Careers | Belmobile',
        fr: 'Carrières | Belmobile',
        nl: 'Carrières | Belmobile'
    };
    const descriptions: Record<string, string> = {
        en: 'Join the Belmobile team. We are hiring sales and technical roles.',
        fr: 'Rejoignez l\'équipe Belmobile. Nous recrutons des profils commerciaux et techniques.',
        nl: 'Word lid van het Belmobile-team. We werven verkoop- en technische functies aan.'
    };

    return {
        title: titles[lang] || titles['en'],
        description: descriptions[lang] || descriptions['en'],
    };
}

export function generateStaticParams() {
    return [];
}

export default function JobsPage() {
    return <Jobs />;
}
