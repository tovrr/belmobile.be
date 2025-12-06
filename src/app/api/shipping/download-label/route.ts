import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const labelUrl = searchParams.get('url');

    if (!labelUrl) {
        return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    try {
        const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
        const secretKey = process.env.SENDCLOUD_SECRET_KEY;

        if (!publicKey || !secretKey) {
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        const auth = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');

        console.log(`Downloading label from: ${labelUrl}`);
        const response = await fetch(labelUrl, {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch label from SendCloud: ${response.status} ${response.statusText}`);
            return NextResponse.json({ error: 'Failed to fetch label from provider' }, { status: response.status });
        }

        const pdfBuffer = await response.arrayBuffer();
        console.log(`Successfully fetched PDF, size: ${pdfBuffer.byteLength} bytes`);

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="shipping-label.pdf"'
            }
        });

    } catch (error) {
        console.error('Error downloading label:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
