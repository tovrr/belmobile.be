'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getDeviceImage } from '../../data/deviceImages';
import { createSlug, slugToDisplayName } from '../../utils/slugs';
import { REPAIR_ISSUES } from '../../constants';

interface MobileSummaryProps {
    type: 'buyback' | 'repair';
    t: (key: string) => string;
    selectedBrand?: string;
    selectedModel?: string;
    storage?: string;
    repairIssues: string[];
    estimateDisplay: React.ReactNode;
    dynamicRepairPrices?: any;
    handleBack: () => void;
    repairEstimates: any;
    selectedScreenQuality?: string | null;
    getSingleIssuePrice: (id: string) => number | null;
    loading?: boolean;
}

const MobileSummary: React.FC<MobileSummaryProps> = ({
    type,
    t,
    selectedBrand,
    selectedModel,
    storage,
    repairIssues,
    estimateDisplay,
    handleBack,
    repairEstimates,
    selectedScreenQuality,
    getSingleIssuePrice,
    loading
}) => {
    const isBuyback = type === 'buyback';

    const deviceImageUrl = (selectedBrand && selectedModel)
        ? getDeviceImage(createSlug(`${selectedBrand} ${selectedModel}`))
        : null;

    return (
        <div className="lg:hidden bg-white dark:bg-slate-900 rounded-3xl p-6 mb-8 border border-gray-200 dark:border-slate-800 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={handleBack} className="p-1 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-gray-500">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{t('Summary')}</h3>
            </div>
            {deviceImageUrl && (
                <div className="relative w-full h-48 mb-4 bg-gray-50 dark:bg-slate-950 rounded-xl p-4">
                    <Image
                        src={deviceImageUrl}
                        alt={`${selectedBrand} ${selectedModel} ${t(isBuyback ? 'Buyback' : 'Repair')}`}
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
                {isBuyback && storage && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">{t('Storage')}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{storage}</span>
                    </div>
                )}
                {!isBuyback && repairIssues.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-slate-700 pt-2 mt-2">
                        {repairIssues.map(issueId => {
                            const issue = REPAIR_ISSUES.find(i => i.id === issueId);
                            if (!issue) return null;

                            let price = 0;
                            if (issueId === 'screen') {
                                if (selectedScreenQuality === 'oled') price = repairEstimates.oled;
                                else if (selectedScreenQuality === 'original') price = repairEstimates.original;
                                else price = repairEstimates.standard;
                            } else {
                                price = getSingleIssuePrice(issueId) || 0;
                            }

                            return (
                                <div key={issueId} className="flex justify-between text-gray-900 dark:text-white">
                                    <span>
                                        {t(issue.id)} {issueId === 'screen' && selectedScreenQuality !== 'generic'
                                            ? (selectedScreenQuality === 'oled' ? `(${t('OLED / Soft')})` : `(${t('Original Refurb')})`)
                                            : ''}
                                    </span>
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
                        })}
                    </div>
                )}
            </div>
            <div className="bg-gray-50 dark:bg-slate-950/50 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {isBuyback ? t('Estimated Value') : t('Total Cost')}
                </p>
                <div className="text-3xl font-extrabold text-bel-dark dark:text-white">
                    {loading ? (
                        <span className="animate-pulse opacity-50">...</span>
                    ) : (
                        typeof estimateDisplay === 'number' ? (
                            estimateDisplay > 0 ? <>&euro;{estimateDisplay}</> : (estimateDisplay === -1 ? t('contact_for_price') : <span className="text-gray-400">-</span>)
                        ) : estimateDisplay
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileSummary;
