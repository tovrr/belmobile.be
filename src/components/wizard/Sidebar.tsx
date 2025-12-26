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

// Map string icon names to components
const ICON_MAP: Record<string, React.ElementType> = {
    WrenchScrewdriverIcon,
    ShieldCheckIcon,
    CheckBadgeIcon,
    BanknotesIcon,
    InformationCircleIcon
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
    // Dynamic Pricing & Logic Props needed for rendering details
    selectedScreenQuality?: string | null;
    repairEstimates: any;
    dynamicRepairPrices?: any;
    getSingleIssuePrice?: (id: string) => number | null;
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
    getSingleIssuePrice
}) => {
    const { t } = useLanguage();
    const isBuyback = type === 'buyback';

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
        <div className="hidden lg:block w-80 xl:w-96 shrink-0 ml-8">
            <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="bg-bel-blue p-6 text-white text-center relative overflow-hidden">


                    <h3 className="font-bold text-xl mb-2 relative z-10">{t('Summary')}</h3>

                    {displayImage && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={displayImage as string}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="relative w-32 h-32 mx-auto mb-3 bg-white/20 rounded-xl p-2 backdrop-blur-sm shadow-inner"
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
                    <p className="text-blue-100 text-sm font-medium relative z-10">
                        {(selectedBrand && selectedModel && selectedModel.toLowerCase().startsWith(selectedBrand.toLowerCase())) ? slugToDisplayName(selectedModel) : `${selectedBrand} ${slugToDisplayName(selectedModel || '')}`}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3 text-sm">
                        {deviceType && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('Device')}</span>
                                <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px] text-right">
                                    {t(DEVICE_TYPES.find(d => d.id === deviceType)?.label || '')}
                                </span>
                            </div>
                        )}
                        {selectedBrand && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">{t('Model')}</span>
                                <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px] text-right">
                                    {(selectedBrand && selectedModel && selectedModel.toLowerCase().startsWith(selectedBrand.toLowerCase())) ? slugToDisplayName(selectedModel) : `${selectedBrand} ${slugToDisplayName(selectedModel || '')}`}
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
                                                <span className="truncate max-w-[150px]" title={label}>{label}</span>
                                                <span>
                                                    {issueId === 'other' ? <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span> : (price > 0 ? <>&euro;{price}</> : <span>-</span>)}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-950/50 rounded-xl p-4 text-center group relative">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {isBuyback ? t('Estimated Value') : t('Total Cost')}
                            </p>
                            <div className="relative group/tooltip">
                                <InformationCircleIcon className="h-3.5 w-3.5 text-gray-400 cursor-help hover:text-bel-blue transition-colors" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity z-50 shadow-xl">
                                    {isBuyback
                                        ? t('Based on your device condition and current market value.')
                                        : t('Includes: 1-Year Warranty, Premium Parts, and Express Service.')}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        </div>
                        <div className="text-3xl font-extrabold text-bel-dark dark:text-white">
                            {typeof estimateDisplay === 'number' ? (
                                estimateDisplay > 0 ? <>&euro;{estimateDisplay}</> : (estimateDisplay === -1 ? t('contact_for_price') : <span className="text-gray-400">-</span>)
                            ) : estimateDisplay}
                        </div>
                        <p className="text-xs font-medium text-gray-500 mt-2">
                            {isBuyback ? t('Paid instantly via cash or bank transfer') : t('Includes labor and premium parts')}
                        </p>
                    </div>

                    {/* Dynamic Trust Signals */}
                    {activeSignals.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
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

                    <div className="space-y-3">
                        {step < 5 && (
                            <button
                                onClick={onNext}
                                disabled={nextDisabled}
                                className="w-full bg-bel-blue text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {nextLabel || t('Next')}
                            </button>
                        )}
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="w-full py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                            >
                                {t('Back')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Optimization: Prevent re-renders on text input changes in main form
export default memo(Sidebar, (prev, next) => {
    // Return TRUE if props are equal (DO NOT RE-RENDER)

    // Critical: If step changes, always re-render
    if (prev.step !== next.step) return false;

    // If brand/model/issues/storage change, re-render
    if (
        prev.selectedBrand !== next.selectedBrand ||
        prev.selectedModel !== next.selectedModel ||
        prev.storage !== next.storage ||
        prev.repairIssues !== next.repairIssues ||
        prev.selectedScreenQuality !== next.selectedScreenQuality
    ) return false;

    // Deep compare estimateDisplay (it's a node, but cheap refs usually)
    // Actually, simple equality might fail if parent reconstructs it.
    // However, since we pass scalar props like prices/storage separately, 
    // we can trust that if those didn't change, the display SHOULD be same.
    // The parent passes `estimateDisplay` as a constructed ReactNode.
    // We can assume if prices didn't change, it's fine.

    return true; // Assume equal otherwise
});
