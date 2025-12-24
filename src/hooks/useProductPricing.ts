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
import { ProductPriceRecord, ProductCondition } from '../types';

export const useProductPricing = (deviceId: string) => {
    const [prices, setPrices] = useState<ProductPriceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!deviceId) return; // Wait for ID

        // Reset state on ID change (defer to avoid sync render warning)
        setTimeout(() => setLoading(true), 0);

        const q = query(
            collection(db, 'product_pricing'),
            where('deviceId', '==', deviceId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: ProductPriceRecord[] = [];
            snapshot.forEach((doc) => {
                fetched.push(doc.data() as ProductPriceRecord);
            });
            setPrices(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching product prices:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [deviceId]);

    const updatePrice = async (
        storage: string,
        condition: ProductCondition,
        price: number
    ) => {
        if (!deviceId) return;

        const docId = `${deviceId}_${storage}_${condition}`;
        const ref = doc(db, 'product_pricing', docId);

        const record: ProductPriceRecord = {
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
            console.error("Error saving product price:", error);
            throw error;
        }
    };

    return { prices, loading, updatePrice };
};
