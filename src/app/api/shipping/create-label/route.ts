import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
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

        const parcelData: any = {
            name: customer.name,
            address: customer.address,
            city: customer.city,
            postal_code: customer.zip,
            country: 'BE', // Assuming Belgium for now
            email: customer.email,
            telephone: customer.phone,
            request_label: true,
            shipment: {
                id: 8 // Default to bpost (need to verify ID, usually 8 or similar for bpost in BE)
            }
        };

        // If service point is selected, add it
        if (servicePoint) {
            parcelData.to_service_point = servicePoint.id;
            // When sending to a service point, the address fields should technically be the service point's?
            // SendCloud usually handles this via 'to_service_point' ID.
            // But we might need to ensure the 'address' fields are still provided (maybe customer's or service point's).
            // Usually for service point delivery, you provide the customer's info + service point ID.
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
            console.error('SendCloud API Error:', errorData);
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
