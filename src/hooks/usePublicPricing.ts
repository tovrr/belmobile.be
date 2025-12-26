import { useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { RepairPriceRecord, BuybackPriceRecord } from '../types';
import { standardizeDeviceId } from '../utils/pricing-utils';
import { useWizard } from '../context/WizardContext';

export const usePublicPricing = (deviceSlug: string) => {
    const { state, dispatch } = useWizard();
    const { pricingData } = state;

    useEffect(() => {
        // Optimization: If no slug, or if data for this slug is already loaded (or loading), skip fetch.
        if (!deviceSlug) {
            // Optional: clear data if slug is empty?
            // For now, let's just not fetch. If user goes back, we might want to keep the old data until new one loads.
            return;
        }

        // Check if we already have data for this model
        if (pricingData.loadedForModel === deviceSlug) return;

        // Prevent double-fetch if already loading THIS model
        // Note: We use a separate 'loadedForModel' to track *completed* loads, 
        // but we might want to track *pending* loads to avoid race conditions if multiple components mount.
        // For simple usage, checking `isLoading` alongside a "target" ref would be better, 
        // but since we update Context closely, `isLoading` check helps. 
        // A better check is: is it loading? AND is it loading *this* slug? 
        // Context doesn't store "loadingForWhichSlug", just "isLoading".
        // We will assume if it is loading, it is loading the current desired slug (since step navigation is linear).
        if (pricingData.isLoading) return;

        const fetchPrices = async () => {
            const dId = standardizeDeviceId(deviceSlug);

            // 1. Set Loading State
            dispatch({
                type: 'SET_PRICING_DATA',
                payload: { isLoading: true, loadedForModel: null } // Clear loadedForModel temporarily or set it to 'pending'? 
                // Better: set loadedForModel only on success. 
            });

            try {
                let imageUrl: string | null = null;
                const rPrices: Record<string, number> = {};
                let bPrices: BuybackPriceRecord[] = [];

                // --- 0. Fetch Device Metadata (Image) ---
                const mainDocRef = doc(db, 'repair_prices', dId);
                const mainSnap = await getDoc(mainDocRef);
                if (mainSnap.exists()) {
                    const data = mainSnap.data();
                    if (data.imageUrl) {
                        imageUrl = data.imageUrl;
                    }
                }

                // --- 1. Fetch Repair Prices ---
                const repairQ = query(
                    collection(db, 'repair_prices'),
                    where('deviceId', '==', dId),
                    where('isActive', '==', true)
                );
                const repairSnap = await getDocs(repairQ);

                // Helper to manage deterministic updates
                const updates: Record<string, { price: number, priority: number }> = {};
                const updatePrice = (key: string, price: number, priority: number) => {
                    const existing = updates[key];
                    if (!existing) {
                        updates[key] = { price, priority };
                        return;
                    }
                    if (priority > existing.priority) {
                        updates[key] = { price, priority };
                    } else if (priority === existing.priority) {
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
                            if (variantValues.some(v => v.includes('oled') || v.includes('ams') || v.includes('soft') || v.includes('hard'))) {
                                updatePrice('screen_oled', data.price, 2);
                                mapped = true;
                            }
                            if (variantValues.some(v => v.includes('generic') || v.includes('incell') || v.includes('lcd') || v.includes('copy'))) {
                                updatePrice('screen_generic', data.price, 2);
                                mapped = true;
                            }
                        }
                        if (!mapped) {
                            updatePrice('screen_generic', data.price, 1);
                        }
                    }
                    // --- BATTERY ---
                    else if (data.issueId === 'battery') {
                        const isOriginal = data.variants && Object.values(data.variants).some(v => String(v).toLowerCase().includes('original'));
                        if (isOriginal) {
                            updatePrice('battery', data.price, 2);
                        } else {
                            updatePrice('battery', data.price, 1);
                        }
                    }
                    // --- OTHERS ---
                    else {
                        updatePrice(data.issueId, data.price, 1);
                    }
                });

                Object.entries(updates).forEach(([key, val]) => {
                    rPrices[key] = val.price;
                });

                // --- 2. Fetch Buyback Prices ---
                const buybackQ = query(
                    collection(db, 'buyback_pricing'),
                    where('deviceId', '==', dId)
                );
                const buybackSnap = await getDocs(buybackQ);

                buybackSnap.forEach(doc => {
                    bPrices.push(doc.data() as BuybackPriceRecord);
                });

                // Dispatch Success
                dispatch({
                    type: 'SET_PRICING_DATA',
                    payload: {
                        repairPrices: rPrices,
                        buybackPrices: bPrices,
                        deviceImage: imageUrl,
                        isLoading: false,
                        loadedForModel: deviceSlug
                    }
                });

            } catch (error) {
                console.error("Error fetching public pricing:", error);
                dispatch({ type: 'SET_PRICING_DATA', payload: { isLoading: false } });
            }
        };

        fetchPrices();
    }, [deviceSlug, pricingData.loadedForModel, pricingData.isLoading, dispatch]);

    // Return the global state (plus calculated loading status)
    // IMPORTANT: If the context has data for a DIFFERENT model than requested, 
    // we should temporarily return specific flags or empty data to prevent mixing models?
    // But since the wizard is linear, 'state.selectedModel' drives both 'deviceSlug' and context.

    // Safety check: if loadedForModel !== deviceSlug, effectively treat as loading
    const effectivelyLoading = pricingData.isLoading || (deviceSlug && pricingData.loadedForModel !== deviceSlug);

    return {
        repairPrices: pricingData.repairPrices,
        buybackPrices: pricingData.buybackPrices,
        deviceImage: pricingData.deviceImage,
        loading: effectivelyLoading
    };
};
