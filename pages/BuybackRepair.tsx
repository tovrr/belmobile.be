
import React, { useState, useMemo, useEffect } from 'react';
import { useShop } from '../hooks/useShop';
import { useData } from '../hooks/useData';
import { Quote } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useSearchParams, useParams } from 'react-router-dom';
import CalculatorBreadcrumbs from '../components/CalculatorBreadcrumbs';
import { 
    CheckCircleIcon, 
    CurrencyEuroIcon, 
    ArrowLeftIcon, 
    InformationCircleIcon,
    TruckIcon,
    BuildingStorefrontIcon,
    ChevronRightIcon,
    WrenchScrewdriverIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    SparklesIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { DEVICE_CATALOG, DEVICE_SPECS, DEVICE_TYPES, REPAIR_ISSUES } from '../constants';
import MetaTags from '../components/MetaTags';

interface BuybackRepairProps {
    type: 'buyback' | 'repair';
}

// Dynamic SEO Content Component
const SEOBottomContent = ({ brand, model, type, t }: any) => {
    if (!model) return null;
    const isRepair = type === 'repair';
    
    return (
        <div className="mt-12 pt-12 border-t border-gray-200 dark:border-slate-700 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t(isRepair ? 'repair_seo_h1' : 'buyback_seo_h1', model)}
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                <p>{t(isRepair ? 'repair_seo_p1' : 'buyback_seo_p1', model, brand)}</p>
                
                <div className="grid md:grid-cols-2 gap-8 my-8">
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {t(isRepair ? 'repair_seo_sub1' : 'buyback_seo_sub1')}
                        </h3>
                        <p className="text-sm">{t(isRepair ? 'repair_seo_sub1_text' : 'buyback_seo_sub1_text', model)}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {t(isRepair ? 'repair_seo_sub2' : 'buyback_seo_sub2')}
                        </h3>
                        <p className="text-sm">{t(isRepair ? 'repair_seo_sub2_text' : 'buyback_seo_sub2_text', brand)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Summary Component
const SelectionSummary = ({ 
    type, 
    step, 
    deviceType, 
    selectedBrand, 
    selectedModel, 
    storage, 
    repairIssues, 
    buybackEstimate, 
    repairEstimates,
    onEditStep,
    t 
}: any) => {
    const isBuyback = type === 'buyback';
    
    if (step === 1) return null; // Don't show summary on first step

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden sticky top-24 transition-colors duration-300">
            <div className="bg-bel-blue p-4 text-white">
                <h3 className="font-bold text-lg flex items-center">
                    <PencilSquareIcon className="h-6 w-6 mr-2" />
                    {t(isBuyback ? 'Sell Request' : 'Repair Request')}
                </h3>
            </div>
            <div className="p-4 space-y-4">
                {deviceType && (
                    <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-slate-700">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg mr-3">
                                <WrenchScrewdriverIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('Device')}</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{t(DEVICE_TYPES.find(d => d.id === deviceType)?.label || '')}</p>
                            </div>
                        </div>
                        <button onClick={() => onEditStep(1)} className="text-bel-blue dark:text-blue-400 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700">
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
                
                {selectedBrand && selectedModel && (
                    <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-slate-700">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg mr-3">
                                <SparklesIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('Model')}</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedBrand} {selectedModel}</p>
                            </div>
                        </div>
                        <button onClick={() => onEditStep(2)} className="text-bel-blue dark:text-blue-400 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700">
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {storage && isBuyback && (
                     <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-slate-700">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg mr-3">
                                <InformationCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('Storage')}</p>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{storage}</p>
                            </div>
                        </div>
                        <button onClick={() => onEditStep(3)} className="text-bel-blue dark:text-blue-400 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700">
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {repairIssues && repairIssues.length > 0 && !isBuyback && (
                    <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-slate-700">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg mr-3">
                                <WrenchScrewdriverIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('Issue')}</p>
                                <ul className="font-semibold text-gray-800 dark:text-gray-200 list-disc list-inside text-sm">
                                    {repairIssues.map((id: string) => (
                                        <li key={id}>{t(REPAIR_ISSUES.find(r => r.id === id)?.label || '')}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <button onClick={() => onEditStep(3)} className="text-bel-blue dark:text-blue-400 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700">
                            <PencilSquareIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Estimate Display in Sidebar */}
                {(isBuyback && buybackEstimate > 0) && (
                    <div className="mt-4 bg-gray-50 dark:bg-slate-700 p-3 rounded-xl">
                         <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-1">{t('Estimated Value')}</p>
                         <p className="text-2xl font-extrabold text-bel-dark dark:text-white text-center">
                            €{buybackEstimate}
                         </p>
                    </div>
                )}
                
                {/* For Repair, we show the estimate if it exists */}
                {(!isBuyback && repairIssues.length > 0) && (
                    <div className="mt-4 bg-gray-50 dark:bg-slate-700 p-3 rounded-xl">
                         <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-1">{t('Estimated Cost')}</p>
                         {repairIssues.includes('other') ? (
                            <p className="text-lg font-bold text-bel-dark dark:text-white text-center">{t('Diagnostic')}</p>
                         ) : (
                            <div className="text-center">
                                {repairEstimates.hasScreen ? (
                                     <p className="text-sm font-bold text-bel-dark dark:text-white">
                                        €{repairEstimates.standard} - €{repairEstimates.original}
                                     </p>
                                ) : (
                                     <p className="text-2xl font-extrabold text-bel-dark dark:text-white">
                                        €{repairEstimates.standard}
                                     </p>
                                )}
                            </div>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};

const BuybackRepair: React.FC<BuybackRepairProps> = ({ type }) => {
    const { selectedShop } = useShop();
    const { addQuote } = useData();
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const params = useParams();

    const [submitted, setSubmitted] = useState(false);
    
    const [step, setStep] = useState(1); 
    
    const [deviceType, setDeviceType] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    
    const [storage, setStorage] = useState('');
    const [turnsOn, setTurnsOn] = useState<boolean | null>(null);
    const [worksCorrectly, setWorksCorrectly] = useState<boolean | null>(null);
    const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
    const [batteryHealth, setBatteryHealth] = useState<string>('');
    const [screenState, setScreenState] = useState<'flawless' | 'scratches' | 'cracked'>('flawless');
    const [bodyState, setBodyState] = useState<'flawless' | 'scratches' | 'dents' | 'bent'>('flawless');
    
    // Multi-select for repair issues
    const [repairIssues, setRepairIssues] = useState<string[]>([]);
    const [deliveryMethod, setDeliveryMethod] = useState<'dropoff' | 'send'>('dropoff');
    
    // Track user choice for screen quality if applicable
    const [selectedScreenQuality, setSelectedScreenQuality] = useState<'generic' | 'original'>('original');

    // --- DEEP LINKING & INIT ---
    useEffect(() => {
        setDeviceType('');
        setSelectedBrand(''); 
        setSelectedModel(''); 
        setStep(1); 
        setStorage(''); 
        setRepairIssues([]);
        setSubmitted(false);

        const pDevice = params.device || searchParams.get('device');
        const pBrand = params.brand || searchParams.get('brand');
        const pModel = params.model || searchParams.get('model');

        if (pDevice && pBrand && pModel) {
            // Validate against catalog to avoid crashes
            if (DEVICE_CATALOG[pDevice]?.[pBrand]?.[pModel]) {
                setDeviceType(pDevice);
                setSelectedBrand(pBrand);
                setSelectedModel(pModel);
                // Jump to Step 3 (Issue Selection for Repair, Specs for Buyback)
                setStep(3); 
            }
        }
    }, [type, searchParams, params]);

    // --- HELPER: Single Issue Price Calculation ---
    // Used to show prices on the buttons in Step 3
    const getSingleIssuePrice = (issueId: string) => {
        if (!deviceType || !selectedBrand || !selectedModel) return null;
        const modelValue = DEVICE_CATALOG[deviceType]?.[selectedBrand]?.[selectedModel] || 200;
        const issueData = REPAIR_ISSUES.find(i => i.id === issueId);
        
        if (!issueData) return null;
        if (issueId === 'other') return null; // 'Diagnostic' has no fixed price

        let tierMultiplier = 1;
        if (modelValue > 800) tierMultiplier = 2.5;
        else if (modelValue > 400) tierMultiplier = 1.8;
        else if (modelValue > 200) tierMultiplier = 1.2;

        return Math.round(issueData.base * tierMultiplier);
    };

    const buybackEstimate = useMemo(() => {
        if (type !== 'buyback' || !selectedBrand || !selectedModel || !deviceType) return 0;
        const brandCatalog = DEVICE_CATALOG[deviceType]?.[selectedBrand];
        let price = brandCatalog?.[selectedModel] || 0;

        // Adjust for Storage
        if (storage === '256GB') price += 20;
        if (storage === '512GB') price += 50;
        if (storage === '1TB') price += 80;
        if (storage === '2TB') price += 120;

        // Adjust for Functional State
        if (turnsOn === false) price *= 0.10;
        else if (worksCorrectly === false) price *= 0.50; 
        
        if (isUnlocked === false) price *= 0.20;
        if (selectedBrand === 'Apple' && deviceType === 'smartphone' && batteryHealth === 'bad') price -= 40; 

        // Adjust for Cosmetic State
        if (screenState === 'scratches') price -= 30;
        if (screenState === 'cracked') price -= 100; 

        if (bodyState === 'scratches') price -= 20;
        if (bodyState === 'dents') price -= 50;
        if (bodyState === 'bent') price -= 80;
        
        // MARGIN ADJUSTMENT
        price = price * 0.45;

        return Math.max(0, Math.round(price));
    }, [type, deviceType, selectedBrand, selectedModel, storage, turnsOn, worksCorrectly, isUnlocked, batteryHealth, screenState, bodyState]);

    const repairEstimates = useMemo(() => {
        if (type !== 'repair' || !selectedModel || repairIssues.length === 0) return { standard: 0, original: 0, hasScreen: false };
        
        let standardTotal = 0;
        let originalTotal = 0;
        let hasScreen = false;

        repairIssues.forEach(issueId => {
            const basePrice = getSingleIssuePrice(issueId);
            if (basePrice !== null) {
                if (issueId === 'screen') {
                    hasScreen = true;
                    standardTotal += basePrice;
                    originalTotal += (basePrice * 1.6);
                } else {
                    standardTotal += basePrice;
                    originalTotal += basePrice; // Usually same price
                }
            }
        });

        return {
            standard: Math.round(standardTotal),
            original: Math.round(originalTotal),
            hasScreen
        };
    }, [type, deviceType, selectedBrand, selectedModel, repairIssues]);

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleEditStep = (stepNumber: number) => {
        setStep(stepNumber);
    };

    const handleDeliverySelection = (method: 'dropoff' | 'send') => {
        setDeliveryMethod(method);
        handleNext();
    };
    
    const toggleRepairIssue = (id: string) => {
        setRepairIssues(prev => {
            if (id === 'other') return ['other']; // If other is selected, clear others
            if (prev.includes('other')) return [id]; // If selecting something else, clear other
            
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        let issueDescription = '';
        if (type === 'buyback') {
            issueDescription = `Action: SELL. Method: ${deliveryMethod}. Estimate: €${buybackEstimate}. Storage: ${storage}. Condition: ${screenState}/${bodyState}.`;
        } else {
            const issueLabels = repairIssues.map(id => REPAIR_ISSUES.find(r => r.id === id)?.label).join(', ');
            let estimateString = '';
            
            if (repairIssues.includes('other')) {
                estimateString = 'Pending Diagnostic';
            } else if (repairEstimates.hasScreen) {
                estimateString = `€${selectedScreenQuality === 'original' ? repairEstimates.original : repairEstimates.standard} (${selectedScreenQuality === 'original' ? 'Original Screen' : 'Compatible Screen'})`;
            } else {
                estimateString = `€${repairEstimates.standard}`;
            }

            issueDescription = `Action: REPAIR. Method: ${deliveryMethod}. Issues: ${issueLabels}. Estimate: ${estimateString}.`;
        }

        const customerName = formData.get('name') as string;
        const customerEmail = formData.get('email') as string;
        const customerPhone = formData.get('phone') as string;

        const quoteData: Omit<Quote, 'id' | 'date' | 'status'> = {
            type: type,
            deviceType: deviceType,
            brand: selectedBrand,
            model: selectedModel,
            condition: type === 'buyback' ? `${screenState}/${bodyState}` : 'N/A',
            issue: issueDescription,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            shopId: selectedShop?.id || 1,
        };
        addQuote(quoteData);

        // NOTE: Removed mailto call to improve UX. The data is safely stored in the Admin Context.
        setSubmitted(true);
    };

    const StepHeader = ({ title }: { title: string }) => (
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
    );

    const NavigationButtons = ({ onNext, nextDisabled, nextLabel }: any) => (
        <div className="flex justify-between pt-8 mt-auto sticky bottom-0 bg-white dark:bg-slate-800 pb-4 border-t border-gray-100 dark:border-slate-700 md:static md:border-none md:pb-0 transition-colors duration-300">
            <button onClick={handleBack} className="flex items-center text-gray-500 dark:text-gray-400 font-semibold px-4 py-3 hover:text-bel-dark dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                <ArrowLeftIcon className="h-4 w-4 mr-2"/> {t('Back')}
            </button>
            <button 
                disabled={nextDisabled}
                onClick={onNext}
                className="bg-bel-blue text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50 disabled:shadow-none active:scale-95 dark:disabled:bg-slate-600"
            >
                {nextLabel || t('Next')}
            </button>
        </div>
    );

    // STEP 1: Device Type
    const renderDeviceType = () => (
        <div className="animate-fade-in h-full flex flex-col">
            <StepHeader title={type === 'buyback' ? t('buyback_step1_title') : t('repair_step1_title')} />
            <div className="grid grid-cols-2 gap-3 md:gap-4">
                {DEVICE_TYPES.map((dt) => (
                    <button
                        key={dt.id}
                        onClick={() => { setDeviceType(dt.id); handleNext(); }}
                        className={`flex flex-col items-center justify-center p-6 border rounded-2xl transition-all active:scale-95 ${
                            deviceType === dt.id 
                                ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/30 text-bel-blue dark:text-blue-300 ring-2 ring-bel-blue/20' 
                                : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <dt.icon className="h-10 w-10 mb-3" />
                        <span className="font-semibold text-sm md:text-base">{t(dt.label)}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    // STEP 2: Brand & Model
    const renderBrandModel = () => {
        const brands = Object.keys(DEVICE_CATALOG[deviceType] || {});
        return (
            <div className="animate-fade-in h-full flex flex-col">
                <StepHeader title={t('step2_title')} />
                
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">{t('Brand')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {brands.map(brand => (
                            <button
                                key={brand}
                                onClick={() => { setSelectedBrand(brand); setSelectedModel(''); }}
                                className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all active:scale-95 ${
                                    selectedBrand === brand 
                                        ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/30 text-bel-blue dark:text-blue-300 ring-2 ring-bel-blue/20' 
                                        : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {brand}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedBrand && (
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">{t('Model')}</label>
                        <div className="relative">
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="block w-full pl-4 pr-10 py-4 text-base border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-bel-blue focus:border-bel-blue rounded-xl border bg-white dark:bg-slate-700 dark:text-white shadow-sm"
                            >
                                <option value="">Select a model...</option>
                                {Object.keys(DEVICE_CATALOG[deviceType][selectedBrand] || {}).map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
                <NavigationButtons onNext={handleNext} nextDisabled={!selectedBrand || !selectedModel} />
            </div>
        );
    };

    // STEP 3 (Repair): Issue Selection (MULTI-SELECT)
    const renderRepairIssues = () => {
        const applicableIssues = DEVICE_TYPES.find(dt => dt.id === deviceType)?.applicableIssues || [];
        const issuesToShow = REPAIR_ISSUES.filter(issue => applicableIssues.includes(issue.id));

        return (
            <div className="animate-fade-in h-full flex flex-col">
                <StepHeader title={t('step3_repair_title')} />
                {selectedModel && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center text-bel-blue dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        <span className="text-sm font-bold">{t('Showing prices for')} {selectedBrand} {selectedModel}</span>
                    </div>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("Select all that apply")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {issuesToShow.map((issue) => {
                        const isSelected = repairIssues.includes(issue.id);
                        const price = getSingleIssuePrice(issue.id);

                        return (
                            <button
                                key={issue.id}
                                onClick={() => toggleRepairIssue(issue.id)}
                                className={`flex items-center p-4 border rounded-xl transition-all text-left active:scale-[0.98] ${
                                    isSelected 
                                        ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/30 ring-1 ring-bel-blue' 
                                        : 'border-gray-200 dark:border-slate-600 hover:border-bel-blue/50 hover:bg-gray-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                <div className={`p-3 rounded-full mr-4 flex-shrink-0 ${isSelected ? 'bg-bel-blue text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                                    <issue.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center">
                                        <div className={`font-bold ${isSelected ? 'text-bel-blue dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>{t(issue.label)}</div>
                                        {price && (
                                            <div className="text-sm font-extrabold text-bel-blue dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded ml-2">
                                                €{price}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{t(issue.desc)}</div>
                                </div>
                                {isSelected && <CheckCircleIcon className="h-6 w-6 text-bel-blue dark:text-blue-400 ml-2" />}
                            </button>
                        );
                    })}
                </div>
                <NavigationButtons onNext={handleNext} nextDisabled={repairIssues.length === 0} nextLabel={repairIssues.includes('other') ? t("Next") : t("Get Price")} />
            </div>
        );
    };

    // STEP 4 (Repair): Estimate (DUAL PRICE FOR SCREENS)
    const renderRepairEstimate = () => {
        if (repairIssues.includes('other')) {
            return (
                <div className="space-y-6 animate-fade-in text-center h-full flex flex-col justify-center">
                     <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-8 shadow-xl dark:shadow-none relative overflow-hidden">
                         <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MagnifyingGlassIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('Diagnostic Required')}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                            {t("Since the issue isn't listed, we need to examine your device to give an accurate price.")}
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-bel-blue dark:text-blue-300 font-medium text-sm border border-blue-100 dark:border-blue-800">
                            {t("Please visit one of our shops or continue to book an appointment for a free check-up.")}
                        </div>
                    </div>
                    <NavigationButtons onNext={handleNext} nextLabel={t("Book Appointment")} />
                </div>
            );
        }

        return (
            <div className="space-y-4 animate-fade-in h-full flex flex-col">
                <StepHeader title={t('Your Estimate')} />
                
                {/* Device Info Banner */}
                <div className="bg-gray-100 dark:bg-slate-800 rounded-xl p-4 flex items-center mb-2">
                     <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mr-4 text-2xl shadow-sm">📱</div>
                     <div>
                         <h3 className="font-bold text-gray-900 dark:text-white">{selectedBrand} {selectedModel}</h3>
                         <p className="text-xs text-gray-500 dark:text-gray-400">
                             Issues: {repairIssues.map(id => t(REPAIR_ISSUES.find(r => r.id === id)?.label || '')).join(', ')}
                         </p>
                     </div>
                </div>

                {repairEstimates.hasScreen ? (
                    <div className="grid grid-cols-1 gap-4">
                        {/* Option 1: Compatible */}
                        <button 
                            onClick={() => setSelectedScreenQuality('generic')}
                            className={`relative p-6 rounded-2xl border-2 transition-all text-left flex flex-col ${
                                selectedScreenQuality === 'generic' 
                                    ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-80 hover:opacity-100'
                            }`}
                        >
                            <div className="flex justify-between items-start w-full mb-2">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">Compatible Screen</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">High quality 3rd party display.</p>
                                </div>
                                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">€{repairEstimates.standard}</span>
                            </div>
                            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                                <li>Standard brightness</li>
                                <li>6 Month Warranty</li>
                            </ul>
                            {selectedScreenQuality === 'generic' && (
                                <div className="absolute -top-3 -right-3 bg-bel-blue text-white p-1 rounded-full shadow-sm">
                                    <CheckCircleIcon className="h-5 w-5" />
                                </div>
                            )}
                        </button>

                        {/* Option 2: Original */}
                        <button 
                            onClick={() => setSelectedScreenQuality('original')}
                            className={`relative p-6 rounded-2xl border-2 transition-all text-left flex flex-col ${
                                selectedScreenQuality === 'original' 
                                    ? 'border-bel-yellow bg-yellow-50 dark:bg-yellow-900/20 shadow-md' 
                                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-80 hover:opacity-100'
                            }`}
                        >
                             {/* Recommended Badge */}
                             <div className="absolute -top-3 left-6 bg-gradient-to-r from-bel-yellow to-orange-400 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide flex items-center">
                                 <SparklesIcon className="h-3 w-3 mr-1" /> Recommended
                             </div>

                            <div className="flex justify-between items-start w-full mb-2 mt-2">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">Original Quality</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">OEM specification display.</p>
                                </div>
                                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">€{repairEstimates.original}</span>
                            </div>
                            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                                <li>Original Colors & Brightness</li>
                                <li>Reinforced Glass</li>
                                <li>1 Year Warranty</li>
                            </ul>
                            {selectedScreenQuality === 'original' && (
                                <div className="absolute -top-3 -right-3 bg-bel-yellow text-white p-1 rounded-full shadow-sm">
                                    <CheckCircleIcon className="h-5 w-5" />
                                </div>
                            )}
                        </button>
                        
                        <p className="text-xs text-center text-gray-400 mt-2">
                            *Price includes cost for all selected issues (Screen + {repairIssues.length > 1 ? 'others' : 'labor'})
                        </p>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col justify-center">
                        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-8 shadow-xl dark:shadow-none relative overflow-hidden text-center">
                            <div className="absolute top-0 left-0 w-full h-2 bg-bel-blue"></div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">{t('Total Estimated Cost')}</p>
                            <div className="flex items-center justify-center text-6xl font-extrabold text-bel-dark dark:text-white mb-4">
                                <span className="text-bel-blue dark:text-blue-400">€</span>{repairEstimates.standard}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Includes labor and premium parts for: <br/>
                                {repairIssues.map(id => t(REPAIR_ISSUES.find(r => r.id === id)?.label || '')).join(', ')}
                            </p>
                        </div>
                    </div>
                )}

                <NavigationButtons onNext={handleNext} nextLabel={t("Start Repair")} />
            </div>
        );
    };

    // STEP 3 (Buyback): Specs
    const renderBuybackSpecs = () => (
        <div className="animate-fade-in h-full flex flex-col">
            <StepHeader title={t('step3_buyback_title')} />
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase">{t('Capacity / Size')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(DEVICE_SPECS[selectedModel] || ['Standard']).map(opt => (
                            <button
                                key={opt}
                                onClick={() => setStorage(opt)}
                                className={`py-3 px-2 rounded-xl border font-bold transition-all text-sm active:scale-95 ${
                                    storage === opt 
                                        ? 'bg-bel-blue text-white border-bel-blue shadow-md' 
                                        : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedBrand === 'Apple' && deviceType === 'smartphone' && (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase">{t('Battery Health')}</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setBatteryHealth('good')} className={`p-4 border rounded-xl text-center transition-all active:scale-95 ${batteryHealth === 'good' ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/30 text-bel-blue dark:text-blue-300' : 'border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-300'}`}>
                                <span className="block font-bold text-lg">&gt; 80%</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Good</span>
                            </button>
                            <button onClick={() => setBatteryHealth('bad')} className={`p-4 border rounded-xl text-center transition-all active:scale-95 ${batteryHealth === 'bad' ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/30 text-bel-blue dark:text-blue-300' : 'border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-300'}`}>
                                <span className="block font-bold text-lg text-red-500">&lt; 80%</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Service</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <NavigationButtons onNext={handleNext} nextDisabled={!storage || (selectedBrand === 'Apple' && deviceType === 'smartphone' && !batteryHealth)} />
        </div>
    );

    // STEP 4 (Buyback): Functional
    const renderBuybackFunctional = () => (
        <div className="animate-fade-in h-full flex flex-col">
            <StepHeader title={t('step4_buyback_title')} />
            <div className="space-y-4">
                {[
                    { q: t("Power On?"), state: turnsOn, setter: setTurnsOn },
                    { q: t("Fully Functional?"), state: worksCorrectly, setter: setWorksCorrectly },
                    { q: t("Unlocked?"), state: isUnlocked, setter: setIsUnlocked }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                        <span className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">{item.q}</span>
                        <div className="flex gap-2">
                            <button onClick={() => item.setter(true)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${item.state === true ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>{t('Yes')}</button>
                            <button onClick={() => item.setter(false)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${item.state === false ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>{t('No')}</button>
                        </div>
                    </div>
                ))}
            </div>
            <NavigationButtons onNext={handleNext} nextDisabled={turnsOn === null || worksCorrectly === null || isUnlocked === null} />
        </div>
    );

    // STEP 5 (Buyback): Cosmetic
    const renderBuybackCosmetic = () => (
        <div className="animate-fade-in h-full flex flex-col">
            <StepHeader title={t('step5_buyback_title')} />
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase">{t('Screen')}</label>
                    <div className="flex flex-col gap-2">
                        {[{ id: 'flawless', label: t('Perfect') }, { id: 'scratches', label: t('Scratched') }, { id: 'cracked', label: t('Broken') }].map((opt) => (
                            <button key={opt.id} onClick={() => setScreenState(opt.id as any)} className={`p-3 rounded-xl border text-left font-medium transition-all flex justify-between items-center ${screenState === opt.id ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/30 text-bel-blue dark:text-blue-300' : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-gray-300'}`}>
                                {opt.label}
                                {screenState === opt.id && <CheckCircleIcon className="h-5 w-5" />}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase">{t('Body')}</label>
                    <div className="flex flex-col gap-2">
                        {[{ id: 'flawless', label: t('Perfect') }, { id: 'scratches', label: t('Scratched') }, { id: 'dents', label: t('Dents') }, { id: 'bent', label: t('Bent') }].map((opt) => (
                            <button key={opt.id} onClick={() => setBodyState(opt.id as any)} className={`p-3 rounded-xl border text-left font-medium transition-all flex justify-between items-center ${bodyState === opt.id ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/30 text-bel-blue dark:text-blue-300' : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-gray-300'}`}>
                                {opt.label}
                                {bodyState === opt.id && <CheckCircleIcon className="h-5 w-5" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
             <NavigationButtons onNext={handleNext} nextLabel={t("Get Price")} />
        </div>
    );

    // STEP 6 (Buyback): Estimate
    const renderBuybackEstimate = () => (
        <div className="animate-fade-in h-full flex flex-col justify-center text-center">
            <div className="bg-gradient-to-br from-bel-blue to-blue-800 rounded-3xl p-8 text-white shadow-2xl mb-6">
                <p className="text-blue-200 font-bold uppercase tracking-widest text-xs mb-4">{t('Your Device Value')}</p>
                <div className="text-6xl font-extrabold mb-2 flex items-center justify-center">
                    <span className="opacity-50 mr-1">€</span>{buybackEstimate}
                </div>
                <p className="text-sm text-blue-100 opacity-80">{t('Paid instantly via bank transfer')}</p>
            </div>
             <NavigationButtons onNext={handleNext} nextLabel={t("Accept & Recycle")} />
        </div>
    );

    // SHARED: Delivery
    const renderDeliverySelection = () => (
        <div className="animate-fade-in h-full flex flex-col">
             <StepHeader title={t('delivery_title')} />
            <div className="grid grid-cols-1 gap-4 mb-6">
                <button 
                    onClick={() => handleDeliverySelection('dropoff')}
                    className="group flex items-center p-5 border-2 rounded-2xl transition-all active:scale-[0.98] hover:border-bel-blue dark:hover:border-blue-500 bg-white dark:bg-slate-800 dark:border-slate-700"
                >
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full mr-5 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-bel-blue dark:group-hover:text-blue-400 transition-colors">
                        <BuildingStorefrontIcon className="h-8 w-8" />
                    </div>
                    <div className="text-left">
                        <span className="block font-bold text-lg text-gray-900 dark:text-white">{t('Visit Store')}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('Immediate service in person')}</span>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 ml-auto text-gray-300 dark:text-gray-600 group-hover:text-bel-blue dark:group-hover:text-blue-400" />
                </button>

                <button 
                    onClick={() => handleDeliverySelection('send')}
                    className="group flex items-center p-5 border-2 rounded-2xl transition-all active:scale-[0.98] hover:border-bel-blue dark:hover:border-blue-500 bg-white dark:bg-slate-800 dark:border-slate-700"
                >
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mr-5">
                        <TruckIcon className="h-8 w-8" />
                    </div>
                    <div className="text-left">
                        <span className="block font-bold text-lg text-gray-900 dark:text-white">{t('Send by Mail')}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('Free shipping label provided')}</span>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 ml-auto text-gray-300 dark:text-gray-600 group-hover:text-bel-blue dark:group-hover:text-blue-400" />
                </button>
            </div>
            <div className="mt-auto">
                 <button onClick={handleBack} className="w-full py-4 text-gray-500 dark:text-gray-400 font-semibold hover:text-bel-dark dark:hover:text-white">{t('Back to Estimate')}</button>
            </div>
        </div>
    );

    // SHARED: Final Form
    const renderFinalForm = () => (
        <div className="animate-fade-in h-full flex flex-col">
            <StepHeader title={t('final_details_title')} />
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                    <input type="text" name="name" placeholder={t("Full Name")} required className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-bel-blue focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400" />
                    <input type="email" name="email" placeholder={t("Email")} required className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-bel-blue focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400" />
                    <input type="tel" name="phone" placeholder={t("Phone Number")} required className="w-full px-4 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-bel-blue focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400" />
                    
                    {deliveryMethod === 'send' && (
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-600 space-y-3">
                             <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t('Shipping Address')}</p>
                             <input type="text" name="address" placeholder={t("Street Address")} required className="w-full px-3 py-2 border dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" />
                             <div className="flex gap-2">
                                 <input type="text" name="zip" placeholder={t("ZIP")} required className="w-1/3 px-3 py-2 border dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" />
                                 <input type="text" name="city" placeholder={t("City")} required className="w-2/3 px-3 py-2 border dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" />
                             </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                    {deliveryMethod === 'dropoff' && !selectedShop && (
                        <p className="text-center text-red-500 text-sm font-bold mb-2">{t('Please select a shop in the menu!')}</p>
                    )}
                    <button type="submit" disabled={deliveryMethod === 'dropoff' && !selectedShop} className="w-full bg-bel-blue text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:shadow-none transition-all">
                        {deliveryMethod === 'dropoff' ? t('Confirm Appointment') : t('Get Shipping Label')}
                    </button>
                    <button type="button" onClick={handleBack} className="w-full py-3 text-gray-500 dark:text-gray-400 text-sm mt-2">{t('Cancel')}</button>
                </div>
            </form>
        </div>
    );

    if (submitted) return <SuccessMessage type={type} shopName={selectedShop?.name} t={t} />;

    const totalSteps = type === 'buyback' ? 8 : 6;

    const renderStepContent = () => {
        if (step === 1) return renderDeviceType();
        if (step === 2) return renderBrandModel();

        if (type === 'buyback') {
            if (step === 3) return renderBuybackSpecs();
            if (step === 4) return renderBuybackFunctional();
            if (step === 5) return renderBuybackCosmetic();
            if (step === 6) return renderBuybackEstimate();
            if (step === 7) return renderDeliverySelection();
            if (step === 8) return renderFinalForm();
        } else {
            if (step === 3) return renderRepairIssues();
            if (step === 4) return renderRepairEstimate();
            if (step === 5) return renderDeliverySelection();
            if (step === 6) return renderFinalForm();
        }
    };

    const pageTitle = selectedModel 
        ? t(type === 'repair' ? 'meta_repair_model_title' : 'meta_buyback_model_title', selectedModel)
        : t(type === 'repair' ? 'meta_repair_title' : 'meta_buyback_title');

    const pageDesc = selectedModel
        ? t(type === 'repair' ? 'meta_repair_model_desc' : 'meta_buyback_model_desc', selectedModel)
        : t(type === 'repair' ? 'meta_repair_desc' : 'meta_buyback_desc');

    // GENERATE SERVICE SCHEMA FOR SEO
    const generateServiceSchema = () => {
        if (!selectedModel) return null;
        
        let schema = null;

        if (type === 'repair') {
            const priceLow = repairEstimates.standard;
            const priceHigh = repairEstimates.original || repairEstimates.standard;

            schema = {
                "@context": "https://schema.org",
                "@type": "Service",
                "name": `${selectedModel} Repair`,
                "description": `Professional repair service for ${selectedModel} in Brussels. Screen replacement, battery, and more.`,
                "provider": {
                    "@type": "LocalBusiness",
                    "name": "Belmobile",
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": "Brussels",
                        "addressCountry": "BE"
                    }
                },
                "areaServed": "Brussels",
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "EUR",
                    "price": priceLow,
                    "priceSpecification": {
                        "@type": "PriceSpecification",
                        "minPrice": priceLow,
                        "maxPrice": priceHigh,
                        "priceCurrency": "EUR"
                    }
                }
            };
        } else if (type === 'buyback') {
             schema = {
                "@context": "https://schema.org",
                "@type": "Service", 
                "name": `Sell Your ${selectedModel}`,
                "description": `Get instant cash for your used ${selectedModel} at Belmobile Brussels. Best trade-in rates guaranteed.`,
                "provider": {
                    "@type": "LocalBusiness",
                    "name": "Belmobile",
                    "image": "https://belmobile.be/logo.png"
                },
                "areaServed": "Brussels",
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "EUR",
                    "price": buybackEstimate,
                    "description": "Estimated trade-in value. Final price depends on condition."
                }
            };
        }
        
        return schema ? <script type="application/ld+json">{JSON.stringify(schema)}</script> : null;
    };

    const handleStartOver = () => {
        setDeviceType('');
        setSelectedBrand('');
        setSelectedModel('');
        setStep(1);
        setStorage('');
        setRepairIssues([]);
        setSubmitted(false);
    };

    const breadcrumbSteps =
        type === 'buyback'
            ? [
                  { name: t('Device'), step: 1 },
                  { name: t('Model'), step: 2 },
                  { name: t('Specs'), step: 3 },
                  { name: t('Functional'), step: 4 },
                  { name: t('Cosmetic'), step: 5 },
                  { name: t('Estimate'), step: 6 },
                  { name: t('Delivery'), step: 7 },
                  { name: t('Finalize'), step: 8 },
              ]
            : [
                  { name: t('Device'), step: 1 },
                  { name: t('Model'), step: 2 },
                  { name: t('Issue'), step: 3 },
                  { name: t('Estimate'), step: 4 },
                  { name: t('Delivery'), step: 5 },
                  { name: t('Finalize'), step: 6 },
              ];

    return (
        <div className="bg-gray-50 dark:bg-slate-900 min-h-screen flex flex-col transition-colors duration-300">
            <MetaTags title={pageTitle} description={pageDesc} />
            {generateServiceSchema()}
            
            <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-4">
                    <CalculatorBreadcrumbs
                        steps={breadcrumbSteps}
                        currentStep={step}
                        onStepClick={handleEditStep}
                    />
                    <button onClick={handleStartOver} className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        {t('Start Over')}
                    </button>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Main Form Area */}
                    <div className="flex-1 order-2 lg:order-1">
                         {/* Mobile Progress Bar Sticky */}
                        <div className="sticky top-16 sm:top-0 z-20 bg-gray-50 dark:bg-slate-900 pt-2 pb-4 transition-colors duration-300 mb-2">
                             <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                                 <span>Progress</span>
                                 <span>{Math.round((step/totalSteps)*100)}%</span>
                             </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-bel-blue h-full rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 sm:rounded-3xl shadow-none sm:shadow-xl border-y sm:border border-gray-100 dark:border-slate-700 min-h-[600px] flex flex-col p-6 sm:p-10 relative transition-colors duration-300">
                            {renderStepContent()}
                        </div>

                        {/* Programmatic Content Injection */}
                        {selectedModel && (
                            <SEOBottomContent brand={selectedBrand} model={selectedModel} type={type} t={t} />
                        )}
                    </div>

                    {/* Summary Sidebar - Hidden on step 1 */}
                    {step > 1 && (
                        <div className="w-full lg:w-80 order-1 lg:order-2">
                             <SelectionSummary 
                                type={type}
                                step={step}
                                deviceType={deviceType}
                                selectedBrand={selectedBrand}
                                selectedModel={selectedModel}
                                storage={storage}
                                repairIssues={repairIssues}
                                buybackEstimate={buybackEstimate}
                                repairEstimates={repairEstimates}
                                onEditStep={handleEditStep}
                                t={t}
                             />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SuccessMessage = ({ type, shopName, t }: any) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl text-center max-w-md w-full border border-gray-100 dark:border-slate-700">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">{t('All Set!')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {t("Your request has been successfully processed. We've sent the details to your email.")}
            </p>
             <a href="/" className="block w-full py-4 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600">{t('Return Home')}</a>
        </div>
    </div>
);

export default BuybackRepair;
