import { NextRequest, NextResponse } from 'next/server';
import { fetchMarketData } from '@/lib/market-intelligence/scrapers';
import { verifyAdminToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { brand, model } = body;

        if (!brand || !model) {
            return NextResponse.json({ error: 'Brand and Model are required' }, { status: 400 });
        }

        if (!verifyAdminToken(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await fetchMarketData(brand, model);

        if (!data) {
            return NextResponse.json({ error: 'Could not fetch market data' }, { status: 404 });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('[API] Market Price Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
