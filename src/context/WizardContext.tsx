'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { BuybackPriceRecord, RepairPriceRecord } from '../types';
import { pricingService } from '../services/pricingService';
import { createSlug } from '../utils/slugs';

/**
 * STATE DEFINITION
 */
export interface WizardState {
    step: number;
    deviceType: string;
    selectedBrand: string;
    selectedModel: string;
    storage: string;

    // Condition (Buyback)
    turnsOn: boolean | null;
    worksCorrectly: boolean | null;
    isUnlocked: boolean | null;
    batteryHealth: 'normal' | 'service' | null;
    faceIdWorking: boolean | null;
    screenState: 'flawless' | 'scratches' | 'cracked';
    bodyState: 'flawless' | 'scratches' | 'dents' | 'bent';

    // Repair
    repairIssues: string[];
    hasHydrogel: boolean;
    selectedScreenQuality: 'generic' | 'oled' | 'original' | '';

    // User Info
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
    customerZip: string;
    deliveryMethod: 'dropoff' | 'send' | 'courier' | null;
    courierTier: 'bridge' | 'brussels';
    termsAccepted: boolean;
    iban: string;
    servicePoint: any | null;
    idFile: File | null;
    honeypot: string;

    // Dynamic Data
    modelsData: Record<string, Record<string, number>>;
    specsData: Record<string, string[]>;

    // Global Pricing Persistence (Phase 1 Fix)
    pricingData: {
        repairPrices: Record<string, number>;
        buybackPrices: BuybackPriceRecord[];
        deviceImage: string | null;
        isLoading: boolean;
        loadedForModel: string | null;
    };

    // UI/UX Logic State
    isTransitioning: boolean;
    isLoadingData: boolean;
    isInitialized: boolean;
    showResumeBanner: boolean;
    shopSelectionError: boolean;
    isShopListOpen: boolean;
}

const initialState: WizardState = {
    step: 1,
    deviceType: '',
    selectedBrand: '',
    selectedModel: '',
    storage: '',
    turnsOn: null,
    worksCorrectly: null,
    isUnlocked: null,
    batteryHealth: null,
    faceIdWorking: null,
    screenState: 'flawless',
    bodyState: 'flawless',
    repairIssues: [],
    hasHydrogel: false,
    selectedScreenQuality: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    customerZip: '',
    deliveryMethod: 'dropoff',
    courierTier: 'bridge',
    termsAccepted: false,
    iban: '',
    servicePoint: null,
    idFile: null,
    honeypot: '',
    modelsData: {},
    specsData: {},
    pricingData: {
        repairPrices: {},
        buybackPrices: [],
        deviceImage: null,
        isLoading: false,
        loadedForModel: null,
    },
    isTransitioning: false,
    isLoadingData: false,
    isInitialized: false,
    showResumeBanner: false,
    shopSelectionError: false,
    isShopListOpen: false,
};

/**
 * ACTIONS
 */
type WizardAction =
    | { type: 'SET_STEP'; payload: number }
    | { type: 'SET_DEVICE_INFO'; payload: Partial<WizardState> }
    | { type: 'SET_CONDITION'; payload: Partial<WizardState> }
    | { type: 'SET_REPAIR_INFO'; payload: Partial<WizardState> }
    | { type: 'SET_USER_INFO'; payload: Partial<WizardState> }
    | { type: 'SET_UI_STATE'; payload: Partial<WizardState> }
    | { type: 'SET_WIZARD_DATA'; payload: Partial<WizardState> }
    | { type: 'SET_PRICING_DATA'; payload: Partial<WizardState['pricingData']> } // Phase 1 Fix
    | { type: 'RESET_WIZARD' }
    | { type: 'HYDRATE'; payload: Partial<WizardState> };

/**
 * REDUCER
 */
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, step: action.payload };
        // Consolidate payload handling for flexibility
        case 'SET_DEVICE_INFO':
        case 'SET_CONDITION':
        case 'SET_REPAIR_INFO':
        case 'SET_USER_INFO':
        case 'SET_UI_STATE':
        case 'SET_WIZARD_DATA':
        case 'HYDRATE':
            const updateProps = action.type === 'HYDRATE' ? { isInitialized: true } : {};
            return { ...state, ...action.payload, ...updateProps };
        case 'SET_PRICING_DATA':
            return {
                ...state,
                pricingData: { ...state.pricingData, ...action.payload }
            };
        case 'RESET_WIZARD':
            return { ...initialState, isInitialized: true };
        default:
            return state;
    }
}

/**
 * CONTEXT
 */
interface WizardContextType {
    state: WizardState;
    dispatch: React.Dispatch<WizardAction>;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: ReactNode, initialProps?: Partial<WizardState> }> = ({ children, initialProps }) => {
    const [state, dispatch] = useReducer(wizardReducer, { ...initialState, ...initialProps });

    // --- Global Pricing Fetcher (Phase 1 Fix) ---
    useEffect(() => {
        const { selectedBrand, selectedModel, pricingData } = state;

        // 1. Check eligibility
        if (!selectedBrand || !selectedModel) return;

        const slug = createSlug(`${selectedBrand} ${selectedModel}`);

        // 2. Check cache/loading status
        if (pricingData.loadedForModel === slug || pricingData.isLoading) return;

        // 3. Fetch
        const fetchPricing = async () => {
            dispatch({ type: 'SET_PRICING_DATA', payload: { isLoading: true } });
            try {
                const data = await pricingService.fetchDevicePricing(slug);
                dispatch({
                    type: 'SET_PRICING_DATA',
                    payload: {
                        repairPrices: data.repairPrices,
                        buybackPrices: data.buybackPrices,
                        deviceImage: data.deviceImage,
                        isLoading: false,
                        loadedForModel: slug
                    }
                });
            } catch (err) {
                console.error("Global pricing fetch failed", err);
                dispatch({ type: 'SET_PRICING_DATA', payload: { isLoading: false } });
            }
        };

        fetchPricing();
    }, [state.selectedBrand, state.selectedModel, state.pricingData.loadedForModel, state.pricingData.isLoading]);

    return (
        <WizardContext.Provider value={{ state, dispatch }}>
            {children}
        </WizardContext.Provider>
    );
};

export const useWizard = () => {
    const context = useContext(WizardContext);
    if (!context) {
        throw new Error('useWizard must be used within a WizardProvider');
    }
    return context;
};
