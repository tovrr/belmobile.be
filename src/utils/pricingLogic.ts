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
}

export interface PricingData {
    buybackPrices: { storage: string; price: number }[];
    repairPrices: Record<string, number>;
}

export const calculateBuybackPriceShared = (params: PricingParams, data: PricingData): number => {
    const { buybackPrices, repairPrices } = data;
    if (!buybackPrices || buybackPrices.length === 0) return 0;

    const storageMatch = buybackPrices.find(p => p.storage === params.storage);
    let baseParamsPrice = storageMatch ? storageMatch.price : Math.max(...buybackPrices.map(p => p.price));

    const getPrice = (id: string) => repairPrices?.[id] || 0;
    const screenRepairPrice = getPrice('screen') || 100;
    const backRepairPrice = getPrice('back_glass') || 80;
    const batteryRepairPrice = getPrice('battery') || 60;

    if (params.turnsOn === false) baseParamsPrice = 0;
    else if (params.worksCorrectly === false) baseParamsPrice *= 0.50;
    if (params.isUnlocked === false) baseParamsPrice = 0;

    if (params.brand === 'Apple' && (params.deviceType === 'smartphone' || params.deviceType === 'tablet')) {
        if (params.batteryHealth === 'service') baseParamsPrice -= batteryRepairPrice;
        if (params.faceIdWorking === false) baseParamsPrice -= 150;
    }

    if (params.screenState === 'scratches') baseParamsPrice -= (screenRepairPrice * 0.3);
    if (params.screenState === 'cracked') baseParamsPrice -= screenRepairPrice;

    if (params.bodyState === 'scratches') baseParamsPrice -= 20;
    if (params.bodyState === 'dents') baseParamsPrice -= backRepairPrice;
    if (params.bodyState === 'bent') baseParamsPrice -= (backRepairPrice + 40);

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
