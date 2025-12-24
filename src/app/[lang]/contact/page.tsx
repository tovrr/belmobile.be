import Contact from '../../../components/Contact';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const titles: Record<string, string> = {
        en: 'Contact Us | Belmobile',
        fr: 'Contactez-nous | Belmobile',
        nl: 'Neem contact op | Belmobile'
    };
    const descriptions: Record<string, string> = {
        en: 'Get in touch with Belmobile for any questions or inquiries.',
        fr: 'Contactez Belmobile pour toute question ou demande.',
        nl: 'Neem contact op met Belmobile voor vragen of verzoeken.'
    };

    return {
        title: titles[lang] || titles['en'],
        description: descriptions[lang] || descriptions['en'],
    };
}

export function generateStaticParams() {
    return [];
}

export default function ContactPage() {
    return <Contact />;
}
