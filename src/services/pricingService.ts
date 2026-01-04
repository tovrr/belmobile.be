import { getWizardRawPricing } from '@/app/_actions/get-quote';
import { BuybackPriceRecord } from '../types';

export interface PricingResult {
    repairPrices: Record<string, number>;
    buybackPrices: BuybackPriceRecord[];
    deviceImage: string | null;
}

export const pricingService = {
    /**
     * Fetches pricing data via Server Action (SSOT)
     * Replaces direct Firestore Client SDK access
     */
    async fetchDevicePricing(deviceSlug: string): Promise<PricingResult> {
        try {
            const response = await getWizardRawPricing(deviceSlug);

            if (response.success && response.data) {
                const { repair, buyback, metadata } = response.data;
                return {
                    repairPrices: repair,
                    // Ensure type safety - server returns generic objects
                    buybackPrices: (Array.isArray(buyback) ? buyback : []) as BuybackPriceRecord[],
                    deviceImage: (metadata as any)?.imageUrl || null
                };
            }

            console.warn(`[PricingService] No data returned for ${deviceSlug}`);
            return { repairPrices: {}, buybackPrices: [], deviceImage: null };

        } catch (error) {
            console.error("[PricingService] Fetch failed:", error);
            // Return empty structure on error to prevent UI crashes
            return { repairPrices: {}, buybackPrices: [], deviceImage: null };
        }
    }
};
