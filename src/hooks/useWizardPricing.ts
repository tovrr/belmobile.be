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
    const { t, language } = useLanguage();

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
        batteryHealth, faceIdWorking, isUnlocked, controllerCount,
        selectedScreenQuality
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
            controllerCount: controllerCount ?? undefined,
            selectedScreenQuality: selectedScreenQuality || undefined,
            language: language as any || 'fr'
        };
    }, [
        selectedBrand, selectedModel, repairIssues, storage,
        turnsOn, worksCorrectly, screenState, bodyState,
        batteryHealth, faceIdWorking, isUnlocked, controllerCount,
        selectedScreenQuality,
        type, t, language
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
    const { repairPrices: dynamicRepairPrices } = state.pricingData;

    const getSingleIssuePrice = useCallback((issueId: string) => {
        // AEGIS FIX: Fallback to smartphone if deviceType is missing to preventing pricing lockout
        const currentDeviceType = state.deviceType || 'smartphone';
        if (!currentDeviceType || !state.selectedBrand || !state.selectedModel) return null; // Wait for core data
        if (dynamicRepairPrices) {
            if (issueId === 'screen') {
                const p: number[] = [];
                if (dynamicRepairPrices.screen_original > 0) p.push(dynamicRepairPrices.screen_original);
                if (dynamicRepairPrices.screen_generic > 0) p.push(dynamicRepairPrices.screen_generic);
                if (dynamicRepairPrices.screen > 0) p.push(dynamicRepairPrices.screen); // Fallback to base key

                if (p.length > 0) return Math.min(...p);
            }
            if (issueId === 'battery') {
                return dynamicRepairPrices.battery ?? dynamicRepairPrices.battery_original ?? dynamicRepairPrices.battery_generic ?? null;
            }
            return dynamicRepairPrices[issueId] || null;
        }
        return null;
    }, [state.deviceType, state.selectedBrand, state.selectedModel, dynamicRepairPrices]);

    return {
        sidebarEstimate: serverPrice, // The Source of Truth from Server
        breakdown: priceBreakdown, // Expose the detailed breakdown
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
