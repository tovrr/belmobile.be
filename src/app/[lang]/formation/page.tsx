import TrainingAcademy from '../../../components/sections/TrainingAcademy';
import { Metadata } from 'next';
import { getFixedT } from '../../../utils/i18n-server';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);
    const baseUrl = 'https://belmobile.be';

    return {
        title: t('meta_training_title'),
        description: t('meta_training_description'),
        alternates: {
            canonical: `${baseUrl}/${lang}/formation`,
            languages: {
                'en': `${baseUrl}/en/formation`,
                'fr': `${baseUrl}/fr/formation`,
                'nl': `${baseUrl}/nl/opleiding`,
            }
        },
    };
}

export function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'nl' }];
}

export default function TrainingPage() {
    return <TrainingAcademy />;
}
