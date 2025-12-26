'use client';

import React, { useEffect, useRef } from 'react';
import { useShop } from '../hooks/useShop';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

import { createSlug } from '../utils/slugs';
import { WizardProvider, useWizard } from '../context/WizardContext';
import { useWizardActions } from '../hooks/useWizardActions';
import { useWizardPricing } from '../hooks/useWizardPricing';
import { orderService } from '../services/orderService';

import { StepCategorySelection } from './wizard/steps/StepCategorySelection';
import { StepDeviceSelection } from './wizard/steps/StepDeviceSelection';
import { StepCondition } from './wizard/steps/StepCondition';
import { StepUserInfo } from './wizard/steps/StepUserInfo';
import StepWrapper from './wizard/StepWrapper';
import StepIndicator from './wizard/StepIndicator';
import MobileBottomBar from './wizard/MobileBottomBar';

interface BuybackRepairProps {
    type: 'buyback' | 'repair';
    initialShop?: string;
    initialCategory?: string;
    initialDevice?: {
        brand: string;
        model: string;
    };
    hideStep1Title?: boolean;
}

const BuybackRepair: React.FC<BuybackRepairProps> = (props) => {
    return (
        <WizardProvider initialProps={{
            deviceType: props.initialCategory || '',
            selectedBrand: props.initialDevice?.brand || '',
            selectedModel: props.initialDevice?.model || '',
            isInitialized: false,
            step: (props.initialDevice?.model && !['iphone', 'ipad', 'galaxy', 'pixels', 'switch'].includes(props.initialDevice.model.toLowerCase())) ? 3 : (props.initialDevice?.brand || props.initialCategory ? 2 : 1)
        }}>
            <BuybackRepairInner {...props} />
        </WizardProvider>
    );
};

const BuybackRepairInner: React.FC<BuybackRepairProps> = ({ type, initialShop, hideStep1Title }) => {
    const { state, dispatch } = useWizard();
    const {
        step, isTransitioning, isLoadingData, isInitialized,
        selectedBrand, selectedModel, customerEmail,
        repairIssues, storage, turnsOn, deviceType,
        worksCorrectly, isUnlocked, batteryHealth, faceIdWorking,
        screenState, bodyState
    } = state;

    const { t, language } = useLanguage();
    const router = useRouter();
    const { shops, sendEmail } = useData();
    const { setSelectedShop } = useShop();

    const { handleNext, handleBack, handleModelSelect, loadBrandData } = useWizardActions(type);
    const { sidebarEstimate, buybackEstimate, repairEstimates } = useWizardPricing(type);

    const formRef = useRef<HTMLFormElement>(null);
    const modelSelectRef = useRef<HTMLDivElement>(null);

    // Sync Shop
    useEffect(() => {
        if (shops.length > 0 && initialShop) {
            const shop = shops.find(s => createSlug(s.name) === initialShop || s.id === initialShop);
            if (shop && shop.status === 'open') setSelectedShop(shop);
        }
    }, [initialShop, shops, setSelectedShop]);

    // Data Loading
    useEffect(() => {
        if (selectedBrand) loadBrandData(createSlug(selectedBrand));
    }, [selectedBrand, loadBrandData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: true } });
            const { readableId, firestoreData } = await orderService.submitOrder({
                ...state,
                type,
                price: type === 'buyback' ? buybackEstimate : repairEstimates.standard,
                condition: type === 'buyback' ? { screen: screenState || null, body: bodyState || null } : null,
                issues: type === 'repair' ? repairIssues : null,
                language: language || 'fr',
                brand: selectedBrand,
                model: selectedModel
            }, t);

            await orderService.generateAndSendPDF(readableId, firestoreData, language || 'fr', t, sendEmail);
            router.push(`/${language}/track-order?id=${readableId}&email=${encodeURIComponent(customerEmail)}&success=true`);
        } catch (error) {
            console.error('Submission error:', error);
            alert(t('error_submitting_order'));
        } finally {
            dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: false } });
        }
    };

    // Calculate next disabled for mobile bottom bar
    // This logic duplicates logic in StepCondition, but necessary for the specific MobileBottomBar placement
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
    }

    return (
        <div className="bg-transparent pt-0 pb-12 px-4 relative min-h-[600px]">
            {!isInitialized && !state.selectedBrand ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-bel-blue border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {(isTransitioning || isLoadingData) && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl animate-fade-in pointer-events-none h-full w-full">
                            <div className="w-16 h-16 border-4 border-bel-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-bold text-gray-900 dark:text-white animate-pulse">{t('Loading details...')}</p>
                        </div>
                    )}
                    <div className="max-w-6xl mx-auto">
                        <StepIndicator type={type} step={step} t={t} />
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <StepWrapper key="step1" stepKey={1}>
                                    <StepCategorySelection
                                        type={type}
                                        step={step}
                                        hideStep1Title={hideStep1Title}
                                    />
                                </StepWrapper>
                            )}
                            {step === 2 && (
                                <StepWrapper key="step2" stepKey={2}>
                                    <StepDeviceSelection
                                        type={type}
                                        step={step}
                                        onBack={handleBack}
                                        onNext={handleNext}
                                        modelSelectRef={modelSelectRef}
                                    />
                                </StepWrapper>
                            )}
                            {step === 3 && (
                                <StepWrapper key="step3" stepKey={3}>
                                    <StepCondition
                                        type={type}
                                        step={step}
                                        onNext={handleNext}
                                        onBack={handleBack}
                                    />
                                </StepWrapper>
                            )}
                            {step === 4 && (
                                <StepWrapper key="step4" stepKey={4}>
                                    <StepUserInfo
                                        type={type}
                                        step={step}
                                        onNext={handleNext}
                                        onBack={handleBack}
                                        handleSubmit={handleSubmit}
                                        formRef={formRef}
                                    />
                                </StepWrapper>
                            )}
                            {step === 5 && type === 'buyback' && (
                                <StepWrapper key="step5" stepKey={5}>
                                    <StepUserInfo
                                        type={type}
                                        step={step}
                                        onNext={handleNext}
                                        onBack={handleBack}
                                        handleSubmit={handleSubmit}
                                        formRef={formRef}
                                    />
                                </StepWrapper>
                            )}
                        </AnimatePresence>
                    </div>
                    {((step >= 3 && step <= 5 && type === 'buyback') || (step >= 3 && step <= 4 && type === 'repair')) && (
                        <MobileBottomBar
                            onNext={handleNext}
                            nextDisabled={nextDisabled}
                            nextLabel={type === 'repair' ? (repairIssues.includes('other') ? t('Next') : t('Start Repair')) : (step === 4 ? t('Accept & Recycle') : undefined)}
                            showEstimate={true}
                            estimateDisplay={sidebarEstimate}
                            type={type}
                            t={t}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default BuybackRepair;