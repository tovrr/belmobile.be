import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { BuybackPriceRecord, BuybackCondition } from '../types';

export const useBuybackPricing = (deviceId: string) => {
    const [prices, setPrices] = useState<BuybackPriceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const [prevDeviceId, setPrevDeviceId] = useState(deviceId);

    // Pattern: Reset state during render when prop changes
    if (deviceId !== prevDeviceId) {
        setPrevDeviceId(deviceId);
        setPrices([]);
        setLoading(true);
    }

    useEffect(() => {
        if (!deviceId) return;

        // Note: loading is already set to true by the render-phase update above if deviceId changed.

        const q = query(
            collection(db, 'buyback_pricing'),
            where('deviceId', '==', deviceId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: BuybackPriceRecord[] = [];
            snapshot.forEach((doc) => {
                fetched.push(doc.data() as BuybackPriceRecord);
            });
            setPrices(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching buyback prices:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [deviceId]);

    // Derived state for return values to avoid sync state updates
    // We can now return state directly as it is reset synchronously

    const updatePrice = async (
        storage: string,
        condition: BuybackCondition,
        price: number
    ) => {
        if (!deviceId) return;

        const docId = `${deviceId}_${storage}_${condition}`;
        const ref = doc(db, 'buyback_pricing', docId);

        const record: BuybackPriceRecord = {
            id: docId,
            deviceId,
            storage,
            condition,
            price,
            currency: 'EUR',
            updatedAt: new Date().toISOString()
        };

        try {
            await setDoc(ref, record, { merge: true });
        } catch (error) {
            console.error("Error saving buyback price:", error);
            throw error;
        }
    };

    return { prices, loading, updatePrice };
};
