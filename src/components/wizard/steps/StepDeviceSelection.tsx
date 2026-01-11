import React from 'react';
import BrandLoader from '../../ui/BrandLoader';
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
import { useHaptic } from '../../../hooks/useHaptic';
import { slugToDisplayName } from '../../../utils/slugs';
import { shimmer, toBase64 } from '../../../utils/shimmer';

interface StepDeviceSelectionProps {
    type: 'buyback' | 'repair';
    step?: number;
    onNext?: () => void;
    onBack?: () => void;
    modelSelectRef?: React.RefObject<HTMLDivElement | null>;
    selectedBrand?: string;
    selectedModel?: string;
}

export const StepDeviceSelection: React.FC<StepDeviceSelectionProps> = ({
    type,
    modelSelectRef
}) => {
    const { state, dispatch } = useWizard();
    const { t } = useLanguage();
    const haptic = useHaptic();

    // Actions
    const { handleBrandSelect, handleModelSelect, handleBack, handleNext } = useWizardActions(type);

    const step = state.step;
    const onBack = handleBack;
    const onNext = handleNext;


    // Pricing for Sidebar
    const { sidebarEstimate, repairEstimates, dynamicRepairPrices, getSingleIssuePrice } = useWizardPricing(type);

    const { deviceType, selectedBrand, selectedModel, modelsData, isLoadingData, storage, repairIssues, selectedScreenQuality } = state;

    const brands = (DEVICE_BRANDS as Record<string, string[]>)[deviceType] || [];
    const nextDisabled = !selectedBrand || !selectedModel;
    const availableModels = modelsData && modelsData[deviceType] ? Object.keys(modelsData[deviceType]) : [];

    const ringColor = type === 'buyback' ? 'ring-yellow-500/30' : 'ring-bel-blue/30';

    // Auto-scroll if brand is already selected (e.g. coming back from next step)
    React.useEffect(() => {
        if (selectedBrand && modelSelectRef?.current) {
            setTimeout(() => {
                modelSelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add visual highlight only (no focus to prevent keyboard opening on mobile)
                const selectElement = modelSelectRef.current?.querySelector('select');
                if (selectElement) {
                    selectElement.classList.add('ring-4', ringColor, 'transition-all', 'duration-500');
                    setTimeout(() => selectElement.classList.remove('ring-4', ringColor), 1500);
                }
            }, 400); // Slightly longer delay to allow page transition
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only on mount

    // Local handler to wrap the action if needed, or stick to direct usage
    const onBrandClick = (brand: string) => {
        haptic.trigger('light');
        handleBrandSelect(brand, deviceType);
        // Wait for state update/render then scroll and focus
        // Slower delay (400ms) to allow "processing" visualization
        setTimeout(() => {
            if (modelSelectRef?.current) {
                modelSelectRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Find the select element inside and focus it
                const selectElement = modelSelectRef.current.querySelector('select');
                if (selectElement) {
                    selectElement.focus();
                    selectElement.classList.add('ring-4', ringColor, 'transition-all', 'duration-500');
                    setTimeout(() => selectElement.classList.remove('ring-4', ringColor), 1500);
                }
            }
        }, 400);
    };

    return (
        <div className={`w-full mx-auto ${state.isWidget ? 'p-0 shadow-none border-0 bg-transparent' : ''}`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-8">
                    <button
                        onClick={() => { haptic.trigger('light'); onBack(); }}
                        type="button"
                        className={`${state.isWidget ? 'block' : 'lg:hidden'} p-2 -ml-2 mr-2 rounded-full hover:bg-white/10 text-gray-900 dark:text-white transition-colors active-press`}
                        aria-label={t('Back')}
                    >
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Select Brand & Model')}</h2>
                </div>

                <div className="mb-8">
                    <label className="block text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                        {t('Brand')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {brands.map((brand: string, index: number) => (
                            <button
                                key={brand}
                                onClick={() => onBrandClick(brand)}
                                className={`group py-4 px-4 rounded-ui font-bold text-sm transition-all flex flex-col items-center justify-center gap-3 h-32 active-press ${selectedBrand === brand
                                    ? (type === 'buyback'
                                        ? 'bg-bel-yellow text-gray-900 shadow-lg shadow-yellow-500/20 dark:shadow-none'
                                        : 'bg-[#6366F1] text-white shadow-lg shadow-indigo-500/20 dark:shadow-none')
                                    : `bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-800 ${type === 'buyback'
                                        ? 'hover:border-bel-yellow hover:bg-yellow-50/50'
                                        : 'hover:border-[#6366F1] hover:bg-indigo-50/50'
                                    } dark:hover:bg-slate-800`
                                    }`}
                            >
                                {getDeviceImage(createSlug(brand), deviceType) && (
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src={getDeviceImage(createSlug(brand), deviceType)!}
                                            alt={`${brand} ${t(type === 'buyback' ? 'Buyback' : 'Repair')} options`}
                                            fill
                                            sizes="(max-width: 640px) 48px, 48px"
                                            priority={index < 4} // Elite: Above the fold priority
                                            {...(index < 4 ? { fetchPriority: "high" } : {})}
                                            placeholder="blur"
                                            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(48, 48))}`}
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
                        <label className="block text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                            {t('Model')}
                        </label>
                        <div className="relative min-h-[56px]">
                            <Select
                                value={selectedModel || ''}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    haptic.trigger('medium');
                                    handleModelSelect(e.target.value);
                                }}
                                options={[
                                    { value: "", label: isLoadingData ? t('Loading models...') : `👇 ${t('Select your model...')}` },
                                    ...availableModels.map(model => ({ value: model, label: model }))
                                ]}
                                className={`text-lg font-medium w-full ${type === 'buyback'
                                    ? 'focus:ring-bel-yellow! focus:border-transparent!'
                                    : 'focus:ring-[#6366F1]! focus:border-transparent!'
                                    }`}
                                disabled={isLoadingData}
                            />

                            {isLoadingData && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 rounded-ui flex items-center justify-center space-x-3 z-10 animate-fade-in backdrop-blur-[1px]">
                                    <BrandLoader variant="inline" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
