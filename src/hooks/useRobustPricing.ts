import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, onSnapshot, setDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { RepairPriceRecord } from '../types';
import { standardizeDeviceId } from '../utils/pricing-utils';

export const useRobustPricing = (deviceId: string | null) => {
    const [prices, setPrices] = useState<RepairPriceRecord[]>([]);
    const [prevDeviceId, setPrevDeviceId] = useState<string | null>(deviceId);

    if (deviceId !== prevDeviceId) {
        setPrevDeviceId(deviceId);
        setPrices([]);
    }

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cache to prevent refetching immediately if component remounts quickly with same deviceId
    // Using useRef for cache to avoid missing dependency warning / infinite loops.
    const cacheRef = useRef<Record<string, RepairPriceRecord[]>>({});

    useEffect(() => {
        if (!deviceId) return;


        const dId = standardizeDeviceId(deviceId);

        // Optimistic cache check
        if (cacheRef.current[dId]) {
            setPrices(cacheRef.current[dId]);
            setLoading(false);
        } else {
            setLoading(true);
        }

        const q = query(
            collection(db, 'repair_prices'),
            where('deviceId', '==', dId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as RepairPriceRecord));

            setPrices(data);
            cacheRef.current[deviceId] = data;
            setLoading(false);
        }, (err) => {
            console.error("Error fetching robust prices:", err);
            setError(err instanceof Error ? err.message : String(err));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [deviceId]);

    const updatePrice = useCallback(async (
        issueId: string,
        variants: Record<string, string>,
        price: number,
        isActive: boolean = true,
        partCost?: number,
        laborMinutes?: number
    ) => {
        if (!deviceId) return;

        // CRITICAL FIX: Match the ID generation logic of the Seeder (BatchPricingTools)
        // Seeder uses: variantValues.join('-')
        // Admin previously used: key-value pairs.
        // We must align to Seeder to avoid ghost records.

        // const variantValues = Object.values(variants || {})
        //     .map(v => String(v).toLowerCase())
        //     .filter(v => v !== 'base'); // Filter out 'base' if present? Seeder logic: if empty 'base'.

        // Note: Seeder sorting logic isn't explicit in `Object.values`, but usually insertion order.
        // However, `useRepairDefaults` defines variants in specific order. 
        // For 'screen', it's usually just { quality: 'oled' }.
        // Let's assume simpler Value-based slug.

        let variantSuffix = 'base';
        if (Object.keys(variants).length > 0) {
            // Try to match Seeder: just the values joined by hyphens.
            // But we need to be careful about order.
            // If we sort by values? Or keys?
            // Seeder: `Object.values(rec.variants)` -> defined in data/models/*.ts
            // We should try to replicate the exact slug if possible. 
            // Given the current mess, we will try to construct the ID based on VALUES only.

            // Sorting by Key ensures consistency even if object property order changes.
            const sortedValues = Object.entries(variants)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([, v]) => v)
                .join('-');

            variantSuffix = sortedValues || 'base';
        }

        const dId = standardizeDeviceId(deviceId);
        const docId = `${dId}_${issueId}_${variantSuffix}`;

        const priceRecord: RepairPriceRecord = {
            deviceId: dId,
            issueId,
            variants,
            price,
            currency: 'EUR',
            isActive,
            isManual: true, // Mark as manual edit for priority boost
            partCost: partCost ?? 0,
            laborMinutes: laborMinutes ?? 30, // Default to 30 mins if not set
            updatedAt: new Date().toISOString()
        };

        // Optimistic Update can be handled by the UI component using local state, 
        // as the snapshot listener will eventually confirm the save.

        try {
            await setDoc(doc(db, 'repair_prices', docId), priceRecord, { merge: true });
        } catch (err: unknown) {
            console.error("Error updating price:", err);
            throw err;
        }
    }, [deviceId]);

    const deleteIssue = useCallback(async (issueId: string) => {
        if (!deviceId) return;

        // 1. Find all documents for this device + issue
        // Since our query above only filters by separate fields, we can filter the local 'prices' or do a new query.
        // A new query is safer to ensure we get everything on server.

        try {
            const dId = deviceId.toLowerCase();
            const q = query(
                collection(db, 'repair_prices'),
                where('deviceId', '==', dId),
                where('issueId', '==', issueId)
            );

            const snapshot = await getDocs(q);
            const batch = writeBatch(db);

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
        } catch (err: unknown) {
            console.error("Error deleting issue:", err);
            throw err;
        }
    }, [deviceId]);

    return { prices, loading, error, updatePrice, deleteIssue };
};
