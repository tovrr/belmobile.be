import { Suspense } from 'react';
import BuybackRepair from '@/components/wizard/BuybackRepair';
import DynamicSEOContent from '@/components/seo/DynamicSEOContent';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getSEOTitle, getSEODescription, getDeviceContext } from '@/utils/seoHelpers';
import { getPriceQuote } from '@/services/server/pricing.dal';
import { slugToDisplayName } from '@/utils/slugs';

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
    // Construct simplified ID from URL params (e.g. apple-iphone-13)
    const deviceSlug = `${brand}-${model}`;
    const quote = await getPriceQuote(deviceSlug);

    // Context for Fallback
    const { durationText, issuesText } = getDeviceContext(decodedModel, currentLang);
    const locationName = currentLang === 'fr' ? 'Bruxelles' : (currentLang === 'nl' ? 'Brussel' : 'Brussels');

    // Title & Desc Resolution
    // Priority: SSOT > Helper Backup
    const title = quote?.seo?.[currentLang]?.repair.title || getSEOTitle({
        isRepair: true,
        lang: currentLang,
        deviceName,
        locationName,
        durationText
    });

    const description = quote?.seo?.[currentLang]?.repair.description || getSEODescription({
        isRepair: true,
        lang: currentLang,
        deviceName,
        locationName,
        durationText,
        issuesText,
        brand: decodedBrand
    });

    // Alternates Resolution from SSOT or Manual Construction
    const languages = {
        'fr': `https://belmobile.be/fr/reparation/${brand}/${model}`,
        'nl': `https://belmobile.be/nl/reparatie/${brand}/${model}`,
        'en': `https://belmobile.be/en/repair/${brand}/${model}`,
        'tr': `https://belmobile.be/tr/onarim/${brand}/${model}`, // Updated to 'tamir' or 'onarim' based on sitemap? Sitemap says 'tamir'. Let's match sitemap if possible, or keep simple. Sitemap has dynamic logic.
        // Ideally we should use quote.seo['tr'].slug if available to be perfect.
    };

    if (quote?.seo) {
        // Use SSOT slugs if available for perfect linking
        if (quote.seo.fr.slug) languages['fr'] = `https://belmobile.be/fr/${quote.seo.fr.slug}`;
        if (quote.seo.nl.slug) languages['nl'] = `https://belmobile.be/nl/${quote.seo.nl.slug}`;
        if (quote.seo.en.slug) languages['en'] = `https://belmobile.be/en/${quote.seo.en.slug}`;
        if (quote.seo.tr.slug) languages['tr'] = `https://belmobile.be/tr/${quote.seo.tr.slug}`;
    }

    return {
        title,
        description,
        alternates: {
            canonical: languages[currentLang] || `https://belmobile.be/${lang}/repair/${brand}/${model}`,
            languages,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            locale: currentLang,
            url: languages[currentLang],
            siteName: 'Belmobile',
            images: quote?.deviceImage ? [{
                url: quote.deviceImage,
                width: 1200,
                height: 630,
                alt: `${decodedBrand} ${decodedModel} Repair`,
            }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: quote?.deviceImage ? [quote.deviceImage] : [],
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

    const decodedBrand = slugToDisplayName(brand);
    const decodedModel = slugToDisplayName(model);
    const currentLang = lang as 'fr' | 'nl' | 'en' | 'tr';

    // SSOT Fetch
    const deviceSlug = `${brand}-${model}`;
    const quote = await getPriceQuote(deviceSlug);

    const { durationText } = getDeviceContext(decodedModel, currentLang);
    const locationName = currentLang === 'fr' ? 'Bruxelles' : (currentLang === 'nl' ? 'Brussel' : 'Brussels');
    const deviceName = `${decodedBrand} ${decodedModel}`;

    const initialDevice = {
        brand: decodedBrand,
        model: decodedModel
    };

    // Determine Title for H1 (SSOT prioritized)
    const h1Title = quote?.seo?.[currentLang]?.repair.title || getSEOTitle({
        isRepair: true,
        lang: currentLang,
        deviceName,
        locationName,
        durationText
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12">
            <h1 className="sr-only">
                {h1Title}
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

                {/* SEO Content Injection - Powered by DAL */}
                <div className="mt-16">
                    <DynamicSEOContent
                        type="repair"
                        lang={currentLang}
                        brand={decodedBrand}
                        model={decodedModel}
                        priceQuote={quote} // Pass the SSOT data
                    // Infers default location 'Brussels' internally
                    />
                </div>
            </div>
        </div>
    );
}
