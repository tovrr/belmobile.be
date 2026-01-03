'use client';

import React from 'react';
import { ChevronRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface MobileBottomBarProps {
    type: 'buyback' | 'repair';
    onNext: () => void;
    nextDisabled?: boolean;
    nextLabel?: string;
    showEstimate?: boolean;
    estimateDisplay?: React.ReactNode;
    hideNextButton?: boolean;
    t: (key: string) => string;
    // selectedIssues removed in favor of Context
}

import { useWizard } from '../../context/WizardContext';
import { slugToDisplayName, createSlug } from '../../utils/slugs';
import { useState, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { getDeviceImage } from '../../data/deviceImages';
import Image from 'next/image';
import { shimmer, toBase64 } from '../../utils/shimmer';

const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
    type,
    onNext,
    nextDisabled = false,
    nextLabel = '',
    showEstimate = false,
    estimateDisplay = null,
    hideNextButton = false,
    t
}) => {
    const { state } = useWizard();
    const {
        selectedBrand,
        selectedModel,
        repairIssues,
        storage,
        deviceType,
        isLoadingData
    } = state;

    const [isExpanded, setIsExpanded] = useState(false);
    const isBuyback = type === 'buyback';

    // Intelligent CTA Logic
    const isLoading = isLoadingData; // Or passed prop?

    // Theme Colors
    const themeColor = isBuyback ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-indigo-600 bg-indigo-50 border-indigo-200';
    const btnGradient = isBuyback
        ? 'bg-linear-to-r from-yellow-400 to-yellow-600 text-gray-900 shadow-yellow-500/30'
        : 'bg-linear-to-r from-indigo-500 to-indigo-700 text-white shadow-indigo-500/30';

    // Summary Helpers
    const hasDevice = selectedBrand && selectedModel;
    const issuesList = type === 'repair' ? repairIssues : [];

    // Dispatch Resize Event for Chat Widget
    useEffect(() => {
        const dispatchResize = () => {
            // Give main thread time to render transitions
            setTimeout(() => {
                const event = new CustomEvent('apollo-mobile-bar-resize', {
                    detail: {
                        expanded: isExpanded,
                        // Rough estimate for "collapsed" height if needed, but expanded is boolean
                        collapsedHeight: 110 // px
                    }
                });
                window.dispatchEvent(event);
            }, 50);
        };
        dispatchResize();
        // Also fire on mount to set initial state
    }, [isExpanded]);

    return (
        <>
            {/* Backdrop for expansion */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            <div
                className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) rounded-t-3xl overflow-hidden ${isExpanded ? 'h-[45vh]' : 'h-auto'}`}
            >
                {/* Drag Handle / Toggle */}
                <div
                    className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-pointer active:opacity-70"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="w-10 h-1 bg-gray-300 dark:bg-slate-700 rounded-full mb-1" />
                    {!isExpanded && hasDevice && (
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            {slugToDisplayName(selectedBrand || '')} <span className="text-gray-300">•</span> {slugToDisplayName(selectedModel || '')}
                            <ChevronUpIcon className="h-3 w-3" />
                        </p>
                    )}
                </div>

                {/* Main Content Container */}
                <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex flex-col h-full">

                    {/* EXPANDED CONTENT: Summary View */}
                    <div className={`flex-1 overflow-y-auto transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        <div className="space-y-4 pt-2 pb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{t('Summary')}</h3>

                            {/* Device Card */}
                            {hasDevice && (
                                <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
                                    {/* Brand Logo */}
                                    <div className="relative w-12 h-12 shrink-0 bg-white dark:bg-white/10 rounded-xl p-2 flex items-center justify-center">
                                        {getDeviceImage(createSlug(selectedBrand || ''), deviceType) ? (
                                            <Image
                                                src={getDeviceImage(createSlug(selectedBrand || ''), deviceType)!}
                                                alt={`${selectedBrand || 'Device'} ${t(type === 'buyback' ? 'Buyback' : 'Repair')}`}
                                                width={40}
                                                height={40}
                                                className="object-contain w-full h-full dark:invert"
                                                placeholder="blur"
                                                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(40, 40))}`}
                                            />
                                        ) : (
                                            <span className={`text-lg font-bold ${themeColor}`}>
                                                {selectedBrand?.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white text-lg">{slugToDisplayName(selectedModel || '')}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">{slugToDisplayName(selectedBrand || '')} • {t(deviceType)}</div>
                                    </div>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {isBuyback && storage && (
                                    <div className="p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <div className="text-[10px] uppercase text-gray-400 font-bold">{t('Storage')}</div>
                                        <div className="font-bold text-gray-900 dark:text-white">{storage}</div>
                                    </div>
                                )}
                                {type === 'repair' && issuesList.length > 0 && (
                                    <div className="col-span-2 p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <div className="text-[10px] uppercase text-gray-400 font-bold mb-2">{t('Issues')}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {issuesList.map(i => (
                                                <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${themeColor}`}>
                                                    {t(i)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ALWAYS VISIBLE: Footer (Price + CTA) */}
                    <div className="mt-auto shrink-0 pt-3 pb-2 relative z-10 bg-white dark:bg-slate-900">
                        {/* Mini Chips Line (Collapsed Only) */}
                        {!isExpanded && type === 'repair' && issuesList.length > 0 && (
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-1 mask-linear-fade-right">
                                {issuesList.map((issue, idx) => (
                                    <span key={idx} className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/30`}>
                                        {t(issue)}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-4">
                            {showEstimate && (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {isBuyback ? t('Value') : t('Total')}
                                        <InformationCircleIcon className="h-3 w-3" />
                                    </div>
                                    <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                                        {estimateDisplay || '€--'}
                                    </div>
                                </div>
                            )}

                            {!hideNextButton && (
                                <button
                                    onClick={onNext}
                                    disabled={nextDisabled || isLoading}
                                    className={`relative overflow-hidden group flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 ${nextDisabled
                                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                                        : `${btnGradient} shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95`
                                        }`}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="font-extrabold uppercase tracking-widest text-sm">
                                                {nextLabel || t('Next')}
                                            </span>
                                            <ChevronRightIcon className="h-4 w-4 stroke-2" />
                                        </>
                                    )}

                                    {/* Shine Effect */}
                                    {!nextDisabled && !isLoading && (
                                        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent z-10" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileBottomBar;
