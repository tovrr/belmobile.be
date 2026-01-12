
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // 1. Search in Quotes
        const quotesRef = adminDb.collection('quotes');
        const quotesSnapshot = await quotesRef.where('trackingToken', '==', token).limit(1).get();

        if (!quotesSnapshot.empty) {
            const doc = quotesSnapshot.docs[0];
            const data = doc.data();
            // Serialize timestamps and add ID
            return NextResponse.json({
                ...data,
                id: doc.id,
                type: data.type || 'repair',
                createdAt: data.createdAt ? { seconds: data.createdAt._seconds || data.createdAt.seconds } : null,
                date: data.date || null
            });
        }

        // 2. Search in Reservations
        const resRef = adminDb.collection('reservations');
        const resSnapshot = await resRef.where('trackingToken', '==', token).limit(1).get();

        if (!resSnapshot.empty) {
            const doc = resSnapshot.docs[0];
            const data = doc.data();
            return NextResponse.json({
                ...data,
                id: doc.id,
                type: 'reservation',
                createdAt: data.createdAt ? { seconds: data.createdAt._seconds || data.createdAt.seconds } : null,
                date: data.date || null
            });
        }

        return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    } catch (error) {
        console.error('Track Order API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
