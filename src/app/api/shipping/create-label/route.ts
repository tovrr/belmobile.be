import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        if (!verifyAdminToken(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { customer, servicePoint } = await request.json();

        const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
        const secretKey = process.env.SENDCLOUD_SECRET_KEY;

        if (!publicKey || !secretKey) {
            return NextResponse.json({ error: 'SendCloud API keys not configured' }, { status: 500 });
        }

        // Construct Basic Auth header
        const auth = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');

        // Prepare parcel data
        // Note: By default, this creates a shipment FROM the shop TO the customer.
        // If this is a Buyback (Return), we might need a different flow (e.g. Return Portal),
        // but for now we'll generate a standard label.

        const parcelData: Record<string, unknown> = {
            name: customer.name,
            address: customer.address,
            city: customer.city,
            postal_code: customer.zip,
            country: 'BE', // Assuming Belgium for now
            email: customer.email,
            telephone: customer.phone,
            request_label: true,
            // shipment: {
            //     id: 8 // User suggested rules might be in play. Letting SendCloud decide.
            // }
        };

        // If service point is selected, add it
        if (servicePoint) {
            // Ensure ID is an integer
            const spId = parseInt(servicePoint.id);
            if (!isNaN(spId)) {
                parcelData.to_service_point = spId;
            } else {
                console.warn('Invalid Service Point ID (not a number):', servicePoint.id);
            }
        }

        const response = await fetch('https://panel.sendcloud.sc/api/v2/parcels', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ parcel: parcelData })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('SendCloud API Error Full:', JSON.stringify(errorData, null, 2));
            return NextResponse.json({ error: 'Failed to create label', details: errorData }, { status: response.status });
        }

        const data = await response.json();
        const parcel = data.parcel;

        return NextResponse.json({
            labelUrl: parcel.label.label_printer, // or normal_printer
            trackingNumber: parcel.tracking_number,
            trackingUrl: parcel.tracking_url,
            id: parcel.id
        });

    } catch (error) {
        console.error('Error creating shipping label:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
