'use client';

import { useMemo, useCallback } from 'react';
import { useWizard } from '../context/WizardContext';
import { useLanguage } from './useLanguage';

export const useWizardPricing = (type: 'buyback' | 'repair') => {
    const { state } = useWizard();
    const { t } = useLanguage();

    // Consuming pricingData from Context (Phase 1 Fix)
    const { repairPrices: dynamicRepairPrices, buybackPrices: dynamicBuybackPrices, isLoading: loading } = state.pricingData;

    const getSingleIssuePrice = useCallback((issueId: string) => {
        if (!state.deviceType || !state.selectedBrand || !state.selectedModel) return null;

        if (dynamicRepairPrices) {
            if (issueId === 'screen') {
                const prices: number[] = [];
                if (dynamicRepairPrices['screen_original'] !== undefined) prices.push(dynamicRepairPrices['screen_original']);
                if (dynamicRepairPrices['screen_oled'] !== undefined) prices.push(dynamicRepairPrices['screen_oled']);
                if (dynamicRepairPrices['screen_generic'] !== undefined) prices.push(dynamicRepairPrices['screen_generic']);

                const validPrices = prices.filter(p => p > 0);
                if (validPrices.length > 0) return Math.min(...validPrices);

                const callUsPrices = prices.filter(p => p === 0);
                if (callUsPrices.length > 0) return 0;
                return null;
            }

            if (dynamicRepairPrices[issueId] !== undefined) {
                return dynamicRepairPrices[issueId];
            }
        }
        return null;
    }, [state.deviceType, state.selectedBrand, state.selectedModel, dynamicRepairPrices]);

    const buybackEstimate = useMemo(() => {
        if (type !== 'buyback' || !state.selectedBrand || !state.selectedModel || !state.deviceType) return 0;

        if (dynamicBuybackPrices && dynamicBuybackPrices.length > 0) {
            const storageMatch = dynamicBuybackPrices.find(p => p.storage === state.storage);
            let baseParamsPrice = storageMatch ? storageMatch.price : Math.max(...dynamicBuybackPrices.map(p => p.price));

            const screenRepairPrice = getSingleIssuePrice('screen') || 100;
            const backRepairPrice = getSingleIssuePrice('back_glass') || 80;
            const batteryRepairPrice = getSingleIssuePrice('battery') || 60;

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
        }
        return 0;
    }, [type, state, dynamicBuybackPrices, getSingleIssuePrice]);

    const repairEstimates = useMemo(() => {
        if (type !== 'repair' || !state.selectedModel || state.repairIssues.length === 0)
            return { standard: 0, original: 0, oled: 0, hasScreen: false };

        let standardTotal = 0;
        let originalTotal = 0;
        let oledTotal = 0;
        let isStandardValid = true;
        let isOriginalValid = true;
        let isOledValid = true;
        let hasScreen = false;

        state.repairIssues.forEach(issueId => {
            const basePrice = getSingleIssuePrice(issueId);

            if (issueId === 'screen') {
                hasScreen = true;
                const d = dynamicRepairPrices || {};

                const pGeneric = d.screen_generic ?? -1;
                const pOled = d.screen_oled ?? -1;
                const pOriginal = d.screen_original ?? -1;

                // Standard (Generic Preferred)
                if (pGeneric > 0) standardTotal += pGeneric;
                else if (pGeneric === 0) isStandardValid = false;
                else if (pOled > 0) standardTotal += pOled;
                else if (pOled === 0) isStandardValid = false;
                else if (pOriginal > 0) standardTotal += pOriginal;
                else if (pOriginal === 0) isStandardValid = false;
                else isStandardValid = false;

                // OLED
                if (pOled > 0) oledTotal += pOled;
                else if (pOled === 0) isOledValid = false;
                else if (pOriginal > 0) oledTotal += pOriginal; // Fallback
                else if (pGeneric > 0) oledTotal += pGeneric; // Fallback
                else isOledValid = false;

                // Original
                if (pOriginal > 0) originalTotal += pOriginal;
                else if (pOriginal === 0) isOriginalValid = false;
                else if (pOled > 0) originalTotal += pOled;
                else if (pGeneric > 0) originalTotal += pGeneric;
                else isOriginalValid = false;

            } else {
                if (basePrice !== null && basePrice > 0) {
                    standardTotal += basePrice;
                    originalTotal += basePrice;
                    oledTotal += basePrice;
                } else if (basePrice === 0) {
                    isStandardValid = false;
                    isOriginalValid = false;
                    isOledValid = false;
                } else {
                    // Item missing in DB
                    isStandardValid = false;
                    isOriginalValid = false;
                    isOledValid = false;
                }
            }
        });

        if (state.hasHydrogel && state.step > 3) {
            const hydroPrice = 15;
            if (isStandardValid) standardTotal += hydroPrice;
            if (isOledValid) oledTotal += hydroPrice;
            if (isOriginalValid) originalTotal += hydroPrice;
        }

        if (state.deliveryMethod === 'courier' && state.courierTier === 'brussels') {
            const courierFee = 15;
            if (isStandardValid) standardTotal += courierFee;
            if (isOledValid) oledTotal += courierFee;
            if (isOriginalValid) originalTotal += courierFee;
        }

        return {
            standard: isStandardValid ? Math.round(standardTotal) : -1,
            original: isOriginalValid ? Math.round(originalTotal) : -1,
            oled: isOledValid ? Math.round(oledTotal) : -1,
            hasScreen
        };
    }, [type, state, dynamicRepairPrices, getSingleIssuePrice]);

    const sidebarEstimate = useMemo(() => {
        if (loading) return 0; // Show 0 or separate loading state in UI

        if (type === 'buyback') return buybackEstimate;

        if (state.selectedScreenQuality === 'original') return repairEstimates.original;
        if (state.selectedScreenQuality === 'oled') return repairEstimates.oled;
        return repairEstimates.standard > 0 ? repairEstimates.standard : 0;
    }, [type, buybackEstimate, repairEstimates, state.selectedScreenQuality, loading]);

    return {
        sidebarEstimate,
        repairEstimates,
        dynamicRepairPrices,
        dynamicBuybackPrices,
        buybackEstimate,
        getSingleIssuePrice,
        loading
    };
};
