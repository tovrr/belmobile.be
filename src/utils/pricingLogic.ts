import { BUYBACK_CONDITION_DEDUCTIONS, BUYBACK_PENALTIES } from '../data/buyback-config';

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
    buybackPrices: { storage: string; price: number }[];
    repairPrices: Record<string, number>;
}



export const calculateBuybackPriceShared = (params: PricingParams, data: PricingData): number => {
    const { buybackPrices, repairPrices } = data;
    if (!buybackPrices || buybackPrices.length === 0) return 0;

    // 1. Base Price Resolution
    const storageMatch = buybackPrices.find(p => p.storage === params.storage);
    let baseParamsPrice = storageMatch ? storageMatch.price : Math.max(...buybackPrices.map(p => p.price));

    // Helper for single issue price
    const getPrice = (id: string, def = 0) => repairPrices?.[id] || def;
    const screenRepairPrice = getPrice('screen', 100);
    const backRepairPrice = getPrice('back_glass', 80);
    const batteryRepairPrice = getPrice('battery', 60);

    // 2. Critical Conditions (Kill Switches) using Config
    if (params.turnsOn === false) return 0; // BUYBACK_PENALTIES.NO_POWER
    if (params.isUnlocked === false) return 0; // BUYBACK_PENALTIES.LOCKED

    // 3. Functional Deductions
    if (params.worksCorrectly === false) {
        baseParamsPrice *= (1 - (BUYBACK_CONDITION_DEDUCTIONS['works-issue'] || 0.5));
    }

    if (params.brand === 'Apple' && (params.deviceType === 'smartphone' || params.deviceType === 'tablet')) {
        if (params.batteryHealth === 'service') baseParamsPrice -= batteryRepairPrice;
        if (params.faceIdWorking === false) baseParamsPrice -= (BUYBACK_PENALTIES.FACE_ID_ISSUE || 150);
    }

    // 4. Cosmetic Deductions
    if (params.screenState === 'scratches') {
        baseParamsPrice -= (screenRepairPrice * (BUYBACK_CONDITION_DEDUCTIONS['screen-scratches'] || 0.3));
    }
    if (params.screenState === 'cracked') {
        baseParamsPrice -= (screenRepairPrice * (BUYBACK_CONDITION_DEDUCTIONS['screen-cracked'] || 1.0));
    }

    if (params.bodyState === 'scratches') {
        baseParamsPrice -= (BUYBACK_CONDITION_DEDUCTIONS['body-scratches'] || 20);
    }
    if (params.bodyState === 'dents') {
        // e.g. 100% of back repair
        baseParamsPrice -= (backRepairPrice * (BUYBACK_CONDITION_DEDUCTIONS['body-dents'] || 1.0));
    }
    if (params.bodyState === 'bent') {
        // e.g. Back Repair + 40
        const bentPenalty = BUYBACK_CONDITION_DEDUCTIONS['body-bent'] || 40;
        baseParamsPrice -= (backRepairPrice + bentPenalty);
    }

    // 5. Console Logic: Adjust for controllers
    if (params.deviceType === 'console_home' && typeof params.controllerCount === 'number') {
        const CONTROLLER_VALUE = 30; // Could be moved to config later
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
