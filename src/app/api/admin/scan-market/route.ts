import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { deviceId, modelName } = await request.json();

        // In a real deployment, this would trigger a Cloud Function or a separate worker.
        // For this local/demo version, we will just log it.
        // The User can run the script manually: `node src/scripts/price-war-scraper.js "iPhone 13"`

        console.log(`[API] Requesting Market Scan for: ${modelName} (${deviceId})`);

        return NextResponse.json({
            success: true,
            message: 'Market scan initiated. Results will appear in the Radar shortly.',
            commandToRun: `node src/scripts/price-war-scraper.js "${modelName}" "${deviceId}"`
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to initiate scan' }, { status: 500 });
    }
}
