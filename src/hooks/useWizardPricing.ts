'use client';

import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useWizard } from '../context/WizardContext';
import { useLanguage } from './useLanguage';
import { getWizardQuote, WizardQuoteRequest } from '@/app/_actions/get-quote';

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export const useWizardPricing = (type: 'buyback' | 'repair') => {
    const { state, dispatch } = useWizard();
    const { t } = useLanguage();

    // Local State for Server Price
    const [serverPrice, setServerPrice] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [priceBreakdown, setPriceBreakdown] = useState<any>({});

    // We also need to fetch "Repair Options" (Original vs Generic) if it's a repair flow
    // The current Server Action returns a single price based on inputs.
    // For the UI that shows 3 options (Generic, OLED, Original), we might need 3 calls or the Server Action to return all variants.
    // Let's assume for now we fetch the "Selected" price.

    // 1. Prepare Request Object (Debounced)
    const {
        selectedBrand, selectedModel, repairIssues, storage,
        turnsOn, worksCorrectly, screenState, bodyState,
        batteryHealth, faceIdWorking, isUnlocked, controllerCount
    } = state;

    const requestPayload: WizardQuoteRequest | null = useMemo(() => {
        if (!selectedBrand || !selectedModel) return null;

        return {
            deviceSlug: `${selectedBrand}-${selectedModel}`,
            type,
            selectedRepairs: repairIssues,
            storage,
            turnsOn: turnsOn ?? undefined,
            worksCorrectly: worksCorrectly ?? undefined,
            screenState: screenState as any,
            bodyState: bodyState as any,
            batteryHealth: batteryHealth as any,
            faceIdWorking: faceIdWorking ?? undefined,
            isUnlocked: isUnlocked ?? undefined,
            controllerCount: controllerCount ?? undefined
        };
    }, [
        selectedBrand, selectedModel, repairIssues, storage,
        turnsOn, worksCorrectly, screenState, bodyState,
        batteryHealth, faceIdWorking, isUnlocked, controllerCount,
        type
    ]);

    const debouncedPayload = useDebounce(requestPayload, 300);

    // 2. Effect to Call Server Action
    useEffect(() => {
        let isMounted = true;

        async function fetchPrice() {
            if (!debouncedPayload) {
                setServerPrice(0);
                setPriceBreakdown({});
                dispatch({
                    type: 'SET_UI_STATE',
                    payload: {
                        currentEstimate: 0,
                        priceBreakdown: {}
                    }
                });
                return;
            }

            setIsLoading(true);
            try {
                const response = await getWizardQuote(debouncedPayload);
                if (isMounted && response.success) {
                    setServerPrice(response.price);
                    setPriceBreakdown(response.breakdown);

                    // Sync to Global Context for SSOT (Safe Submission)
                    dispatch({
                        type: 'SET_UI_STATE',
                        payload: {
                            currentEstimate: response.price,
                            priceBreakdown: response.breakdown
                        }
                    });
                } else if (isMounted && !response.success) {
                    console.error("Pricing Fetch Error from server:", response.error);
                    setServerPrice(0);
                    setPriceBreakdown({});
                    dispatch({
                        type: 'SET_UI_STATE',
                        payload: {
                            currentEstimate: 0,
                            priceBreakdown: {}
                        }
                    });
                }
            } catch (err) {
                console.error("Pricing Fetch Error", err);
                setServerPrice(0);
                setPriceBreakdown({});
                dispatch({
                    type: 'SET_UI_STATE',
                    payload: {
                        currentEstimate: 0,
                        priceBreakdown: {}
                    }
                });
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchPrice();

        return () => { isMounted = false; };
    }, [debouncedPayload]);

    // 3. Single Issue Price Helper (Still needed for "Starting from X" badges in UI)
    // This might need access to raw data. The Server Action doesn't return raw data by default.
    // However, `state.pricingData` is currently populating `repairPrices` via `useBuybackPricing` hook (which listens to Firestore snapshot).
    // If we want to replace `useBuybackPricing` entirely, we need to pass raw data here.
    // BUT `useWizardPricing` is used for total calculation.
    // The `state.pricingData` comes from `useBuybackPricing` which is separate.
    // If we keep `useBuybackPricing` for raw data sync, we can use it for `getSingleIssuePrice`.
    // Let's keep `getSingleIssuePrice` using `state.pricingData` (Client Side Snapshot) for UI badges, 
    // but use Server Action for the TOTAL (The Truth).

    // We re-implement getSingleIssuePrice to use the context data for speed/UI elements
    const { repairPrices: dynamicRepairPrices } = state.pricingData;

    const getSingleIssuePrice = useCallback((issueId: string) => {
        if (!state.deviceType || !state.selectedBrand || !state.selectedModel) return null;
        // ... (Same logic as before for UI badges)
        if (dynamicRepairPrices) {
            if (issueId === 'screen') {
                // Check if we have multiple qualities
                const p = [];
                if (dynamicRepairPrices.screen_original) p.push(dynamicRepairPrices.screen_original);
                if (dynamicRepairPrices.screen_generic) p.push(dynamicRepairPrices.screen_generic);
                if (p.length) return Math.min(...p);
            }
            return dynamicRepairPrices[issueId] || null;
        }
        return null;
    }, [state.deviceType, state.selectedBrand, state.selectedModel, dynamicRepairPrices]);


    return {
        sidebarEstimate: serverPrice, // The Source of Truth from Server
        // repairEstimates: ... // If we need variant prices, we might need to expand Server Action or use local state
        // For now, let's just expose what the UI consumes.
        // It seems `repairEstimates` object was used for the "Screen Quality Selection" step to show specific prices.
        // For that step, we should probably fetch those specifics.
        // But for "Sidebar Estimate", serverPrice is key.

        // We'll map serverPrice to the structure expected by consumers or adapt consumers.
        // Let's keep simpler API.

        repairEstimates: {
            standard: dynamicRepairPrices?.screen_generic ?? -1,
            original: dynamicRepairPrices?.screen_original ?? -1,
            oled: dynamicRepairPrices?.screen_oled ?? -1,
            hasScreen: state.repairIssues.includes('screen')
        },

        dynamicRepairPrices, // Pass through for UI badges
        dynamicBuybackPrices: state.pricingData.buybackPrices,

        buybackEstimate: serverPrice, // Unified

        getSingleIssuePrice,
        loading: isLoading
    };
};
