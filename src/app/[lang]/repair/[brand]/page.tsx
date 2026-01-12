import { Suspense } from 'react';
import BuybackRepair from '@/components/wizard/BuybackRepair';
import { notFound } from 'next/navigation';
import { DEVICE_TYPES } from '@/constants';
import DynamicSEOContent from '@/components/seo/DynamicSEOContent';
import { Metadata } from 'next';
import { getSEOTitle, getSEODescription, getDeviceContext } from '@/utils/seoHelpers';

// CACHING STRATEGY: ISR (1 Hour)
export const revalidate = 3600;
export const dynamicParams = true;

type Props = {
    params: Promise<{ lang: string; brand: string }>,
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, brand } = await params;
    const decodedParam = decodeURIComponent(brand).toLowerCase();
    const matchedCategory = DEVICE_TYPES.find(dt => dt.id === decodedParam || dt.aliases?.includes(decodedParam));
    const isCategory = !!matchedCategory;

    const deviceName = isCategory ? (matchedCategory?.id || decodedParam) : decodedParam.replace(/-/g, ' ');
    const { durationText, issuesText } = getDeviceContext(deviceName, lang as any);

    const title = getSEOTitle({
        isRepair: true,
        lang: lang as any,
        // If category, deviceName is the category name (e.g. "Smartphone")
        // If brand, deviceName is the brand (e.g. "Apple")
        deviceName,
        locationName: lang === 'fr' ? 'Bruxelles' : (lang === 'nl' ? 'Brussel' : 'Brussels'),
        durationText
    });

    const description = getSEODescription({
        isRepair: true,
        lang: lang as any,
        deviceName,
        locationName: lang === 'fr' ? 'Bruxelles' : (lang === 'nl' ? 'Brussel' : 'Brussels'),
        durationText,
        issuesText,
        brand: !isCategory ? deviceName : undefined
    });

    const serviceSlug = lang === 'fr' ? 'reparation' : (lang === 'nl' ? 'reparatie' : 'repair');

    return {
        title,
        description,
        alternates: {
            canonical: `https://belmobile.be/${lang}/${serviceSlug}/${brand}`,
        }
    };
}

export default async function RepairBrandOrCategoryPage({
    params
}: Props) {
    const { lang, brand } = await params;
    // Client components handle query params (e.g. partnerId).

    if (!brand) return notFound();

    const decodedParam = decodeURIComponent(brand).toLowerCase();

    // COLLISION FIX: Distinguish Category vs Brand (Check IDs AND Aliases)
    const matchedCategory = DEVICE_TYPES.find(dt => dt.id === decodedParam || dt.aliases?.includes(decodedParam));
    const isCategory = !!matchedCategory;

    let initialDevice = undefined;
    let initialCategory = undefined;
    let startStep = 2;

    if (isCategory) {
        initialCategory = matchedCategory?.id; // Normalize to main ID
        // If category is known, pass it so wizard filters by type
    } else {
        initialDevice = {
            brand: decodedParam.replace(/-/g, ' '),
            model: ''
        };
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12">
            <h1 className="sr-only">
                {getSEOTitle({
                    isRepair: true,
                    lang: lang as 'fr' | 'nl' | 'en' | 'tr',
                    deviceName: isCategory ? decodedParam : decodedParam.replace(/-/g, ' '),
                    locationName: lang === 'fr' ? 'Bruxelles' : (lang === 'nl' ? 'Brussel' : 'Brussels'),
                    durationText: getDeviceContext(isCategory ? decodedParam : decodedParam.replace(/-/g, ' '), lang as any).durationText
                })}
            </h1>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />}>
                    <BuybackRepair
                        type="repair"
                        initialDevice={initialDevice}
                        initialCategory={initialCategory}
                        isWidget={false}
                        hideStep1Title={false}
                        initialWizardProps={{
                            step: startStep
                        }}
                    />
                </Suspense>

                {/* SEO Content: Brand OR Category */}
                <div className="mt-16">
                    <DynamicSEOContent
                        type="repair"
                        lang={lang as 'fr' | 'nl' | 'en' | 'tr'}
                        brand={!isCategory ? decodedParam.replace(/-/g, ' ') : undefined}
                        deviceType={isCategory ? decodedParam : undefined}
                    />
                </div>
            </div>
        </div>
    );
}
