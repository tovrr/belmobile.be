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
    // Critical Failures = Damaged immediately (or 25% value)
    if (params.turnsOn === false || params.isUnlocked === false) return 'damaged';

    // User Update: FaceID is specific (-50%), map to 'fair' for UI consistency
    if (params.faceIdWorking === false) return 'fair';

    // Functional Issues (e.g. Broken Speaker/Mic) -> Fair (approx 50% value)
    if (params.worksCorrectly === false) return 'fair';

    // Cosmetic Logic
    // 1. Heavy Damage
    if (params.screenState === 'cracked' || params.bodyState === 'bent') return 'damaged';

    // 2. Medium Wear
    if (params.bodyState === 'dents') return 'good';
    if (params.screenState === 'scratches') return 'good';

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
    if (typeof params.controllerCount === 'number') {
        const CONTROLLER_VALUE = 30;
        const missingControllers = 2 - params.controllerCount;
        if (missingControllers > 0) {
            final -= (missingControllers * CONTROLLER_VALUE);
        }
    }

    return Math.round(final); // Rounded for clean numbers
};

/**
 * 📊 MATRIX PRICING ENGINE (User Requested - Granular Logic)
 * Instead of simple Tiers, we calculate precise multipliers based on Screen + Body combos.
 */
const getCosmeticMultiplier = (screen: string, body: string): number => {
    // 1. Screen Flawless
    if (screen === 'flawless') {
        if (body === 'flawless') return 1.0;     // 100%
        if (body === 'scratches') return 0.8;    // 80%
        if (body === 'dents') return 0.65;       // 65%
        if (body === 'bent') return 0.40;        // 40% (Body Broken)
    }

    // 2. Screen Scratches
    if (screen === 'scratches') {
        if (body === 'flawless') return 0.75;    // 75%
        if (body === 'scratches') return 0.65;   // 65%
        if (body === 'dents') return 0.50;       // 50%
        if (body === 'bent') return 0.30;        // 30% (Body Broken)
    }

    // 3. Screen Broken (Cracked)
    if (screen === 'cracked') {
        if (body === 'flawless') return 0.40;    // 40%
        if (body === 'scratches') return 0.35;   // 35%
        if (body === 'dents') return 0.25;       // 25% (Lowest before damaged)
        if (body === 'bent') return 0.20;        // 20%
    }

    return 0.25; // Fallback
};

/**
 * 🏆 THE BULLETPROOF CALCULATOR
 * "Surgical" replacement for calculateBuybackPriceShared
 */
