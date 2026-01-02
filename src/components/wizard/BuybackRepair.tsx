'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useShop } from '../../hooks/useShop';
import { useData } from '../../hooks/useData';
import { useLanguage } from '../../hooks/useLanguage';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { createSlug } from '../../utils/slugs';
import { WizardProvider, useWizard } from '../../context/WizardContext';
import { useWizardActions } from '../../hooks/useWizardActions';
import { useWizardPricing } from '../../hooks/useWizardPricing';
import { orderService } from '../../services/orderService';
import { auth } from '../../firebase';
import { signInAnonymously } from 'firebase/auth';

const StepCategorySelection = dynamic(() => import('./steps/StepCategorySelection').then(mod => mod.StepCategorySelection));
const StepDeviceSelection = dynamic(() => import('./steps/StepDeviceSelection').then(mod => mod.StepDeviceSelection), {
    loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />,
    ssr: false
});
const StepCondition = dynamic(() => import('./steps/StepCondition').then(mod => mod.StepCondition), {
    loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />,
    ssr: false
});
const StepUserInfo = dynamic(() => import('./steps/StepUserInfo').then(mod => mod.StepUserInfo), {
    loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />,
    ssr: false
});
import StepWrapper from './StepWrapper';
import StepIndicator from './StepIndicator';
import MobileBottomBar from './MobileBottomBar';

interface BuybackRepairProps {
    type: 'buyback' | 'repair';
    initialShop?: string;
    initialCategory?: string;
    initialDevice?: {
        brand: string;
        model: string;
    };
    hideStep1Title?: boolean;
    initialWizardProps?: any;
    isWidget?: boolean;
    isKiosk?: boolean;
}

