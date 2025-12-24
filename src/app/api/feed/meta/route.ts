import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { RepairPriceRecord, BuybackPriceRecord } from '../../../../types';

// Types
interface FeedItem {
    id: string;
    title: string;
    description: string;
    availability: 'in_stock' | 'out_of_stock'; // Meta required
    condition: 'new' | 'refurbished' | 'used';
    price: string; // "100.00 EUR"
    link: string;
    image_link: string;
    brand: string;
    google_product_category?: string; // e.g. "Electronics > Electronics Accessories" or Service ID
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'repair'; // repair | buyback | products
    const baseUrl = 'https://belmobile.be';

    const items: FeedItem[] = [];

    try {
        if (type === 'repair') {
            // --- REPAIR FEED ---
            // Goals: List "Screen Repair for iPhone 13", "Battery Replacement for Samsung S21", etc.
            // Source: We iterate over known models and their known issues.
            // Best approach: Use `repair_prices` collection for active prices, fallback to static defaults for coverage.

            // 1. Fetch Active Prices
            const q = query(collection(db, 'repair_prices'), where('isActive', '==', true));
            const snapshot = await getDocs(q);

            const processedKeys = new Set<string>();

            snapshot.forEach(doc => {
                const data = doc.data() as RepairPriceRecord;
                // We only want "main" issues to avoid spamming the feed (Screen, Battery)
                if (!['screen', 'battery', 'charging_port'].includes(data.issueId)) return;

                const uniqueKey = `${data.deviceId}_${data.issueId}`;
                if (processedKeys.has(uniqueKey)) return; // Avoid duplicates (variants)
                processedKeys.add(uniqueKey);

                // Construct Title
                // deviceId is usually slug "apple-iphone-13". Try to make it readable.
                const deviceName = data.deviceId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                const issueName = data.issueId.charAt(0).toUpperCase() + data.issueId.slice(1);

                items.push({
                    id: uniqueKey,
                    title: `${issueName} Repair - ${deviceName}`,
                    description: `Professional ${issueName} repair for ${deviceName}. Includes 1 year warranty. Done in 30 minutes.`,
                    availability: 'in_stock',
                    condition: 'new', // Service is "new"
                    price: `${data.price.toFixed(2)} EUR`,
                    link: `${baseUrl}/en/repair/${data.deviceId}?issue=${data.issueId}`, // Deep link
                    image_link: `${baseUrl}/images/devices/${data.deviceId}.png`, // improved later
                    brand: 'Belmobile',
                    google_product_category: '8126' // "Phone & Tablet Repair" (approximate)
                });
            });

        } else if (type === 'buyback') {
            // --- BUYBACK FEED (Offers) ---
            // "Sell your iPhone 13 - Get up to €400"
            const q = query(collection(db, 'buyback_pricing'));
            const snapshot = await getDocs(q);

            snapshot.forEach(doc => {
                const data = doc.data() as BuybackPriceRecord;
                // Deduplicate by device? Or show all storage variants?
                // Meta prefers distinct products.
                const uniqueKey = `${data.deviceId}_${data.storage}`;
                const deviceName = data.deviceId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                items.push({
                    id: `buyback_${uniqueKey}`,
                    title: `Sell your ${deviceName} (${data.storage})`,
                    description: `Get paid instantly for your ${deviceName} ${data.storage}. Best price guaranteed.`,
                    availability: 'in_stock', // "We are buying"
                    condition: 'used',
                    price: `${data.price.toFixed(2)} EUR`, // Offer price
                    link: `${baseUrl}/en/buyback/${data.deviceId}`,
                    image_link: `${baseUrl}/images/devices/${data.deviceId}.png`,
                    brand: 'Belmobile',
                    google_product_category: '263' // Mobile Phones
                });
            });
        }
    } catch (e) {
        console.error("Feed generation error", e);
        return new NextResponse(`Error generating feed: ${String(e)}`, { status: 500 });
    }

    // Generate XML
    const xml = `<?xml version="1.0"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Belmobile ${type.charAt(0).toUpperCase() + type.slice(1)} Feed</title>
<link>${baseUrl}</link>
<description>Belmobile Services</description>
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
${item.google_product_category ? `<g:google_product_category>${item.google_product_category}</g:google_product_category>` : ''}
</item>
`).join('')}
</channel>
</rss>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate'
        }
    });
}

function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
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
