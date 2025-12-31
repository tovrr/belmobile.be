import React, { memo, useState, useEffect } from 'react';
import {
    ChevronLeftIcon, CheckCircleIcon, BuildingStorefrontIcon, TruckIcon,
    ChevronRightIcon, XMarkIcon, MapPinIcon, ClockIcon, CloudArrowUpIcon,
    DocumentIcon, TrashIcon, ShieldCheckIcon, CheckIcon, BanknotesIcon, DocumentTextIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Bike } from 'lucide-react';
import Sidebar from '../Sidebar';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Image from 'next/image';
import { createSlug, slugToDisplayName } from '../../../utils/slugs';
import { getDeviceImage } from '../../../data/deviceImages';
import { REPAIR_ISSUES } from '../../../constants';
import { parseAddressString } from '../../../utils/addressParser';
import { useWizard } from '../../../context/WizardContext';
import { useWizardActions } from '../../../hooks/useWizardActions';
import { useWizardPricing } from '../../../hooks/useWizardPricing';
import { useLanguage } from '../../../hooks/useLanguage';
import { useShop } from '../../../hooks/useShop';
import { useData } from '../../../hooks/useData';
import { useRouter } from 'next/navigation';
import { TrustBar } from '../TrustBar';
import { WizardFAQ } from '../WizardFAQ';
import { orderService } from '../../../services/orderService';

interface StepUserInfoProps {
    type: 'buyback' | 'repair';
    step?: number;
    onNext?: () => void;
    onBack?: () => void;
    handleSubmit?: (e: React.FormEvent) => void;
    formRef?: React.RefObject<HTMLFormElement | null>;
    shops?: any[];
    [key: string]: any;
}