const BuybackRepairInner: React.FC<BuybackRepairProps> = ({ type, initialShop, hideStep1Title, initialCategory }) => {
    const { state, dispatch } = useWizard();

    const {
        step, isTransitioning, isLoadingData,
        selectedBrand, selectedModel, customerEmail,
        repairIssues, storage, turnsOn, deviceType,
        worksCorrectly, isUnlocked, batteryHealth, faceIdWorking,
        screenState, bodyState
    } = state;

    const { t, language } = useLanguage();
    const router = useRouter();
    const { shops, sendEmail } = useData();
    const { setSelectedShop } = useShop();

    const { handleNext, handleBack, handleModelSelect, loadBrandData, handleSubmit } = useWizardActions(type);
    const { sidebarEstimate, buybackEstimate, repairEstimates, loading: pricingLoading } = useWizardPricing(type);

    const formRef = useRef<HTMLFormElement>(null);
    const modelSelectRef = useRef<HTMLDivElement>(null);

    // Recovery Logic: Check for session-stored state (Magic Link Recovery)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const recoveryData = sessionStorage.getItem('belmobile_recovery_state');
        if (recoveryData) {
            try {
                const hydratedState = JSON.parse(recoveryData);
                // Clean up to prevent re-hydrating on refresh
                sessionStorage.removeItem('belmobile_recovery_state');

                // Nuclear Hydration
                dispatch({
                    type: 'HYDRATE',
                    payload: {
                        ...hydratedState,
                        isInitialized: true,
                        // If we are recovering, we probably want to be on the last step (User Info)
                        // but let's respect the saved step if it exists
                    }
                });
            } catch (e) {
                console.error('Failed to parse recovery state', e);
            }
        }
    }, [dispatch]);

    // Sync Shop
    useEffect(() => {
        if (shops.length > 0 && initialShop) {
            const shop = shops.find(s => createSlug(s.name) === initialShop || s.id === initialShop);
            if (shop && shop.status === 'open') setSelectedShop(shop);
        }
    }, [initialShop, shops, setSelectedShop]);

    // React to initialCategory prop changes (Sync State with URL)
    useEffect(() => {
        if (initialCategory && initialCategory !== state.deviceType) {
            dispatch({ type: 'SET_DEVICE_INFO', payload: { deviceType: initialCategory } });
        }
    }, [initialCategory, dispatch, state.deviceType]);

    // Data Loading
    useEffect(() => {
        if (selectedBrand) {
            loadBrandData(createSlug(selectedBrand));
        }
    }, [selectedBrand, loadBrandData]);

    // Initial Pricing Load (Deep Link Fix)
    useEffect(() => {
        // --- CLIENT-SIDE REDIRECT FIX (PlayStation 5) ---
        // Force redirect from generic PS5 to "Disc" edition to bypass browser cache issues
        if (selectedBrand === 'Sony' && selectedModel === 'Playstation 5') {
            let slug = 'repair';
            if (language === 'fr') slug = 'reparation';
            if (language === 'nl') slug = 'reparatie';
            if (language === 'tr') slug = 'onarim';

            const newPath = `/${language}/${slug}/sony/playstation-5-disc`;
            router.replace(newPath);
            return;
        }

        // --- CLIENT-SIDE REDIRECT FIX (Nintendo 3DS) ---
        // Legacy URL /pages/reparation-3ds-2ds-xl-bruxelles often mis-redirects to generic
        // or the user lands on a page where the model isn't selected.
        // We detect if we are on the generic /nintendo page but with a 3ds intent?
        // Actually, if the user lands on /reparation/nintendo/new-3ds-xl, the model should be selected.
        // If they land on /reparation (Step 1), selectedBrand is null.
        // But we can check the window.location.pathname if needed, or rely on URL props.
        // The issue is likely the '3ds-2ds-xl' part of the legacy URL is confusing things if not redirected properly.
        // If the server redirect works, they hit /fr/reparation/nintendo/new-3ds-xl.
        // If they hit that, selectedModel should be 'New 3DS XL'.

        // If the user says "sending to first step", it means the redirect FAILED and they went to /fr/reparation.
        // In that case, window.location.href might still show the old legacy URL if next.config.ts didn't catch it?
        // No, Next.js handles redirects server-side.
        // If they end up on "First Step" (Category Selection), it means `initialDevice` was null.
        // Which means they landed on `/fr/reparation`.
        // So the redirect rule `/pages/reparation-3ds...` -> `/fr/reparation` (Generic Fallback) might have triggered instead of the specific one.
        // But I put the specific one ABOVE the generic one.
        // Browser cache again?
        // I will add a window check here to be 100% nuclear.

        if (typeof window !== 'undefined' && window.location.pathname.includes('reparation-3ds-2ds-xl-bruxelles')) {
            let slug = 'repair';
            if (language === 'fr') slug = 'reparation';
            if (language === 'nl') slug = 'reparatie';
            if (language === 'tr') slug = 'onarim';

            const newPath = `/${language}/${slug}/nintendo/new-3ds-xl`;
            router.replace(newPath);
            return;
        }

        // If we have a brand and model selected on mount, but no pricing data loaded for it, trigger the selection logic.
        if (selectedBrand && selectedModel && state.pricingData.loadedForModel !== createSlug(`${selectedBrand} ${selectedModel}`)) {
            handleModelSelect(selectedModel);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run ONCE on mount

    // Calculate next disabled for mobile bottom bar
    const isAppleSmartphone = selectedBrand?.toLowerCase() === 'apple' && (deviceType === 'smartphone' || deviceType === 'tablet');
    let nextDisabled = false;
    if (step === 3) {
        if (type === 'buyback') {
            nextDisabled = !storage || turnsOn === null;
            if (turnsOn !== false) {
                nextDisabled = nextDisabled || worksCorrectly === null || isUnlocked === null || (isAppleSmartphone && (!batteryHealth || faceIdWorking === null));
            }
        } else {
            nextDisabled = repairIssues.length === 0;
        }
    } else if (step === 2) {
        nextDisabled = !selectedBrand || !selectedModel;
    }

    return (
        <div className={`w-full ${state.isWidget ? 'py-0' : 'pb-32'}`}>
            <StepIndicator step={step} type={type} t={t} isWidget={state.isWidget} />

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <StepWrapper key="step1" stepKey="step1">
                        <StepCategorySelection
                            type={type}
                            step={step}
                            hideStep1Title={hideStep1Title}
                        />
                    </StepWrapper>
                )}

                {step === 2 && (
                    <StepWrapper key="step2" stepKey="step2">
                        <StepDeviceSelection
                            type={type}
                            modelSelectRef={modelSelectRef}
                        />
                    </StepWrapper>
                )}

                {step === 3 && (
                    <StepWrapper key="step3" stepKey="step3">
                        <StepCondition
                            type={type}
                        />
                    </StepWrapper>
                )}

                {(step === 4 || (step === 5 && type === 'buyback')) && (
                    <StepWrapper key="step4" stepKey="step4">
                        <StepUserInfo
                            type={type}
                            formRef={formRef}
                        />
                    </StepWrapper>
                )}
            </AnimatePresence>
        </div>
    );
};

const BuybackRepair: React.FC<BuybackRepairProps> = (props) => {
    return (
        <WizardProvider initialProps={{
            deviceType: props.initialWizardProps?.deviceType || props.initialCategory || '',
            selectedBrand: props.initialWizardProps?.selectedBrand || props.initialDevice?.brand || '',
            selectedModel: props.initialWizardProps?.selectedModel || props.initialDevice?.model || '',
            customerEmail: props.initialWizardProps?.customerEmail || '',
            partnerId: props.initialWizardProps?.partnerId || '',
            isWidget: props.isWidget || false,
            isKiosk: props.isKiosk || false,
            isInitialized: false,
            step: props.initialWizardProps?.step || ((props.initialDevice?.model && !['iphone', 'ipad', 'galaxy', 'pixels', 'switch'].includes(props.initialDevice.model.toLowerCase())) ? 3 : (props.initialDevice?.brand || props.initialCategory ? 2 : 1))
        }}>
            <BuybackRepairInner {...props} />
        </WizardProvider>
    );
};

export default BuybackRepair;