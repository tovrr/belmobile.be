import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { orderService } from '@/services/orderService';
import TrackOrder from '@/components/features/TrackOrder';
import { getFixedT } from '@/utils/i18n-server';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ lang: string; token: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    const t = getFixedT(lang);

    return {
        title: t('meta_track_order_title'),
        description: t('meta_track_order_description'),
    };
}

export default async function MagicTrackPage({ params }: Props) {
    const { lang, token } = await params;

    // Server-side fetch for security and speed
    const order = await orderService.getOrderByToken(token);

    if (!order) {
        return notFound();
    }

    // Cast to the expected component type
    const initialData = {
        ...order,
        id: order.id,
        type: (order as any).type || 'repair'
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-8 pb-16">
            <Suspense fallback={<div className="container mx-auto px-4 py-8 h-96 animate-pulse bg-gray-200 dark:bg-slate-800 rounded-3xl" />}>
                <div className="container mx-auto px-4">
                    <TrackOrder initialData={initialData as any} />
                </div>
            </Suspense>
        </div>
    );
}
