import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAllDevices, getPriceQuote } from '@/services/server/pricing.dal';
import { SERVICES } from '@/data/services';

/**
 * GOOGLE MERCHANT CENTER DYNAMIC FEED
 * Powers Google Shopping, Google Business Profile (Local Inventory), and Performance Max.
 * 
 * Query Params:
 * - lang: fr | nl | en | tr (default: fr)
 * - type: repair | buyback (default: repair)
 */

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') as 'fr' | 'nl' | 'en' | 'tr') || 'fr';
    const type = searchParams.get('type') || 'repair';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://belmobile.be';

    try {
        const deviceIds = await getAllDevices();
        const items: any[] = [];

        // Fetch pricing data for all devices (Batch processing would be better, but DAL is cached)
        const quotes = await Promise.all(
            deviceIds.map(async (id) => {
                const quote = await getPriceQuote(id);
                return { id, quote };
            })
        );

        for (const { id, quote } of quotes) {
            if (!quote) continue;

            const brand = id.split('-')[0].charAt(0).toUpperCase() + id.split('-')[0].slice(1);
            const model = id.split('-').slice(1).join(' ').replace(/\b\w/g, c => c.toUpperCase());
            const deviceName = `${brand} ${model}`;

            if (type === 'repair') {
                // Generate repair entries (Screen & Battery are high-intent for Google)
                const issues = [
                    { id: 'screen', name: { fr: 'Écran', nl: 'Scherm', en: 'Screen', tr: 'Ekran' } },
                    { id: 'battery', name: { fr: 'Batterie', nl: 'Batterij', en: 'Battery', tr: 'Batarya' } }
                ];

                for (const issue of issues) {
                    const price = (quote.repair as any)[issue.id === 'screen' ? 'screen_generic' : 'battery'] || 0;
                    if (price <= 0) continue;

                    const title = `${lang === 'fr' ? 'Réparation' : (lang === 'nl' ? 'Reparatie' : 'Repair')} ${issue.name[lang]} ${deviceName}`;
                    const description = quote.seo[lang].repair.description;

                    items.push({
                        id: `repair_${id}_${issue.id}_${lang}`,
                        title,
                        description,
                        link: `${baseUrl}/${lang}/repair/${id.replace('-', '/')}`,
                        image_link: quote.deviceImage || `${baseUrl}/images/devices/${id}.png`,
                        price: `${price.toFixed(2)} EUR`,
                        availability: 'in_stock',
                        condition: 'new',
                        brand: 'Belmobile',
                        google_product_category: '8126', // Phone Repair Service
                        custom_label_0: brand,
                        custom_label_1: 'Repair'
                    });
                }
            } else if (type === 'buyback') {
                // Generate buyback entries
                const price = quote.buyback.maxPrice;
                if (price <= 0) continue;

                const title = quote.seo[lang].buyback.title;
                const description = quote.seo[lang].buyback.description;

                items.push({
                    id: `buyback_${id}_${lang}`,
                    title,
                    description,
                    link: `${baseUrl}/${lang}/buyback/${id.replace('-', '/')}`,
                    image_link: quote.deviceImage || `${baseUrl}/images/devices/${id}.png`,
                    price: `${price.toFixed(2)} EUR`,
                    availability: 'in_stock',
                    condition: 'used',
                    brand: 'Belmobile',
                    google_product_category: '263', // Mobile Phones
                    custom_label_0: brand,
                    custom_label_1: 'Buyback'
                });
            }
        }

        // --- XML Construction ---
        const xml = `<?xml version="1.0"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
    <title>Belmobile Google Feed (${type.toUpperCase()} - ${lang.toUpperCase()})</title>
    <link>${baseUrl}</link>
    <description>Dynamic pricing feed for Belmobile Brussels</description>
    ${items.map(item => `
    <item>
        <g:id>${item.id}</g:id>
        <g:title>${escapeXml(item.title)}</g:title>
        <g:description>${escapeXml(item.description)}</g:description>
        <g:link>${item.link}</g:link>
        <g:image_link>${item.image_link}</g:image_link>
        <g:brand>${escapeXml(item.brand)}</g:brand>
        <g:condition>${item.condition}</g:condition>
        <g:availability>${item.availability}</g:availability>
        <g:price>${item.price}</g:price>
        <g:google_product_category>${item.google_product_category}</g:google_product_category>
        <g:custom_label_0>${item.custom_label_0}</g:custom_label_0>
        <g:custom_label_1>${item.custom_label_1}</g:custom_label_1>
        <g:identifier_exists>no</g:identifier_exists>
    </item>`).join('')}
</channel>
</rss>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate'
            }
        });

    } catch (error) {
        console.error('[GoogleFeed] Error:', error);
        return new NextResponse(`Error generating feed: ${String(error)}`, { status: 500 });
    }
}

function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}
