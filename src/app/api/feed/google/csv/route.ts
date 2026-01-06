
import { NextRequest, NextResponse } from 'next/server';
import { getAllDevices, getPriceQuote } from '@/services/server/pricing.dal';

/**
 * GOOGLE MERCHANT CENTER DYNAMIC FEED (CSV VERSION)
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
        const csvRows: string[] = [];

        // CSV Header (Tab Separated usually works best, but Comma is standard)
        // GMC Columns: id, title, description, link, image_link, availability, price, brand, condition, google_product_category, custom_label_0 (Device), custom_label_1 (Service), custom_label_2 (Quality)
        csvRows.push(
            [
                'id',
                'title',
                'description',
                'link',
                'image_link',
                'availability',
                'price',
                'brand',
                'condition',
                'google_product_category',
                'custom_label_0', // Device (e.g. iPhone 13)
                'custom_label_1', // Service (e.g. Screen Replacement)
                'custom_label_2'  // Quality (e.g. Original)
            ].join('\t')
        );

        // Fetch pricing data for all devices
        // Batching for performance
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

            // Helper to escape CSV fields
            const safe = (str: string) => `"${str.replace(/"/g, '""')}"`;

            if (type === 'repair') {
                // EXPANDED REPAIR LIST (Matching our DAL capabilities)
                const repairIssues = [
                    { id: 'screen_generic', label: { fr: 'Écran (Eco)', nl: 'Scherm (Eco)', en: 'Screen (Eco)', tr: 'Ekran (Eco)' }, q: 'Eco' },
                    { id: 'screen_oled', label: { fr: 'Écran (OLED)', nl: 'Scherm (OLED)', en: 'Screen (OLED)', tr: 'Ekran (OLED)' }, q: 'Premium' },
                    { id: 'screen_original', label: { fr: 'Écran (Original)', nl: 'Scherm (Origineel)', en: 'Screen (Original)', tr: 'Ekran (Orijinal)' }, q: 'Original' },
                    { id: 'battery', label: { fr: 'Batterie', nl: 'Batterij', en: 'Battery', tr: 'Batarya' }, q: 'High Capacity' },
                    { id: 'charging', label: { fr: 'Connecteur Charge', nl: 'Laadconnector', en: 'Charging Port', tr: 'Şarj Soketi' }, q: 'Original' },
                    { id: 'camera', label: { fr: 'Caméra', nl: 'Camera', en: 'Camera', tr: 'Kamera' }, q: 'Original' },
                    { id: 'back_glass', label: { fr: 'Vitre Arrière', nl: 'Achterglas', en: 'Back Glass', tr: 'Arka Cam' }, q: 'Laser' }
                ];

                for (const issue of repairIssues) {
                    // Dynamic Access to Quote Properties
                    const price = (quote.repair as any)[issue.id];

                    // Filter: Must have valid price > 0
                    if (!price || typeof price !== 'number' || price <= 0) continue;

                    // Title Construction (Explicit & Keyword Rich)
                    // e.g. "Réparation Écran (Original) iPhone 13 - Bruxelles"
                    const serviceName = lang === 'fr' ? 'Réparation' : (lang === 'nl' ? 'Reparatie' : 'Repair');
                    const title = `${serviceName} ${issue.label[lang]} ${deviceName} - Belmobile`;

                    // Description (Localized + Trust Signals)
                    const warrLabel = lang === 'fr' ? 'Garantie 1 an' : (lang === 'nl' ? '1 jaar garantie' : '1 Year Warranty');
                    const timeLabel = lang === 'fr' ? '30 min' : '30 min';
                    const description = `${title}. ${timeLabel}. ${warrLabel}. Brussels.`;

                    const row = [
                        `repair_${id}_${issue.id}_${lang}`,         // ID
                        safe(title),                                // Title
                        safe(description),                          // Description
                        `${baseUrl}/${lang}/repair/${id.replace('-', '/')}`, // Link
                        quote.deviceImage || `${baseUrl}/images/devices/${id}.png`, // Image
                        'in_stock',                                 // Availability
                        `${price.toFixed(2)} EUR`,                  // Price
                        'Belmobile',                                // Brand (Service Brand)
                        'new',                                      // Condition (Parts are new)
                        '8126',                                     // Category: Phone Repair
                        safe(deviceName),                           // Label 0: Device
                        safe(issue.label[lang]),                    // Label 1: Service Type
                        safe(issue.q)                               // Label 2: Quality Tier
                    ].join('\t');

                    csvRows.push(row);
                }

            } else if (type === 'buyback') {
                // Buyback Logic (Max Price)
                const price = quote.buyback.maxPrice;
                if (price > 0) {
                    const title = quote.seo[lang].buyback.title;
                    const description = quote.seo[lang].buyback.description;

                    const row = [
                        `buyback_${id}_${lang}`,
                        safe(title),
                        safe(description),
                        `${baseUrl}/${lang}/buyback/${id.replace('-', '/')}`,
                        quote.deviceImage || `${baseUrl}/images/devices/${id}.png`,
                        'in_stock',
                        `${price.toFixed(2)} EUR`,
                        'Belmobile',
                        'used',
                        '263', // Category: Mobile Phones
                        safe(deviceName),
                        'Buyback',
                        'Cash'
                    ].join('\t');

                    csvRows.push(row);
                }
            }
        }

        // Return CSV File
        return new NextResponse(csvRows.join('\n'), {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="belmobile_feed_${type}_${lang}.csv"`,
                'Cache-Control': 's-maxage=3600, stale-while-revalidate'
            }
        });

    } catch (error) {
        console.error('[GoogleFeedCSV] Error:', error);
        return new NextResponse(`Error generating CSV feed: ${String(error)}`, { status: 500 });
    }
}
