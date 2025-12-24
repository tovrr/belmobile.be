import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { createSlug } from '../utils/slugs';
import { RepairPricing } from '../types';
import { getDeviceImage } from '../data/deviceImages';

export interface RepairData extends RepairPricing {
    imageUrl?: string;
    isCustom?: boolean;
}

export const useRepairData = (brand: string, model: string) => {
    const [data, setData] = useState<RepairData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!brand || !model) {
            // Reset state if inputs invalid (defer to avoid sync render warning)
            const timer = setTimeout(() => {
                setData(null);
                setLoading(false);
            }, 0);
            return () => clearTimeout(timer);
        }

        const slug = createSlug(`${brand} ${model}`);
        const staticImage = getDeviceImage(slug);

        // Initial state (empty pricing, just ID and Image)
        const initialData: RepairData = {
            id: slug,
            issueId: '', // Default placeholder
            price: 0,    // Default placeholder
            imageUrl: staticImage || undefined,
            isCustom: false
        };

        // Subscribe to Firestore for overrides
        let unsubscribe = () => { };

        try {
            unsubscribe = onSnapshot(doc(db, 'repair_prices', slug), (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const firestoreData = docSnapshot.data() as Partial<RepairPricing> & { imageUrl?: string };

                    // Merge strategies: Firestore Only
                    setData({
                        ...initialData,
                        ...firestoreData,
                        isCustom: true
                    });
                } else {
                    // No data found in Firestore
                    setData(initialData);
                }
                setLoading(false);
            }, (error) => {
                // Silence permission errors as they are expected for public users if rules are strict
                if (error.code !== 'permission-denied') {
                    console.error("Error fetching repair pricing:", error);
                }
                // Ensure we fallback to basic data
                setData(initialData);
                setLoading(false);
            });
        } catch (err) {
            console.warn("Firestore subscription failed", err);
            setTimeout(() => setLoading(false), 0);
        }

        return () => unsubscribe();
    }, [brand, model]);

    return { data, loading };
};
