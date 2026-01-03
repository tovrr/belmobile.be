import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { vatNumber } = await request.json();

        if (!vatNumber) {
            return NextResponse.json({ error: 'Missing VAT number' }, { status: 400 });
        }

        // Clean the VAT number (remove dots, spaces)
        const cleanVat = vatNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        let countryCode = 'BE';
        let vatId = cleanVat;

        if (cleanVat.startsWith('BE')) {
            countryCode = 'BE';
            vatId = cleanVat.substring(2);
        } else if (/^[A-Z]{2}/.test(cleanVat)) {
            countryCode = cleanVat.substring(0, 2);
            vatId = cleanVat.substring(2);
        }

        console.log(`[VAT] Validating ${countryCode}${vatId} via VIES...`);

        try {
            const response = await fetch('https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    countryCode,
                    vatNumber: vatId
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`VIES API returned ${response.status}`);
            }

            const data = await response.json();

            // VIES REST API returns { isValid: boolean, name: string, address: string, ... }
            return NextResponse.json({
                isValid: data.isValid,
                name: data.name && data.name !== '---' ? data.name : null,
                address: data.address && data.address !== '---' ? data.address : null,
                countryCode,
                vatId,
                message: data.isValid ? 'VAT validated' : 'Invalid VAT number'
            });
        } catch (apiError) {
            console.warn('[VAT] VIES API call failed, falling back to regex', apiError);
            // Fallback to regex if VIES is down
            const beRegex = /^BE[01]\d{9}$/;
            const isValid = countryCode === 'BE' && beRegex.test(cleanVat);

            return NextResponse.json({
                isValid,
                message: isValid ? 'VAT format validated (VIES offline)' : 'Invalid VAT number'
            });
        }


    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
