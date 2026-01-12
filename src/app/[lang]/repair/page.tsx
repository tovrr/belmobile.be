import { Suspense } from 'react';
import BuybackRepair from '@/components/wizard/BuybackRepair';
import { retrieveQuote } from '@/app/_actions/retrieve-quote';

export const dynamic = 'force-dynamic';

export default async function RepairPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { lang } = await params;
    const resolvedSearchParams = await searchParams;

    // Handle standard params
    const partnerId = typeof resolvedSearchParams?.partnerId === 'string' ? resolvedSearchParams.partnerId : undefined;
    const initialBrand = typeof resolvedSearchParams?.brand === 'string' ? resolvedSearchParams.brand : undefined;
    const initialModel = typeof resolvedSearchParams?.model === 'string' ? resolvedSearchParams.model : undefined;
    const initialCategory = typeof resolvedSearchParams?.category === 'string' ? resolvedSearchParams.category : undefined;

    // Handle Magic Link Resume
    const resumeId = typeof resolvedSearchParams?.resume === 'string' ? resolvedSearchParams.resume : undefined;
    let resumedState: any = {};

    if (resumeId) {
        const { success, data } = await retrieveQuote(resumeId);
        if (success && data) {
            resumedState = data;
        }
    }

    const initialDevice = initialBrand ? {
        brand: initialBrand,
        model: initialModel || ''
    } : undefined;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />}>
                    <BuybackRepair
                        type="repair"
                        initialDevice={initialDevice}
                        initialCategory={initialCategory}
                        isWidget={false}
                        hideStep1Title={false}
                        initialWizardProps={{
                            partnerId: partnerId,
                            ...resumedState
                        }}
                    />
                </Suspense>
            </div>
        </div>
    );
}
