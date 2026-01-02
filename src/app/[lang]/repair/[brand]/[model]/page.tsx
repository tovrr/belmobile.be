import { Suspense } from 'react';
import BuybackRepair from '@/components/wizard/BuybackRepair';
import DynamicSEOContent from '@/components/seo/DynamicSEOContent';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createSlug } from '@/utils/slugs';
import { getSEOTitle, getSEODescription } from '@/utils/seoHelpers';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ lang: string; brand: string; model: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, brand, model } = await params;

    // Decode for display
    const decodedBrand = decodeURIComponent(brand).replace(/-/g, ' ');
    const decodedModel = decodeURIComponent(model).replace(/-/g, ' ');
    const deviceName = `${decodedBrand} ${decodedModel}`;

    // Use helper for consistent SEO titles
    const title = getSEOTitle({
        isRepair: true,
        lang: lang as 'fr' | 'nl' | 'en' | 'tr',
        deviceName,
        locationName: lang === 'fr' ? 'Bruxelles' : (lang === 'nl' ? 'Brussel' : 'Brussels')
    });

    const description = getSEODescription({
        isRepair: true,
        lang: lang as 'fr' | 'nl' | 'en' | 'tr',
        deviceName,
        locationName: lang === 'fr' ? 'Bruxelles' : (lang === 'nl' ? 'Brussel' : 'Brussels')
    });

    return {
        title,
        description,
        alternates: {
            canonical: `https://belmobile.be/${lang}/repair/${brand}/${model}`, // TODO: Use localized slugs in canonical if standard changes
            languages: {
                'fr': `https://belmobile.be/fr/reparation/${brand}/${model}`,
                'nl': `https://belmobile.be/nl/reparatie/${brand}/${model}`,
                'en': `https://belmobile.be/en/repair/${brand}/${model}`,
                'tr': `https://belmobile.be/tr/onarim/${brand}/${model}`,
            },
        },
        openGraph: {
            title,
            description,
            // images: [getDeviceImage(...)], // TODO: Add dynamic OG Image
        }
    };
}

export default async function RepairModelPage({
    params,
    searchParams
}: Props) {
    const { lang, brand, model } = await params;
    const resolvedSearchParams = await searchParams;
    const partnerId = typeof resolvedSearchParams?.partnerId === 'string' ? resolvedSearchParams.partnerId : undefined;

    if (!brand || !model) return notFound();

    const decodedBrand = decodeURIComponent(brand).replace(/-/g, ' ');
    const decodedModel = decodeURIComponent(model).replace(/-/g, ' ');

    const initialDevice = {
        brand: decodedBrand,
        model: decodedModel
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12">
            <h1 className="sr-only">
                {getSEOTitle({
                    isRepair: true,
                    lang: lang as 'fr' | 'nl' | 'en' | 'tr',
                    deviceName: `${decodedBrand} ${decodedModel}`,
                    locationName: lang === 'fr' ? 'Bruxelles' : (lang === 'nl' ? 'Brussel' : 'Brussels')
                })}
            </h1>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />}>
                    <BuybackRepair
                        type="repair"
                        initialDevice={initialDevice}
                        isWidget={false}
                        hideStep1Title={false}
                        initialWizardProps={{
                            partnerId: partnerId,
                            step: 3 // Start at condition/options
                        }}
                    />
                </Suspense>

                {/* SEO Content Injection - Google Loves This */}
                <div className="mt-16">
                    <DynamicSEOContent
                        type="repair"
                        lang={lang as 'fr' | 'nl' | 'en' | 'tr'}
                        brand={decodedBrand}
                        model={decodedModel}
                    // Infers default location 'Brussels' internally
                    />
                </div>
            </div>
        </div>
    );
}
