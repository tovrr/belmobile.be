import { permanentRedirect } from 'next/navigation';

interface PageProps {
    params: Promise<{ lang: string; slug: string[] }>;
}

/**
 * SMART COLLECTIONS REDIRECTOR
 * Shopify URLs: /collections/iphone-accessories or /collections/apple-iphone
 * Redirects to specific repair pages if a brand is detected, otherwise falls back to the shop.
 */
export default async function CollectionRedirectPage({ params }: PageProps) {
    const { lang, slug } = await params;
    const legacySlug = slug[slug.length - 1].toLowerCase();

    // Detect Brand or Intent
    if (legacySlug.includes('iphone') || legacySlug.includes('apple')) {
        permanentRedirect(`/${lang}/reparation/apple/iphone`);
    }
    if (legacySlug.includes('samsung')) {
        permanentRedirect(`/${lang}/reparation/samsung`);
    }
    if (legacySlug.includes('huawei')) {
        permanentRedirect(`/${lang}/reparation/huawei`);
    }
    if (legacySlug.includes('macbook')) {
        permanentRedirect(`/${lang}/reparation/apple/macbook`);
    }
    if (legacySlug.includes('console') || legacySlug.includes('ps5') || legacySlug.includes('xbox')) {
        permanentRedirect(`/${lang}/reparation`);
    }

    // Default Fallback
    permanentRedirect(`/${lang}/products`);
}
