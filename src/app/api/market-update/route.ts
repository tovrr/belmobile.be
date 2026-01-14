import { NextRequest, NextResponse } from 'next/server';
import { updateMarketPrice } from '@/services/server/pricing.dal';
import { logger } from '@/utils/logger';

export async function POST(req: NextRequest) {
    // 1. Security: Validate API Key
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { deviceId, price, source } = body;

        // 2. Validation
        if (!deviceId || typeof price !== 'number') {
            return NextResponse.json({ error: 'Invalid Payload' }, { status: 400 });
        }

        // 3. Sanity Checks (Prevent Price Bombs)
        // Flag extreme updates or invalid bounds
        if (price < 50 || price > 2500) {
            logger.warn(`[MarketAPI] Price suspended. Outside safety bounds`, { deviceId, price, action: 'market_update_suspended' });
            return NextResponse.json({
                warning: 'Price flagged for review (Out of bounds)',
                success: false
            }, { status: 202 });
        }

        // 4. Update DAL
        const result = await updateMarketPrice(deviceId, price, source || 'api-scraper');

        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 404 });
        }

        // 5. Revalidate Cache (Optional if using ISR)
        // revalidateTag('pricing'); 

        return NextResponse.json({ success: true, deviceId, newPrice: price });

    } catch (error) {
        console.error('[MarketAPI] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
