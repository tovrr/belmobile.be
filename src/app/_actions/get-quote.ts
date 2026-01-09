'use server';

import * as Sentry from '@sentry/nextjs';

import { calculateBuybackPriceShared, calculateRepairPriceShared, PricingParams } from '@/utils/pricingLogic';
import { getPricingData, getLocalizedRepairDictionary } from '@/services/server/pricing.dal';

export interface WizardQuoteRequest {
    deviceSlug: string;
    type: 'repair' | 'buyback';
    condition?: string; // used for buyback state
    selectedRepairs?: string[]; // IDs of repairs
    storage?: string; // for buyback
    // Add other state flags from PricingState
    turnsOn?: boolean;
    worksCorrectly?: boolean;
    screenState?: 'flawless' | 'scratches' | 'cracked';
    bodyState?: 'flawless' | 'scratches' | 'dents' | 'bent';
    batteryHealth?: 'normal' | 'service';
    faceIdWorking?: boolean;
    isUnlocked?: boolean;
    controllerCount?: number;
    // 7. Add language to request payload
    language?: 'fr' | 'nl' | 'en' | 'tr';
    // Repair extra
    selectedScreenQuality?: 'generic' | 'oled' | 'original' | '';
}

export interface WizardQuoteResponse {
    price: number;
    currency: string;
    breakdown: {
        basePrice?: number;
        deductions?: { label: string; amount: number }[];
        repairs?: { label: string; amount: number }[];
    };
    success: boolean;
    error?: string;
}

export async function getWizardQuote(request: WizardQuoteRequest): Promise<WizardQuoteResponse> {
    try {
        // 1. Fetch RAW data via DAL
        const data = await getPricingData(request.deviceSlug);
        const localizedDict = await getLocalizedRepairDictionary(request.language || 'fr');

        if (!data) {
            return { price: 0, currency: 'EUR', breakdown: {}, success: false, error: 'Device not found' };
        }

        let finalPrice = 0;
        let breakdown: any = {};

        // 2. Calculate based on Type
        if (request.type === 'buyback') {
            const params: PricingParams = {
                type: 'buyback',
                brand: data.metadata?.brand || 'Unknown',
                model: 'Unknown',
                deviceType: data.metadata?.category || 'smartphone',
                storage: request.storage || '',
                turnsOn: request.turnsOn,
                worksCorrectly: request.worksCorrectly,
                screenState: request.screenState,
                bodyState: request.bodyState,
                batteryHealth: request.batteryHealth,
                faceIdWorking: request.faceIdWorking,
                isUnlocked: request.isUnlocked,
                controllerCount: request.controllerCount
            };

            // Custom Breakdown Logic for Buyback
            const result = calculateBuybackPriceShared(params, {
                buybackPrices: data.buyback as any,
                repairPrices: data.repair as any
            });
            // Assuming calculateBuybackPriceShared only returns number. We need to refactor it or re-calculate breakdown here.
            // For now, let's just use the number and provide a simple breakdown based on params.
            finalPrice = result;

            // Re-simulation for breakdown (SOTA: In real app, logic function should return breakdown)
            breakdown = {
                basePrice: finalPrice, // Simplified for now
                deductions: []
            };

        }
        else if (request.type === 'repair') {
            const params: PricingParams = {
                type: 'repair',
                brand: data.metadata?.brand || 'Unknown',
                model: 'Unknown',
                deviceType: data.metadata?.category || 'smartphone',
                repairIssues: request.selectedRepairs,
                selectedScreenQuality: request.selectedScreenQuality
            };

            const repairParams = data.repair as any;

            finalPrice = calculateRepairPriceShared(params, {
                buybackPrices: [],
                repairPrices: repairParams
            });

            // Repair Breakdown
            const repairs = (request.selectedRepairs || []).map(id => {
                let amount = repairParams[id] || 0;

                // Screen Special Case
                if (id === 'screen' && request.selectedScreenQuality) {
                    const q = request.selectedScreenQuality;
                    amount = repairParams[`screen_${q}`] || repairParams['screen_generic'] || amount;
                } else if (id === 'battery') {
                    amount = repairParams['battery'] || repairParams['battery_original'] || repairParams['battery_generic'] || amount;
                }

                return {
                    label: localizedDict[id] || id,
                    amount: amount
                };
            }).filter(i => i.amount > 0);

            breakdown = {
                repairs,
                total: finalPrice
            };
        }

        return {
            price: finalPrice,
            currency: 'EUR',
            breakdown,
            success: true
        };

    } catch (error) {
        console.error('Server Action Error:', error);
        Sentry.captureException(error, {
            tags: {
                action: 'getWizardQuote',
                device: request.deviceSlug,
                type: request.type
            },
            extra: { request }
        });
        return { price: 0, currency: 'EUR', breakdown: {}, success: false, error: 'Calculation failed' };
    }
}

/**
 * EXPOSE RAW PRICING DATA TO CLIENT
 * Used by pricingService.ts to populate badges without direct Firestore access
 */
export async function getWizardRawPricing(deviceSlug: string) {
    try {
        const data = await getPricingData(deviceSlug);
        if (!data) return { success: false, data: null };

        return { success: true, data };
    } catch (error) {
        console.error('[getWizardRawPricing] Error:', error);
        return { success: false, data: null };
    }
}
