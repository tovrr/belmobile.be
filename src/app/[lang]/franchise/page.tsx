import Franchise from '../../../components/Franchise';
import { Metadata } from 'next';
import { getFixedT } from '../../../utils/i18n-server';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('meta_franchise_title'),
        description: t('meta_franchise_description'),
    };
}

export function generateStaticParams() {
    return [];
}

export default function FranchisePage() {
    return <Franchise />;
}
