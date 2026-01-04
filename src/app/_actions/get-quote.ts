'use server';

import { calculateBuybackPriceShared, calculateRepairPriceShared, PricingParams } from '@/utils/pricingLogic';
import { getPricingData } from '@/services/server/pricing.dal';

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
    // Repair extra
    selectedScreenQuality?: 'generic' | 'oled' | 'original' | '';
}

export interface WizardQuoteResponse {
    price: number; // The Calculated Final Price
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

        if (!data) {
            return { price: 0, currency: 'EUR', breakdown: {}, success: false, error: 'Device not found' };
        }

        let finalPrice = 0;
        let breakdown: any = {};

        // 2. Calculate based on Type
        if (request.type === 'buyback') {
            // Map request to PricingParams
            const params: PricingParams = {
                type: 'buyback',
                brand: data.metadata?.brand || 'Unknown',
                model: 'Unknown', // Not used in calculation logic but required by interface
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

            finalPrice = calculateBuybackPriceShared(params, {
                buybackPrices: data.buyback,
                repairPrices: data.repair
            });

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

            finalPrice = calculateRepairPriceShared(params, {
                buybackPrices: [], // Not needed for repair
                repairPrices: data.repair
            });
        }

        return {
            price: finalPrice,
            currency: 'EUR',
            breakdown,
            success: true
        };

    } catch (error) {
        console.error('Server Action Error:', error);
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
