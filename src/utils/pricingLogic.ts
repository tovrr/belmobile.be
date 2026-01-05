import { BUYBACK_CONDITION_DEDUCTIONS, BUYBACK_PENALTIES, BUYBACK_STORAGE_MULTIPLIERS } from '../data/buyback-config';

export interface PricingParams {
    type: 'buyback' | 'repair';
    brand: string;
    model: string;
    deviceType?: string;
    storage?: string;
    // Condition
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
    buybackPrices: { storage: string; price: number; condition?: string; capacity?: string }[];
    repairPrices: Record<string, number>;
}

export const calculateBuybackPriceShared = (params: PricingParams, data: PricingData): number => {
    const { buybackPrices, repairPrices } = data;
    if (!buybackPrices || buybackPrices.length === 0) return 0;

    // --- TIER BASED CALCULATION (ANCHOR V1) ---
    // 1. Determine Condition Tier from Inputs
    let tier = 'good'; // Default

    // Critical Failures
    if (params.turnsOn === false || params.isUnlocked === false) return 0;

    // Functional Failures -> Damaged
    if (params.worksCorrectly === false || params.faceIdWorking === false) {
        tier = 'damaged';
    }
    // Cosmetic Grading
    else if (params.screenState === 'cracked' || params.bodyState === 'bent') {
        tier = 'damaged'; // Or 'repair-needed' if we had that tier
    }
    else if (params.bodyState === 'dents') {
        tier = 'fair';
    }
    else if (params.screenState === 'scratches') {
        tier = 'fair'; // or good? Conservative: Fair.
    }
    else if (params.bodyState === 'scratches') {
        tier = 'good';
    }
    else if (params.screenState === 'flawless' && params.bodyState === 'flawless') {
        // "Impeccable" -> Like New. "New" is usually sealed.
        tier = 'like-new';
    }

    // 2. Try to find EXACT match (Storage + Tier)
    const exactMatch = buybackPrices.find(p =>
        (p.storage === params.storage || p.capacity === params.storage) &&
        p.condition === tier
    );

    if (exactMatch && exactMatch.price > 0) {
        // FOUND TIER PRICE - RETURN DIRECTLY
        // We can still apply minor deductions like "Cable missing" if we tracked that,
        // but for now, the Tier Price is the Authority.

        // One exception: Consoles controller count logic is "extra" on top of condition?
        let final = exactMatch.price;
        if (params.deviceType === 'console_home' && typeof params.controllerCount === 'number') {
            const CONTROLLER_VALUE = 30;
            if (params.controllerCount === 0) final -= CONTROLLER_VALUE;
            if (params.controllerCount === 2) final += CONTROLLER_VALUE;
        }
        return Math.max(0, final);
    }


    // --- FALLBACK: LEGACY DEDUCTION LOGIC ---
    // Used if database doesn't have tiers (old devices) or exact match missing.

    // 1. Base Price Resolution (Highest 'New' Price?)
    // We try to find the "Best" price for this storage to start deducting from
    // Filter by storage first
    let candidates = buybackPrices.filter(p => p.storage === params.storage || p.capacity === params.storage);
    if (candidates.length === 0) candidates = buybackPrices; // Fallback to all (and use multiplier)

    // Sort by price descending (Best Case / New)
    candidates.sort((a, b) => b.price - a.price);

    let baseParamsPrice = 0;
    const bestCandidate = candidates[0];

    if (bestCandidate.storage === params.storage || bestCandidate.capacity === params.storage) {
        baseParamsPrice = bestCandidate.price;
    } else {
        // Multiplier Logic (Storage translation)
        const highestStorage = bestCandidate.storage || '128GB';
        const multTarget = BUYBACK_STORAGE_MULTIPLIERS[params.storage || '128GB'] || 1.0;
        const multSource = BUYBACK_STORAGE_MULTIPLIERS[highestStorage] || 1.0;
        baseParamsPrice = (bestCandidate.price / multSource) * multTarget;
    }

    // Helper for single issue price
    const getPrice = (id: string, def = 0) => repairPrices?.[id] || def;
    const screenRepairPrice = getPrice('screen', 100);
    const backRepairPrice = getPrice('back_glass', 80);
    const batteryRepairPrice = getPrice('battery', 60);

    // Deductions
    if (params.worksCorrectly === false) baseParamsPrice *= (1 - (BUYBACK_CONDITION_DEDUCTIONS['works-issue'] || 0.5));

    if (params.brand === 'Apple' && (params.deviceType === 'smartphone' || params.deviceType === 'tablet')) {
        if (params.batteryHealth === 'service') baseParamsPrice -= batteryRepairPrice;
        if (params.faceIdWorking === false) baseParamsPrice -= (BUYBACK_PENALTIES.FACE_ID_ISSUE || 150);
    }

    if (params.screenState === 'scratches') baseParamsPrice -= (screenRepairPrice * (BUYBACK_CONDITION_DEDUCTIONS['screen-scratches'] || 0.3));
    if (params.screenState === 'cracked') baseParamsPrice -= (screenRepairPrice * (BUYBACK_CONDITION_DEDUCTIONS['screen-cracked'] || 1.0));

    if (params.bodyState === 'scratches') baseParamsPrice -= (BUYBACK_CONDITION_DEDUCTIONS['body-scratches'] || 20);
    if (params.bodyState === 'dents') baseParamsPrice -= (backRepairPrice * (BUYBACK_CONDITION_DEDUCTIONS['body-dents'] || 1.0));
    if (params.bodyState === 'bent') {
        const bentPenalty = BUYBACK_CONDITION_DEDUCTIONS['body-bent'] || 40;
        baseParamsPrice -= (backRepairPrice + bentPenalty);
    }

    if (params.deviceType === 'console_home' && typeof params.controllerCount === 'number') {
        const CONTROLLER_VALUE = 30;
        if (params.controllerCount === 0) baseParamsPrice -= CONTROLLER_VALUE;
        if (params.controllerCount === 2) baseParamsPrice += CONTROLLER_VALUE;
    }

    return Math.max(0, Math.round(baseParamsPrice));
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
        } else {
            const price = repairPrices[issueId] ?? 0;
            if (price > 0) total += price;
            else if (price === 0) isValid = false;
        }
    });

    if (params.hasHydrogel) total += 15;
    if (params.deliveryMethod === 'courier' && params.courierTier === 'brussels') total += 15;

    return isValid ? Math.round(total) : 0;
};
