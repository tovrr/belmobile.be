import axios from 'axios';
import * as cheerio from 'cheerio';

// Mock User-Agent to avoid immediate 403 blocks (though rotation is better)
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
};

/**
 * Scrape eBay for "Sold" listings to estimate current market value.
 * Filters for "Cell Phones & Smartphones" category if possible to reduce noise.
 */
export async function fetchEbaySoldAvg(query: string): Promise<number | null> {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.ebay.fr/sch/i.html?_nkw=${encodedQuery}&LH_Sold=1&LH_Complete=1&_ipg=60`;

        console.log(`[Scraper] Fetching eBay: ${url} ...`);

        // Add Timeout & Explicit Headers
        const response = await axios.get(url, {
            headers: HEADERS,
            timeout: 5000
        });

        const $ = cheerio.load(response.data);

        const prices: number[] = [];

        $('.s-item__price').each((_, element) => {
            const priceText = $(element).text().trim();
            const match = priceText.match(/[\d,.]+/);
            if (match) {
                const numStr = match[0].replace(/,/g, '');
                const price = parseFloat(numStr);

                if (!isNaN(price) && price > 50 && price < 3000) {
                    prices.push(price);
                }
            }
        });

        if (prices.length === 0) {
            console.warn('[Scraper] Zero items found. Falling back to internal estimate.');
            return estimateMarketValue(query);
        }

        const sum = prices.reduce((a, b) => a + b, 0);
        const avgUsd = sum / prices.length;
        const avgEur = Math.round(avgUsd * 0.92);

        // console.log(`[Scraper] eBay ${query}: Found ${prices.length} items. Avg: ${avgUsd.toFixed(2)} USD (~${avgEur} EUR)`);

        return avgEur;

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`[Scraper] eBay Error for ${query}:`, msg);
        return estimateMarketValue(query);
    }
}

function estimateMarketValue(query: string): number {
    const q = query.toLowerCase();

    // Rough approximations for demo
    if (q.includes('iphone 15 pro max')) return 950;
    if (q.includes('iphone 15 pro')) return 850;
    if (q.includes('iphone 15')) return 600;
    if (q.includes('iphone 14 pro')) return 700;
    if (q.includes('iphone 14')) return 450;
    if (q.includes('iphone 13 pro')) return 500;
    if (q.includes('iphone 13')) return 350;
    if (q.includes('iphone 12')) return 250;
    if (q.includes('iphone 11')) return 200;

    if (q.includes('s24')) return 600;
    if (q.includes('s23')) return 450;
    if (q.includes('s22')) return 300;

    return 150; // Generic fallback
}

export async function fetchPartCostEstimate(brand: string, model: string): Promise<{ screen: number, battery: number }> {
    const b = brand.toLowerCase();
    const m = model.toLowerCase();

    let screen = 0;
    let battery = 20;

    if (b === 'apple') {
        if (m.includes('15')) {
            screen = m.includes('pro') ? (m.includes('max') ? 380 : 350) : 280;
            battery = 45;
        } else if (m.includes('14')) {
            screen = m.includes('pro') ? 300 : 180;
            battery = 35;
        } else if (m.includes('13')) {
            screen = m.includes('pro') ? 220 : 110;
            battery = 25;
        } else if (m.includes('12')) {
            screen = 90;
            battery = 20;
        } else if (m.includes('11')) {
            screen = m.includes('pro') ? 80 : 40;
            battery = 15;
        } else {
            screen = 30;
            battery = 10;
        }
    } else if (b === 'samsung') {
        if (m.includes('s24')) { screen = 250; battery = 40; }
        else if (m.includes('s23')) { screen = 200; battery = 35; }
        else if (m.includes('s22')) { screen = 160; battery = 30; }
        else if (m.includes('s21')) { screen = 120; battery = 25; }
        else if (m.includes('fold')) { screen = 400; battery = 60; }
        else if (m.includes('flip')) { screen = 300; battery = 40; }
        else { screen = 80; battery = 20; }
    } else {
        screen = 60;
        battery = 15;
    }

    return { screen, battery };
}

export interface MarketData {
    avgPrice: number;
    currency: string;
    samples: number;
    partCosts: {
        screen: number;
        battery: number;
    };
    source: string;
    lastUpdated: string;
}

export async function fetchMarketData(brand: string, model: string): Promise<MarketData | null> {
    const query = `${brand} ${model}`;

    const [ebayPrice, parts] = await Promise.all([
        fetchEbaySoldAvg(query),
        fetchPartCostEstimate(brand, model)
    ]);

    if (!ebayPrice) return null;

    return {
        avgPrice: ebayPrice,
        currency: 'EUR',
        samples: 10,
        partCosts: parts,
        source: 'eBay Sold Listings + Estimate',
        lastUpdated: new Date().toISOString()
    };
}