export const StepUserInfo: React.FC<StepUserInfoProps> = memo(({
    type,
    formRef
}) => {
    const { state, dispatch } = useWizard();
    const { t, language } = useLanguage();
    const { shops } = useData();
    const { handleBack, handleNext, handleSubmit } = useWizardActions(type);
    const router = useRouter();
    const { selectedShop, setSelectedShop } = useShop();

    const [processingStep, setProcessingStep] = React.useState(0);

    // Suspense Message Cycle
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state.isTransitioning) {
            setProcessingStep(1);
            interval = setInterval(() => {
                setProcessingStep(prev => (prev >= 3 ? 3 : prev + 1));
            }, 1500);
        } else {
            setProcessingStep(0);
        }
        return () => clearInterval(interval);
    }, [state.isTransitioning]);

    const getProcessingText = () => {
        if (processingStep === 1) return t('processing_step_1');
        if (processingStep === 2) return t('processing_step_2');
        if (processingStep === 3) return t('processing_step_3');
        return t('processing_generic');
    };

    const step = state.step;
    const onBack = handleBack;
    const onNext = (type === 'buyback' && step === 4) ? handleNext : () => formRef?.current?.requestSubmit();
    const onHandleSubmit = handleSubmit;


    // Actions are not heavily used here except maybe navigation if we wanted, 
    // but we use passed onBack/onNext or handleSubmit

    // Pricing
    const {
        sidebarEstimate,
        repairEstimates,
        dynamicRepairPrices,
        getSingleIssuePrice,
        buybackEstimate,
        loading
    } = useWizardPricing(type);

    const {
        deviceType,
        selectedBrand,
        selectedModel,
        storage,
        repairIssues,
        selectedScreenQuality,
        screenState,
        bodyState,
        deliveryMethod,
        shopSelectionError,
        isShopListOpen,
        servicePoint,
        courierTier,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        customerZip,
        customerCity,
        iban,
        idFile,
        hasHydrogel,
        honeypot,
        termsAccepted,
        isCompany,
        companyName,
        vatNumber,
        notificationPreferences
    } = state;

    // Setters
    const setScreenState = (val: any) => dispatch({ type: 'SET_WIZARD_DATA', payload: { screenState: val } });
    const setBodyState = (val: any) => dispatch({ type: 'SET_WIZARD_DATA', payload: { bodyState: val } });
    const setDeliveryMethod = (val: any) => dispatch({ type: 'SET_WIZARD_DATA', payload: { deliveryMethod: val } });
    const setShopSelectionError = (val: boolean) => dispatch({ type: 'SET_WIZARD_DATA', payload: { shopSelectionError: val } });
    const setIsShopListOpen = (val: boolean) => dispatch({ type: 'SET_WIZARD_DATA', payload: { isShopListOpen: val } });
    const setServicePoint = (val: any) => dispatch({ type: 'SET_WIZARD_DATA', payload: { servicePoint: val } });
    const setCourierTier = (val: any) => dispatch({ type: 'SET_WIZARD_DATA', payload: { courierTier: val } });
    const setCustomerName = (val: string) => dispatch({ type: 'SET_WIZARD_DATA', payload: { customerName: val } });
    const setCustomerPhone = (val: string) => dispatch({ type: 'SET_WIZARD_DATA', payload: { customerPhone: val } });
    const setCustomerEmail = (val: string) => dispatch({ type: 'SET_WIZARD_DATA', payload: { customerEmail: val } });
    const setCustomerAddress = (val: string) => dispatch({ type: 'SET_WIZARD_DATA', payload: { customerAddress: val } });
    const setCustomerZip = (val: string) => dispatch({ type: 'SET_WIZARD_DATA', payload: { customerZip: val } });
    const setCustomerCity = (val: string) => dispatch({ type: 'SET_WIZARD_DATA', payload: { customerCity: val } });
    const setIban = (val: string) => dispatch({ type: 'SET_WIZARD_DATA', payload: { iban: val } });
    const setIdFile = (val: File | null) => dispatch({ type: 'SET_WIZARD_DATA', payload: { idFile: val } });
    const setHasHydrogel = (val: boolean) => dispatch({ type: 'SET_WIZARD_DATA', payload: { hasHydrogel: val } });
    const setHoneypot = (val: string) => dispatch({ type: 'SET_WIZARD_DATA', payload: { honeypot: val } });
    const setIsCompany = (val: boolean) => dispatch({ type: 'SET_WIZARD_DATA', payload: { isCompany: val } });
    const setCompanyName = (val: string) => dispatch({ type: 'SET_WIZARD_DATA', payload: { companyName: val } });
    const setVatNumber = (val: string) => dispatch({ type: 'SET_WIZARD_DATA', payload: { vatNumber: val } });
    const setNotificationPreferences = (val: ('email' | 'whatsapp' | 'sms')[]) => dispatch({ type: 'SET_WIZARD_DATA', payload: { notificationPreferences: val } });

    const [validatingVat, setValidatingVat] = useState(false);
    const [vatValidationError, setVatValidationError] = useState<string | null>(null);

    const handleVatBlur = async () => {
        if (!vatNumber || vatNumber.length < 5) return;
        setValidatingVat(true);
        setVatValidationError(null);
        try {
            const res = await fetch('/api/b2b/validate-vat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vatNumber })
            });
            const data = await res.json();
            if (!data.isValid) {
                setVatValidationError(data.message || 'Invalid VAT number');
            }
        } catch (err) {
            console.error('VAT validation failed', err);
        } finally {
            setValidatingVat(false);
        }
    };

    const handleEmailBlur = async () => {
        if (!customerEmail || !customerEmail.includes('@')) return;

        // Capture context for lead recovery
        const leadContext = {
            type,
            brand: selectedBrand,
            model: selectedModel,
            name: customerName,
            phone: customerPhone,
            storage,
            lang: language,
            issues: repairIssues,
            timestamp: Date.now()
        };

        // Sanitize state for Firestore (remove File objects)
        const sanitizedState = { ...state };
        delete (sanitizedState as any).idFile;

        await orderService.saveLead(customerEmail, leadContext, sanitizedState);
    };
    const setTermsAccepted = (val: boolean) => dispatch({ type: 'SET_WIZARD_DATA', payload: { termsAccepted: val } });

    // SendCloud / Service Point logic
    const openServicePointPicker = () => {
        const sendcloud = (window as any).sendcloud;
        if (typeof window !== 'undefined' && sendcloud && sendcloud.servicePointPicker) {
            sendcloud.servicePointPicker.open({
                apiKey: process.env.NEXT_PUBLIC_SENDCLOUD_API_KEY || 'AIzaSyDbBU2HDNb_CravJAIbYKqsWhhbAgVBelY', // Fallback just in case
                country: 'be',
                language: 'en-us',
                onSelect: (data: any) => {
                    setServicePoint(data);
                }
            });
        } else {
            console.warn("SendCloud not loaded");
            alert(t ? t('Service Point Picker is loading...') : "Service Point Picker is loading...");
        }
    };

    // -------------------------------------------------------------------------
    // HANDLERS: Intelligent Address Parser
    // -------------------------------------------------------------------------
    const handleAddressPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData('text');
        if (!pastedText) return;

        const parsed = parseAddressString(pastedText);

        if (parsed.confidence >= 0.8) {
            e.preventDefault();
            setCustomerAddress(parsed.streetAddress.replace(/\b\w/g, c => c.toUpperCase()));
            if (parsed.postalCode) setCustomerZip(parsed.postalCode);
            if (parsed.city) setCustomerCity(parsed.city.replace(/\b\w/g, c => c.toUpperCase()));
        }
    };

    // -------------------------------------------------------------------------
    // RENDER: Mobile Summary Helper
    // -------------------------------------------------------------------------
    const renderMobileSummary = () => {
        const isBuyback = type === 'buyback';
        let estimateDisplay: React.ReactNode = null;
        if (loading) {
            estimateDisplay = <span className="animate-pulse opacity-50">...</span>;
        } else if (isBuyback) {
            estimateDisplay = buybackEstimate > 0 ? <>&euro;{buybackEstimate}</> : <span className="text-bel-blue dark:text-blue-400 text-lg">{t('contact_for_price')}</span>;
        } else {
            if (repairIssues.length === 0) {
                estimateDisplay = <span className="text-gray-400">-</span>;
            } else if (repairIssues.includes('other')) {
                estimateDisplay = <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span>;
            } else {
                if (repairEstimates.hasScreen && selectedScreenQuality) {
                    if (selectedScreenQuality === 'original') estimateDisplay = repairEstimates.original > 0 ? <>&euro;{repairEstimates.original}</> : <span className="text-bel-blue dark:text-blue-400 uppercase font-bold text-sm tracking-tighter">{t('contact_for_price')}</span>;
                    else if (selectedScreenQuality === 'oled') estimateDisplay = repairEstimates.oled > 0 ? <>&euro;{repairEstimates.oled}</> : <span className="text-bel-blue dark:text-blue-400 uppercase font-bold text-sm tracking-tighter">{t('contact_for_price')}</span>;
                    else if (selectedScreenQuality === 'generic') estimateDisplay = repairEstimates.standard > 0 ? <>&euro;{repairEstimates.standard}</> : <span className="text-bel-blue dark:text-blue-400 uppercase font-bold text-sm tracking-tighter">{t('contact_for_price')}</span>;
                    else estimateDisplay = <span className="text-bel-blue dark:text-blue-400 text-sm italic">{t('select_quality_short')}</span>;
                } else {
                    if (repairEstimates.standard > 0) {
                        estimateDisplay = <>&euro;{repairEstimates.standard}</>;
                    } else if (repairEstimates.standard === -1 && repairIssues.length > 0) {
                        estimateDisplay = <span className="text-bel-blue dark:text-blue-400 uppercase font-bold text-sm tracking-tighter">{t('contact_for_price')}</span>;
                    } else {
                        estimateDisplay = <span className="text-gray-400">-</span>;
                    }
                }
            }
        }
        return (
            <div className="lg:hidden bg-white dark:bg-slate-900 rounded-ui-lg p-4 sm:p-6 mb-8 border border-gray-200 dark:border-slate-800 shadow-sm animate-fade-in mx-auto w-full">
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={onBack}
                        type="button"
                        className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                        aria-label={t('Back')}
                    >
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">{t('Summary')}</h3>
                </div>
                {(selectedModel && getDeviceImage(createSlug(`${selectedBrand} ${selectedModel}`))) && (
                    <div className="relative w-full h-48 mb-4 bg-gray-50 dark:bg-slate-950 rounded-xl p-4">
                        <Image
                            src={getDeviceImage(createSlug(`${selectedBrand} ${selectedModel}`))!}
                            alt={`${selectedBrand} ${selectedModel}`}
                            fill
                            className="object-contain"
                        />
                    </div>
                )}
                <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between">
                        <span className="text-gray-500">{t('Device')}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {selectedBrand && selectedModel ? (
                                selectedModel.toLowerCase().includes(selectedBrand.toLowerCase())
                                    ? slugToDisplayName(selectedModel)
                                    : `${selectedBrand} ${slugToDisplayName(selectedModel)}`
                            ) : selectedBrand || ''}
                        </span>
                    </div>
                    {isBuyback && storage && (<div className="flex justify-between"><span className="text-gray-500">{t('Storage')}</span><span className="font-medium text-gray-900 dark:text-white">{storage}</span></div>)}
                    {!isBuyback && repairIssues.length > 0 && (<div className="border-t border-gray-100 dark:border-slate-700 pt-2 mt-2">{repairIssues.map(issueId => {
                        const issue = REPAIR_ISSUES.find(i => i.id === issueId);
                        if (!issue) return null;

                        let price = 0;
                        if (issueId === 'screen') {
                            if (selectedScreenQuality === 'oled') price = repairEstimates.oled;
                            else if (selectedScreenQuality === 'original') price = repairEstimates.original;
                            else price = repairEstimates.standard;
                        } else {
                            price = (getSingleIssuePrice && getSingleIssuePrice(issueId)) || 0;
                        }

                        return (
                            <div key={issueId} className="flex justify-between text-gray-900 dark:text-white">
                                <span>{t(issue.id)} {issueId === 'screen' && selectedScreenQuality !== 'generic' ? (selectedScreenQuality === 'oled' ? `(${t('OLED / Soft')})` : `(${t('Original Refurb')})`) : ''}</span>
                                <span>
                                    {issueId === 'other' ? (
                                        <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span>
                                    ) : (
                                        price && price > 0 ? (
                                            <>&euro;{price}</>
                                        ) : (
                                            price === 0 ? t('contact_for_price') : <span>-</span>
                                        )
                                    )}
                                </span>
                            </div>
                        );
                    })}</div>)}
                    {!isBuyback && (deliveryMethod === 'courier' || hasHydrogel) && (
                        <div className="border-t border-gray-100 dark:border-slate-700 pt-2 mt-2">
                            {hasHydrogel && (
                                <div className="flex justify-between text-gray-900 dark:text-white mb-1">
                                    <span>{t('hydrogel_protection')}</span>
                                    <span>&euro;15</span>
                                </div>
                            )}
                            {deliveryMethod === 'courier' && (
                                <div className="flex justify-between text-gray-900 dark:text-white">
                                    <span>{t('Express Courier')}</span>
                                    <span>{courierTier === 'brussels' ? <>&euro;15</> : <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span>}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 dark:bg-slate-950/50 rounded-xl p-4 text-center group/tooltip relative">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{isBuyback ? t('Estimated Value') : t('Total Cost')}</p>
                        <InformationCircleIcon className="h-3 w-3 text-gray-400" />
                    </div>
                    <div className="text-3xl font-extrabold text-bel-dark dark:text-white">
                        {estimateDisplay}
                    </div>

                    {/* Tooltip for Mobile Summary */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-active/tooltip:opacity-100 transition-opacity z-50 shadow-xl border border-white/10">
                        {isBuyback
                            ? t('Based on your device condition and current market value.')
                            : t('Includes: 1-Year Warranty, Premium Parts, and Express Service.')}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            </div>
        );
    };

    // -------------------------------------------------------------------------
    // RENDER: Step 4 (Buyback Cosmetic)
    // -------------------------------------------------------------------------
    if (step === 4 && type === 'buyback') {
        return (
            <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-ui-lg p-4 lg:p-8 gap-6">
                <div className="flex-1 min-w-0 space-y-8">
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={onBack}
                            type="button"
                            className="lg:hidden p-2 -ml-2 mr-2 rounded-full hover:bg-white/10 text-gray-900 dark:text-white transition-colors"
                            aria-label={t('Back')}
                        >
                            <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Cosmetic Condition')}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('Screen Condition')}</label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'flawless', label: 'Flawless', desc: 'screen_flawless_desc' },
                                    { id: 'scratches', label: 'Light Scratches', desc: 'screen_scratches_desc' },
                                    { id: 'cracked', label: 'Cracked / Broken', desc: 'screen_cracked_desc' }
                                ].map((s) => (
                                    <button
                                        type="button"
                                        key={s.id}
                                        onClick={() => setScreenState(s.id as any)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${screenState === s.id ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                                    >
                                        <div className="font-bold text-gray-900 dark:text-white">{t(s.label)}</div>
                                        <div className="text-sm text-gray-500">{t(s.desc)}</div>
                                    </button>
                                ))}
                            </div>
                            {/* Dynamic Screen Condition Help Card */}
                            {screenState && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-bel-blue/20 flex gap-3 animate-fade-in">
                                    <InformationCircleIcon className="h-5 w-5 text-bel-blue shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                                        {t(`explain_screen_${screenState}`)}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('Body Condition')}</label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'flawless', label: 'Flawless', desc: 'body_flawless_desc' },
                                    { id: 'scratches', label: 'Scratches', desc: 'body_scratches_desc' },
                                    { id: 'dents', label: 'Dents', desc: 'body_dents_desc' },
                                    { id: 'bent', label: 'Bent / Broken', desc: 'body_bent_desc' }
                                ].map((s) => (
                                    <button
                                        type="button"
                                        key={s.id}
                                        onClick={() => setBodyState(s.id as any)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${bodyState === s.id ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                                    >
                                        <div className="font-bold text-gray-900 dark:text-white">{t(s.label)}</div>
                                        <div className="text-sm text-gray-500">{t(s.desc)}</div>
                                    </button>
                                ))}
                            </div>
                            {/* Dynamic Body Condition Help Card */}
                            {bodyState && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-bel-blue/20 flex gap-3 animate-fade-in">
                                    <InformationCircleIcon className="h-5 w-5 text-bel-blue shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                                        {t(`explain_body_${bodyState}`)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Mobile Summary & Action Block (Buyback Cosmetic) */}
                    <div className="lg:hidden mt-8 mb-8 p-6 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{t('Estimated Value')}</p>
                                    <div className="text-3xl font-extrabold text-bel-dark dark:text-white mt-1">
                                        {loading ? <span className="animate-pulse">...</span> : `€${sidebarEstimate}`}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{t('Based on current selection')}</p>
                                </div>
                            </div>

                            <button
                                onClick={onNext}
                                disabled={state.isTransitioning}
                                className="w-full bg-bel-blue text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-lg flex items-center justify-center gap-2 transition-all hover:bg-bel-blue/90"
                            >
                                <span>{t('Accept & Recycle')}</span>
                                <ChevronLeftIcon className="h-5 w-5 rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>
                <Sidebar
                    type={type}
                    step={step}
                    selectedBrand={selectedBrand}
                    selectedModel={selectedModel}
                    deviceType={deviceType}
                    storage={storage}
                    repairIssues={repairIssues}
                    estimateDisplay={sidebarEstimate}
                    onNext={onNext}
                    handleBack={onBack}
                    nextDisabled={false}
                    nextLabel={t('Accept & Recycle')}
                    selectedScreenQuality={selectedScreenQuality}
                    repairEstimates={repairEstimates}
                    dynamicRepairPrices={dynamicRepairPrices}
                    getSingleIssuePrice={getSingleIssuePrice}
                    isSubmitting={state.isTransitioning}
                />
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: Step 5 (Final Details - Buyback) or Step 4 (Final Details - Repair)
    // -------------------------------------------------------------------------
    if (step === 5 || (step === 4 && type === 'repair')) {
        return (
            <div className={`flex flex-col lg:flex-row w-full mx-auto gap-6 ${state.isWidget ? 'p-0 shadow-none border-0 bg-transparent' : 'max-w-7xl pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-ui-lg p-3 sm:p-6 lg:p-8'}`}>
                {renderMobileSummary()}
                <div className="flex-1 min-w-0">
                    <div className="mb-8">
                        <TrustBar />
                    </div>
                    <form ref={(formRef as any)} onSubmit={onHandleSubmit} className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t('Contact & Delivery')}</h2>
                            <label className="block text-xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">{t('delivery_title')}</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {/* Visit Store */}
                                <div onClick={() => setDeliveryMethod(deliveryMethod === 'dropoff' ? null : 'dropoff')} className={`cursor-pointer p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 text-left transition-all flex flex-col ${deliveryMethod === 'dropoff' ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20 ring-1 ring-bel-blue' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-bel-blue/50'}`}>
                                    <div className="flex items-start">
                                        <BuildingStorefrontIcon className={`h-8 w-8 mr-4 ${deliveryMethod === 'dropoff' ? 'text-bel-blue' : 'text-gray-400'}`} />
                                        <div><span className={`block font-bold text-lg mb-1 ${deliveryMethod === 'dropoff' ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>{t('delivery_visit_store_title')}</span><p className="text-sm text-gray-500 dark:text-gray-400">{t('delivery_visit_store_desc')}</p></div>
                                    </div>
                                    {deliveryMethod === 'dropoff' && (
                                        <div className="mt-4 w-full animate-fade-in">
                                            {shopSelectionError && !selectedShop && (
                                                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl text-red-700 dark:text-red-400 font-medium text-sm">
                                                    {"\u26A0\uFE0F"} {t('Please select a shop')}
                                                </div>
                                            )}
                                            {!selectedShop ? (
                                                <div className="space-y-3">
                                                    {!isShopListOpen ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsShopListOpen(true);
                                                            }}
                                                            className="w-full py-4 px-6 bg-white dark:bg-slate-900 text-left rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-bel-blue transition font-medium text-gray-900 dark:text-white flex items-center justify-between"
                                                        >
                                                            <span>{t('Select a shop')}</span>
                                                            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                                        </button>
                                                    ) : (
                                                        <div className="animate-fade-in border-2 border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden">
                                                            <div className="bg-gray-50 dark:bg-slate-950 px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                                                                <span className="font-bold text-sm text-gray-500 uppercase tracking-wider">{t('Available Shops')}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); setIsShopListOpen(false); }}
                                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                                >
                                                                    <XMarkIcon className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-slate-800 max-h-60 overflow-y-auto bg-white dark:bg-slate-900">
                                                                {shops
                                                                    .filter((s: any) => s.status === 'open')
                                                                    .sort((a: any, b: any) => (a.isPrimary ? -1 : 1))
                                                                    .map((shop: any) => (
                                                                        <button
                                                                            key={shop.id}
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedShop(shop);
                                                                                setShopSelectionError(false);
                                                                                setIsShopListOpen(false);
                                                                            }}
                                                                            className={`w-full py-4 px-6 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-center justify-between group ${shop.isPrimary ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                                                        >
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className={`font-bold text-gray-900 dark:text-white group-hover:text-bel-blue transition-colors ${shop.isPrimary ? 'text-bel-blue' : ''}`}>{shop.name.replace('Belmobile ', '')}</div>
                                                                                    {shop.isPrimary && (
                                                                                        <span className="bg-bel-blue text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">⚡ {t('Available Today')}</span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 mt-1">{shop.address}</div>
                                                                            </div>
                                                                            <ChevronRightIcon className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                        </button>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-bel-blue">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-bel-blue">{selectedShop?.name?.replace('Belmobile ', '')}</p>
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedShop.address}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedShop(null);
                                                                setIsShopListOpen(true);
                                                            }}
                                                            className="text-sm text-bel-blue hover:text-blue-700 font-medium underline"
                                                        >
                                                            {t('Change')}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Send by Post */}
                                <div onClick={() => setDeliveryMethod(deliveryMethod === 'send' ? null : 'send')} className={`cursor-pointer p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 text-left transition-all flex flex-col ${deliveryMethod === 'send' ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20 ring-1 ring-bel-blue' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-bel-blue/50'}`}>
                                    <div className="flex items-start">
                                        <TruckIcon className={`h-8 w-8 mr-4 ${deliveryMethod === 'send' ? 'text-bel-blue' : 'text-gray-400'}`} />
                                        <div><span className={`block font-bold text-lg mb-1 ${deliveryMethod === 'send' ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>{t('Send by Post')}</span><p className="text-sm text-gray-500 dark:text-gray-400">{t('Free shipping label provided. Secure and insured.')}</p></div>
                                    </div>
                                    {deliveryMethod === 'send' && (
                                        <div className="mt-4 w-full animate-fade-in">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openServicePointPicker();
                                                }}
                                                className="w-full py-3 px-4 bg-bel-blue text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none"
                                            >
                                                {servicePoint ? t('Change Service Point') : t('Choose Service Point')}
                                            </button>
                                            {servicePoint && (
                                                <div className="mt-3 relative text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setServicePoint(null);
                                                        }}
                                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        title={t('Remove')}
                                                    >
                                                        <XMarkIcon className="h-5 w-5" />
                                                    </button>
                                                    <p className="font-bold text-bel-blue pr-6">{servicePoint.name}</p>
                                                    <p>{servicePoint.street} {servicePoint.house_number}</p>
                                                    <p>{servicePoint.postal_code} {servicePoint.city}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Express Courier */}
                                <div
                                    onClick={() => setDeliveryMethod(deliveryMethod === 'courier' ? null : 'courier')}
                                    className={`col-span-1 md:col-span-2 cursor-pointer p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 text-left transition-all flex flex-col ${deliveryMethod === 'courier' ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20 ring-1 ring-bel-blue' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-bel-blue/50'}`}
                                >
                                    <div className="flex items-start">
                                        <div className="relative">
                                            <Bike className={`h-8 w-8 mr-4 ${deliveryMethod === 'courier' ? 'text-bel-blue' : 'text-gray-400'}`} />
                                            <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm z-10">FREE</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`block font-bold text-lg ${deliveryMethod === 'courier' ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>{t('Express Courier (Brussels)')}</span>
                                                <span className="bg-bel-yellow text-bel-blue text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm">{t('Tour & Taxis Bridge')}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {t('courier_promo_desc')}
                                            </p>
                                        </div>
                                    </div>
                                    {deliveryMethod === 'courier' && (
                                        <div className="mt-4 space-y-3 animate-fade-in">
                                            <div
                                                onClick={(e) => { e.stopPropagation(); setCourierTier('bridge'); }}
                                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${courierTier === 'bridge' ? 'border-bel-blue bg-white dark:bg-slate-900 shadow-md ring-1 ring-bel-blue' : 'border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 hover:border-bel-blue/30'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${courierTier === 'bridge' ? 'bg-bel-blue text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                                                        <MapPinIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-sm ${courierTier === 'bridge' ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>{t('Tour & Taxis Bridge')}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{t('Free Pickup')}</p>
                                                    </div>
                                                </div>
                                                {courierTier === 'bridge' && <CheckCircleIcon className="h-5 w-5 text-bel-blue" />}
                                            </div>

                                            <div
                                                onClick={(e) => { e.stopPropagation(); setCourierTier('brussels'); }}
                                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${courierTier === 'brussels' ? 'border-bel-blue bg-white dark:bg-slate-900 shadow-md ring-1 ring-bel-blue' : 'border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 hover:border-bel-blue/30'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${courierTier === 'brussels' ? 'bg-bel-blue text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                                                        <TruckIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-sm ${courierTier === 'brussels' ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>{t('Grand-Bruxelles')}</p>
                                                        <p className="text-[10px] text-bel-blue font-black uppercase tracking-wider">{t('All 19 municipalities')} (+15€)</p>
                                                    </div>
                                                </div>
                                                {courierTier === 'brussels' && <CheckCircleIcon className="h-5 w-5 text-bel-blue" />}
                                            </div>

                                            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-bel-blue/10">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                    <ClockIcon className="h-3.5 w-3.5 text-bel-blue" />
                                                    {courierTier === 'bridge' ? t('Please provide your corporate address. A technician will contact you shortly.') : t('Courier will pick up from your home/office anywhere in Brussels.')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Upsell Card (Repair Only) */}
                        {type === 'repair' && (
                            <div className={`mb-6 p-1 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-fade-in transition-all duration-300 ${hasHydrogel ? 'ring-4 ring-green-400/50 shadow-xl scale-[1.01]' : 'shadow-md hover:shadow-lg'}`}>
                                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 h-full relative overflow-hidden group">
                                    {/* Spotlight Effect */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                                        <div className="flex-shrink-0 bg-blue-100 dark:bg-slate-800 p-3 rounded-full">
                                            <ShieldCheckIcon className="h-8 w-8 text-bel-blue" />
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                                                {t('upsell_title')}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                                                {t('upsell_desc')}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setHasHydrogel(!hasHydrogel)}
                                                className={`px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg ${hasHydrogel ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30' : 'bg-bel-blue hover:bg-blue-600 text-white shadow-blue-500/30'}`}
                                            >
                                                {hasHydrogel ? t('upsell_added') : t('upsell_add')}
                                            </button>
                                            {!hasHydrogel && (
                                                <span className="text-xs text-gray-400 line-through font-medium">{t('upsell_strike_price')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Details */}
                        <div className="bg-white dark:bg-slate-900 rounded-ui-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <label className="block text-xl font-bold text-gray-900 dark:text-white tracking-tight">{t('Your Details')}</label>
                                <button
                                    type="button"
                                    onClick={() => setIsCompany(!isCompany)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${isCompany ? 'bg-bel-blue border-bel-blue text-white' : 'bg-transparent border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400'}`}
                                >
                                    {isCompany ? <CheckIcon className="h-3 w-3" /> : <div className="h-3 w-3 rounded-full border border-current" />}
                                    {t('is_company')}
                                </button>
                            </div>

                            {isCompany && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fade-in">
                                    <Input
                                        label={t('company_name')}
                                        required
                                        name="companyName"
                                        value={companyName}
                                        placeholder="Belmobile SRL"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                                    />
                                    <Input
                                        label={t('vat_number')}
                                        required
                                        name="vatNumber"
                                        value={vatNumber}
                                        placeholder="BE0XXX.XXX.XXX"
                                        error={vatValidationError || undefined}
                                        onBlur={handleVatBlur}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setVatNumber(e.target.value.toUpperCase());
                                            if (vatValidationError) setVatValidationError(null);
                                        }}
                                        rightElement={
                                            validatingVat ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-bel-blue border-t-transparent" />
                                            ) : vatNumber && !vatValidationError ? (
                                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                            ) : null
                                        }
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <Input
                                    label={t('contact_full_name')}
                                    required
                                    name="name"
                                    autoComplete="name"
                                    autoCapitalize="words"
                                    value={customerName}
                                    placeholder={t('contact_placeholder_name')}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))}
                                />
                                <Input
                                    label={t('contact_phone')}
                                    required
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    value={customerPhone}
                                    placeholder={t('contact_phone_placeholder')}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
                                />
                            </div>
                            <div className="mb-6">
                                <Input
                                    label={t('contact_email_address')}
                                    required
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={customerEmail}
                                    placeholder={t('contact_placeholder_email')}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerEmail(e.target.value)}
                                    onBlur={handleEmailBlur}
                                />
                            </div>

                            {/* Notification Preferences */}
                            <div className="mb-6 animate-fade-in">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">{t('notification_preferences_title') || 'How should we update you?'}</label>
                                <div className="flex flex-wrap gap-3">
                                    {/* Email */}
                                    <label className={`flex items-center gap-2 p-3 pr-4 rounded-xl border-2 cursor-pointer transition-all ${notificationPreferences?.includes('email') ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-800 hover:border-bel-blue/50'}`}>
                                        <input
                                            type="checkbox"
                                            checked={notificationPreferences?.includes('email')}
                                            onChange={() => {
                                                const current = notificationPreferences || [];
                                                const newPrefs = current.includes('email')
                                                    ? current.filter(p => p !== 'email')
                                                    : [...current, 'email'];
                                                if (!newPrefs.includes('email')) newPrefs.push('email'); // Enforce email
                                                setNotificationPreferences(newPrefs as ('email' | 'whatsapp' | 'sms')[]);
                                            }}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${notificationPreferences?.includes('email') ? 'bg-bel-blue border-bel-blue' : 'border-gray-300 dark:border-slate-600'}`}>
                                            {notificationPreferences?.includes('email') && <CheckIcon className="h-3.5 w-3.5 text-white" />}
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{t('Email')}</span>
                                    </label>

                                    {/* SMS */}
                                    <label className={`flex items-center gap-2 p-3 pr-4 rounded-xl border-2 cursor-pointer transition-all ${notificationPreferences?.includes('sms') ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-800 hover:border-bel-blue/50'}`}>
                                        <input
                                            type="checkbox"
                                            checked={notificationPreferences?.includes('sms')}
                                            onChange={() => {
                                                const current = notificationPreferences || [];
                                                const newPrefs = current.includes('sms')
                                                    ? current.filter(p => p !== 'sms')
                                                    : [...current, 'sms'];
                                                setNotificationPreferences(newPrefs as ('email' | 'whatsapp' | 'sms')[]);
                                            }}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${notificationPreferences?.includes('sms') ? 'bg-bel-blue border-bel-blue' : 'border-gray-300 dark:border-slate-600'}`}>
                                            {notificationPreferences?.includes('sms') && <CheckIcon className="h-3.5 w-3.5 text-white" />}
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{t('SMS')}</span>
                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded uppercase font-bold">Free</span>
                                    </label>

                                    {/* WhatsApp */}
                                    <label className={`flex items-center gap-2 p-3 pr-4 rounded-xl border-2 cursor-pointer transition-all ${notificationPreferences?.includes('whatsapp') ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-800 hover:border-bel-blue/50'}`}>
                                        <input
                                            type="checkbox"
                                            checked={notificationPreferences?.includes('whatsapp')}
                                            onChange={() => {
                                                const current = notificationPreferences || [];
                                                const newPrefs = current.includes('whatsapp')
                                                    ? current.filter(p => p !== 'whatsapp')
                                                    : [...current, 'whatsapp'];
                                                setNotificationPreferences(newPrefs as ('email' | 'whatsapp' | 'sms')[]);
                                            }}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${notificationPreferences?.includes('whatsapp') ? 'bg-bel-blue border-bel-blue' : 'border-gray-300 dark:border-slate-600'}`}>
                                            {notificationPreferences?.includes('whatsapp') && <CheckIcon className="h-3.5 w-3.5 text-white" />}
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{t('WhatsApp')}</span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{t('notification_preferences_desc') || 'Choose how you want to receive updates about your order.'}</p>
                            </div>

                            {/* Address Parser Logic */}
                            {(deliveryMethod === 'send' || deliveryMethod === 'courier') && (
                                <div className="animate-fade-in-up space-y-4 border-t border-gray-100 dark:border-slate-700 pt-4 mb-8">
                                    <h4 className="font-bold text-gray-900 dark:text-white">{deliveryMethod === 'courier' ? t('Pickup Address') : t('Shipping Address')}</h4>
                                    <Input
                                        label={t('Address')}
                                        required
                                        name="address"
                                        autoComplete="street-address"
                                        autoCapitalize="words"
                                        placeholder="Rue de la Loi 16"
                                        value={customerAddress}
                                        onPaste={handleAddressPaste}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerAddress(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label={t('Postal Code')}
                                            required
                                            name="zip"
                                            autoComplete="postal-code"
                                            value={customerZip}
                                            placeholder="1000"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerZip(e.target.value)}
                                        />
                                        <Input
                                            label={t('City')}
                                            required
                                            name="city"
                                            autoComplete="address-level2"
                                            autoCapitalize="words"
                                            value={customerCity}
                                            placeholder="Bruxelles"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerCity(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))}
                                        />
                                    </div>

                                    {/* IBAN & ID Upload for Buyback */}
                                    {type === 'buyback' && (
                                        <>
                                            <Input
                                                label={t('IBAN Number')}
                                                required
                                                value={iban}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIban(e.target.value)}
                                                placeholder="BE00 0000 0000 0000"
                                            />
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">{t('Upload ID Copy')}</label>
                                                <p className="text-xs text-gray-500 mb-3 ml-1">{t('id_upload_desc')}</p>

                                                {!idFile ? (
                                                    <div className="relative group">
                                                        <input
                                                            required
                                                            type="file"
                                                            accept="image/*,application/pdf"
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdFile(e.target.files ? e.target.files[0] : null)}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="w-full p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 group-hover:border-bel-blue group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 transition-all flex flex-col items-center justify-center text-center">
                                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                                <CloudArrowUpIcon className="h-6 w-6 text-bel-blue" />
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-700 dark:text-white mb-1 group-hover:text-bel-blue transition-colors">
                                                                {t('Click to upload')}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                PNG, JPG or PDF (max 5MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm animate-fade-in">
                                                        <div className="flex items-center space-x-3 overflow-hidden">
                                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg shrink-0">
                                                                <DocumentIcon className="h-5 w-5 text-bel-blue" />
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-xs">{idFile.name}</p>
                                                                <p className="text-xs text-gray-500">{(idFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIdFile(null)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Repair Extras */}
                            {type === 'repair' && (
                                <div className="bg-bel-blue/5 dark:bg-blue-900/10 p-4 sm:p-6 rounded-ui-lg border border-bel-blue/10 mb-6 mt-8">
                                    <h4 className="text-sm font-bold text-bel-blue uppercase tracking-widest mb-4">{t('Extra Options')}</h4>
                                    <div
                                        onClick={() => setHasHydrogel(!hasHydrogel)}
                                        className={`cursor-pointer p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all flex items-center justify-between ${hasHydrogel ? 'border-bel-blue bg-white dark:bg-slate-900 shadow-md ring-1 ring-bel-blue' : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 hover:border-bel-blue/30'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${hasHydrogel ? 'bg-bel-blue text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-400 border border-gray-100 dark:border-slate-700'}`}>
                                                <ShieldCheckIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold text-base ${hasHydrogel ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>{t('hydrogel_protection')}</span>
                                                    <span className="bg-bel-yellow text-bel-blue text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">+15€</span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('hydrogel_protection_desc')}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${hasHydrogel ? 'border-bel-blue bg-bel-blue' : 'border-gray-300 dark:border-slate-700'}`}>
                                            {hasHydrogel && <CheckIcon className="h-4 w-4 text-white font-bold" />}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Terms & Submit */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 mb-6 mt-4 relative z-10">
                                <div style={{ display: 'none' }} aria-hidden="true">
                                    <input
                                        type="text"
                                        name="hp_email"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        value={honeypot}
                                        onChange={(e) => setHoneypot(e.target.value)}
                                    />
                                </div>
                                <label className="flex items-start cursor-pointer">
                                    <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 w-5 h-5 text-bel-blue rounded border-gray-300 focus:ring-bel-blue" />
                                    <div className="ml-3"><p className="font-bold text-gray-900 dark:text-white text-sm">{type === 'buyback' ? (selectedBrand?.toLowerCase() === 'apple' ? t('terms_icloud') : t('terms_android')) : t('terms_repair_backup')}</p><p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{t('terms_and_privacy')}</p></div>
                                </label>
                            </div>
                            <Button
                                type="submit"
                                disabled={!termsAccepted || state.isTransitioning}
                                variant="cyber"
                                className={`w-full mt-6 ${state.isWidget ? 'block' : 'lg:hidden'}`}
                                isLoading={state.isTransitioning}
                            >
                                {t('confirm_request')}
                            </Button>

                            {/* Trust Signals */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-bel-blue/20 mt-8">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <CheckCircleIcon className="h-4 w-4 text-bel-blue" />
                                    Brussels Local Choice
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                                            <BanknotesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-xs">
                                                {t('payment_bancontact')}
                                            </p>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">{t('instant_cash')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                                            <MapPinIcon className="h-5 w-5 text-bel-blue" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-xs">
                                                {t('transit_nearby')}
                                            </p>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">STIB/MIVB Network</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                                            <DocumentTextIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-xs">
                                                {t('insurance_invoice')}
                                            </p>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">Official VAT Proof</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
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
                        onNext={onNext}
                        handleBack={onBack}
                        nextDisabled={false}
                        nextLabel={t('Complete Request')}
                        selectedScreenQuality={selectedScreenQuality}
                        repairEstimates={repairEstimates}
                        dynamicRepairPrices={dynamicRepairPrices}
                        getSingleIssuePrice={getSingleIssuePrice}
                        deliveryMethod={deliveryMethod}
                        courierTier={courierTier}
                        hasHydrogel={hasHydrogel}
                        isProcessing={state.isTransitioning}
                        processingText={getProcessingText()}
                    />
                )}
            </div>
        );
    }

    return null;
});
