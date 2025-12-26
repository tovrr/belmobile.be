import React, { useState, useMemo, memo } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { DEVICE_TYPES } from '../../../constants';
import TypewriterInput from '../../ui/TypewriterInput';
import { SEARCH_INDEX } from '../../../data/search-index';
import { createSlug } from '../../../utils/slugs';
import { useWizard } from '../../../context/WizardContext';
import { useWizardActions } from '../../../hooks/useWizardActions';
import { useLanguage } from '../../../hooks/useLanguage';

interface SearchResult {
    brand: string;
    model: string;
    category: string;
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
    const { handleNext: actionHandleNext } = useWizardActions(type);

    const onNext = handleNext || actionHandleNext;

    // Local Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const searchResults = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        const term = createSlug(searchTerm);
        return Object.values(SEARCH_INDEX).filter(item =>
            createSlug(item.brand + ' ' + item.model).includes(term) ||
            createSlug(item.model).includes(term)
        ).slice(0, 5) as SearchResult[];
    }, [searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsSearching(e.target.value.length >= 2);
    };

    const onSearchSelect = (item: SearchResult) => {
        dispatch({ type: 'SET_DEVICE_INFO', payload: { deviceType: item.category, selectedBrand: item.brand, selectedModel: item.model } });
        // Jump to logic for selecting model (Step 3 usually)
        dispatch({ type: 'SET_STEP', payload: 3 });
    };

    return (
        <div className="animate-fade-in w-full max-w-4xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8">
            {!hideStep1Title && (
                <div className="text-center mb-12">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                        {type === 'buyback' ? t('Sell') : t('Repair')}
                        <TypewriterInput
                            phrases={DEVICE_TYPES.map(dt => t(dt.label))}
                            className="text-bel-blue ml-3"
                        />
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
                        {t(type === 'buyback' ? 'buyback_step1_title' : 'repair_step1_title')}
                    </p>
                </div>
            )}

            {/* Search Bar */}
            <div className={`relative max-w-lg mx-auto ${hideStep1Title ? 'mb-8' : 'mb-12'}`}>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                    <input
                        type="text"
                        placeholder={wizardPlaceholder || t('Search...')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-bel-blue focus:ring-4 focus:ring-blue-500/10 transition-all text-lg"
                    />
                </div>

                {/* Search Results Dropdown */}
                {isSearching && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50">
                        {searchResults.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSearchSelect(item)}
                                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left border-b border-gray-50 dark:border-slate-800 last:border-0"
                            >
                                <div className="w-10 h-10 relative bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                                    <DevicePhoneMobileIcon className="w-full h-full text-gray-400" aria-hidden="true" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{item.brand} {item.model}</div>
                                    <div className="text-xs text-gray-500 capitalize">{t(DEVICE_TYPES.find(d => d.id === item.category)?.label || item.category)}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DEVICE_TYPES.map((dt) => (
                    <button
                        key={dt.id}
                        onClick={() => {
                            dispatch({ type: 'SET_DEVICE_INFO', payload: { deviceType: dt.id } });
                            onNext();
                        }}
                        className={`group flex flex-col items-center justify-center p-4 lg:p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${state.deviceType === dt.id
                            ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-bel-blue/50'
                            }`}
                    >
                        <div className={`relative w-16 h-16 p-4 rounded-2xl mb-4 transition-all duration-300 ${state.deviceType === dt.id ? 'bg-bel-blue scale-110 shadow-lg shadow-blue-500/30' : 'bg-transparent'}`}>
                            <Image
                                src={dt.icon}
                                alt={`${t(dt.label)} category icon`}
                                fill
                                priority
                                sizes="64px"
                                className={`object-contain p-2 transition-all duration-300 ${state.deviceType === dt.id ? 'brightness-0 invert' : 'opacity-60 dark:invert dark:opacity-80 group-hover:opacity-100'}`}
                            />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{t(dt.label)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
});
