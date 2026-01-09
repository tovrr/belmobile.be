import { BuybackPriceRecord } from '../types';

const EXTRAS_PRICING = {
    HYDROGEL: 15,
    COURIER_BRUSSELS: 15
};

// Enforce Type Safety for Conditions
type ConditionTier = 'new' | 'like-new' | 'good' | 'fair' | 'damaged';

export interface PricingParams {
    type: 'buyback' | 'repair';
    brand: string;
    model: string;
    deviceType?: string;
    storage?: string;

    // Condition (Buyback)
    turnsOn?: boolean | null;
    worksCorrectly?: boolean | null;
    isUnlocked?: boolean | null;
    batteryHealth?: 'normal' | 'service' | null;
    faceIdWorking?: boolean | null;
    screenState?: 'flawless' | 'scratches' | 'cracked';
    bodyState?: 'flawless' | 'scratches' | 'dents' | 'bent';

    // Repair
    repairIssues?: string[];
    selectedScreenQuality?: 'generic' | 'oled' | 'original' | '';

    // Extras
    hasHydrogel?: boolean;
    deliveryMethod?: 'dropoff' | 'send' | 'courier' | null;
    courierTier?: 'bridge' | 'brussels';
    controllerCount?: number | null;
}

export interface PricingData {
    buybackPrices: BuybackPriceRecord[];
    repairPrices: Record<string, number>;
}

/**
 * 🛡️ STRATEGY 1: Determine the Condition Tier
 * Pure function. Given the physical state, what is the tier?
 */
const determineConditionTier = (params: PricingParams): ConditionTier => {
    // Critical Failures = Damaged immediately (or 0 value)
    if (params.turnsOn === false || params.isUnlocked === false) return 'damaged';
    if (params.worksCorrectly === false || params.faceIdWorking === false) return 'damaged';

    // Cosmetic Logic
    // 1. Heavy Damage
    if (params.screenState === 'cracked' || params.bodyState === 'bent') return 'damaged';

    // 2. Medium Wear
    if (params.bodyState === 'dents') return 'fair';
    if (params.screenState === 'scratches') return 'fair'; // Safe conservative estimate

    // 3. Light Wear
    // If body has scratches but screen is flawless -> Good
    if (params.bodyState === 'scratches') return 'good';

    // 4. Perfect
    if (params.screenState === 'flawless' && params.bodyState === 'flawless') return 'like-new';

    return 'good'; // Safe Fallback
};

/**
 * 🛡️ STRATEGY 2: Calculate Extensions (e.g. Controllers)
 */
const calculateExtensions = (params: PricingParams, currentPrice: number): number => {
    let final = currentPrice;

    // Console Controller Logic
    if (params.deviceType === 'console_home' && typeof params.controllerCount === 'number') {
        const CONTROLLER_VALUE = 30;
        if (params.controllerCount === 0) final -= CONTROLLER_VALUE;
        if (params.controllerCount === 2) final += CONTROLLER_VALUE;
    }

    return final;
};

/**
 * 🏆 THE BULLETPROOF CALCULATOR
 * "Surgical" replacement for calculateBuybackPriceShared
 */
export const calculateBuybackPriceShared = (params: PricingParams, data: PricingData): number => {
    try {
        const { buybackPrices } = data;

        // Guard: No data
        if (!buybackPrices || buybackPrices.length === 0) {
            // console.warn('[Pricing] No buyback prices available for calculation.');
            return 0;
        }

        // 1. Get Tier
        const tier = determineConditionTier(params);

        // 2. Find Exact Price Match
        const match = buybackPrices.find(p =>
            p.storage === params.storage &&
            p.condition === tier
        );

        if (match && typeof match.price === 'number') {
            // 3. Apply Extensions
            const finalPrice = calculateExtensions(params, match.price);
            return Math.max(0, finalPrice);
        }

        // 4. If exact match failed, try finding 'good' tier as a base and applying ratio?
        // Ideally we strictly enforce exact matches for 'Bulletproof' logic.
        // If the 'damaged' tier is missing, we might return 0.

        // Fallback: If 'damaged' requested but not found, return 0.
        // If 'like-new' requested but not found, maybe look for 'good'?
        // For now, let's keep it strict to force the Admin to fill the data.

        // console.warn(`[Pricing] Price point missing for ${params.model} (${params.storage}) @ ${tier}`);
        return 0;

    } catch (error) {
        console.error('[Pricing] Critical Calculation Error', error);
        return 0; // Fail safe
    }
};

export const calculateRepairPriceShared = (params: PricingParams, data: PricingData): number => {
    const { repairPrices } = data;
    if (!repairPrices || !params.repairIssues || params.repairIssues.length === 0) return 0;

    let total = 0;
    let isValid = true;

    params.repairIssues.forEach(issueId => {
        if (issueId === 'screen') {
            const quality = params.selectedScreenQuality || 'generic';
            const price = repairPrices[`screen_${quality}`] ?? repairPrices['screen_generic'] ?? 0;
            if (price > 0) total += price;
            else if (price === 0) isValid = false;
        } else if (issueId === 'battery') {
            const price = repairPrices['battery'] ?? repairPrices['battery_original'] ?? repairPrices['battery_generic'] ?? 0;
            if (price > 0) total += price;
            // Don't invalidate if battery is 0, arguably? Or keep strict? 
            // Strict: else if (price === 0) isValid = false;
            // Let's keep strict to surface errors if data is missing.
            else if (price === 0) isValid = false;
        } else {
            const price = repairPrices[issueId] ?? 0;
            if (price > 0) total += price;
            else if (price === 0) isValid = false;
        }
    });

    if (params.hasHydrogel) total += EXTRAS_PRICING.HYDROGEL;
    if (params.deliveryMethod === 'courier' && params.courierTier === 'brussels') total += EXTRAS_PRICING.COURIER_BRUSSELS;

    return isValid ? Math.round(total) : 0;
};
