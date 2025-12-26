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
}

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
    const isBuyback = type === 'buyback';

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform duration-300 transform translate-y-0">
            <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
                {showEstimate && (
                    <div className="flex flex-col group/tooltip relative">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-tight">
                                {isBuyback ? t('Estimated Value') : t('Total Cost')}
                            </span>
                            <InformationCircleIcon className="h-3 w-3 text-gray-400" />
                        </div>
                        <span className="text-xl font-extrabold text-bel-dark dark:text-white leading-tight">
                            {estimateDisplay || <>&euro;0</>}
                        </span>

                        {/* Tooltip for Mobile */}
                        <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-active/tooltip:opacity-100 transition-opacity z-50 shadow-xl border border-white/10">
                            {isBuyback
                                ? t('Based on your device condition and current market value.')
                                : t('Includes: 1-Year Warranty, Premium Parts, and Express Service.')}
                            <div className="absolute top-full left-4 border-8 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                )}
                {!hideNextButton && (
                    <button
                        onClick={onNext}
                        disabled={nextDisabled}
                        className={`flex-1 bg-bel-blue text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-base flex items-center justify-center gap-2 transition-all ${!showEstimate || !estimateDisplay ? 'w-full' : ''}`}
                    >
                        <span>{nextLabel || t('Next')}</span>
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default MobileBottomBar;
