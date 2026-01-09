import Careers from '../../../components/pages/Careers';
import { Metadata } from 'next';
import { getFixedT } from '../../../utils/i18n-server';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('careers_meta_title'),
        description: t('careers_meta_desc'),
    };
}

export function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'nl' }, { lang: 'tr' }];
}

export default function CareersPage() {
    return <Careers />;
}
