import { Suspense } from 'react';
import BuybackRepair from '@/components/wizard/BuybackRepair';
import DynamicSEOContent from '@/components/seo/DynamicSEOContent';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { slugToDisplayName } from '@/utils/slugs';
import { getSEOTitle, getSEODescription, getDeviceContext } from '@/utils/seoHelpers';
import { getPriceQuote } from '@/services/server/pricing.dal';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ lang: string; brand: string; model: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang, brand, model } = await params;
    const currentLang = lang as 'fr' | 'nl' | 'en' | 'tr';

    // Decode for display
    const decodedBrand = slugToDisplayName(brand);
    const decodedModel = slugToDisplayName(model);
    const deviceName = `${decodedBrand} ${decodedModel}`;

    // SSOT Fetch (0 Latency)
    const deviceSlug = `${brand}-${model}`;
    const quote = await getPriceQuote(deviceSlug);

    // Context for Fallback
    const locationName = currentLang === 'fr' ? 'Bruxelles' : (currentLang === 'nl' ? 'Brussel' : (currentLang === 'tr' ? 'Brüksel' : 'Brussels'));

    // Title & Desc Resolution
    const title = quote?.seo?.[currentLang]?.buyback.title ||
        getSEOTitle({
            isRepair: false,
            lang: currentLang,
            deviceName,
            locationName
        });

    const description = quote?.seo?.[currentLang]?.buyback.description || getSEODescription({
        isRepair: false,
        lang: currentLang,
        deviceName,
        locationName,
        brand: decodedBrand
    });

    // Alternates Resolution
    const languages = {
        'fr': `https://belmobile.be/fr/rachat/${brand}/${model}`,
        'nl': `https://belmobile.be/nl/inkoop/${brand}/${model}`,
        'en': `https://belmobile.be/en/buyback/${brand}/${model}`,
        'tr': `https://belmobile.be/tr/geri-alim/${brand}/${model}`,
    };

    return {
        title,
        description,
        alternates: {
            canonical: languages[currentLang] || `https://belmobile.be/${lang}/buyback/${brand}/${model}`,
            languages,
        },
        openGraph: {
            title,
            description,
            images: quote?.deviceImage ? [quote.deviceImage] : [],
        }
    };
}

export default async function BuybackModelPage({
    params,
    searchParams
}: Props) {
    const { lang, brand, model } = await params;
    const resolvedSearchParams = await searchParams;
    const partnerId = typeof resolvedSearchParams?.partnerId === 'string' ? resolvedSearchParams.partnerId : undefined;

    if (!brand || !model) return notFound();

    const decodedBrand = slugToDisplayName(brand);
    const decodedModel = slugToDisplayName(model);
    const currentLang = lang as 'fr' | 'nl' | 'en' | 'tr';

    // SSOT Fetch
    const deviceSlug = `${brand}-${model}`;
    const quote = await getPriceQuote(deviceSlug);

    const initialDevice = {
        brand: decodedBrand,
        model: decodedModel
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12">
            <h1 className="sr-only">
                {getSEOTitle({
                    isRepair: false,
                    lang: currentLang,
                    deviceName: `${decodedBrand} ${decodedModel}`,
                    locationName: currentLang === 'fr' ? 'Bruxelles' : (currentLang === 'nl' ? 'Brussel' : (currentLang === 'tr' ? 'Brüksel' : 'Brussels'))
                })}
            </h1>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />}>
                    <BuybackRepair
                        type="buyback"
                        initialDevice={initialDevice}
                        isWidget={false}
                        hideStep1Title={false}
                        initialWizardProps={{
                            partnerId: partnerId,
                            step: 3 // Start at condition assessment
                        }}
                    />
                </Suspense>

                {/* SEO Content Injection - Powered by DAL */}
                <div className="mt-16">
                    <DynamicSEOContent
                        type="buyback"
                        lang={currentLang}
                        brand={decodedBrand}
                        model={decodedModel}
                        priceQuote={quote}
                    />
                </div>
            </div>
        </div>
    );
}
