import { getFixedT } from '@/utils/i18n-server';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('biz_green_title') || 'Sustainability | Belmobile',
        description: t('biz_green_desc') || 'Our commitment to a greener future.',
    };
}

export default async function SustainabilityPage({ params }: Props) {
    const { lang } = await params;
    const t = getFixedT(lang);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                    {t('biz_green_title')}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    {t('biz_green_desc')}
                </p>
                <div className="mt-12 p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl">
                    <p className="text-slate-500 italic">
                        {lang === 'fr' ? 'Contenu détaillé à venir...' : lang === 'nl' ? 'Gedetailleerde inhoud volgt...' : 'Detailed content coming soon...'}
                    </p>
                </div>
            </div>
        </div>
    );
}
