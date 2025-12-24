import FAQPage from '../../../components/FAQPage';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const titles: Record<string, string> = {
        en: 'FAQ | Belmobile',
        fr: 'FAQ | Belmobile',
        nl: 'FAQ | Belmobile'
    };
    const descriptions: Record<string, string> = {
        en: 'Frequently Asked Questions about Belmobile services.',
        fr: 'Foire aux questions sur les services Belmobile.',
        nl: 'Veelgestelde vragen over Belmobile diensten.'
    };

    return {
        title: titles[lang] || titles['en'],
        description: descriptions[lang] || descriptions['en'],
    };
}

export function generateStaticParams() {
    return [];
}

export default function FAQ() {
    return <FAQPage />;
}
