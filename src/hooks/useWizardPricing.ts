'use client';

import { useMemo, useCallback } from 'react';
import { useWizard } from '../context/WizardContext';
import { usePublicPricing } from './usePublicPricing';
import { createSlug } from '../utils/slugs';
import { useLanguage } from './useLanguage';

export const useWizardPricing = (type: 'buyback' | 'repair') => {
    const { state } = useWizard();
    const { t } = useLanguage();

    const { repairPrices: dynamicRepairPrices, buybackPrices: dynamicBuybackPrices } = usePublicPricing(
        state.selectedModel ? createSlug(`${state.selectedBrand} ${state.selectedModel}`) : ''
    );

    const getSingleIssuePrice = useCallback((issueId: string) => {
        if (!state.deviceType || !state.selectedBrand || !state.selectedModel) return null;

        if (dynamicRepairPrices) {
            if (issueId === 'screen') {
                const prices: number[] = [];
                if (dynamicRepairPrices['screen_generic'] !== undefined) prices.push(dynamicRepairPrices['screen_generic']);
                if (dynamicRepairPrices['screen_oled'] !== undefined) prices.push(dynamicRepairPrices['screen_oled']);
                if (dynamicRepairPrices['screen_original'] !== undefined) prices.push(dynamicRepairPrices['screen_original']);

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
            if (basePrice !== null && basePrice !== undefined) {
                if (issueId === 'screen') {
                    hasScreen = true;
                    const d = dynamicRepairPrices;

                    const pGeneric = (d?.screen_generic !== undefined && d.screen_generic >= 0) ? d.screen_generic : -1;
                    const pOled = (d?.screen_oled !== undefined && d.screen_oled >= 0) ? d.screen_oled : -1;
                    const pOriginal = (d?.screen_original !== undefined && d.screen_original >= 0) ? d.screen_original : -1;

                    if (pGeneric >= 0) {
                        if (pGeneric === 0) isStandardValid = false;
                        standardTotal += pGeneric;
                    } else isStandardValid = false;

                    if (pOled >= 0) {
                        if (pOled === 0) isOledValid = false;
                        oledTotal = (oledTotal === 0 ? pOled : oledTotal + pOled);
                    } else isOledValid = false;

                    if (pOriginal >= 0) {
                        if (pOriginal === 0) isOriginalValid = false;
                        originalTotal = (originalTotal === 0 ? pOriginal : originalTotal + pOriginal);
                    } else isOriginalValid = false;
                } else {
                    if (basePrice === 0) {
                        isStandardValid = false;
                        isOledValid = false;
                        isOriginalValid = false;
                    }
                    standardTotal += basePrice;
                    oledTotal += basePrice;
                    originalTotal += basePrice;
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
            oled: isOledValid ? Math.round(oledTotal) : -1,
            original: isOriginalValid ? Math.round(originalTotal) : -1,
            hasScreen
        };
    }, [type, state, dynamicRepairPrices, getSingleIssuePrice]);

    const sidebarEstimate = useMemo(() => {
        if (type === 'buyback') return buybackEstimate;
        // Logic for repair display in sidebar if needed, or just return relevant object
        return repairEstimates.standard > 0 ? repairEstimates.standard : 0;
    }, [type, buybackEstimate, repairEstimates]);

    return {
        sidebarEstimate,
        buybackEstimate,
        repairEstimates,
        getSingleIssuePrice,
        dynamicRepairPrices,
        dynamicBuybackPrices
    };
};
