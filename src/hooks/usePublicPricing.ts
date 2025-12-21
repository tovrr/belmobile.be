import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { RepairPriceRecord, BuybackPriceRecord } from '../types';
import { standardizeDeviceId } from '../utils/pricing-utils';

export const usePublicPricing = (deviceSlug: string) => {
    const [repairPrices, setRepairPrices] = useState<Record<string, number>>({});
    const [buybackPrices, setBuybackPrices] = useState<BuybackPriceRecord[]>([]);
    const [deviceImage, setDeviceImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!deviceSlug) {
            setRepairPrices({});
            setBuybackPrices([]);
            setDeviceImage(null);
            return;
        }

        const fetchPrices = async () => {
            const dId = standardizeDeviceId(deviceSlug);
            setLoading(true);
            try {
                // --- 0. Fetch Device Metadata (Image) ---
                const mainDocRef = doc(db, 'repair_prices', dId);
                const mainSnap = await getDoc(mainDocRef);
                if (mainSnap.exists()) {
                    const data = mainSnap.data();
                    if (data.imageUrl) {
                        setDeviceImage(data.imageUrl);
                    }
                }

                // --- 1. Fetch Repair Prices ---
                const repairQ = query(
                    collection(db, 'repair_prices'),
                    where('deviceId', '==', dId),
                    where('isActive', '==', true)
                );
                const repairSnap = await getDocs(repairQ);
                const rPrices: Record<string, number> = {};
                // Helper to manage deterministic updates
                const updates: Record<string, { price: number, priority: number }> = {};
                const updatePrice = (key: string, price: number, priority: number) => {
                    const existing = updates[key];
                    if (!existing) {
                        updates[key] = { price, priority };
                        return;
                    }
                    // Strategy:
                    // 1. Higher priority wins.
                    // 2. Same priority? Use Math.min (cheaper price wins, also ensures -1/disabled wins if present).
                    //    This ensures stability (no random fluctuation on refresh).
                    if (priority > existing.priority) {
                        updates[key] = { price, priority };
                    } else if (priority === existing.priority) {
                        // Special handling: if one is -1 (disabled), does it win?
                        // If we want to hide it, -1 should probably win?
                        // Or if we have a valid price (100) and a disabled one (-1), maybe the valid one implies availability?
                        // User intent: If they have a duplicate, likely one is "Ghost".
                        // Usually "Ghost" is the Base Price legacy garbage.
                        // If Explicit Variant (Priority 2) has duplicates:
                        // 1. 'Generic' (-1) and 'Generic' (139).
                        // Min is -1. So it becomes disabled. Correct.

                        updates[key] = { price: Math.min(existing.price, price), priority };
                    }
                };

                repairSnap.forEach(doc => {
                    const data = doc.data() as RepairPriceRecord;

                    // --- SCREEN ---
                    if (data.issueId === 'screen') {
                        let mapped = false;
                        if (data.variants) {
                            const variantValues = Object.values(data.variants).map(v => String(v).toLowerCase());

                            if (variantValues.some(v => v.includes('original') || v.includes('service') || v.includes('refurb'))) {
                                updatePrice('screen_original', data.price, 2);
                                mapped = true;
                            }
                            // Check 'oled' separately to handle duplicates
                            if (variantValues.some(v => v.includes('oled') || v.includes('ams') || v.includes('soft') || v.includes('hard'))) {
                                updatePrice('screen_oled', data.price, 2);
                                mapped = true;
                            }
                            if (variantValues.some(v => v.includes('generic') || v.includes('incell') || v.includes('lcd') || v.includes('copy'))) {
                                updatePrice('screen_generic', data.price, 2);
                                mapped = true;
                            }
                        }

                        // Fallback: If NOT mapped to a variant, it's a generic base screen.
                        if (!mapped) {
                            updatePrice('screen_generic', data.price, 1); // Low Priority
                        }
                    }
                    // --- BATTERY ---
                    else if (data.issueId === 'battery') {
                        const isOriginal = data.variants && Object.values(data.variants).some(v => String(v).toLowerCase().includes('original'));
                        if (isOriginal) {
                            updatePrice('battery', data.price, 2); // High Priority
                        } else {
                            updatePrice('battery', data.price, 1); // Low Priority
                        }
                    }
                    // --- OTHERS ---
                    else {
                        updatePrice(data.issueId, data.price, 1);
                    }
                });

                // Finalize to flat map
                Object.entries(updates).forEach(([key, val]) => {
                    rPrices[key] = val.price;
                });

                setRepairPrices(rPrices);

                // --- 2. Fetch Buyback Prices ---
                const buybackQ = query(
                    collection(db, 'buyback_pricing'),
                    where('deviceId', '==', dId)
                );
                const buybackSnap = await getDocs(buybackQ);
                const bPrices: BuybackPriceRecord[] = [];
                buybackSnap.forEach(doc => {
                    bPrices.push(doc.data() as BuybackPriceRecord);
                });
                setBuybackPrices(bPrices);

            } catch (error) {
                console.error("Error fetching public pricing:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
    }, [deviceSlug]);

    return { repairPrices, buybackPrices, deviceImage, loading };
};
