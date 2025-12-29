import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { RepairPriceRecord, BuybackPriceRecord } from '../types';
import { standardizeDeviceId } from '../utils/pricing-utils';

export interface PricingResult {
    repairPrices: Record<string, number>;
    buybackPrices: BuybackPriceRecord[];
    deviceImage: string | null;
}

export const pricingService = {
    async fetchDevicePricing(deviceSlug: string): Promise<PricingResult> {
        const dId = standardizeDeviceId(deviceSlug);
        let imageUrl: string | null = null;
        const rPrices: Record<string, number> = {};
        let bPrices: BuybackPriceRecord[] = [];

        try {
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

            if (Object.keys(rPrices).length === 0) {
                // Fallback to Mock Data (Fix for "On Request")
                const { MOCK_REPAIR_PRICES } = await import('../constants');
                const mock = MOCK_REPAIR_PRICES.find(p => p.id === dId);
                if (mock) {
                    // Map mock fields to dynamic keys (Correct IDs from repair-issues.ts)
                    if (typeof mock.charging_port === 'number') rPrices['hdmi'] = mock.charging_port; // 'hdmi' is the correct ID
                    if (typeof mock.battery === 'number') rPrices['power_supply'] = mock.battery; // Reusing battery slot for PSU
                    if (typeof mock.screen_generic === 'number') rPrices['disc_drive'] = 80; // Mock value
                    rPrices['cleaning'] = 60; // Standard cleaning price
                }
            }

            return {
                repairPrices: rPrices,
                buybackPrices: bPrices,
                deviceImage: imageUrl
            };

        } catch (error) {
            console.error("Error fetching pricing service:", error);
            throw error;
        }
    }
};
