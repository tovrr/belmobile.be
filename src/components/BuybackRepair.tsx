'use client';

import React, { useEffect, useRef } from 'react';
import { useShop } from '../hooks/useShop';
import { useData } from '../hooks/useData';
import { useLanguage } from '../hooks/useLanguage';
import { useRouter } from 'next/navigation';

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
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950/50 pb-32">
            <StepIndicator step={step} type={type} t={t} />

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
                            step={step}
                            onNext={handleNext}
                            onBack={handleBack}
                            modelSelectRef={modelSelectRef}
                        />
                    </StepWrapper>
                )}

                {step === 3 && (
                    <StepWrapper key="step3" stepKey="step3">
                        <StepCondition
                            type={type}
                            step={step}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    </StepWrapper>
                )}

                {step === 4 && (
                    <StepWrapper key="step4" stepKey="step4">
                        <StepUserInfo
                            type={type}
                            step={step}
                            onNext={() => formRef.current?.requestSubmit()}
                            onBack={handleBack}
                            handleSubmit={handleSubmit}
                            formRef={formRef}
                            shops={shops}
                        />
                    </StepWrapper>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Bar */}
            <MobileBottomBar
                type={type}
                onNext={step === 4 ? () => formRef.current?.requestSubmit() : handleNext}
                nextDisabled={nextDisabled || isLoadingData || isTransitioning}
                estimateDisplay={sidebarEstimate}
                t={t}
            />
        </div>
    );
};

export default BuybackRepair;