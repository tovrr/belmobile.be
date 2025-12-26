import React, { memo } from 'react';
import {
    ChevronLeftIcon, CheckCircleIcon, BuildingStorefrontIcon, TruckIcon,
    ChevronRightIcon, XMarkIcon, MapPinIcon, ClockIcon, CloudArrowUpIcon,
    DocumentIcon, TrashIcon, ShieldCheckIcon, CheckIcon, BanknotesIcon, DocumentTextIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
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
import { useShop } from '../../../hooks/useShop'; // Fixed Import Path
import { useData } from '../../../hooks/useData'; // Fixed Import Path

interface StepUserInfoProps {
    type: 'buyback' | 'repair';
    step: number;
    onNext: () => void;
    onBack: () => void;
    handleSubmit: (e: React.FormEvent) => void;
    formRef?: React.RefObject<HTMLFormElement | null>;
    shops?: any[]; // Allow shops passed as props if needed
    [key: string]: any; // Allow extra props
}

export const StepUserInfo: React.FC<StepUserInfoProps> = memo(({
    type,
    step,
    onBack,
    onNext,
    handleSubmit,
    formRef,
    shops: propsShops
}) => {
    const { state, dispatch } = useWizard();
    const { t } = useLanguage();
    const { shops: dataShops } = useData();
    const { selectedShop, setSelectedShop } = useShop();

    // Use props shops if provided, otherwise data context
    const shops = propsShops || dataShops;

    // Actions are not heavily used here except maybe navigation if we wanted, 
    // but we use passed onBack/onNext or handleSubmit

    // Pricing
    const {
        sidebarEstimate,
        repairEstimates,
        dynamicRepairPrices,
        getSingleIssuePrice,
        buybackEstimate
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
        termsAccepted
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
    const setTermsAccepted = (val: boolean) => dispatch({ type: 'SET_WIZARD_DATA', payload: { termsAccepted: val } });

    // SendCloud / Service Point logic
    const openServicePointPicker = () => {
        // Logic placeholder
        if (typeof window !== 'undefined' && (window as any).sendcloud) {
            (window as any).sendcloud.servicePointPicker.open({
                apiKey: 'AIzaSyDbBU2HDNb_CravJAIbYKqsWhhbAgVBelY', // TODO: Move to config
                country: 'be',
                language: 'en-us',
                onSelect: (data: any) => {
                    setServicePoint(data);
                }
            });
        } else {
            console.warn("SendCloud not loaded");
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
        if (isBuyback) {
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
                } else if (repairEstimates.hasScreen && !selectedScreenQuality) {
                    estimateDisplay = <span className="text-bel-blue dark:text-blue-400 text-sm italic">{t('select_quality_short')}</span>;
                } else {
                    estimateDisplay = repairEstimates.standard > 0 ? <>&euro;{repairEstimates.standard}</> : <span className="text-bel-blue dark:text-blue-400 uppercase font-bold text-sm tracking-tighter">{t('contact_for_price')}</span>;
                }
            }
        }
        return (
            <div className="lg:hidden bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 mb-8 border border-gray-200 dark:border-slate-800 shadow-sm animate-fade-in mx-auto w-full">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={onBack} className="p-1 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-gray-500">
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
                    <div className="flex justify-between"><span className="text-gray-500">{t('Device')}</span><span className="font-medium text-gray-900 dark:text-white">{(selectedBrand && selectedModel && selectedModel.toLowerCase().startsWith(selectedBrand.toLowerCase())) ? slugToDisplayName(selectedModel) : `${selectedBrand} ${slugToDisplayName(selectedModel || '')}`}</span></div>
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
                                    {issueId === 'other' ? <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span> : (price > 0 ? <>&euro;{price}</> : <span>-</span>)}
                                </span>
                            </div>
                        );
                    })}</div>)}
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
            <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8">
                <div className="flex-1 space-y-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('Cosmetic Condition')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase">{t('Screen Condition')}</label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'flawless', label: 'Flawless', desc: 'Like new, no scratches' },
                                    { id: 'scratches', label: 'Light Scratches', desc: 'Visible scratches but no cracks' },
                                    { id: 'cracked', label: 'Cracked / Broken', desc: 'Glass is cracked or display broken' }
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
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase">{t('Body Condition')}</label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'flawless', label: 'Flawless', desc: 'Like new, no dents or scratches' },
                                    { id: 'scratches', label: 'Scratches', desc: 'Visible scratches or scuffs' },
                                    { id: 'dents', label: 'Dents', desc: 'Visible dents on the frame' },
                                    { id: 'bent', label: 'Bent / Broken', desc: 'Frame is bent or structural damage' }
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
                />
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: Step 5 (Final Details - Buyback) or Step 4 (Final Details - Repair)
    // -------------------------------------------------------------------------
    if (step === 5 || (step === 4 && type === 'repair')) {
        return (
            <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-8">
                {renderMobileSummary()}
                <div className="flex-1">
                    <form ref={(formRef as any)} onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('How would you like to proceed?')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {/* Visit Store */}
                                <div onClick={() => setDeliveryMethod(deliveryMethod === 'dropoff' ? null : 'dropoff')} className={`cursor-pointer p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 text-left transition-all flex flex-col ${deliveryMethod === 'dropoff' ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20 ring-1 ring-bel-blue' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-bel-blue/50'}`}>
                                    <div className="flex items-start">
                                        <BuildingStorefrontIcon className={`h-8 w-8 mr-4 ${deliveryMethod === 'dropoff' ? 'text-bel-blue' : 'text-gray-400'}`} />
                                        <div><span className={`block font-bold text-lg mb-1 ${deliveryMethod === 'dropoff' ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>{t('Visit Store')}</span><p className="text-sm text-gray-500 dark:text-gray-400">{t('Come to one of our shops in Brussels. No appointment needed.')}</p></div>
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
                                            <TruckIcon className={`h-8 w-8 mr-4 ${deliveryMethod === 'courier' ? 'text-bel-blue' : 'text-gray-400'}`} />
                                            <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm z-10">{t('free')}</div>
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

                        {/* User Details */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('Your Details')}</h3>
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
                                />
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
                                <div className="bg-bel-blue/5 dark:bg-blue-900/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-bel-blue/10 mb-6 mt-8">
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
                                disabled={!termsAccepted}
                                variant="primary"
                                className="w-full mt-6"
                            >
                                {t('Confirm Request')}
                            </Button>

                            {/* Trust Signals */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-bel-blue/20 mt-8">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5 text-bel-blue" />
                                    {t('trust_title')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                            <BanknotesIcon className="h-5 w-5 text-bel-blue" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                {type === 'buyback' ? t('trust_price_title_buyback') : t('trust_price_title')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {type === 'buyback' ? t('trust_price_subtitle_buyback') : t('price_vat_included')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                            <ShieldCheckIcon className="h-5 w-5 text-bel-blue" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                {type === 'buyback' ? t('trust_warranty_title_buyback') : t('trust_warranty_title')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{type === 'buyback' ? t('buyback_payment_terms') : t('repair_payment_terms')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                            <DocumentTextIcon className="h-5 w-5 text-bel-blue" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                {type === 'buyback' ? t('trust_document_title_buyback') : t('trust_document_title')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{type === 'buyback' ? t('pdf_confirmation_buyback') : t('pdf_confirmation_repair')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                            <XMarkIcon className="h-5 w-5 text-bel-blue" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                {type === 'buyback' ? t('trust_flexibility_title_buyback') : t('Flexibility')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('cancellation_policy')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
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
                    nextLabel={t('Complete Request')}
                    selectedScreenQuality={selectedScreenQuality}
                    repairEstimates={repairEstimates}
                    dynamicRepairPrices={dynamicRepairPrices}
                    getSingleIssuePrice={getSingleIssuePrice}
                />
            </div>
        );
    }

    return null;
});
