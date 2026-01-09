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
import { WizardExitIntent } from '../features/WizardExitIntent';
import { ToastProvider } from '../ui/Toast';
import { useWizardSEO } from '../../hooks/useWizardSEO';

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
import Sidebar from './Sidebar';
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
        screenState, bodyState, selectedScreenQuality,
        deliveryMethod, courierTier, hasHydrogel, controllerCount
    } = state;

    const { t, language } = useLanguage();
    const router = useRouter();
    const { shops, sendEmail } = useData();
    const { setSelectedShop } = useShop();

    const { handleNext, handleBack, handleModelSelect, loadBrandData, handleSubmit } = useWizardActions(type);
    const { sidebarEstimate, buybackEstimate, repairEstimates, loading: pricingLoading, dynamicRepairPrices, getSingleIssuePrice } = useWizardPricing(type);

    // --- SEO & META MANAGEMENT ---
    const { breadcrumbList, softwareApp } = useWizardSEO({
        type,
        step,
        selectedBrand: selectedBrand || undefined,
        selectedModel: selectedModel || undefined,
        deviceCategory: deviceType || undefined,
        estimateDisplay: type === 'buyback' ? buybackEstimate : sidebarEstimate,
        loading: pricingLoading
    });

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
                // console.log(`[BuybackRepair] Inferred category '${defaultMatch.deviceType}' for brand '${state.selectedBrand}'`);
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

        if (selectedBrand && selectedModel && state.pricingData.loadedForModel !== createSlug(`${selectedBrand} ${selectedModel}`)) {
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
            const isAppleSmartphone = selectedBrand?.toLowerCase() === 'apple' && (deviceType === 'smartphone' || deviceType === 'tablet');
            const isHomeConsole = deviceType === 'console_home';

            nextDisabled = !storage || turnsOn === null;
            if (turnsOn !== false) {
                nextDisabled = nextDisabled || worksCorrectly === null;

                // Smartphone specific checks
                if (deviceType === 'smartphone') {
                    nextDisabled = nextDisabled || isUnlocked === null;
                }

                // Apple specific checks
                if (isAppleSmartphone) {
                    nextDisabled = nextDisabled || !batteryHealth || faceIdWorking === null;
                }

                // Console specific checks
                if (isHomeConsole && (controllerCount === null || controllerCount === undefined)) {
                    nextDisabled = true;
                }
            }
        } else {
            nextDisabled = repairIssues.length === 0;
            // Also logic from StepCondition repair:
            if (!repairIssues.includes('other')) {
                nextLabel = t("Start Repair");
            }
        }
    } else if (step === 2) {
        nextDisabled = !selectedBrand || !selectedModel;
    } else if (step === 4 && type === 'repair') {
        nextLabel = t('Confirm Request');
    } else if (step === 5 && type === 'buyback') {
        nextLabel = t('Confirm Offer');
    }

    const handleMobileNext = () => {
        if (state.isWidget) {
            handleNext();
            return;
        }
        const isFinalStep = (type === 'buyback' && step === 5) || (type === 'repair' && step === 4);
        if (isFinalStep) {
            if (formRef.current) formRef.current.requestSubmit();
        } else {
            handleNext();
        }
    };

    const handleDesktopNext = () => {
        const isFinalStep = (type === 'buyback' && step === 5) || (type === 'repair' && step === 4);
        if (isFinalStep) {
            if (formRef.current) formRef.current.requestSubmit();
        } else {
            handleNext();
        }
    }



    return (
        <div className={`w-full ${state.isWidget ? 'py-0' : 'pb-32'}`}>
            <WizardExitIntent />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [breadcrumbList, softwareApp]
                    })
                }}
            />

            <StepIndicator step={step} type={type} t={t} isWidget={state.isWidget} />

            {/* Step 1: No Sidebar, No Card (usually) */}
            {step === 1 && (
                <AnimatePresence mode="wait">
                    <StepWrapper key="step1" stepKey="step1">
                        <StepCategorySelection
                            type={type}
                            step={step}
                            hideStep1Title={hideStep1Title}
                        />
                    </StepWrapper>
                </AnimatePresence>
            )}

            {/* Steps 2+: Glass Card Container (Sidebar Persistence) */}
            {step >= 2 && (
                <div className={`flex flex-col lg:flex-row w-full mx-auto gap-6 ${state.isWidget ? 'p-0 shadow-none border-0 bg-transparent' : 'max-w-7xl pb-24 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8'}`}>
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
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
                                        isKiosk={state.isKiosk}
                                    />
                                </StepWrapper>
                            )}
                        </AnimatePresence>
                    </div>

                    {!state.isWidget && (
                        <Sidebar
                            type={type}
                            step={step}
                            selectedBrand={selectedBrand}
                            selectedModel={selectedModel}
                            deviceType={deviceType}
                            storage={storage}
                            repairIssues={repairIssues}
                            estimateDisplay={sidebarEstimate}
                            onNext={handleDesktopNext}
                            handleBack={handleBack}
                            nextDisabled={nextDisabled}
                            nextLabel={nextLabel}
                            selectedScreenQuality={selectedScreenQuality}
                            repairEstimates={repairEstimates}
                            dynamicRepairPrices={dynamicRepairPrices}
                            getSingleIssuePrice={getSingleIssuePrice}
                            loading={pricingLoading}
                            deliveryMethod={deliveryMethod}
                            courierTier={courierTier}
                            hasHydrogel={hasHydrogel}
                            breakdown={state.priceBreakdown}
                        />
                    )}
                </div>
            )}

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
                        showEstimate={step >= 3 && (type === 'buyback' || repairIssues.length > 0)}
                        estimateDisplay={pricingLoading ? (
                            <div className="flex space-x-1 py-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        ) : (
                            sidebarEstimate > 0 ? (
                                <>€{sidebarEstimate}</>
                            ) : (
                                selectedModel ? (type === 'buyback' ? t('contact_for_price_buyback') : t('contact_for_price')) : '-'
                            )
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
            ...props.initialWizardProps,
            deviceType: props.initialWizardProps?.deviceType || props.initialCategory || '',
            selectedBrand: props.initialWizardProps?.selectedBrand || props.initialDevice?.brand || '',
            selectedModel: props.initialWizardProps?.selectedModel || props.initialDevice?.model || '',
            customerEmail: props.initialWizardProps?.customerEmail || '',
            partnerId: partnerId,
            isWidget: props.isWidget || false,
            isKiosk: props.isKiosk || false,
            isInitialized: !!props.initialWizardProps, // Mark as initialized if we have props (hydration)
            step: props.initialWizardProps?.step || ((props.initialDevice?.model && !['iphone', 'ipad', 'galaxy', 'pixels', 'switch'].includes(props.initialDevice.model.toLowerCase())) ? 3 : (props.initialDevice?.brand || props.initialCategory ? 2 : 1))
        }}>
            <ToastProvider>
                <BuybackRepairInner {...props} />
            </ToastProvider>
        </WizardProvider>
    );
};

export default BuybackRepair;
