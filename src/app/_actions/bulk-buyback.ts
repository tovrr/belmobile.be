'use server';

import { pricingService } from '@/services/pricingService';
import { calculateBuybackPriceShared } from '@/utils/pricingLogic';
import { createSlug } from '@/utils/slugs';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from '@/utils/logger';

export interface BulkBuybackItem {
    brand: string;
    model: string;
    storage: string;
    condition: string;
    imei?: string;
}

/**
 * Maps common B2B labels to internal cosmetic states
 */
const mapConditionToStates = (conditionStr: string) => {
    const c = conditionStr.toLowerCase().trim();
    if (c.includes('flawless') || c.includes('new') || c === 'a' || c === 'perfect') {
        return { screenState: 'flawless' as const, bodyState: 'flawless' as const };
    }
    if (c.includes('good') || c === 'b') {
        return { screenState: 'scratches' as const, bodyState: 'scratches' as const };
    }
    if (c.includes('fair') || c === 'c') {
        return { screenState: 'scratches' as const, bodyState: 'dents' as const };
    }
    if (c.includes('crack') || c.includes('broken') || c === 'd') {
        return { screenState: 'cracked' as const, bodyState: 'dents' as const };
    }
    return { screenState: 'scratches' as const, bodyState: 'scratches' as const }; // Default to B
};

export async function calculateBulkBuybackAction(items: BulkBuybackItem[]) {
    try {
        logger.info(`[BulkBuyback] Calculating batch offer for ${items.length} units`);

        // 1. Gather unique slugs to minimize DB calls
        const uniqueSlugs = Array.from(new Set(items.map(i => createSlug(`${i.brand} ${i.model}`))));
        const pricingCache: Record<string, any> = {};

        // 2. Fetch all required pricing data
        for (const slug of uniqueSlugs) {
            pricingCache[slug] = await pricingService.fetchDevicePricing(slug);
        }

        // 3. Process each item
        const results = items.map(item => {
            const slug = createSlug(`${item.brand} ${item.model}`);
            const pricingData = pricingCache[slug];
            const states = mapConditionToStates(item.condition);

            const params: any = {
                type: 'buyback',
                brand: item.brand,
                model: item.model,
                storage: item.storage,
                ...states,
                turnsOn: true,
                isUnlocked: true,
                worksCorrectly: true,
            };

            const { price, deductions } = calculateBuybackPriceShared(params, pricingData);

            return {
                ...item,
                calculatedPrice: price,
                deductions
            };
        });

        const totalOffer = results.reduce((sum, item) => sum + item.calculatedPrice, 0);

        return {
            success: true,
            results,
            totalOffer,
            currency: 'EUR'
        };

    } catch (error: any) {
        logger.error(`[BulkBuyback] valuation failed`, { error: error.message });
        return { success: false, error: error.message };
    }
}

export async function submitBulkBuybackAction(companyId: string, results: any[], totalOffer: number) {
    try {
        if (!adminDb) throw new Error("Database connectivity missing");

        const payload = {
            companyId,
            items: results,
            totalOffer,
            status: 'pending',
            deviceCount: results.length,
            createdAt: FieldValue.serverTimestamp(),
            lastModified: FieldValue.serverTimestamp()
        };

        const docRef = await adminDb.collection('b2b_buyback_requests').add(payload);

        logger.info(`[BulkBuyback] Submitted successfully`, { companyId, id: docRef.id });

        return { success: true, id: docRef.id };

    } catch (error: any) {
        logger.error(`[BulkBuyback] Submission failed`, { error: error.message });
        return { success: false, error: error.message };
    }
}
