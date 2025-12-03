import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        console.log('SendCloud Webhook Payload:', payload);

        // SendCloud payload structure for parcel updates usually includes:
        // parcel: { id, status, tracking_number, tracking_url, ... }
        // or just the fields directly depending on the specific webhook event.
        // We'll assume a standard structure or handle the fields we need.

        const { parcel, action } = payload;

        if (action === 'parcel_status_changed' && parcel) {
            const { id: sendcloudParcelId, status, tracking_url, order_number } = parcel;

            // Find the quote/order associated with this parcel
            // We might have stored the SendCloud Parcel ID or we can look up by order number (quote ID)

            let quoteDoc = null;

            // Strategy 1: Look up by Quote ID if 'order_number' matches our Quote ID
            if (order_number) {
                const quoteRef = doc(db, 'quotes', order_number);
                // We can't verify existence easily without reading, but updateDoc fails if not found? 
                // Better to query if we are not sure order_number is exactly the ID.
                // Let's try to query by ID first.
                // actually doc() creates a reference.
            }

            // Strategy 2: Query by a stored 'sendcloudParcelId' if we saved it (we haven't yet).
            // Strategy 3: Query by 'id' (Quote ID) assuming order_number is the Quote ID.

            if (order_number) {
                const q = query(collection(db, 'quotes'), where('id', '==', order_number));
                // Note: 'id' field in our docs is usually the doc ID, but we also store it as a field sometimes?
                // In our previous code: const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // So 'id' is the doc ID.

                // If order_number IS the doc ID:
                const docRef = doc(db, 'quotes', order_number);

                // Map SendCloud status to our status
                // SendCloud statuses: 'announced', 'unannounced', 'created', 'sent', 'arrived', 'out_for_delivery', 'delivered', 'cancelled', 'error'

                let newStatus = 'processing';
                if (status.id === 11 || status.message === 'Delivered') { // 11 is often delivered
                    newStatus = 'closed'; // or 'completed'
                } else if (status.message === 'Out for delivery') {
                    newStatus = 'processing';
                }

                await updateDoc(docRef, {
                    shippingStatus: status.message, // Store the specific shipping status
                    trackingUrl: tracking_url,
                    sendcloudParcelId: sendcloudParcelId,
                    lastUpdate: new Date().toISOString()
                });

                return NextResponse.json({ message: 'Quote updated successfully' });
            }
        }

        return NextResponse.json({ message: 'Webhook received' });
    } catch (error) {
        console.error('Error processing SendCloud webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
