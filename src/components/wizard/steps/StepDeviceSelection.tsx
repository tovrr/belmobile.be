import React, { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Select from '../../ui/Select';
import Sidebar from '../Sidebar';
import { createSlug } from '../../../utils/slugs';
import { getDeviceImage } from '../../../data/deviceImages';
import { DEVICE_BRANDS } from '../../../data/brands';
import { useWizard } from '../../../context/WizardContext';
import { useWizardActions } from '../../../hooks/useWizardActions';
import { useWizardPricing } from '../../../hooks/useWizardPricing';
import { useLanguage } from '../../../hooks/useLanguage';

interface StepDeviceSelectionProps {
    type: 'buyback' | 'repair';
    step: number; // passed for Sidebar compatibility or just use context? Sidebar takes step.
    onNext: () => void;
    onBack: () => void;
    modelSelectRef?: React.RefObject<HTMLDivElement | null>;
    // Optional overrides for legacy compatibility or storybook
    selectedBrand?: string;
    selectedModel?: string;
}

export const StepDeviceSelection: React.FC<StepDeviceSelectionProps> = ({
    type,
    step,
    onBack,
    onNext,
    modelSelectRef
}) => {
    const { state, dispatch } = useWizard();
    const { t } = useLanguage();

    // Actions
    const { handleBrandSelect, handleModelSelect } = useWizardActions(type);

    // Pricing for Sidebar
    const { sidebarEstimate, repairEstimates, dynamicRepairPrices, getSingleIssuePrice } = useWizardPricing(type);

    const { deviceType, selectedBrand, selectedModel, modelsData, isLoadingData, storage, repairIssues, selectedScreenQuality } = state;

    const brands = (DEVICE_BRANDS as Record<string, string[]>)[deviceType] || [];
    const nextDisabled = !selectedBrand || !selectedModel;
    const availableModels = modelsData && modelsData[deviceType] ? Object.keys(modelsData[deviceType]) : [];

    // Local handler to wrap the action if needed, or stick to direct usage
    const onBrandClick = (brand: string) => {
        handleBrandSelect(brand);
        // Scroll or focus handling if needed
    };

    return (
        <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-8">
                    <button onClick={onBack} className="lg:hidden p-1 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-gray-500">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Select Brand & Model')}</h2>
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">{t('Brand')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {brands.map((brand: string, index: number) => (
                            <button
                                key={brand}
                                onClick={() => onBrandClick(brand)}
                                className={`group py-4 px-4 rounded-xl font-bold text-sm transition-all flex flex-col items-center justify-center gap-3 h-32 ${selectedBrand === brand
                                    ? 'bg-bel-blue text-white shadow-lg shadow-blue-200 dark:shadow-none'
                                    : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-800 hover:border-bel-blue hover:bg-blue-50/50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {getDeviceImage(createSlug(brand)) && (
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src={getDeviceImage(createSlug(brand))!}
                                            alt={`${brand} ${t(type === 'buyback' ? 'Buyback' : 'Repair')} options`}
                                            fill
                                            sizes="48px"
                                            priority={index < 6}
                                            className={`object-contain transition-all duration-300 ${selectedBrand === brand
                                                ? 'brightness-0 invert'
                                                : 'opacity-40 grayscale dark:invert dark:opacity-60 group-hover:opacity-100 group-hover:grayscale-0'
                                                }`}
                                        />
                                    </div>
                                )}
                                <span>{brand}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedBrand && (
                    <div ref={modelSelectRef} className="mb-8 animate-fade-in">
                        <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">{t('Model')}</label>
                        <div className="relative min-h-[56px]">
                            <Select
                                value={selectedModel || ''}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleModelSelect(e.target.value)}
                                options={[
                                    { value: "", label: isLoadingData ? t('Loading models...') : t('Select your model...') },
                                    ...availableModels.map(model => ({ value: model, label: model }))
                                ]}
                                className="text-lg font-medium w-full"
                                disabled={isLoadingData}
                            />

                            {isLoadingData && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 rounded-xl flex items-center justify-center space-x-3 z-10 animate-fade-in backdrop-blur-[1px]">
                                    <div className="w-5 h-5 border-2 border-bel-blue border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
                nextDisabled={nextDisabled}
                nextLabel={t('Next')}
                selectedScreenQuality={selectedScreenQuality}
                repairEstimates={repairEstimates}
                dynamicRepairPrices={dynamicRepairPrices}
                getSingleIssuePrice={getSingleIssuePrice}
            />
        </div>
    );
};
