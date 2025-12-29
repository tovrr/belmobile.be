'use client';

import { useMemo, useCallback } from 'react';
import { useWizard } from '../context/WizardContext';
import { useLanguage } from './useLanguage';
import { calculateBuybackPriceShared, calculateRepairPriceShared } from '../utils/pricingLogic';

export const useWizardPricing = (type: 'buyback' | 'repair') => {
    const { state } = useWizard();
    const { t } = useLanguage();

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

        return calculateBuybackPriceShared({
            ...state,
            type: 'buyback',
            brand: state.selectedBrand,
            model: state.selectedModel,
            controllerCount: state.controllerCount
        }, state.pricingData);
    }, [type, state]);

    const repairEstimates = useMemo(() => {
        const hasScreen = state.repairIssues.includes('screen');
        if (type !== 'repair' || !state.selectedModel || state.repairIssues.length === 0)
            return { standard: 0, original: 0, oled: 0, hasScreen };

        const params = {
            ...state,
            type: 'repair' as const,
            brand: state.selectedBrand,
            model: state.selectedModel
        };

        const standard = calculateRepairPriceShared({ ...params, selectedScreenQuality: 'generic' }, state.pricingData);
        const oled = calculateRepairPriceShared({ ...params, selectedScreenQuality: 'oled' }, state.pricingData);
        const original = calculateRepairPriceShared({ ...params, selectedScreenQuality: 'original' }, state.pricingData);

        return {
            standard: standard > 0 ? standard : -1,
            oled: oled > 0 ? oled : -1,
            original: original > 0 ? original : -1,
            hasScreen
        };
    }, [type, state]);

    const sidebarEstimate = useMemo(() => {
        if (loading) return 0;

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
