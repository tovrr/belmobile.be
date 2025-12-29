import FAQPage from '../../../components/FAQPage';
import { Metadata } from 'next';
import { getFixedT } from '../../../utils/i18nFixed';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('meta_faq_title'),
        description: t('meta_faq_description'),
        keywords: t('meta_faq_keywords'),
    };
}

export function generateStaticParams() {
    return [];
}

export default function FAQ() {
    return <FAQPage />;
}
