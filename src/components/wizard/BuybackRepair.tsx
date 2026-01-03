'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useShop } from '../../hooks/useShop';
import { useData } from '../../hooks/useData';
import { useLanguage } from '../../hooks/useLanguage';
import { useRouter, useSearchParams } from 'next/navigation';

import { AnimatePresence } from 'framer-motion';
import { createSlug } from '../../utils/slugs';
import { WizardProvider, useWizard } from '../../context/WizardContext';
import { useWizardActions } from '../../hooks/useWizardActions';
import { useWizardPricing } from '../../hooks/useWizardPricing';
import { orderService } from '../../services/orderService';
import { auth } from '../../firebase';
import { signInAnonymously } from 'firebase/auth';

const ApolloLoader = () => (
    <div className="w-full h-96 rounded-4xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 dark:via-white/5 to-transparent skew-x-12 animate-[shimmer_1.5s_infinite]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-t-electric-indigo border-r-transparent border-b-electric-indigo border-l-transparent animate-spin"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Apollo Engine Loading</span>
        </div>
    </div>
);

const StepCategorySelection = dynamic(() => import('./steps/StepCategorySelection').then(mod => mod.StepCategorySelection));
const StepDeviceSelection = dynamic(() => import('./steps/StepDeviceSelection').then(mod => mod.StepDeviceSelection), {
    loading: () => <ApolloLoader />,
    ssr: false
});
const StepCondition = dynamic(() => import('./steps/StepCondition').then(mod => mod.StepCondition), {
    loading: () => <ApolloLoader />,
    ssr: false
});
const StepUserInfo = dynamic(() => import('./steps/StepUserInfo').then(mod => mod.StepUserInfo), {
    loading: () => <ApolloLoader />,
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
        } else if (!initialCategory && !state.deviceType && state.selectedBrand) {
            // INFERENCE LOGIC: If we have a brand but no category (e.g. /repair/apple),
            // infer the default category (e.g. smartphone) so models load correctly.
            const { findDefaultBrandCategory } = require('../../utils/deviceLogic');
            const defaultMatch = findDefaultBrandCategory(createSlug(state.selectedBrand));
            if (defaultMatch) {
                console.log(`[BuybackRepair] Inferred category '${defaultMatch.deviceType}' for brand '${state.selectedBrand}'`);
                dispatch({ type: 'SET_DEVICE_INFO', payload: { deviceType: defaultMatch.deviceType } });
            }
        }
    }, [initialCategory, dispatch, state.deviceType, state.selectedBrand]);

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
        // NOTE: With SSR pages, this might be redundant or cause double-fetching if the parent page handles it.
        // But for client-side navigation it's safe.
        if (selectedBrand && selectedModel && state.pricingData.loadedForModel !== createSlug(`${selectedBrand} ${selectedModel}`)) {
            // Only trigger if we are NOT on a server-rendered page that might already satisfy this?
            // Actually, handleModelSelect triggers a fetch. It's safe to keep for now.
            handleModelSelect(selectedModel);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run ONCE on mount

    // Calculate next disabled for mobile bottom bar
    const isAppleSmartphone = selectedBrand?.toLowerCase() === 'apple' && (deviceType === 'smartphone' || deviceType === 'tablet');
    let nextDisabled = false;
    let nextLabel = t('Next');

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
    } else if (step === 4 && type === 'repair') {
        // Step 4 is User Info for repair
        nextLabel = t('Confirm Request');
        // Validation is handled by form submission usually, so button triggers form submit or is disabled if invalid?
        // Actually StepUserInfo usually has its own submit button.
        // MobileBottomBar might want to trigger form submission
    } else if (step === 5 && type === 'buyback') {
        nextLabel = t('Confirm Offer');
    }

    const handleMobileNext = () => {
        const isFinalStep = (type === 'buyback' && step === 5) || (type === 'repair' && step === 4);
        if (isFinalStep) {
            if (formRef.current) formRef.current.requestSubmit();
        } else {
            handleNext();
        }
    };

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

            {/* APOLLO ENGINE: Mobile Controls */}
            {!state.isWidget && (
                (step === 2 && selectedModel) ||
                (step >= 3)
            ) && (
                    <MobileBottomBar
                        type={type}
                        onNext={handleMobileNext}
                        nextDisabled={nextDisabled}
                        nextLabel={nextLabel}
                        t={t}
                        showEstimate={step === 3}
                        estimateDisplay={pricingLoading ? (
                            <div className="flex space-x-1 py-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        ) : (
                            <>€{sidebarEstimate}</>
                        )}
                    />
                )}
        </div>
    );
};

const BuybackRepair: React.FC<BuybackRepairProps> = (props) => {
    const searchParams = useSearchParams();
    const partnerId = searchParams.get('partnerId') || props.initialWizardProps?.partnerId || '';

    return (
        <WizardProvider initialProps={{
            deviceType: props.initialWizardProps?.deviceType || props.initialCategory || '',
            selectedBrand: props.initialWizardProps?.selectedBrand || props.initialDevice?.brand || '',
            selectedModel: props.initialWizardProps?.selectedModel || props.initialDevice?.model || '',
            customerEmail: props.initialWizardProps?.customerEmail || '',
            partnerId: partnerId,
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