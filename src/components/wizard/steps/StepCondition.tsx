import React, { memo, useEffect, useState, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Sidebar from '../Sidebar';
import { REPAIR_ISSUES } from '../../../data/repair-issues';
import { getRepairProfileForModel } from '../../../config/repair-profiles';
import { useWizard } from '../../../context/WizardContext';
import { getDeviceContext } from '../../../utils/seoHelpers';
import { useWizardPricing } from '../../../hooks/useWizardPricing';
import { useWizardActions } from '../../../hooks/useWizardActions';
import { useLanguage } from '../../../hooks/useLanguage';
import { useHaptic } from '../../../hooks/useHaptic';
import { slugToDisplayName } from '../../../utils/slugs';
import { WizardFAQ } from '../WizardFAQ';
import { BoltIcon, BanknotesIcon, ShieldCheckIcon } from '../../ui/BrandIcons';
import BrandLoader from '../../ui/BrandLoader';

interface StepConditionProps {
    type: 'buyback' | 'repair';
    step?: number;
    onNext?: () => void;
    onBack?: () => void;
}

export const StepCondition: React.FC<StepConditionProps> = memo(({
    type
}) => {
    const { state, dispatch } = useWizard();
    const { t } = useLanguage();
    const { handleNext, handleBack } = useWizardActions(type);
    const haptic = useHaptic();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 200;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const step = state.step;
    const onNext = handleNext;
    const onBack = handleBack;


    const {
        sidebarEstimate,
        repairEstimates,
        dynamicRepairPrices,
        dynamicBuybackPrices,
        getSingleIssuePrice,
        loading
    } = useWizardPricing(type);

    const {
        deviceType,
        selectedBrand,
        selectedModel,
        storage,
        turnsOn,
        worksCorrectly,
        isUnlocked,
        faceIdWorking,
        batteryHealth,
        specsData,
        repairIssues,
        selectedScreenQuality,
        controllerCount,
        screenState,
        bodyState
    } = state;

    // Dispatch helpers
    const setStorage = (val: string) => { haptic.trigger('light'); dispatch({ type: 'SET_WIZARD_DATA', payload: { storage: val } }); };
    const setTurnsOn = (val: boolean | null) => { haptic.trigger('light'); dispatch({ type: 'SET_WIZARD_DATA', payload: { turnsOn: val } }); };
    const setWorksCorrectly = (val: boolean | null) => { haptic.trigger('light'); dispatch({ type: 'SET_WIZARD_DATA', payload: { worksCorrectly: val } }); };
    const setIsUnlocked = (val: boolean | null) => { haptic.trigger('light'); dispatch({ type: 'SET_WIZARD_DATA', payload: { isUnlocked: val } }); };
    const setFaceIdWorking = (val: boolean | null) => { haptic.trigger('light'); dispatch({ type: 'SET_WIZARD_DATA', payload: { faceIdWorking: val } }); };
    const setBatteryHealth = (val: 'normal' | 'service' | null) => { haptic.trigger('light'); dispatch({ type: 'SET_WIZARD_DATA', payload: { batteryHealth: val } }); };
    const setSelectedScreenQuality = (val: 'generic' | 'oled' | 'original' | '') => { haptic.trigger('light'); dispatch({ type: 'SET_WIZARD_DATA', payload: { selectedScreenQuality: val } }); };
    const setControllerCount = (val: number) => { haptic.trigger('light'); dispatch({ type: 'SET_WIZARD_DATA', payload: { controllerCount: val } }); };

    const toggleRepairIssue = (issue: string) => {
        haptic.trigger('light');
        const currentIssues = repairIssues || [];
        const newIssues = currentIssues.includes(issue)
            ? currentIssues.filter(i => i !== issue)
            : [...currentIssues, issue];
        dispatch({ type: 'SET_WIZARD_DATA', payload: { repairIssues: newIssues } });
    };

    // Auto-select best condition (Green Boxes) defaults for Buyback to match max price
    useEffect(() => {
        if (type === 'buyback' && step === 3) {
            // 1. Storage Logic (Robust Auto-Select)
            // Calculate valid options first
            const staticOptions = (specsData && selectedModel ? specsData[selectedModel] : []) || [];
            const dynamicOptions = dynamicBuybackPrices ? dynamicBuybackPrices.map(p => p.storage).filter(Boolean) : [];

            let options: string[] = [];
            if (dynamicOptions.length > 0) options = Array.from(new Set(dynamicOptions));
            else if (staticOptions.length > 0) options = staticOptions;

            // Fallback only if NOT loading (to avoid premature fallback)
            if (options.length === 0 && !loading) {
                options = ['128GB', '256GB', '512GB']; // Modern Fallback
            }

            // AEGIS: Filter out 64GB for modern iPhones
            const isModernIphone = selectedBrand?.toLowerCase() === 'apple' &&
                deviceType === 'smartphone' &&
                (selectedModel.includes('13') || selectedModel.includes('14') ||
                    selectedModel.includes('15') || selectedModel.includes('16') ||
                    selectedModel.includes('17') || selectedModel.includes('Air'));

            if (isModernIphone) {
                options = options.filter(o => o !== '64GB');
            }

            // Sort Descending (Max First)
            const getVal = (s: string) => {
                if (s.endsWith('TB')) return parseFloat(s) * 1024;
                return parseFloat(s);
            };
            options.sort((a, b) => getVal(b) - getVal(a));

            // SELECTION LOGIC:
            // Only update if:
            // A) No storage set
            // B) Current storage is INVALID (not in legitimate options)
            // This fixes the "Stuck on 512GB" bug while respecting manual "128GB" selection.
            if (options.length > 0) {
                if (!storage || !options.includes(storage)) {
                    setStorage(options[0]);
                }
            }


            // 2. Functional Checks: Select "Yes" (Best Condition)
            if (turnsOn === null) setTurnsOn(true);
            if (worksCorrectly === null) setWorksCorrectly(true);
            if (isUnlocked === null) setIsUnlocked(true);

            // 3. Apple Specifics
            const isAppleSmartphone = selectedBrand?.toLowerCase() === 'apple' && (deviceType === 'smartphone' || deviceType === 'tablet');
            if (isAppleSmartphone) {
                if (faceIdWorking === null) setFaceIdWorking(true);
                if (batteryHealth === null) setBatteryHealth('normal'); // > 80%
            }

            // 4. Console Specifics: Pre-select 2 Controllers (Max Config)
            const isHomeConsole = deviceType === 'console_home';
            if (isHomeConsole && (controllerCount === null || controllerCount === undefined)) {
                setControllerCount(2);
            }

            // 5. Smartwatch Specifics: Auto-set storage to 'Standard' to bypass validation
            if (deviceType === 'smartwatch' && !storage) {
                setStorage('Standard');
            }
        }
    }, [
        type, step, loading, dynamicBuybackPrices, specsData, selectedModel, selectedBrand, deviceType,
        storage, turnsOn, worksCorrectly, isUnlocked, faceIdWorking, batteryHealth, controllerCount,
        setStorage, setTurnsOn, setWorksCorrectly, setIsUnlocked, setFaceIdWorking, setBatteryHealth, setControllerCount
    ]);

    // -------------------------------------------------------------------------
    // BUYBACK VIEW
    // -------------------------------------------------------------------------
    if (type === 'buyback') {
        const isAppleSmartphone = selectedBrand?.toLowerCase() === 'apple' && (deviceType === 'smartphone' || deviceType === 'tablet');
        const isHomeConsole = deviceType === 'console_home';

        // Strict validation logic (mirrors original)
        let nextDisabled = !storage || turnsOn === null;
        if (turnsOn !== false) {
            nextDisabled = nextDisabled || worksCorrectly === null || (deviceType === 'smartphone' && isUnlocked === null) || (isAppleSmartphone && (!batteryHealth || faceIdWorking === null));

            // Console validation
            if (isHomeConsole && (controllerCount === null || controllerCount === undefined)) {
                nextDisabled = true;
            }
        }

        return (
            <div className={`w-full mx-auto ${state.isWidget ? 'p-0 shadow-none border-0 bg-transparent' : ''}`}>
                <div className="flex-1 min-w-0 space-y-8">
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={() => { haptic.trigger('light'); onBack(); }}
                            type="button"
                            className={`${state.isWidget ? 'block' : 'lg:hidden'} p-2 -ml-2 mr-2 rounded-full hover:bg-white/10 text-gray-900 dark:text-white transition-colors active-press`}
                            aria-label={t('Back')}
                        >
                            <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Functionality & Specs')}</h2>
                    </div>

                    {/* Storage Selection */}
                    {deviceType !== 'smartwatch' && (
                        <div>
                            <label className="block text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('Storage')}</label>
                            <div className="grid grid-cols-3 gap-3 min-h-[60px] items-center">
                                {(loading || state.isLoadingData) ? (
                                    <div className="col-span-3 flex items-center justify-center space-x-2 py-4">
                                        <div className="w-2 h-2 bg-bel-yellow rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-bel-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-bel-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">{t('loading_specs')}</span>
                                    </div>
                                ) : (
                                    (() => {
                                        const findSpecs = (modelStr: string) => {
                                            if (!specsData || !modelStr) return [];
                                            const m = String(modelStr).trim();
                                            if (specsData[m]) return specsData[m];
                                            const key = Object.keys(specsData).find(k => k.toLowerCase() === m.toLowerCase());
                                            return key ? specsData[key] : [];
                                        };


                                        const staticOptions = findSpecs(selectedModel);
                                        const dynamicOptions = (dynamicBuybackPrices || [])
                                            .map(p => p.storage)
                                            .filter(Boolean);

                                        let finalOptions: string[] = [];
                                        if (dynamicOptions.length > 0) {
                                            finalOptions = Array.from(new Set(dynamicOptions));
                                        } else if (staticOptions && staticOptions.length > 0) {
                                            finalOptions = staticOptions;
                                        } else {
                                            // Robust Fallback
                                            finalOptions = ['128GB', '256GB', '512GB'];
                                        }

                                        // AEGIS: Safety Filter - Modern iPhones do not have 64GB
                                        const isModernIphone = selectedBrand?.toLowerCase() === 'apple' &&
                                            deviceType === 'smartphone' &&
                                            (selectedModel.includes('13') || selectedModel.includes('14') ||
                                                selectedModel.includes('15') || selectedModel.includes('16') ||
                                                selectedModel.includes('17') || selectedModel.includes('Air'));

                                        if (isModernIphone) {
                                            finalOptions = finalOptions.filter(o => o !== '64GB');
                                        }

                                        const sortStorageAsc = (a: string, b: string) => {
                                            const getVal = (s: string) => {
                                                if (!s) return 0;
                                                if (s.endsWith('TB')) return parseFloat(s) * 1024;
                                                return parseFloat(s) || 0;
                                            };
                                            return getVal(a) - getVal(b); // Ascending (Small -> Large)
                                        };

                                        return finalOptions.sort(sortStorageAsc).map((opt) => (
                                            <button
                                                key={`storage-${opt}`}
                                                type="button"
                                                onClick={() => setStorage(opt)}
                                                className={`py-3 rounded-xl font-bold transition-all active-press ${storage === opt
                                                    ? 'bg-bel-yellow text-gray-900 shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-400'
                                                    : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-bel-yellow hover:bg-yellow-50/50 dark:hover:bg-slate-800'}`}
                                            >
                                                {opt}
                                            </button>
                                        ));
                                    })()
                                )}
                            </div>
                        </div>
                    )}

                    {/* Functional Questions */}
                    <div className="space-y-4">
                        <label className="block text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('Functionality')}</label>
                        {[
                            { id: 'turns-on', label: 'Turns On?', state: turnsOn, setter: setTurnsOn },
                            { id: 'works-correctly', label: 'Everything Works?', state: worksCorrectly, setter: setWorksCorrectly },
                            ...(deviceType === 'smartphone' ? [{ id: 'is-unlocked', label: 'Unlocked?', state: isUnlocked, setter: setIsUnlocked }] : []),
                            ...(isAppleSmartphone ? [{ id: 'faceid', label: 'Face ID Working?', state: faceIdWorking, setter: setFaceIdWorking }] : [])
                        ].map((item) => {
                            const isDisabled = turnsOn === false && item.id !== 'turns-on';
                            if (!item.setter) return null;

                            return (
                                <div key={item.id} className={`flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-white">{t(item.label)}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('desc_' + item.label)}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => item.setter!(true)}
                                            disabled={isDisabled}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border active-press ${item.state === true ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                                        >
                                            {t('Yes')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => item.setter!(false)}
                                            disabled={isDisabled}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border active-press ${item.state === false ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                                        >
                                            {t('No')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Battery Health (Apple Only) */}
                    {isAppleSmartphone && (
                        <div className={turnsOn === false ? 'opacity-50 pointer-events-none' : ''}>
                            <label className="block text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('Battery Health')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setBatteryHealth('normal')} disabled={turnsOn === false} className={`py-3 px-4 rounded-xl font-bold transition-all border active-press ${batteryHealth === 'normal' ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}>{t('battery_normal_desc')}</button>
                                <button type="button" onClick={() => setBatteryHealth('service')} disabled={turnsOn === false} className={`py-3 px-4 rounded-xl font-bold transition-all border active-press ${batteryHealth === 'service' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>{t('battery_service_desc')}</button>
                            </div>
                        </div>
                    )}

                    {/* Controller Count (Home Consoles Only) */}
                    {isHomeConsole && (
                        <div className={turnsOn === false ? 'opacity-50 pointer-events-none' : ''}>
                            <label className="block text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('How many controllers?')}</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[0, 1, 2].map((count) => (
                                    <button
                                        key={count}
                                        type="button"
                                        onClick={() => setControllerCount(count)}
                                        disabled={turnsOn === false}
                                        className={`py-3 px-4 rounded-xl font-bold transition-all border active-press ${controllerCount === count
                                            ? 'bg-bel-yellow text-gray-900 border-bel-yellow'
                                            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {count === 0 ? t('No Controller') : (count === 1 ? t('1 Controller') : t('2 Controllers'))}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Mobile Summary Block (Buyback) - REMOVED (Redundant with MobileBottomBar) */}


                    <WizardFAQ
                        currentStep={step}
                        flow={type}
                        deviceType={deviceType}
                        selectedBrand={selectedBrand || undefined}
                        selectedModel={selectedModel || undefined}
                    />
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // REPAIR VIEW
    // -------------------------------------------------------------------------
    else {
        const { language: lang } = useLanguage();
        const nextDisabled = repairIssues.length === 0;
        const nextLabel = repairIssues.includes('other') ? t("Next") : t("Start Repair");
        const isNintendo = selectedBrand?.toLowerCase() === 'nintendo';

        return (
            <div className={`w-full mx-auto ${state.isWidget ? 'p-0 shadow-none border-0 bg-transparent' : ''}`}>
                <div className="flex-1 min-w-0">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => { haptic.trigger('light'); onBack(); }}
                                type="button"
                                className="p-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-gray-900 dark:text-white transition-colors active-press hover:bg-slate-200 dark:hover:bg-white/20"
                                aria-label={t('Back')}
                            >
                                <ChevronLeftIcon className="h-6 w-6" />
                            </button>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{t('What needs fixing?')}</h2>
                        </div>

                        {/* Desktop Scroll Arrows - Top Right */}
                        <div className="hidden md:flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => scroll('left')}
                                className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors active-press hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => scroll('right')}
                                className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors active-press hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Category Selector */}
                    <div className="relative group mb-6">
                        {/* Mobile Scroll Hint Arrow */}
                        <div className="md:hidden absolute right-0 top-1/2 -translate-y-[calc(50%+8px)] z-20 pointer-events-none pr-1">
                            <div className="bg-white/90 dark:bg-slate-800/90 rounded-full p-1.5 shadow-lg border border-gray-200 dark:border-slate-700 animate-pulse ring-4 ring-indigo-500/5">
                                <ChevronRightIcon className="h-4 w-4 text-[#6366F1]" />
                            </div>
                        </div>

                        <div
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto pb-4 gap-2 no-scrollbar scroll-smooth snap-x"
                        >
                            {['all', 'display', 'power', 'camera', 'body', 'technical'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { haptic.trigger('light'); setActiveCategory(cat); }}
                                    className={`px-6 py-3 rounded-2xl whitespace-nowrap font-black text-xs uppercase tracking-widest transition-all snap-start active-press min-w-max ${activeCategory === cat
                                        ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/20 ring-4 ring-indigo-500/10'
                                        : 'bg-white/50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:scale-105'
                                        }`}
                                >
                                    {t('cat_' + cat)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {REPAIR_ISSUES.filter(issue => {
                            // SAFEGUARD: Defaults
                            const currentType = deviceType || 'smartphone';
                            const currentBrand = selectedBrand?.toLowerCase() || '';

                            // 1. Initial Filtering (Device, Brand, Prices, etc.)
                            if (issue.devices && !issue.devices.includes(currentType)) return false;

                            if (issue.brands && issue.brands.length > 0) {
                                if (currentBrand && !issue.brands.some(b => b.toLowerCase() === currentBrand)) return false;
                            }

                            // 2. Category Filtering
                            if (activeCategory !== 'all' && issue.category !== activeCategory) return false;

                            // 3. Model Specific Filtering
                            const modelName = selectedModel || '';
                            const isFoldableModel = modelName.includes('Fold') || modelName.includes('Flip') || modelName.includes('Find N') || modelName.includes('Pixel Fold') || modelName.includes('Razr') || modelName.includes('Open');
                            const isFoldableIssue = ['screen_foldable_inner', 'screen_foldable_outer'].includes(issue.id);
                            if (isFoldableIssue && !isFoldableModel) return false;

                            if (issue.id === 'screen') {
                                const innerPrice = getSingleIssuePrice('screen_foldable_inner');
                                const outerPrice = getSingleIssuePrice('screen_foldable_outer');
                                const hasFoldablePrices = (typeof innerPrice === 'number' && innerPrice >= 0) || (typeof outerPrice === 'number' && outerPrice >= 0);
                                if (isFoldableModel || hasFoldablePrices) return false;
                            }

                            // 4. Soft Delete (Negative Prices)
                            const p = getSingleIssuePrice(issue.id);
                            const isHandheldScreenIssue = ['screen_upper', 'screen_bottom', 'screen_digitizer', 'screen_lcd', 'screen_component'].includes(issue.id);
                            const isHandheldDevice = deviceType === 'console_portable' || deviceType === 'tablet';
                            // AEGIS FIX: Never soft-delete core smartphone issues to ensure "Sur devis" appears for new devices (e.g. iPhone 16)
                            const isCoreIssue = ['screen', 'battery', 'charging', 'back_glass', 'camera_rear', 'housing'].includes(issue.id);
                            const isExemptFromSoftDelete = (isFoldableIssue && isFoldableModel) || (isHandheldDevice && isHandheldScreenIssue) || (deviceType === 'smartphone' && isCoreIssue);
                            if (typeof p === 'number' && p < 0 && !isExemptFromSoftDelete) return false;

                            // 5. Profile Check
                            const unifiedProfile = getRepairProfileForModel(modelName, deviceType);
                            if (unifiedProfile) {
                                if (!unifiedProfile.includes(issue.id)) return false;
                            } else {
                                if (['screen_upper', 'screen_bottom', 'screen_digitizer', 'screen_lcd'].includes(issue.id)) return false;
                            }

                            return true;
                        }).map(issue => {
                            const isSelected = repairIssues.includes(issue.id);
                            const price = getSingleIssuePrice(issue.id);
                            const displayPrice = (price && price >= 0) ? price : null;
                            const isScreenIssue = issue.id === 'screen';
                            const showScreenOptionsForIssue = isScreenIssue && isSelected && (deviceType === 'smartphone' || selectedBrand?.toLowerCase() === 'nintendo');

                            return (
                                <div key={issue.id} className={`group relative flex flex-col p-4 rounded-[1.5rem] border-2 transition-all duration-300 active-press ${isSelected ? 'border-[#6366F1] bg-indigo-50/50 dark:bg-indigo-900/10 shadow-xl shadow-indigo-500/5' : 'border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900'} ${showScreenOptionsForIssue ? 'md:col-span-2 shadow-2xl shadow-indigo-500/10' : ''}`}>
                                    <div className="flex items-start h-full cursor-pointer" onClick={() => toggleRepairIssue(issue.id)}>
                                        <div className={`p-4 rounded-2xl mr-4 shrink-0 transition-all duration-500 ${isSelected ? 'bg-[#6366F1] text-white shadow-lg shadow-indigo-500/30 scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:scale-110 group-hover:bg-slate-200 group-hover:text-slate-600'} `}>
                                            <issue.icon className="h-6 w-6" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col">
                                                <div className="flex justify-between items-start mb-1 gap-2">
                                                    <span className={`font-black text-sm md:text-base leading-tight transition-colors ${isSelected ? 'text-[#6366F1]' : 'text-gray-900 dark:text-white'}`}>
                                                        {t(issue.id)}
                                                    </span>

                                                    {!showScreenOptionsForIssue && (
                                                        <div className="flex flex-col items-end shrink-0">
                                                            <span className={`text-[11px] font-black px-2 py-1 rounded-lg transition-colors ${isSelected ? 'bg-[#6366F1] text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'}`}>
                                                                {isScreenIssue && displayPrice !== null && displayPrice > 0 && <span className="mr-1 text-[9px] font-normal opacity-70 uppercase tracking-tighter">{t('À partir de')}</span>}
                                                                {issue.id === 'other' ? <span className="font-black uppercase tracking-widest">{t('free')}</span> : (displayPrice !== null && displayPrice > 0 ? <>&euro;{displayPrice}</> : <span className="text-[9px] font-bold tracking-tight whitespace-nowrap">{t('on_request')}</span>)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className={`text-[11px] leading-relaxed transition-colors line-clamp-2 ${isSelected ? 'text-indigo-700/70 dark:text-indigo-300/60' : 'text-slate-500'}`}>
                                                    {t(issue.id + '_desc')}
                                                </p>
                                            </div>
                                        </div>

                                        {isSelected && !showScreenOptionsForIssue && (
                                            <div className="absolute top-2 right-2 animate-in fade-in zoom-in duration-300">
                                                <div className="bg-[#6366F1] text-white rounded-full p-1 shadow-lg shadow-indigo-500/40">
                                                    <CheckCircleIcon className="h-3 w-3 stroke-3" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Screen Quality Options */}
                                    {showScreenOptionsForIssue && (
                                        <div className="mt-4 space-y-3 animate-fade-in border-t border-blue-100 dark:border-blue-800 pt-4">
                                            {/* Generic / Standard */}
                                            {(dynamicRepairPrices?.screen_generic !== undefined ? dynamicRepairPrices.screen_generic : (repairEstimates.hasScreen ? repairEstimates.standard : -1)) >= 0 && (
                                                <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all active-press ${selectedScreenQuality === 'generic' ? 'border-gray-400 bg-white dark:bg-slate-900' : 'border-transparent hover:bg-white/50'}`}>
                                                    <input type="radio" name="screenQuality" value="generic" checked={selectedScreenQuality === 'generic'} onChange={() => setSelectedScreenQuality('generic')} className="w-5 h-5 text-gray-600 focus:ring-gray-500 border-gray-300" />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex justify-between">
                                                            <span className="font-bold text-gray-900 dark:text-white">{isNintendo ? t('Touchscreen / Glass Only') : t('Generic / LCD')}</span>
                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                {(() => {
                                                                    const p = dynamicRepairPrices?.screen_generic !== undefined ? dynamicRepairPrices.screen_generic : repairEstimates.standard;
                                                                    return p > 0 ? <>&euro;{p}</> : t('contact_for_price');
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            )}

                                            {/* OLED / Premium */}
                                            {dynamicRepairPrices?.screen_oled !== undefined && dynamicRepairPrices.screen_oled >= 0 && (
                                                <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all active-press ${selectedScreenQuality === 'oled' ? 'border-blue-500 bg-white dark:bg-slate-900' : 'border-transparent hover:bg-white/50'}`}>
                                                    <input type="radio" name="screenQuality" value="oled" checked={selectedScreenQuality === 'oled'} onChange={() => setSelectedScreenQuality('oled')} className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex justify-between">
                                                            <span className="font-bold text-gray-900 dark:text-white">{isNintendo ? t('Full LCD Assembly') : t('OLED / Soft')}</span>
                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                {dynamicRepairPrices.screen_oled > 0 ? <>&euro;{dynamicRepairPrices.screen_oled}</> : t('contact_for_price')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            )}

                                            {/* Original / Refurb */}
                                            {dynamicRepairPrices?.screen_original !== undefined && dynamicRepairPrices.screen_original >= 0 && (
                                                <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all active-press ${selectedScreenQuality === 'original' ? 'border-purple-500 bg-white dark:bg-slate-900' : 'border-transparent hover:bg-white/50'}`}>
                                                    <input type="radio" name="screenQuality" value="original" checked={selectedScreenQuality === 'original'} onChange={() => setSelectedScreenQuality('original')} className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300" />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex justify-between">
                                                            <span className="font-bold text-gray-900 dark:text-white">{
                                                                selectedBrand?.toLowerCase().startsWith('samsung')
                                                                    ? t('Original Service Pack')
                                                                    : t('Original Refurb')
                                                            }</span>
                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                {dynamicRepairPrices.screen_original > 0 ? <>&euro;{dynamicRepairPrices.screen_original}</> : t('contact_for_price')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Trust Bar - Cheap, Fast, Guaranteed (Moved here) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                        {[
                            { icon: BoltIcon, label: 'repair_trust_fast', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-800/30' },
                            { icon: BanknotesIcon, label: 'repair_trust_cheap', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/30' },
                            { icon: ShieldCheckIcon, label: 'repair_trust_warranty', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-800/30', className: 'hidden md:flex' }
                        ].map((item, idx) => {
                            const { durationText } = getDeviceContext(selectedModel || '', lang as any);
                            let label = t(item.label);
                            if (item.label === 'repair_trust_fast') {
                                label = label
                                    .replace('30m', durationText)
                                    .replace('30min', durationText)
                                    .replace('30 min', durationText);
                            }

                            return (
                                <div key={idx} className={`flex items-center gap-3 p-3.5 rounded-2xl ${item.bg} ${item.border} ${item.className || ''} border transition-transform hover:scale-[1.02] duration-300`}>
                                    <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm ${item.color}`}>
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 antialiased leading-tight">{label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Mobile Summary Block (Repair) - REMOVED (Redundant with MobileBottomBar) */}


                    <WizardFAQ
                        currentStep={step}
                        flow={type}
                        deviceType={deviceType}
                        selectedBrand={selectedBrand || undefined}
                        selectedModel={selectedModel || undefined}
                    />
                </div>
            </div>
        );
    }
});
