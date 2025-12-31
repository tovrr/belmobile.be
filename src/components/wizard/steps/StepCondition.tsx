import React, { memo, useEffect, useState } from 'react';
import { ChevronLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Sidebar from '../Sidebar';
import { REPAIR_ISSUES } from '../../../constants';
import { getRepairProfileForModel } from '../../../config/repair-profiles';
import { useWizard } from '../../../context/WizardContext';
import { useWizardPricing } from '../../../hooks/useWizardPricing';
import { useWizardActions } from '../../../hooks/useWizardActions';
import { useLanguage } from '../../../hooks/useLanguage';
import { slugToDisplayName } from '../../../utils/slugs';
import { WizardFAQ } from '../WizardFAQ';

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
    const [activeCategory, setActiveCategory] = useState<string>('all');

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
    const setStorage = (val: string) => dispatch({ type: 'SET_WIZARD_DATA', payload: { storage: val } });
    const setTurnsOn = (val: boolean | null) => dispatch({ type: 'SET_WIZARD_DATA', payload: { turnsOn: val } });
    const setWorksCorrectly = (val: boolean | null) => dispatch({ type: 'SET_WIZARD_DATA', payload: { worksCorrectly: val } });
    const setIsUnlocked = (val: boolean | null) => dispatch({ type: 'SET_WIZARD_DATA', payload: { isUnlocked: val } });
    const setFaceIdWorking = (val: boolean | null) => dispatch({ type: 'SET_WIZARD_DATA', payload: { faceIdWorking: val } });
    const setBatteryHealth = (val: 'normal' | 'service' | null) => dispatch({ type: 'SET_WIZARD_DATA', payload: { batteryHealth: val } });
    const setSelectedScreenQuality = (val: 'generic' | 'oled' | 'original' | '') => dispatch({ type: 'SET_WIZARD_DATA', payload: { selectedScreenQuality: val } });
    const setControllerCount = (val: number) => dispatch({ type: 'SET_WIZARD_DATA', payload: { controllerCount: val } });

    const toggleRepairIssue = (issue: string) => {
        const currentIssues = repairIssues || [];
        const newIssues = currentIssues.includes(issue)
            ? currentIssues.filter(i => i !== issue)
            : [...currentIssues, issue];
        dispatch({ type: 'SET_WIZARD_DATA', payload: { repairIssues: newIssues } });
    };

    // Auto-select best condition (Green Boxes) defaults for Buyback to match max price
    useEffect(() => {
        if (type === 'buyback' && step === 3 && !loading) {
            // 1. Storage: Select Max Capacity
            if (!storage) {
                const staticOptions = (specsData && selectedModel ? specsData[selectedModel] : []) || [];
                const dynamicOptions = dynamicBuybackPrices ? dynamicBuybackPrices.map(p => p.storage) : [];

                let options: string[] = [];
                if (dynamicOptions.length > 0) options = Array.from(new Set(dynamicOptions));
                else if (staticOptions.length > 0) options = staticOptions;
                else options = ['64GB', '128GB', '256GB']; // Fallback

                const getVal = (s: string) => {
                    if (s.endsWith('TB')) return parseFloat(s) * 1024;
                    return parseFloat(s);
                };

                // Sort descending (Max first)
                options.sort((a, b) => getVal(b) - getVal(a));

                if (options.length > 0) setStorage(options[0]);
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
        }
    }, [
        type, step, loading, dynamicBuybackPrices, specsData, selectedModel, selectedBrand, deviceType,
        storage, turnsOn, worksCorrectly, isUnlocked, faceIdWorking, batteryHealth,
        // Dependencies are stable or guarded, preventing loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8 gap-6">
                <div className="flex-1 min-w-0 space-y-8">
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={onBack}
                            type="button"
                            className="lg:hidden p-2 -ml-2 mr-2 rounded-full hover:bg-white/10 text-gray-900 dark:text-white transition-colors"
                            aria-label={t('Back')}
                        >
                            <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Functionality & Specs')}</h2>
                    </div>

                    {/* Storage Selection */}
                    <div>
                        <label className="block text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('Storage')}</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(() => {
                                const staticOptions = (specsData && selectedModel ? specsData[selectedModel] : []) || [];
                                const dynamicOptions = dynamicBuybackPrices ? dynamicBuybackPrices.map(p => p.storage) : [];

                                let finalOptions = [];
                                if (dynamicOptions.length > 0) {
                                    finalOptions = Array.from(new Set(dynamicOptions));
                                } else if (staticOptions.length > 0) {
                                    finalOptions = staticOptions;
                                } else {
                                    finalOptions = ['64GB', '128GB', '256GB'];
                                }

                                const sortStorage = (a: string, b: string) => {
                                    const getVal = (s: string) => {
                                        if (s.endsWith('TB')) return parseFloat(s) * 1024;
                                        return parseFloat(s);
                                    };
                                    return getVal(a) - getVal(b);
                                };

                                return finalOptions.sort(sortStorage).map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setStorage(opt)}
                                        className={`py-3 rounded-xl font-bold transition-all ${storage === opt ? 'bg-bel-blue text-white' : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800'}`}
                                    >
                                        {opt}
                                    </button>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* Functional Questions */}
                    <div className="space-y-4">
                        <label className="block text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">{t('Functionality')}</label>
                        {[
                            { label: 'Turns On?', state: turnsOn, setter: setTurnsOn },
                            { label: 'Everything Works?', state: worksCorrectly, setter: setWorksCorrectly },
                            ...(deviceType === 'smartphone' ? [{ label: 'Unlocked?', state: isUnlocked, setter: setIsUnlocked }] : []),
                            ...(isAppleSmartphone ? [{ label: 'Face ID Working?', state: faceIdWorking, setter: setFaceIdWorking }] : [])
                        ].map((item, i) => {
                            const isDisabled = turnsOn === false && item.label !== 'Turns On?';
                            if (!item.setter) return null;

                            return (
                                <div key={i} className={`flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <span className="font-medium text-gray-900 dark:text-white">{t(item.label)}</span>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => item.setter!(true)}
                                            disabled={isDisabled}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border ${item.state === true ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                                        >
                                            {t('Yes')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => item.setter!(false)}
                                            disabled={isDisabled}
                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border ${item.state === false ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
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
                                <button type="button" onClick={() => setBatteryHealth('normal')} disabled={turnsOn === false} className={`py-3 px-4 rounded-xl font-bold transition-all border ${batteryHealth === 'normal' ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}>{t('battery_normal_desc')}</button>
                                <button type="button" onClick={() => setBatteryHealth('service')} disabled={turnsOn === false} className={`py-3 px-4 rounded-xl font-bold transition-all border ${batteryHealth === 'service' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>{t('battery_service_desc')}</button>
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
                                        className={`py-3 px-4 rounded-xl font-bold transition-all border ${controllerCount === count
                                            ? 'bg-bel-blue text-white border-bel-blue'
                                            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {count === 0 ? t('No Controller') : (count === 1 ? t('1 Controller') : t('2 Controllers'))}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Mobile Summary & Action Block (Buyback) */}
                    <div className="lg:hidden mt-8 mb-8 p-6 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{t('Estimated Value')}</p>
                                    <div className="text-3xl font-extrabold text-bel-dark dark:text-white mt-1">
                                        {loading ? <span className="animate-pulse">...</span> : `€${sidebarEstimate}`}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{t('Based on current selection')}</p>
                                </div>
                            </div>

                            <button
                                onClick={onNext}
                                disabled={nextDisabled}
                                className="w-full bg-bel-blue text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-lg flex items-center justify-center gap-2 transition-all hover:bg-bel-blue/90"
                            >
                                <span>{t('Next')}</span>
                                <ChevronLeftIcon className="h-5 w-5 rotate-180" />
                            </button>
                        </div>
                    </div>
                    <WizardFAQ
                        currentStep={step}
                        flow={type}
                        deviceType={deviceType}
                        selectedBrand={selectedBrand || undefined}
                        selectedModel={selectedModel || undefined}
                    />
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
                    loading={loading}
                />
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // REPAIR VIEW
    // -------------------------------------------------------------------------
    else {
        const nextDisabled = repairIssues.length === 0;
        const nextLabel = repairIssues.includes('other') ? t("Next") : t("Start Repair");
        const isNintendo = selectedBrand?.toLowerCase() === 'nintendo';

        return (
            <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8 gap-6">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <button
                            onClick={onBack}
                            type="button"
                            className="lg:hidden p-2 -ml-2 mr-2 rounded-full hover:bg-white/10 text-gray-900 dark:text-white transition-colors"
                            aria-label={t('Back')}
                        >
                            <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('What needs fixing?')}</h2>
                    </div>
                    <p className="text-gray-500 mb-6">{selectedBrand} {slugToDisplayName(selectedModel || '')}</p>

                    {/* Category Selector */}
                    <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar scroll-smooth snap-x">
                        {['all', 'display', 'power', 'camera', 'body', 'technical'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-full whitespace-nowrap font-bold transition-all snap-start ${activeCategory === cat
                                    ? 'bg-bel-blue text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/20'
                                    : 'bg-white/50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                                    }`}
                            >
                                {t('cat_' + cat)}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {REPAIR_ISSUES.filter(issue => {
                            // 1. Initial Filtering (Device, Brand, Prices, etc.)
                            if (issue.devices && !issue.devices.includes(deviceType)) return false;
                            const brand = selectedBrand?.toLowerCase();
                            if (issue.brands && !issue.brands.some(b => b.toLowerCase() === brand)) return false;

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
                            const isExemptFromSoftDelete = (isFoldableIssue && isFoldableModel) || (isHandheldDevice && isHandheldScreenIssue);
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
                                <div key={issue.id} className={`flex flex-col p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900'} ${showScreenOptionsForIssue ? 'md:col-span-2' : ''}`}>
                                    <div className="flex items-center cursor-pointer" onClick={() => toggleRepairIssue(issue.id)}>
                                        <div className={`p-3 rounded-xl mr-4 ${isSelected ? 'bg-bel-blue text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}><issue.icon className="h-6 w-6" /></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className={`font-bold ${isSelected ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>{t(issue.id)}</span>
                                                {/* pricesLoading check if needed, but we don't have it in context, assume fast */}
                                                {!showScreenOptionsForIssue && (
                                                    <span className="text-sm font-bold bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300 animate-fade-in">
                                                        {isScreenIssue && displayPrice !== null && displayPrice > 0 && <span className="mr-1 text-xs font-normal opacity-70">{t('À partir de')}</span>}
                                                        {issue.id === 'other' ? <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span> : (displayPrice !== null && displayPrice > 0 ? <>&euro;{displayPrice}</> : <span className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">{t('contact_for_price')}</span>)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{t(issue.id + '_desc')}</p>
                                        </div>
                                        {isSelected && !showScreenOptionsForIssue && <CheckCircleIcon className="h-6 w-6 text-bel-blue ml-2" />}
                                    </div>

                                    {/* Screen Quality Options */}
                                    {showScreenOptionsForIssue && (
                                        <div className="mt-4 space-y-3 animate-fade-in border-t border-blue-100 dark:border-blue-800 pt-4">
                                            {/* Generic / Standard */}
                                            {(dynamicRepairPrices?.screen_generic !== undefined ? dynamicRepairPrices.screen_generic : (repairEstimates.hasScreen ? repairEstimates.standard : -1)) >= 0 && (
                                                <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedScreenQuality === 'generic' ? 'border-gray-400 bg-white dark:bg-slate-900' : 'border-transparent hover:bg-white/50'}`}>
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
                                                <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedScreenQuality === 'oled' ? 'border-blue-500 bg-white dark:bg-slate-900' : 'border-transparent hover:bg-white/50'}`}>
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
                                                <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedScreenQuality === 'original' ? 'border-purple-500 bg-white dark:bg-slate-900' : 'border-transparent hover:bg-white/50'}`}>
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

                    {/* Mobile Summary & Action Block (Replaces Sticky Footer) */}
                    <div className="lg:hidden mt-8 mb-8 p-6 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{t('Total Estimated Cost')}</p>
                                    <div className="text-3xl font-extrabold text-bel-dark dark:text-white mt-1">
                                        {loading ? <span className="animate-pulse">...</span> : `€${sidebarEstimate}`}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{t('includes_vat_labor')}</p>
                                </div>
                            </div>

                            <button
                                onClick={onNext}
                                disabled={nextDisabled}
                                className="w-full bg-bel-blue text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-lg flex items-center justify-center gap-2 transition-all hover:bg-bel-blue/90"
                            >
                                <span>{nextLabel}</span>
                                <ChevronLeftIcon className="h-5 w-5 rotate-180" />
                            </button>
                        </div>
                    </div>
                    <WizardFAQ
                        currentStep={step}
                        flow={type}
                        deviceType={deviceType}
                        selectedBrand={selectedBrand || undefined}
                        selectedModel={selectedModel || undefined}
                    />
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
                    nextLabel={nextLabel}
                    selectedScreenQuality={selectedScreenQuality}
                    repairEstimates={repairEstimates}
                    dynamicRepairPrices={dynamicRepairPrices}
                    getSingleIssuePrice={getSingleIssuePrice}
                    loading={loading}
                />
            </div>
        );
    }
});
