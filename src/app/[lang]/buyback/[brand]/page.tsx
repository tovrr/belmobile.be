import { Suspense } from 'react';
import BuybackRepair from '@/components/wizard/BuybackRepair';
import { notFound } from 'next/navigation';
import { DEVICE_TYPES } from '@/constants';
import DynamicSEOContent from '@/components/seo/DynamicSEOContent';
import { Metadata } from 'next';
import { getSEOTitle, getSEODescription } from '@/utils/seoHelpers';

// CACHING STRATEGY: ISR (1 Hour)
// This avoids Vercel Hobby "US East" latency by caching pages at the Edge (Paris).
export const revalidate = 3600;
export const dynamicParams = true;

type Props = {
    params: Promise<{ lang: string; brand: string }>,
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, brand } = await params;
    const decodedParam = decodeURIComponent(brand).toLowerCase();
    const isCategory = DEVICE_TYPES.some(dt => dt.id === decodedParam);

    const title = getSEOTitle({
        isRepair: false,
        lang: lang as any,
        deviceName: isCategory ? decodedParam : decodedParam.replace(/-/g, ' '),
        locationName: lang === 'fr' ? 'Bruxelles' : (lang === 'nl' ? 'Brussel' : 'Brussels')
    });

    const description = getSEODescription({
        isRepair: false,
        lang: lang as any,
        deviceName: isCategory ? decodedParam : decodedParam.replace(/-/g, ' '),
        locationName: lang === 'fr' ? 'Bruxelles' : (lang === 'nl' ? 'Brussel' : 'Brussels')
    });

    const serviceSlug = lang === 'fr' ? 'rachat' : (lang === 'nl' ? 'inkoop' : 'buyback');

    return {
        title,
        description,
        alternates: {
            canonical: `https://belmobile.be/${lang}/${serviceSlug}/${brand}`,
        }
    };
}

export default async function BuybackBrandOrCategoryPage({
    params
}: Props) {
    const { lang, brand } = await params;

    // NOTE: We do NOT await searchParams here to avoid aggressive dynamic opt-in on Hobby.
    // Client components handle query params (e.g. partnerId).

    if (!brand) return notFound();

    const decodedParam = decodeURIComponent(brand).toLowerCase();

    // COLLISION FIX: Distinguish Category vs Brand
    const isCategory = DEVICE_TYPES.some(dt => dt.id === decodedParam);

    let initialDevice = undefined;
    let initialCategory = undefined;
    let startStep = 2;

    if (isCategory) {
        initialCategory = decodedParam;
    } else {
        initialDevice = {
            brand: decodedParam.replace(/-/g, ' '),
            model: '' // Let the client wizard handle model selection if present in generic brand page logic
        };
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12">
            <h1 className="sr-only">
                {getSEOTitle({
                    isRepair: false,
                    lang: lang as 'fr' | 'nl' | 'en' | 'tr',
                    deviceName: isCategory ? decodedParam : decodedParam.replace(/-/g, ' '),
                    locationName: lang === 'fr' ? 'Bruxelles' : (lang === 'nl' ? 'Brussel' : 'Brussels')
                })}
            </h1>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />}>
                    <BuybackRepair
                        type="buyback"
                        initialDevice={initialDevice}
                        initialCategory={initialCategory}
                        isWidget={false}
                        hideStep1Title={false}
                        initialWizardProps={{
                            step: startStep
                            // partnerId read client-side
                        }}
                    />
                </Suspense>

                {/* SEO Content: Brand OR Category */}
                <div className="mt-16">
                    <DynamicSEOContent
                        type="buyback"
                        lang={lang as 'fr' | 'nl' | 'en' | 'tr'}
                        brand={!isCategory ? decodedParam.replace(/-/g, ' ') : undefined}
                        deviceType={isCategory ? decodedParam : undefined}
                    />
                </div>
            </div>
        </div>
    );
}
