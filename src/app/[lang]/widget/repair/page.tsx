import { Suspense } from 'react';
import BuybackRepair from '@/components/wizard/BuybackRepair';

export const dynamic = 'force-dynamic';

export default async function RepairWidgetPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { lang } = await params;
    const resolvedSearchParams = await searchParams;

    const partnerId = typeof resolvedSearchParams?.partnerId === 'string' ? resolvedSearchParams.partnerId : undefined;
    const initialBrand = typeof resolvedSearchParams?.brand === 'string' ? resolvedSearchParams.brand : undefined;
    const initialModel = typeof resolvedSearchParams?.model === 'string' ? resolvedSearchParams.model : undefined;

    const initialDevice = initialBrand ? {
        brand: initialBrand,
        model: initialModel || ''
    } : undefined;

    return (
        <div className="p-0 sm:p-2 overflow-hidden">
            <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />}>
                <BuybackRepair
                    type="repair"
                    initialDevice={initialDevice}
                    isWidget={true}
                    hideStep1Title={true}
                    initialWizardProps={{
                        partnerId: partnerId
                    }}
                />
            </Suspense>
        </div>
    );
}
