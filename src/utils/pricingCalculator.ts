import { BuybackPriceRecord } from '../types';

export interface PricingState {
    type: 'buyback' | 'repair';
    deviceType: string;
    selectedBrand: string;
    selectedModel: string;
    storage: string;

    // Condition
    turnsOn?: boolean | null;
    worksCorrectly?: boolean | null;
    isUnlocked?: boolean | null;
    batteryHealth?: string | null;
    faceIdWorking?: boolean | null;
    screenState?: string; // 'flawless' | 'scratches' | 'cracked'
    bodyState?: string; // 'flawless' | 'scratches' | 'dents' | 'bent'

    // Repair
    repairIssues: string[];
    hasHydrogel?: boolean;
    selectedScreenQuality?: string; // 'generic' | 'oled' | 'original'
    deliveryMethod?: string | null;
    courierTier?: string;
}

export interface PricingData {
    repairPrices: Record<string, number>;
    buybackPrices: BuybackPriceRecord[];
}

export const calculateBuybackPrice = (state: PricingState, data: PricingData): number => {
    if (state.type !== 'buyback' || !state.selectedBrand || !state.selectedModel || !state.deviceType) return 0;

    const { buybackPrices, repairPrices } = data;
    if (!buybackPrices || buybackPrices.length === 0) return 0;

    const storageMatch = buybackPrices.find(p => p.storage === state.storage);
    let baseParamsPrice = storageMatch ? storageMatch.price : Math.max(...buybackPrices.map(p => p.price));

    // Helper for single issue price (copied logic)
    const getIssuePrice = (id: string, def: number) => {
        if (!repairPrices) return def;
        // Logic for screen/battery/back_glass variants fallback
        // Simplified helper since we passed flattened repairPrices usually?
        // Wait, pricingService returns flattened keys like 'screen_original', 'screen_generic'.
        // But getSingleIssuePrice in hook had complex logic for 'screen'.
        // We need to implement that resolution logic here or expect flattened input.
        // pricingService returns `rPrices` with keys 'screen_generic', 'screen_oled', etc.
        // But for 'back_glass', 'battery' it might have variants too?
        // pricingService flattened them.

        if (id === 'screen') {
            const vals = [];
            if (repairPrices['screen_generic']) vals.push(repairPrices['screen_generic']);
            if (repairPrices['screen_oled']) vals.push(repairPrices['screen_oled']);
            if (repairPrices['screen_original']) vals.push(repairPrices['screen_original']);
            const valid = vals.filter(v => v > 0);
            return valid.length > 0 ? Math.min(...valid) : def;
        }
        return repairPrices[id] || def;
    };

    const screenRepairPrice = getIssuePrice('screen', 100);
    const backRepairPrice = getIssuePrice('back_glass', 80);
    const batteryRepairPrice = getIssuePrice('battery', 60);

    if (state.turnsOn === false) baseParamsPrice = 0;
    else if (state.worksCorrectly === false) baseParamsPrice *= 0.50;
    if (state.isUnlocked === false) baseParamsPrice = 0;

    if (state.selectedBrand === 'Apple' && (state.deviceType === 'smartphone' || state.deviceType === 'tablet')) {
        if (state.batteryHealth === 'service') baseParamsPrice -= batteryRepairPrice;
        if (state.faceIdWorking === false) baseParamsPrice -= 150;
    }

    if (state.screenState === 'scratches') baseParamsPrice -= (screenRepairPrice * 0.3);
    if (state.screenState === 'cracked') baseParamsPrice -= screenRepairPrice;

    if (state.bodyState === 'scratches') baseParamsPrice -= 20;
    if (state.bodyState === 'dents') baseParamsPrice -= backRepairPrice;
    if (state.bodyState === 'bent') baseParamsPrice -= (backRepairPrice + 40);

    return Math.max(0, Math.round(baseParamsPrice));
};

export const calculateRepairPrice = (state: PricingState, data: PricingData): number => {
    if (state.type !== 'repair' || !state.selectedModel || state.repairIssues.length === 0) return 0;

    const { repairPrices } = data;
    let total = 0;
    let isValid = true;

    // Determine screen quality or default (standard/generic)
    // The previous hook returned an object { standard, original, oled }.
    // Here we want the FINAL price based on selection.
    // If user hasn't selected screen quality yet (step < ?), maybe return standard or 0.
    // But 'calculateRepairPrice' implies we want the "Total" display.
    // However, the Sidebar shows "Standard / OLED / Original".
    // For "Server Side Validation", the user submits a specific quality?
    // The `OrderSubmissionData` doesn't explicitly have `selectedScreenQuality` field at top level?
    // Let's check `OrderSubmissionData`. It has `condition`? No, type Repair has issues.
    // Steps: `StepUserInfo` state has `selectedScreenQuality`.
    // We need to ensure `selectedScreenQuality` is part of submission to validate exact price.

    // Logic:
    state.repairIssues.forEach(issueId => {
        if (issueId === 'screen') {
            const q = state.selectedScreenQuality || 'generic'; // Default to generic if missing?
            let price = 0;
            if (q === 'original') price = repairPrices['screen_original'];
            else if (q === 'oled') price = repairPrices['screen_oled'];
            else price = repairPrices['screen_generic'];

            // Fallbacks:
            if (!price || price === 0) {
                if (repairPrices['screen_generic'] > 0) price = repairPrices['screen_generic'];
                else if (repairPrices['screen_oled'] > 0) price = repairPrices['screen_oled'];
                else if (repairPrices['screen_original'] > 0) price = repairPrices['screen_original'];
            }

            if (price > 0) total += price;
            else isValid = false;
        } else {
            const price = repairPrices[issueId];
            if (price > 0) total += price;
            else isValid = false;
        }
    });

    if (state.hasHydrogel) total += 15;
    if (state.deliveryMethod === 'courier' && state.courierTier === 'brussels') total += 15;

    return isValid ? Math.round(total) : -1; // -1 for Contact Us
};
