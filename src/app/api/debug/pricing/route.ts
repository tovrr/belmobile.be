
import { NextRequest, NextResponse } from 'next/server';
import { getPriceQuote, getPricingData } from '@/services/server/pricing.dal';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    try {
        const quote = await getPriceQuote(slug);
        const raw = await getPricingData(slug);
        
        return NextResponse.json({
             buyback: quote?.buyback,
             repair: quote?.repair,
             rawBuyback: raw.buyback,
             seoTitles: quote?.seo
        });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
