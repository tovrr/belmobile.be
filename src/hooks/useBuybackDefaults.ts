import { SPECS as APPLE_SPECS } from '../data/models/apple';
import { SPECS as SAMSUNG_SPECS } from '../data/models/samsung';
import { SPECS as MOTOROLA_SPECS } from '../data/models/motorola';
import { SPECS as REALME_SPECS } from '../data/models/realme';
import { createSlug } from '../utils/slugs';
import { BUYBACK_CONDITION_DEDUCTIONS, BUYBACK_STORAGE_MULTIPLIERS } from '../data/buyback-config';

export interface BuybackDefaultOffer {
    storage: string;
    price: number;
    condition_deductions: Record<string, number>;
}

export function generateBuybackDefaults(deviceId: string) {
    const records: BuybackDefaultOffer[] = [];
    const create = (storage: string, price: number): BuybackDefaultOffer => ({
        storage,
        price,
        condition_deductions: BUYBACK_CONDITION_DEDUCTIONS
    });

    if (!deviceId) return records;

    // 1. APPLE DEVICES
    if (deviceId.startsWith('apple') || deviceId.includes('iphone')) {
        const isProMax = deviceId.includes('pro-max');
        const isPro = deviceId.includes('pro') && !isProMax;
        const isPlus = deviceId.includes('plus');
        const match = deviceId.match(/iphone-(\d+)/);
        const series = match ? parseInt(match[1]) : 0;
        const isAir = deviceId.includes('iphone-air');

        let base = 0;
        // Market Value Estimates (approx +30% vs previous Offer prices)
        if (isAir) base = 750; // Treat as Future Gen / High End
        else if (series >= 17) base = 750; // Future Gen
        else if (series >= 16) base = 650; // Current Gen
        else if (series >= 15) base = 550; // Previous Gen
        else if (series >= 14) base = 450;
        else if (series >= 13) base = 350;
        else if (series >= 12) base = 280;
        else if (series >= 11) base = 200;
        else base = 150; // Older

        // Boosts to Market Value
        if (isProMax) base += 250;
        else if (isPro) base += 150;
        else if (isPlus) base += 50;

        // --- NEW CENTRALIZED STORAGE LOGIC (APPLE) ---
        // Try to find matching specs in our central config
        let matchedStorages: string[] = [];

        // Sort keys by length descending to ensure "iPhone 15 Pro Max" is checked before "iPhone 15"
        const sortedSpecs = Object.entries(APPLE_SPECS).sort((a, b) => b[0].length - a[0].length);

        for (const [modelName, capacities] of sortedSpecs) {
            const modelSlug = createSlug(modelName);
            // Strict suffix check
            if (deviceId.endsWith(`-${modelSlug}`) || deviceId === modelSlug) {
                // No logs here`[BuybackDefaults] Matched ${deviceId} to spec ${modelName}`);
                matchedStorages = capacities;
                break;
            }
        }

        // Fallback Logic if no match found in SPECS
        if (matchedStorages.length === 0) {
            matchedStorages = ['64GB', '128GB'];
        }

        // Generate Records based on matched storages
        matchedStorages.forEach(s => {
            let multiplier = 1.0;
            multiplier = BUYBACK_STORAGE_MULTIPLIERS[s] || 1.0;
            records.push(create(s, Math.round(base * multiplier)));
        });
    }
    // 2. SAMSUNG INTELLIGENCE
    else if (deviceId.startsWith('samsung') || deviceId.includes('galaxy')) {
        const sMatch = deviceId.match(/s(\d+)/);
        const aMatch = deviceId.match(/a(\d+)/);
        let base = 200;

        if (sMatch) {
            const sSeries = parseInt(sMatch[1]);
            if (sSeries >= 24) base = 800; // S24, S25
            else if (sSeries >= 23) base = 600;
            else if (sSeries >= 22) base = 450;
            else if (sSeries >= 21) base = 300;
        } else if (aMatch) {
            const aSeries = parseInt(aMatch[1]); // e.g. 55, 35, 15, 05
            // High Tier: A7x, A5x (e.g. A55)
            if (aSeries >= 70) base = 250;
            else if (aSeries >= 50) base = 200;
            // Mid Tier: A3x, A4x
            else if (aSeries >= 30) base = 150;
            // Low Tier: A0x, A1x, A2x
            else if (aSeries >= 20) base = 100;
            else base = 60; // A05, A15, A11
        }

        // Ultra/Fold Handling
        if (deviceId.includes('ultra')) base += 250;
        if (deviceId.includes('fold')) base += 400;

        // --- DYNAMIC CENTRALIZED STORAGE LOGIC (SAMSUNG) ---
        let matchedStorages: string[] = [];
        const sortedSpecs = Object.entries(SAMSUNG_SPECS).sort((a, b) => b[0].length - a[0].length);

        for (const [modelName, capacities] of sortedSpecs) {
            const modelSlug = createSlug(modelName);
            if (deviceId.endsWith(`-${modelSlug}`) || deviceId === modelSlug) {
                // No logs here`[BuybackDefaults] Matched ${deviceId} to spec ${modelName}`);
                matchedStorages = capacities;
                break;
            }
        }

        if (matchedStorages.length === 0) matchedStorages = ['128GB', '256GB']; // Fallback

        matchedStorages.forEach(s => {
            let multiplier = 1.0;
            if (s === '256GB') multiplier = 1.1;
            if (s === '512GB') multiplier = 1.25;
            if (s === '1TB') multiplier = 1.4;
            records.push(create(s, Math.round(base * multiplier)));
        });
    }
    // 3. OTHER ANDROID (Motorola, Realme, etc.)
    else if (['motorola', 'realme', 'huawei', 'oneplus', 'xiaomi', 'oppo', 'google'].some(b => deviceId.startsWith(b))) {
        const base = 150;
        let matchedStorages: string[] = [];

        // Select correct SPECS based on brand
        let specs: Record<string, string[]> = {};
        if (deviceId.startsWith('motorola')) specs = MOTOROLA_SPECS;
        else if (deviceId.startsWith('realme')) specs = REALME_SPECS;
        // Add others as needed (Huawei, OnePlus, etc. should ideally be imported too)

        if (Object.keys(specs).length > 0) {
            const sortedSpecs = Object.entries(specs).sort((a, b) => b[0].length - a[0].length);
            for (const [modelName, capacities] of sortedSpecs) {
                const modelSlug = createSlug(modelName);
                if (deviceId.endsWith(`-${modelSlug}`) || deviceId === modelSlug) {
                    matchedStorages = capacities;
                    break;
                }
            }
        }

        if (matchedStorages.length === 0) matchedStorages = ['128GB', '256GB'];

        matchedStorages.forEach(s => {
            let multiplier = 1.0;
            if (s === '256GB') multiplier = 1.1;
            if (s === '512GB') multiplier = 1.25;
            if (s === '1TB') multiplier = 1.4;
            records.push(create(s, Math.round(base * multiplier)));
        });
    }
    else {
        // Generic Fallback
        records.push(create('Standard', 150));
    }

    return records;
}
