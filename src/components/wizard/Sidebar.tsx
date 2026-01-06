'use client';

import React, { memo, useState } from 'react';
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
import { getDeviceContext } from '../../utils/seoHelpers';
import { useHaptic } from '../../hooks/useHaptic';
import Button from '../ui/Button';

import { useWizard } from '../../context/WizardContext';
import { PriceLockTimer } from '../ui/PriceLockTimer';
import { BoltIcon } from '../ui/BrandIcons';
import SaveQuoteModal from './SaveQuoteModal';
import { useExitIntent } from '../../hooks/useExitIntent';

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
    breakdown?: any;
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
    processingText,
    breakdown
}) => {
    const { t, language } = useLanguage();
    const { state } = useWizard();
    const haptic = useHaptic();
    const isTransitioning = state.isTransitioning;
    const isBuyback = type === 'buyback';

    // State for Save Quote Modal
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    // --- EXIT INTENT CRO ---
    // Trigger only if we have a price and user is engaged (step > 1)
    const hasValue = typeof estimateDisplay === 'number' && estimateDisplay > 0;
    const isEngaged = step > 1;

    useExitIntent({
        onExit: () => {
            if (!isSaveModalOpen && !loading && !isSubmitting) {
                console.log("[CRO] Exit Intent Triggered");
                setIsSaveModalOpen(true);
            }
        },
        enabled: hasValue && isEngaged && step >= 4 && !state.isWidget && !state.isKiosk // Only trigger on Step 4+, Desktop, Main Site
    });

    // Consolidate processing state
    const isLoadingState = isSubmitting || isProcessing;
    const loadingText = processingText || t('Processing...');

    // Image Logic
    const specificImage = selectedModel ? getDeviceImage(createSlug(`${selectedBrand} ${selectedModel}`), deviceType) : null;
    const brandImage = selectedBrand ? getDeviceImage(createSlug(selectedBrand), deviceType) : null;
    const displayImage = specificImage || brandImage;
    const isFallback = !specificImage || (typeof specificImage === 'string' && specificImage.includes('/brands/'));

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
                    <div className={`${isBuyback ? 'bg-bel-yellow' : 'bg-indigo-500'} p-6 ${isBuyback ? 'text-gray-900' : 'text-white'} text-center rounded-t-ui-lg relative overflow-hidden`}>
                        <h3 className="font-bold text-xl mb-2 relative z-10">{t('Summary')}</h3>
                        {displayImage && (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={displayImage as string}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className={`relative mx-auto mb-2 overflow-hidden ${isFallback
                                        ? 'w-24 h-24 flex items-center justify-center'
                                        : 'w-32 h-32 bg-white rounded-2xl p-3 shadow-xl border border-white/50'
                                        }`}
                                >
                                    <Image
                                        src={displayImage}
                                        alt={t(
                                            isBuyback ? 'seo_image_buyback_alt' : 'seo_image_repair_alt',
                                            slugToDisplayName(selectedBrand || ''),
                                            slugToDisplayName(selectedModel || '')
                                        )}
                                        fill
                                        sizes="128px"
                                        className={`object-contain transition-all ${isFallback
                                            ? (isBuyback ? 'brightness-0' : 'brightness-0 invert')
                                            : 'hover:scale-105 p-1'
                                            }`}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        )}
                        <p className={`${isBuyback ? 'text-gray-700' : 'text-indigo-100'} text-sm font-medium relative z-10 line-clamp-1`}>
                            {selectedBrand && selectedModel ? (
                                selectedModel.toLowerCase().includes(selectedBrand.toLowerCase())
                                    ? slugToDisplayName(selectedModel)
                                    : `${slugToDisplayName(selectedBrand)} ${slugToDisplayName(selectedModel)}`
                            ) : slugToDisplayName(selectedBrand || '')}
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
                                                : `${slugToDisplayName(selectedBrand)} ${slugToDisplayName(selectedModel)}`
                                        ) : slugToDisplayName(selectedBrand || '')}
                                    </span>
                                </div>
                            )}

                            {isBuyback && storage && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('Storage')}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{storage}</span>
                                </div>
                            )}

                            {/* SSoT Breakdown Display */}
                            {breakdown && (breakdown.repairs?.length > 0 || breakdown.deductions?.length > 0) ? (
                                <div className="border-t border-gray-100 dark:border-slate-800 pt-3 mt-3">
                                    <span className="block text-gray-500 mb-2">{t('Details')}</span>
                                    <ul className="space-y-2">
                                        {/* Repair Items */}
                                        {breakdown.repairs?.map((item: any, idx: number) => (
                                            <li key={`rep-${idx}`} className="flex justify-between text-gray-900 dark:text-white font-medium">
                                                <span className="text-sm">{item.label}</span>
                                                <span className="text-sm font-mono">{item.amount > 0 ? `€${item.amount}` : t('free')}</span>
                                            </li>
                                        ))}

                                        {/* Buyback Base */}
                                        {isBuyback && breakdown.basePrice !== undefined && (
                                            <li className="flex justify-between text-gray-900 dark:text-white font-medium">
                                                <span className="text-sm">{t('base_value')}</span>
                                                <span className="text-sm font-mono">€{breakdown.basePrice}</span>
                                            </li>
                                        )}

                                        {/* Buyback Deductions */}
                                        {breakdown.deductions?.map((item: any, idx: number) => (
                                            <li key={`ded-${idx}`} className="flex justify-between text-gray-500 font-medium">
                                                <span className="text-sm">{item.label}</span>
                                                <span className="text-sm font-mono text-red-500">-€{item.amount}</span>
                                            </li>
                                        ))}

                                        {/* Extras */}
                                        {hasHydrogel && (
                                            <li className="flex justify-between text-gray-900 dark:text-white font-medium">
                                                <span className="text-sm">{t('hydrogel_protection')}</span>
                                                <span className="text-sm font-mono">€15</span>
                                            </li>
                                        )}
                                        {deliveryMethod === 'courier' && (
                                            <li className="flex justify-between text-gray-900 dark:text-white font-medium">
                                                <span className="text-sm">{t('Express Courier')}</span>
                                                <span className="text-sm font-mono">{courierTier === 'brussels' ? '€15' : t('free')}</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            ) : (
                                !isBuyback && repairIssues.length > 0 && (
                                    <div className="border-t border-gray-100 dark:border-slate-800 pt-3 mt-3">
                                        <p className="text-sm text-gray-400 italic text-center">{t('calculating_details')}</p>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Price Estimation Card */}
                        <div className="bg-gray-50 dark:bg-slate-950/50 rounded-xl p-4 text-center group relative mt-6 transition-all duration-300">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {isBuyback ? t('Estimated Value') : t('Total Cost')}
                                </p>
                            </div>
                            <div className="text-3xl font-extrabold text-bel-dark dark:text-white min-h-[40px] flex items-center justify-center">
                                {loading || isTransitioning || (estimateDisplay === 0 && loading) ? (
                                    <div className="flex space-x-1 h-9 items-center justify-center">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                ) : (
                                    <motion.span
                                        key={typeof estimateDisplay === 'number' ? estimateDisplay : 'txt'}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-bel-blue dark:text-blue-400"
                                    >
                                        {typeof estimateDisplay === 'number' ? (
                                            estimateDisplay > 0 ? `€${estimateDisplay}` : (estimateDisplay === -1 ? t('contact_for_price') : '-')
                                        ) : estimateDisplay}
                                    </motion.span>
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
                                                className={`${isBuyback ? 'bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-100/50 dark:border-yellow-900/20' : 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100/50 dark:border-indigo-900/20'} p-2 rounded-lg text-center min-h-[64px] flex flex-col items-center justify-center border`}
                                            >
                                                <Icon className={`w-5 h-5 ${isBuyback ? 'text-bel-yellow' : 'text-indigo-500'} mb-1`} />
                                                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 leading-tight">
                                                    {(() => {
                                                        const { durationText } = getDeviceContext(selectedModel || '', language as any);
                                                        let label = t(signal.titleKey);
                                                        if (signal.titleKey === 'repair_trust_fast') {
                                                            label = label
                                                                .replace('30m', durationText)
                                                                .replace('30min', durationText)
                                                                .replace('30 min', durationText);
                                                        }
                                                        return label;
                                                    })()}
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
                                    variant={isBuyback ? 'cyber' : 'action'}
                                    className="w-full"
                                >
                                    {isLoadingState ? loadingText : (nextLabel || t('Next'))}
                                </Button>
                            )}

                            {((isBuyback && step === 5) || (!isBuyback && step === 4)) && (
                                <Button
                                    onClick={onNext}
                                    disabled={nextDisabled || isLoadingState}
                                    variant={isBuyback ? 'cyber' : 'action'}
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
                                    variant="outline"
                                    className={`w-full ${isBuyback ? 'border-bel-yellow! text-bel-yellow! hover:bg-yellow-50!' : 'border-indigo-500! text-indigo-500! hover:bg-indigo-50!'}`}
                                >
                                    {t('Back')}
                                </Button>
                            )}

                            {/* --- SAVE QUOTE FEATURE (CRO) --- */}
                            {/* Only show after specs/condition are selected (Step 4+) */}
                            {step >= 4 && typeof estimateDisplay === 'number' && estimateDisplay > 0 && !loading && (
                                <button
                                    onClick={() => { haptic.trigger('light'); setIsSaveModalOpen(true); }}
                                    className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline decoration-dashed underline-offset-4 py-2 transition-colors active-press"
                                >
                                    {t('save_for_later', 'Save quote for later')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isSaveModalOpen && (
                    <SaveQuoteModal
                        isOpen={isSaveModalOpen}
                        onClose={() => setIsSaveModalOpen(false)}
                        type={type}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default memo(Sidebar);
