'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
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

const StepCategorySelection = dynamic(() => import('./wizard/steps/StepCategorySelection').then(mod => mod.StepCategorySelection));
const StepDeviceSelection = dynamic(() => import('./wizard/steps/StepDeviceSelection').then(mod => mod.StepDeviceSelection), {
    loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />,
    ssr: false
});
const StepCondition = dynamic(() => import('./wizard/steps/StepCondition').then(mod => mod.StepCondition), {
    loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />,
    ssr: false
});
const StepUserInfo = dynamic(() => import('./wizard/steps/StepUserInfo').then(mod => mod.StepUserInfo), {
    loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 dark:bg-slate-800 rounded-3xl" />,
    ssr: false
});
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
    initialWizardProps?: any;
}

const BuybackRepair: React.FC<BuybackRepairProps> = (props) => {
    return (
        <WizardProvider initialProps={{
            deviceType: props.initialWizardProps?.deviceType || props.initialCategory || '',
            selectedBrand: props.initialWizardProps?.selectedBrand || props.initialDevice?.brand || '',
            selectedModel: props.initialWizardProps?.selectedModel || props.initialDevice?.model || '',
            customerEmail: props.initialWizardProps?.customerEmail || '',
            isInitialized: false,
            step: props.initialWizardProps?.step || ((props.initialDevice?.model && !['iphone', 'ipad', 'galaxy', 'pixels', 'switch'].includes(props.initialDevice.model.toLowerCase())) ? 3 : (props.initialDevice?.brand || props.initialCategory ? 2 : 1))
        }}>
            <BuybackRepairInner {...props} />
        </WizardProvider>
    );
};

import { auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';

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

    const { handleNext, handleBack, handleModelSelect, loadBrandData, handleSubmit } = useWizardActions(type);
    const { sidebarEstimate, buybackEstimate, repairEstimates, loading: pricingLoading } = useWizardPricing(type);

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
        <div className="w-full pb-32">
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

            {/* Mobile Bottom Bar */}
            <MobileBottomBar
                type={type}
                onNext={((type === 'buyback' && step === 5) || (type === 'repair' && step === 4)) ? () => formRef.current?.requestSubmit() : handleNext}
                nextDisabled={!!(nextDisabled || isLoadingData || isTransitioning || pricingLoading)}
                showEstimate={step > 1}
                estimateDisplay={pricingLoading ? <span className="animate-pulse opacity-50">...</span> : sidebarEstimate}
                hideNextButton={step < 3}
                t={t}
            />
        </div>
    );
};

export default BuybackRepair;