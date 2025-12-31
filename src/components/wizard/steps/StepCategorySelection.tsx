import React, { useState, useMemo, memo } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, DevicePhoneMobileIcon, ChevronLeftIcon, ShieldCheckIcon, BanknotesIcon, BoltIcon, StarIcon } from '@heroicons/react/24/outline';
import { DEVICE_TYPES } from '../../../constants';
import TypewriterInput from '../../ui/TypewriterInput';
import { SEARCH_INDEX } from '../../../data/search-index';
import { getDeviceImage } from '../../../data/deviceImages';
import { createSlug } from '../../../utils/slugs';
import { useWizard } from '../../../context/WizardContext';
import { useWizardActions } from '../../../hooks/useWizardActions';
import { useLanguage } from '../../../hooks/useLanguage';
import { useDebounce } from '../../../hooks/useDebounce';
import { POPULAR_REPAIR_KEYS, POPULAR_BUYBACK_KEYS } from '../../../data/popularDevices';
import Select from '../../ui/Select';
import Button from '../../ui/Button';

interface SearchResult {
    brand: string;
    model: string;
    category: string;
    keywords?: string[];
}

interface StepCategorySelectionProps {
    type: 'buyback' | 'repair';
    step: number; // Added step prop
    handleNext?: () => void; // Made optional as we might use action directly
    hideStep1Title?: boolean;
    wizardPlaceholder?: string;
    // Legacy compatibility props - simplified
    [key: string]: any;
}

