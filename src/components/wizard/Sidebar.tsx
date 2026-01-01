'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircleIcon, WrenchScrewdriverIcon, ShieldCheckIcon,
    CheckBadgeIcon, BanknotesIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../hooks/useLanguage';
import { REPAIR_ISSUES, DEVICE_TYPES } from '../../constants';
import { getDeviceImage } from '../../data/deviceImages';
import { createSlug, slugToDisplayName } from '../../utils/slugs';
import { TRUST_SIGNALS, SignalContext } from '../../data/trustSignals';
import Button from '../ui/Button';

import { useWizard } from '../../context/WizardContext';
import { PriceLockTimer } from '../ui/PriceLockTimer';
import { BoltIcon } from '../ui/BrandIcons';

// Map string icon names to components
const ICON_MAP: Record<string, React.ElementType> = {
    WrenchScrewdriverIcon,
    ShieldCheckIcon,
    CheckBadgeIcon,
    BanknotesIcon,
    InformationCircleIcon,
    BoltIcon
};

interface SidebarProps {
    type: 'buyback' | 'repair';
    step: number;
    selectedBrand?: string;
    selectedModel?: string;
    deviceType?: string;
    storage?: string;
    repairIssues: string[];
    estimateDisplay: React.ReactNode;
    onNext: () => void;
    handleBack: () => void;
    nextDisabled?: boolean;
    nextLabel?: string;
    selectedScreenQuality?: string | null;
    repairEstimates: any;
    dynamicRepairPrices?: any;
    getSingleIssuePrice?: (id: string) => number | null;
    loading?: boolean;
    deliveryMethod?: string | null;
    courierTier?: string;
    hasHydrogel?: boolean;
    isSubmitting?: boolean;
    isProcessing?: boolean;
    processingText?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    type,
    step,
    selectedBrand,
    selectedModel,
    deviceType,
    storage,
    repairIssues,
    estimateDisplay,
    onNext,
    handleBack,
    nextDisabled,
    nextLabel,
    selectedScreenQuality,
    repairEstimates,
    dynamicRepairPrices,
    getSingleIssuePrice,
    loading,
    deliveryMethod,
    courierTier,
    hasHydrogel,
    isSubmitting = false,
    isProcessing = false,
    processingText
}) => {
    const { t } = useLanguage();
    const { state } = useWizard();
    const isTransitioning = state.isTransitioning;
    const isBuyback = type === 'buyback';

    // Consolidate processing state
    const isLoadingState = isSubmitting || isProcessing;
    const loadingText = processingText || t('Processing...');

    // Image Logic
    const specificImage = selectedModel ? getDeviceImage(createSlug(`${selectedBrand} ${selectedModel}`)) : null;
    const brandImage = selectedBrand ? getDeviceImage(createSlug(selectedBrand)) : null;
    const displayImage = specificImage || brandImage;
    const isFallback = !specificImage;

    // Trust Signals Logic
    const signalContext: SignalContext = {
        type,
        brand: selectedBrand,
        model: selectedModel
    };
    const activeSignals = TRUST_SIGNALS.filter(s => s.condition ? s.condition(signalContext) : true).slice(0, 2); // Show top 2

    return (
        <div className="hidden lg:block w-80 xl:w-96 shrink-0 z-20">
            <div className="sticky top-32 bg-white dark:bg-slate-900 rounded-ui-lg shadow-lg border border-gray-100 dark:border-slate-800 transition-all duration-300">

                {/* Unified Content Block */}
                <div>
                    {/* Header */}
                    <div className="bg-bel-blue p-6 text-white text-center rounded-t-ui-lg relative overflow-hidden">
                        <h3 className="font-bold text-xl mb-2 relative z-10">{t('Summary')}</h3>
                        {displayImage && (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={displayImage as string}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative w-24 h-24 mx-auto mb-2 bg-white/20 rounded-xl p-2 backdrop-blur-sm shadow-inner"
                                >
                                    <Image
                                        src={displayImage}
                                        alt={`${selectedBrand} ${selectedModel} ${t(type === 'buyback' ? 'Buyback' : 'Repair')} service`}
                                        fill
                                        sizes="128px"
                                        className={`object-contain transition-all ${isFallback ? 'brightness-0 invert p-4 opacity-90' : 'hover:scale-105'}`}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        )}
                        <p className="text-blue-100 text-sm font-medium relative z-10 line-clamp-1">
                            {selectedBrand && selectedModel ? (
                                selectedModel.toLowerCase().includes(selectedBrand.toLowerCase())
                                    ? slugToDisplayName(selectedModel)
                                    : `${selectedBrand} ${slugToDisplayName(selectedModel)}`
                            ) : selectedBrand || ''}
                        </p>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 space-y-6">
                        <div className="space-y-3 text-sm">
                            {deviceType && (
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-500 shrink-0">{t('Device')}</span>
                                    <span className="font-medium text-gray-900 dark:text-white text-right break-all pl-2">
                                        {t(DEVICE_TYPES.find(d => d.id === deviceType)?.label || '')}
                                    </span>
                                </div>
                            )}
                            {selectedBrand && (
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-500 shrink-0">{t('Model')}</span>
                                    <span className="font-medium text-gray-900 dark:text-white text-right break-all pl-2">
                                        {selectedBrand && selectedModel ? (
                                            selectedModel.toLowerCase().includes(selectedBrand.toLowerCase())
                                                ? slugToDisplayName(selectedModel)
                                                : `${selectedBrand} ${slugToDisplayName(selectedModel)}`
                                        ) : selectedBrand || ''}
                                    </span>
                                </div>
                            )}

                            {isBuyback && storage && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('Storage')}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{storage}</span>
                                </div>
                            )}

                            {!isBuyback && repairIssues.length > 0 && (
                                <div className="border-t border-gray-100 dark:border-slate-800 pt-3 mt-3">
                                    <span className="block text-gray-500 mb-2">{t('Repairs')}</span>
                                    <ul className="space-y-1">
                                        {repairIssues.map(issueId => {
                                            const issue = REPAIR_ISSUES.find(i => i.id === issueId);
                                            if (!issue) return null;

                                            let label = t(issue.id);
                                            if (issueId === 'screen') {
                                                const hasMultiple = [
                                                    dynamicRepairPrices?.screen_generic >= 0,
                                                    dynamicRepairPrices?.screen_oled >= 0,
                                                    dynamicRepairPrices?.screen_original >= 0
                                                ].filter(Boolean).length > 1;

                                                if (hasMultiple && selectedScreenQuality) {
                                                    if (selectedScreenQuality === 'oled') label += ` (${t('OLED / Soft')})`;
                                                    else if (selectedScreenQuality === 'original') label += ` (${t('Original Refurb')})`;
                                                    else if (selectedScreenQuality === 'generic') label += ` (${t('Generic / LCD')})`;
                                                }
                                            }

                                            let price = 0;
                                            if (issueId === 'screen') {
                                                if (selectedScreenQuality === 'oled') price = repairEstimates.oled;
                                                else if (selectedScreenQuality === 'original') price = repairEstimates.original;
                                                else price = repairEstimates.standard;
                                            } else {
                                                price = (getSingleIssuePrice && getSingleIssuePrice(issueId)) || 0;
                                            }

                                            return (
                                                <li key={issueId} className="flex justify-between text-gray-900 dark:text-white font-medium">
                                                    <span className="break-all max-w-[150px]" title={label}>{label}</span>
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
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {!isBuyback && (deliveryMethod === 'courier' || hasHydrogel) && (
                                <div className="border-t border-gray-100 dark:border-slate-800 pt-3 mt-3">
                                    <span className="block text-gray-500 mb-2">{t('Extras')}</span>
                                    <ul className="space-y-1">
                                        {hasHydrogel && (
                                            <li className="flex justify-between text-gray-900 dark:text-white font-medium">
                                                <span>{t('hydrogel_protection')}</span>
                                                <span>&euro;15</span>
                                            </li>
                                        )}
                                        {deliveryMethod === 'courier' && (
                                            <li className="flex justify-between text-gray-900 dark:text-white font-medium">
                                                <span>{t('Express Courier')}</span>
                                                <span>{courierTier === 'brussels' ? <>&euro;15</> : <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span>}</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Price Estimation */}
                        <div className="bg-gray-50 dark:bg-slate-950/50 rounded-xl p-4 text-center group relative mt-6">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {isBuyback ? t('Estimated Value') : t('Total Cost')}
                                </p>
                            </div>
                            <div className="text-3xl font-extrabold text-bel-dark dark:text-white">
                                {loading || isTransitioning || (isBuyback && typeof estimateDisplay === 'number' && estimateDisplay === 0) ? (
                                    <div className="flex space-x-1 h-9 items-center justify-center">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                ) : (
                                    typeof estimateDisplay === 'number' ? (
                                        estimateDisplay > 0 ? <>&euro;{estimateDisplay}</> : (estimateDisplay === -1 ? t('contact_for_price') : <span className="text-gray-400">-</span>)
                                    ) : estimateDisplay
                                )}
                            </div>
                            {isBuyback && typeof estimateDisplay === 'number' && estimateDisplay > 0 && !loading && !isTransitioning && (
                                <div className="flex justify-center mt-2 animate-fade-in">
                                    <PriceLockTimer />
                                </div>
                            )}
                            <p className="text-xs font-medium text-gray-500 mt-2">
                                {isBuyback ? t('Paid instantly via cash or bank transfer') : t('Includes labor and premium parts')}
                            </p>
                        </div>

                        {/* Trust Signals */}
                        {activeSignals.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <AnimatePresence mode="popLayout">
                                    {activeSignals.map(signal => {
                                        const Icon = ICON_MAP[signal.icon] || CheckCircleIcon;
                                        return (
                                            <motion.div
                                                key={signal.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded-lg text-center min-h-[64px] flex flex-col items-center justify-center border border-blue-100/50 dark:border-blue-900/20"
                                            >
                                                <Icon className="w-5 h-5 text-bel-blue mb-1" />
                                                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 leading-tight">
                                                    {t(signal.titleKey)}
                                                </p>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Buttons Footer (Included in scroll) */}
                        <div className="space-y-3 pt-4">
                            {((isBuyback && step < 5) || (!isBuyback && step < 4)) && (
                                <Button
                                    onClick={onNext}
                                    disabled={nextDisabled}
                                    variant="cyber"
                                    className="w-full"
                                >
                                    {isLoadingState ? loadingText : (nextLabel || t('Next'))}
                                </Button>
                            )}

                            {((isBuyback && step === 5) || (!isBuyback && step === 4)) && (
                                <Button
                                    onClick={onNext}
                                    disabled={nextDisabled || isLoadingState}
                                    variant="cyber"
                                    className="w-full"
                                    isLoading={isLoadingState}
                                    icon={<CheckBadgeIcon className="w-5 h-5" />}
                                >
                                    {isLoadingState ? loadingText : t('confirm_request')}
                                </Button>
                            )}

                            {step > 1 && (
                                <Button
                                    onClick={handleBack}
                                    variant="ghost"
                                    className="w-full"
                                >
                                    {t('Back')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Optimization: Prevent re-renders on text input changes in main form
export default memo(Sidebar);