export const calculateBuybackPriceShared = (params: PricingParams, data: PricingData): { price: number, deductions: { label: string, amount: number }[] } => {
    try {
        const { buybackPrices } = data;
        const deductions: { label: string, amount: number }[] = [];

        if (!buybackPrices || buybackPrices.length === 0) return { price: 0, deductions: [] };

        // 1. CRITICAL CHECKS (Overrides Cosmetic Matrix)
        // Simlock, Dead Phone -> Damaged Price (25%)
        // NOTE: FaceID is distinct now (-50%).
        const isCriticalFailure =
            params.turnsOn === false ||
            params.isUnlocked === false;

        const isFunctionalFailure = params.worksCorrectly === false;

        // 2. FIND BASE PRICE (Like-New)
        const baseRecord = buybackPrices.find(p => p.storage === params.storage && p.condition === 'like-new');

        // If we can't find a base price, we can't calculate. 
        if (!baseRecord || !baseRecord.price) return { price: 0, deductions: [] };

        const basePrice = baseRecord.price;
        let currentPrice = basePrice;

        // 3. APPLY LOGIC
        if (isCriticalFailure) {
            // Damaged Tier (25%)
            const drop = currentPrice * 0.75;
            currentPrice = currentPrice * 0.25;
            deductions.push({ label: 'Critical Damage / Locked', amount: Math.round(drop) });
        } else {
            // Cumulative Logic

            // A. General Functionality (Speaker, Mic, etc)
            if (isFunctionalFailure) {
                const before = currentPrice;
                currentPrice *= 0.60;
                deductions.push({ label: 'Functional Issues', amount: Math.round(before - currentPrice) });
            }

            // B. Face ID (Specific User Request: -50%)
            if (params.faceIdWorking === false) {
                const before = currentPrice;
                currentPrice *= 0.50;
                deductions.push({ label: 'Face ID Fault', amount: Math.round(before - currentPrice) });
            }

            // C. Battery Health (Service = -15%)
            if (params.batteryHealth === 'service') {
                const before = currentPrice;
                currentPrice *= 0.85;
                deductions.push({ label: 'Battery Service', amount: Math.round(before - currentPrice) });
            }

            // D. Cosmetic Matrix
            const cosmeticMult = getCosmeticMultiplier(
                params.screenState || 'flawless',
                params.bodyState || 'flawless'
            );

            if (cosmeticMult < 1.0) {
                const before = currentPrice;
                currentPrice *= cosmeticMult;
                deductions.push({ label: 'Cosmetic Condition', amount: Math.round(before - currentPrice) });
            }

            // Floor Check: Don't go below transport cost? 
            if (currentPrice < 5) currentPrice = 5;
        }

        // 5. EXTENSIONS (Controllers, etc)
        const finalPrice = calculateExtensions(params, currentPrice);
        if (finalPrice !== Math.round(currentPrice)) {
            // Logic inside calculateExtensions deducts.
            // We can infer deduction.
            const diff = Math.round(currentPrice) - finalPrice;
            if (diff > 0) deductions.push({ label: 'Missing Accessories', amount: diff });
        }

        return { price: Math.round(finalPrice), deductions };

    } catch (error) {
        console.error('[Pricing] Critical Calculation Error', error);
        return { price: 0, deductions: [] };
    }
};

export const calculateRepairPriceShared = (params: PricingParams, data: PricingData): number => {
    const { repairPrices } = data;
    if (!repairPrices || !params.repairIssues || params.repairIssues.length === 0) return 0;

    // Special Case: Diagnostic (Other) -> 0
    if (params.repairIssues.includes('other')) return 0;

    let prices: number[] = [];
    let isValid = true;

    // 1. Collect all individual prices
    params.repairIssues.forEach(issueId => {
        let price = 0;

        if (issueId === 'screen') {
            const quality = params.selectedScreenQuality;
            if (quality) {
                price = repairPrices[`screen_${quality}`] ?? 0;
            } else {
                const candidates = [
                    repairPrices['screen_generic'],
                    repairPrices['screen_original'],
                    repairPrices['screen_oled'],
                    repairPrices['screen']
                ].filter(p => typeof p === 'number' && p > 0);

                if (candidates.length > 0) price = Math.min(...candidates);
            }
        } else if (issueId === 'battery') {
            price = repairPrices['battery'] ?? repairPrices['battery_original'] ?? repairPrices['battery_generic'] ?? 0;
        } else {
            price = repairPrices[issueId] ?? 0;
        }

        if (price > 0) {
            prices.push(price);
        } else {
            // If a required price is missing (0), the calculation is invalid
            isValid = false;
        }
    });

    if (!isValid) return 0;

    // 2. Sort Descending (Highest Price First)
    prices.sort((a, b) => b - a);

    // 3. Apply Bundle Discounts
    // 1st item: 100%
    // 2nd item: 75% (25% off)
    // 3rd+ item: 50% (50% off)
    let total = 0;
    prices.forEach((price, index) => {
        if (index === 0) {
            total += price;
        } else if (index === 1) {
            total += Math.round(price * 0.75);
        } else {
            total += Math.round(price * 0.50);
        }
    });

    // 4. Add Extras (No discount on extras)
    if (params.hasHydrogel) total += EXTRAS_PRICING.HYDROGEL;
    if (params.deliveryMethod === 'courier' && params.courierTier === 'brussels') total += EXTRAS_PRICING.COURIER_BRUSSELS;

    return Math.round(total);
};