export const StepCategorySelection: React.FC<StepCategorySelectionProps> = memo(({
    type,
    step,
    handleNext,
    hideStep1Title,
    wizardPlaceholder,
}) => {
    const { state, dispatch } = useWizard();
    const { t } = useLanguage();
    // We can get handleNext from useWizardActions if not passed, but passing is fine
    const { handleNext: actionHandleNext, handleCategorySelect } = useWizardActions(type);

    const onNext = handleNext || actionHandleNext;

    // Local Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Local manual selection for compact widget
    const [localBrand, setLocalBrand] = useState('');
    const [localModel, setLocalModel] = useState('');

    const allBrands = useMemo(() => {
        const unique = new Set(Object.values(SEARCH_INDEX).map(i => i.brand));
        return Array.from(unique).sort();
    }, []);

    const modelsForBrand = useMemo(() => {
        if (!localBrand) return [];
        return Object.values(SEARCH_INDEX)
            .filter(i => i.brand === localBrand)
            .map(i => i.model)
            .sort();
    }, [localBrand]);

    const handleManualGo = () => {
        if (!localBrand || !localModel) return;
        const item = Object.values(SEARCH_INDEX).find(i => i.brand === localBrand && i.model === localModel);
        if (item) {
            onSearchSelect(item as SearchResult);
        }
    };

    // Filtered search results
    const debouncedSearchTerm = useDebounce(searchTerm, 150);

    const searchResults = useMemo(() => {
        if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];
        const term = createSlug(debouncedSearchTerm);
        return Object.values(SEARCH_INDEX).filter(item =>
            createSlug(item.brand + ' ' + item.model).includes(term) ||
            createSlug(item.model).includes(term) ||
            item.keywords?.some(k => k.includes(term))
        ).slice(0, 5) as SearchResult[];
    }, [debouncedSearchTerm]);

    // Popular suggestions (Hand-picked based on 2024/2025 market research)
    const popularSuggestions = useMemo(() => {
        const keys = type === 'repair' ? POPULAR_REPAIR_KEYS : POPULAR_BUYBACK_KEYS;

        return keys
            .map(key => SEARCH_INDEX[key])
            .filter(Boolean) as SearchResult[];
    }, [type]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsSearching(e.target.value.length >= 2);
    };

    const onSearchSelect = (item: SearchResult) => {
        dispatch({ type: 'SET_DEVICE_INFO', payload: { deviceType: item.category, selectedBrand: item.brand, selectedModel: item.model } });
        dispatch({ type: 'SET_STEP', payload: 3 });
        setIsFocused(false);
    };

    const showDropdown = isFocused && (isSearching || (searchTerm.length === 0 && popularSuggestions.length > 0));

    return (
        <div className={`animate-fade-in w-full mx-auto ${state.isWidget ? 'p-0 shadow-none border-0 bg-transparent' : 'max-w-4xl pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8'}`}>
            {!hideStep1Title && (
                <div className="text-center mb-12">

                    <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight flex flex-col items-center sm:block">
                        <span className="sr-only">
                            {type === 'buyback'
                                ? "Sell Your Smartphone, Tablet, or Laptop at the Best Price"
                                : "Professional Repair for Smartphone, Tablet, or Laptop"}
                        </span>
                        <span aria-hidden="true">
                            {type === 'buyback' ? t('wizard_action_sell') : t('wizard_action_repair')}
                        </span>
                        <span aria-hidden="true" className="text-bel-blue mt-2 sm:mt-0 sm:ml-3 relative inline-flex justify-start min-h-[1.2em] align-top">
                            <TypewriterInput
                                phrases={[
                                    t('typewriter_1'),
                                    t('typewriter_2'),
                                    t('typewriter_3'),
                                    t('typewriter_4'),
                                    t('typewriter_5'),
                                ]}
                                className=""
                            />
                        </span>
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
                        {t(type === 'buyback' ? 'buyback_step1_title' : 'repair_step1_title')}
                    </p>
                </div>
            )}

            {/* Search Bar */}
            <div className={`relative max-w-lg mx-auto ${hideStep1Title ? 'mb-8' : 'mb-12'}`}>
                <div className="relative z-20">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                    <input
                        type="text"
                        placeholder={wizardPlaceholder || t('Search...')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-bel-blue focus:ring-4 focus:ring-blue-500/10 transition-all text-lg shadow-sm"
                        aria-expanded={showDropdown}
                        aria-haspopup="listbox"
                    />
                </div>

                {/* Dropdown: Popular Suggestions or Search Results */}
                {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        {searchTerm.length === 0 ? (
                            <div className="p-2">
                                <div className="px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-slate-800">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('popular_devices')}</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {type === 'repair' ? (
                                            <>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800 uppercase">
                                                    {t('screen')}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-100 dark:border-green-800 uppercase">
                                                    {t('battery')}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 uppercase">
                                                    {t('instant_cash')}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-100 dark:border-purple-800 uppercase">
                                                    {t('eco_friendly')}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {popularSuggestions.map((item, idx) => (
                                    <SearchResultItem
                                        key={`popular-${idx}`}
                                        item={item}
                                        onSelect={onSearchSelect}
                                        type={type}
                                        t={t}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-2">
                                {searchResults.length > 0 ? (
                                    searchResults.map((item, idx) => (
                                        <SearchResultItem
                                            key={`result-${idx}`}
                                            item={item}
                                            onSelect={onSearchSelect}
                                            type={type}
                                            t={t}
                                        />
                                    ))
                                ) : (
                                    <div className="px-6 py-8 text-center text-gray-500">
                                        <div className="mb-2">🔍</div>
                                        {t('no_results_found')}{' '}
                                        <span className="font-bold text-gray-900 dark:text-white">"{searchTerm}"</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {state.isWidget ? (
                <div className="flex flex-col gap-6 max-w-lg mx-auto">
                    <div className="bg-white/40 dark:bg-slate-900/40 p-6 rounded-3xl border border-white/20 backdrop-blur-md shadow-2xl relative overflow-hidden group/card transition-all hover:bg-white/50 dark:hover:bg-slate-900/50">
                        {/* Perfect Widget Conversion Badge */}
                        <div className="absolute -top-1 -right-1 flex flex-col items-end">
                            <div className="bg-bel-blue text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-bl-2xl shadow-lg animate-pulse flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                {type === 'buyback' ? t('trust_best_price') : t('trust_official_warranty')}
                            </div>
                        </div>

                        <div className="text-xs font-black text-bel-blue uppercase tracking-widest text-center mb-6">
                            {t('or_select_manually')}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <Select
                                label={t('Brand')}
                                value={localBrand}
                                onChange={(e) => {
                                    setLocalBrand(e.target.value);
                                    setLocalModel('');
                                }}
                                options={[
                                    { value: '', label: t('Select Brand') },
                                    ...allBrands.map(b => ({ value: b, label: b }))
                                ]}
                                className="py-4! rounded-2xl! bg-white/80 dark:bg-slate-950/80"
                            />
                            <Select
                                label={t('Model')}
                                value={localModel}
                                disabled={!localBrand}
                                onChange={(e) => setLocalModel(e.target.value)}
                                options={[
                                    { value: '', label: t('Select Model') },
                                    ...modelsForBrand.map(m => ({ value: m, label: m }))
                                ]}
                                className="py-4! rounded-2xl! bg-white/80 dark:bg-slate-950/80"
                            />
                        </div>

                        <Button
                            onClick={handleManualGo}
                            disabled={!localBrand || !localModel}
                            variant="cyber"
                            className="w-full mt-2 py-6! text-lg! rounded-2xl! shadow-xl shadow-bel-blue/20 group/btn relative overflow-hidden"
                            icon={<BoltIcon className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />}
                        >
                            <span className="relative z-10 font-black">{t(type === 'buyback' ? 'Evaluate My Device' : 'Estimate Repair')}</span>
                        </Button>
                    </div>

                    {/* Trust Signals Row - The "Perfect Widget" Secret Sauce */}
                    <div className="flex justify-between gap-2 px-2">
                        <div className="flex flex-col items-center gap-1 flex-1 text-center">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-bel-blue border border-blue-100 dark:border-blue-800">
                                <ShieldCheckIcon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase leading-tight">{t('trust_official_warranty')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1 text-center">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-800">
                                <BanknotesIcon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase leading-tight">{t('trust_instant_cash')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-1 text-center">
                            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 border border-amber-100 dark:border-amber-800">
                                <StarIcon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase leading-tight">4.9/5 Rating</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {DEVICE_TYPES.map((dt) => (
                        <button
                            key={dt.id}
                            onClick={() => {
                                if (handleCategorySelect) {
                                    handleCategorySelect(dt.id);
                                } else {
                                    // Fallback if action not available (shouldn't happen)
                                    dispatch({ type: 'SET_DEVICE_INFO', payload: { deviceType: dt.id } });
                                    onNext();
                                }
                            }}
                            className={`group flex flex-col items-center justify-center p-4 lg:p-8 rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${state.deviceType === dt.id
                                ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20 shadow-blue-500/20'
                                : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-bel-blue/50'
                                }`}
                        >
                            <div className={`relative w-16 h-16 p-4 rounded-2xl mb-4 transition-all duration-300 ${state.deviceType === dt.id ? 'bg-bel-blue scale-110 shadow-lg shadow-blue-500/30' : 'bg-gray-50 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10'}`}>
                                <Image
                                    src={dt.icon}
                                    alt={`${t(dt.label)} category icon`}
                                    fill
                                    priority
                                    sizes="64px"
                                    className={`object-contain p-2 transition-all duration-300 ${state.deviceType === dt.id ? 'brightness-0 invert' : 'opacity-60 dark:invert dark:opacity-80 group-hover:opacity-100 group-hover:scale-110'}`}
                                />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-bel-blue transition-colors">{t(dt.label)}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});

interface SearchResultItemProps {
    item: SearchResult;
    onSelect: (item: SearchResult) => void;
    type: 'buyback' | 'repair';
    t: (key: string) => string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ item, onSelect, type, t }) => {
    const slug = createSlug(`${item.brand} ${item.model}`);
    const deviceImg = getDeviceImage(slug) || getDeviceImage(createSlug(item.brand));

    return (
        <button
            onMouseDown={(e) => {
                e.preventDefault(); // Prevent input onBlur
                onSelect(item);
            }}
            className="w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition rounded-xl text-left"
        >
            <div className="w-14 h-14 relative bg-gray-50 dark:bg-slate-200 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-slate-700">
                {deviceImg ? (
                    <Image
                        src={deviceImg}
                        alt={item.model}
                        fill
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                        sizes="56px"
                        className="object-contain p-1"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <DevicePhoneMobileIcon className="w-6 h-6" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-bel-blue uppercase tracking-tight">{item.brand}</span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    <span className="text-xs text-gray-500 uppercase">{t(DEVICE_TYPES.find(d => d.id === item.category)?.label || item.category)}</span>
                </div>
                <div className="font-bold text-gray-900 dark:text-white truncate">{item.model}</div>
            </div>
            <div className="text-gray-300 dark:text-gray-600">
                <ChevronLeftIcon className="w-5 h-5 rotate-180" />
            </div>
        </button>
    );
};
