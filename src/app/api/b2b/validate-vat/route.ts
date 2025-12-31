import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { vatNumber } = await request.json();

        if (!vatNumber) {
            return NextResponse.json({ error: 'Missing VAT number' }, { status: 400 });
        }

        // Clean the VAT number (remove dots, spaces)
        const cleanVat = vatNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        // Simple Belgian VAT regex: BE followed by 10 digits (often starting with 0 or 1)
        const beRegex = /^BE[01]\d{9}$/;

        if (!beRegex.test(cleanVat)) {
            return NextResponse.json({
                isValid: false,
                message: 'Invalid format. Use BE0XXX.XXX.XXX'
            });
        }

        // In a real production environment, we would call VIES API here.
        // For now, since we want the "baby" to grow up but not over-engineer, 
        // we'll perform a basic checksum or internal list check if we had one.
        // Let's implement a mock VIES check that returns true for the regex-matching BE numbers
        // but could be expanded later to full VIES.

        return NextResponse.json({
            isValid: true,
            countryCode: 'BE',
            vatId: cleanVat.substring(2),
            message: 'VAT format validated'
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
