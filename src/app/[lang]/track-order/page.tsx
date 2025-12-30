import TrackOrder from '../../../components/TrackOrder';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getFixedT } from '../../../utils/i18n-server';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ lang: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('meta_track_order_title'),
        description: t('meta_track_order_description'),
    };
}

export function generateStaticParams() {
    return [];
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse" />}>
            <TrackOrder />
        </Suspense>
    );
}

