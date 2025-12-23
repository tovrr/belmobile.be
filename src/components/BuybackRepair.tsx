'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useShop } from '../hooks/useShop';
import Input from './ui/Input';
import Button from './ui/Button';
import Select from './ui/Select';
import { getRepairProfileForModel } from '../config/repair-profiles';
import { useData } from '../hooks/useData';
import { db, storage as firebaseStorage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { jsPDF } from 'jspdf';

import { usePublicPricing } from '../hooks/usePublicPricing';
import { useLanguage } from '../hooks/useLanguage';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import {
    CheckCircleIcon,
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    DevicePhoneMobileIcon,
    BuildingStorefrontIcon,
    TruckIcon,
    XMarkIcon,
    CloudArrowUpIcon,
    DocumentIcon,
    TrashIcon,
    ShieldCheckIcon,
    BanknotesIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { DEVICE_TYPES, REPAIR_ISSUES } from '../constants';
import { DEVICE_BRANDS } from '../data/brands';
import { createSlug } from '../utils/slugs';
// import SEO from '../components/SEO'; // SEO handled by page metadata

import { getDeviceImage } from '../data/deviceImages';
import { SEARCH_INDEX } from '../data/search-index';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface BuybackRepairProps {
    type: 'buyback' | 'repair';
    initialShop?: string;
    initialCategory?: string;
    initialDevice?: {
        brand: string;
        model: string;
    };
    hideStep1Title?: boolean;
}

// --- ANIMATION WRAPPER ---
const StepWrapper = ({ children, stepKey }: { children: React.ReactNode, stepKey: number }) => {
    // Critical LCP Fix: Don't animate opacity for the first step on mount.
    // This allows SSR content to be visible immediately.
    const isFirstStep = stepKey === 1;
    return (
        <motion.div
            key={stepKey}
            initial={isFirstStep ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
};

const BuybackRepair: React.FC<BuybackRepairProps> = ({ type, initialShop, initialCategory, initialDevice, hideStep1Title }) => {
    const { selectedShop, setSelectedShop } = useShop();
    const { shops, sendEmail } = useData();
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();

    const router = useRouter();
    const params = useParams();

    // Ensure lang is defined
    const lang = language || params.lang || 'fr';

    // State
    const [step, setStep] = useState(() => {
        const isGenericModel = initialDevice?.model && ['iphone', 'ipad', 'galaxy', 'pixels', 'switch'].includes(initialDevice.model.toLowerCase());
        if (initialDevice?.model && !isGenericModel) return 3;
        if (initialDevice?.brand) return 2;
        if (initialCategory) return 2;
        return 1;
    });
    // Transition State
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [deviceType, setDeviceType] = useState<string>(initialCategory || '');
    const [selectedBrand, setSelectedBrand] = useState<string>(initialDevice?.brand || '');
    const [selectedModel, setSelectedModel] = useState<string>(initialDevice?.model || '');
    const [storage, setStorage] = useState<string>('');

    // Condition State
    const [turnsOn, setTurnsOn] = useState<boolean | null>(null);
    const [worksCorrectly, setWorksCorrectly] = useState<boolean | null>(null);
    const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
    const [batteryHealth, setBatteryHealth] = useState<string>('');
    const [faceIdWorking, setFaceIdWorking] = useState<boolean | null>(null);
    const [screenState, setScreenState] = useState<'flawless' | 'scratches' | 'cracked'>('flawless');
    const [bodyState, setBodyState] = useState<'flawless' | 'scratches' | 'dents' | 'bent'>('flawless');

    const [repairIssues, setRepairIssues] = useState<string[]>([]);
    const [deliveryMethod, setDeliveryMethod] = useState<'dropoff' | 'send'>('dropoff');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [iban, setIban] = useState('');
    const [honeypot, setHoneypot] = useState('');
    const [idFile, setIdFile] = useState<File | null>(null);

    const [selectedScreenQuality, setSelectedScreenQuality] = useState<'generic' | 'oled' | 'original' | ''>('');
    const [shopSelectionError, setShopSelectionError] = useState(false);

    // Dynamic Pricing Hook
    const { repairPrices: dynamicRepairPrices, buybackPrices: dynamicBuybackPrices, deviceImage: dynamicImage, loading: pricesLoading } = usePublicPricing(selectedModel ? createSlug(`${selectedBrand} ${selectedModel}`) : '');
    // Contact Form State
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerCity, setCustomerCity] = useState('');
    const [customerZip, setCustomerZip] = useState('');

    // Submission State
    const [submitted, setSubmitted] = useState(false);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<{ brand: string; model: string; category: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isShopListOpen, setIsShopListOpen] = useState(false);
    const [submittedOrder, setSubmittedOrder] = useState<{ id: string, data: Record<string, unknown> } | null>(null);

    // Service Point State
    const [servicePoint, setServicePoint] = useState<{ name: string; street: string; house_number: string; postal_code: string; city: string;[key: string]: unknown } | null>(null);

    // URL Params State
    // URL Params State


    // Refs
    const modelSelectRef = useRef<HTMLDivElement>(null);

    // SendCloud Script
    // SendCloud Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://embed.sendcloud.sc/spp/1.0.0/api.min.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Normalize Selected Model from Slug to Display Name
    // This ensures consistency between URL slugs (e.g. 'galaxy-s22') and Select options ('Galaxy S22')
    useEffect(() => {
        if (!selectedModel || !deviceType) return;

        const normalizeModel = async () => {
            if (!selectedBrand) return;
            try {
                // Use SEARCH_INDEX to map Slug -> Model Name
                const searchItem = SEARCH_INDEX[createSlug(`${selectedBrand} ${selectedModel}`)];
                if (searchItem && searchItem.model && searchItem.model !== selectedModel) {
                    setSelectedModel(searchItem.model);
                }
            } catch (e) {
                console.error("Error normalizing model", e);
            }
        };

        normalizeModel();
    }, [selectedModel, selectedBrand, deviceType]);



    // Handle initialShop prop - only set if shop is OPEN
    useEffect(() => {
        if (initialShop && setSelectedShop && shops.length > 0) {
            const shop = shops.find(s => createSlug(s.name) === initialShop || s.id === initialShop);
            // Only set the shop if it exists AND has status 'open' (not coming_soon)
            if (shop && shop.status === 'open') {
                setSelectedShop(shop);
            }
        }
    }, [initialShop, setSelectedShop, shops]);

    // Handle initialCategory prop
    useEffect(() => {
        const pCategory = searchParams.get('category');
        // Only verify/set initialCategory if URL doesn't forbid it or override it
        if (initialCategory && !pCategory) {
            setDeviceType(initialCategory);
        }
    }, [initialCategory, searchParams]);

    // Handle initialDevice prop
    useEffect(() => {
        // Only run this on mount or if we explicitly want to sync from props, 
        // but avoid overriding if user has navigated (which we track via local state changes usually)
        // So we can just rely on searchParams or the 'params' object from next/navigation.
        // But the component uses 'searchParams.get' for brand/model in the existing code.
        // We need to adapt this to support the new route structure /lang/service/brand/model

        // Let's check if we have route params from the new dynamic route structure
        // The 'params' object from useParams() should contain the slug array if we are in [...slug].
        // But this component is used inside the page.



        // Sync deviceType with category param if present
        const pCategory = searchParams.get('category');
        if (pCategory && pCategory !== deviceType) {
            setDeviceType(pCategory);
        }

    }, [searchParams, initialDevice, deviceType]);

    const openServicePointPicker = () => {
        // @ts-expect-error -- External script not typed
        if (window.sendcloud) {
            // @ts-expect-error -- External script not typed
            window.sendcloud.servicePoints.open(
                {
                    apiKey: process.env.NEXT_PUBLIC_SENDCLOUD_API_KEY,
                    country: 'be',
                    language: 'en-us',
                    carriers: ['bpost'],
                },
                (servicePointObject: { name: string; street: string; house_number: string; postal_code: string; city: string;[key: string]: unknown }) => {
                    console.log('Selected service point:', servicePointObject);
                    setServicePoint(servicePointObject);
                    // Update address fields with service point data
                    setCustomerAddress(servicePointObject.street + ' ' + servicePointObject.house_number);
                    setCustomerCity(servicePointObject.city);
                    setCustomerZip(servicePointObject.postal_code);
                },
                (errors: unknown) => {
                    console.error('Service Point Picker errors:', errors);
                }
            );
        } else {
            console.error('SendCloud script not loaded');
        }
    };

    const downloadLabel = async (labelUrl: string) => {
        try {
            const response = await fetch(`/api/shipping/download-label?url=${encodeURIComponent(labelUrl)}`, {
                headers: {
                    'X-Admin-Token': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
                }
            });
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `shipping-label-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error downloading label:', err);
            alert('Failed to download shipping label. Please try again.');
        }
    };

    // Dynamic Data State
    const [modelsData, setModelsData] = useState<Record<string, Record<string, number>>>({});
    const [specsData, setSpecsData] = useState<Record<string, string[]>>({});
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Helper to get localized type slug
    const getLocalizedTypeSlug = (currentType: 'buyback' | 'repair') => {
        if (currentType === 'repair') {
            if (lang === 'fr') return 'reparation';
            if (lang === 'nl') return 'reparatie';
            return 'repair';
        } else {
            if (lang === 'fr') return 'rachat';
            if (lang === 'nl') return 'inkoop';
            return 'buyback';
        }
    };

    const typeSlug = getLocalizedTypeSlug(type);

    // --- DEEP LINKING & INIT ---
    useEffect(() => {
        const pBrand = searchParams.get('brand');
        const pModel = searchParams.get('model');
        const pCategory = searchParams.get('category');

        if (pBrand) {
            const brandSlug = createSlug(pBrand);
            const query = pCategory ? `?category=${pCategory}` : '';

            if (pModel) {
                const modelSlug = createSlug(pModel);
                router.replace(`/${lang}/${typeSlug}/${brandSlug}/${modelSlug}${query}`);
            } else {
                router.replace(`/${lang}/${typeSlug}/${brandSlug}${query}`);
            }
        }
    }, [searchParams, lang, typeSlug, router]);



    // --- DYNAMIC DATA LOADING ---
    const loadedBrandRef = useRef<string | null>(null);

    const loadBrandData = useCallback(async (brandSlug: string) => {
        // Prevent infinite loops / redundant fetches
        if (loadedBrandRef.current === brandSlug) return;

        loadedBrandRef.current = brandSlug;
        setIsLoadingData(true);

        try {
            const brandModule = await import(`../data/models/${brandSlug}`);

            if (brandModule && brandModule.MODELS) {
                setModelsData(brandModule.MODELS);
                setSpecsData(brandModule.SPECS || {});
            } else {
                console.warn(`Module for ${brandSlug} is missing MODELS export`);
                setModelsData({});
                setSpecsData({});
            }
        } catch (error) {
            console.error(`Failed to load data for ${brandSlug}:`, error);
            loadedBrandRef.current = null;
            setModelsData({});
            setSpecsData({});
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    // Trigger data loading when selectedBrand changes
    useEffect(() => {
        if (selectedBrand) {
            loadBrandData(createSlug(selectedBrand));
            if (!selectedModel && step === 1) {
                setStep(2);
            }
        }
    }, [selectedBrand, deviceType, step, selectedModel, loadBrandData]);

    // --- LOCAL STORAGE PERSISTENCE ---
    useEffect(() => {
        if (isInitialized && selectedBrand && selectedModel) {
            const key = `buyback_state_${createSlug(selectedBrand)}_${createSlug(selectedModel)}`;
            const stateToSave = {
                step, storage, turnsOn, worksCorrectly, isUnlocked, batteryHealth,
                faceIdWorking, screenState, bodyState, repairIssues, deliveryMethod,
                iban, termsAccepted, selectedScreenQuality, customerName, customerEmail,
                customerPhone, customerAddress, customerCity, customerZip, timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(stateToSave));
        }
    }, [
        selectedBrand, selectedModel, step, storage, turnsOn, worksCorrectly, isUnlocked,
        batteryHealth, faceIdWorking, screenState, bodyState, repairIssues,
        deliveryMethod, iban, termsAccepted, selectedScreenQuality, isInitialized,
        customerName, customerEmail, customerPhone, customerAddress, customerCity, customerZip
    ]);

    // Handle Model Selection from URL after Data Load & Restore State
    useEffect(() => {
        const routeModel = searchParams.get('model') || (initialDevice?.model ? createSlug(initialDevice.model) : null);

        if (!routeModel) {
            setIsInitialized(true);
            return;
        }

        if (routeModel && modelsData && Object.keys(modelsData).length > 0) {
            let categoryModels = modelsData[deviceType];

            // Fallback: If category not found or model not in category, search all categories
            // Also check if searchParams has a category that overrides the current deviceType
            const pCategory = searchParams.get('category');
            if (pCategory && pCategory !== deviceType && modelsData[pCategory]) {
                setDeviceType(pCategory);
                categoryModels = modelsData[pCategory];
            } else if (!categoryModels || !Object.keys(categoryModels).some(m => createSlug(m) === routeModel)) {
                const foundCategory = Object.keys(modelsData).find(cat =>
                    Object.keys(modelsData[cat]).some(m => {
                        const slug = createSlug(m);
                        return slug === routeModel || slug.startsWith(routeModel);
                    })
                );
                if (foundCategory) {
                    setDeviceType(foundCategory);
                    categoryModels = modelsData[foundCategory];
                }
            }

            if (categoryModels) {
                // Find exact match first
                const exactModel = Object.keys(categoryModels).find(m => createSlug(m) === routeModel);

                // Fuzzy match fallback (e.g. 'playstation-5' matching 'playstation-5-disc')
                // AVOID fuzzy match for generic series names to prevent jumping to first model
                const isGeneric = ['iphone', 'ipad', 'galaxy', 'pixels', 'switch'].includes(routeModel.toLowerCase());
                const fuzzyModel = (!exactModel && !isGeneric)
                    ? Object.keys(categoryModels).find(m => createSlug(m).startsWith(routeModel))
                    : undefined;

                const finalModelName = exactModel || fuzzyModel;
                const isExactMatch = !!exactModel;

                if (finalModelName) {
                    setSelectedModel(finalModelName);

                    const pStorage = searchParams.get('storage');
                    const pCondition = searchParams.get('condition');

                    if (pStorage) {
                        setStorage(pStorage);
                        if (pCondition === 'flawless') {
                            setTurnsOn(true); setWorksCorrectly(true); setIsUnlocked(true);
                            setBatteryHealth('normal'); setFaceIdWorking(true);
                            setScreenState('flawless'); setBodyState('flawless');
                            setStep(5);
                        } else if (isExactMatch) {
                            setStep(3);
                        }
                    } else {
                        const key = `buyback_state_${createSlug(selectedBrand)}_${createSlug(finalModelName)}`;
                        const savedState = localStorage.getItem(key);

                        if (savedState) {
                            try {
                                const parsed = JSON.parse(savedState);
                                setStep(parsed.step || (isExactMatch ? 3 : 2));
                                if (parsed.storage !== undefined) setStorage(parsed.storage);
                                if (parsed.turnsOn !== undefined) setTurnsOn(parsed.turnsOn);
                                if (parsed.worksCorrectly !== undefined) setWorksCorrectly(parsed.worksCorrectly);
                                if (parsed.isUnlocked !== undefined) setIsUnlocked(parsed.isUnlocked);
                                if (parsed.batteryHealth !== undefined) setBatteryHealth(parsed.batteryHealth);
                                if (parsed.faceIdWorking !== undefined) setFaceIdWorking(parsed.faceIdWorking);
                                if (parsed.screenState !== undefined) setScreenState(parsed.screenState);
                                if (parsed.bodyState !== undefined) setBodyState(parsed.bodyState);
                                if (parsed.repairIssues !== undefined) setRepairIssues(parsed.repairIssues);
                                if (parsed.deliveryMethod !== undefined) setDeliveryMethod(parsed.deliveryMethod);
                                if (parsed.iban !== undefined) setIban(parsed.iban);
                                if (parsed.termsAccepted !== undefined) setTermsAccepted(parsed.termsAccepted);
                                if (parsed.selectedScreenQuality !== undefined) setSelectedScreenQuality(parsed.selectedScreenQuality);
                                if (parsed.customerName !== undefined) setCustomerName(parsed.customerName);
                                if (parsed.customerEmail !== undefined) setCustomerEmail(parsed.customerEmail);
                                if (parsed.customerPhone !== undefined) setCustomerPhone(parsed.customerPhone);
                                if (parsed.customerAddress !== undefined) setCustomerAddress(parsed.customerAddress);
                                if (parsed.customerCity !== undefined) setCustomerCity(parsed.customerCity);
                                if (parsed.customerZip !== undefined) setCustomerZip(parsed.customerZip);
                            } catch (e) {
                                console.error('Failed to parse saved state', e);
                                if (isExactMatch) setStep(3);
                                else setStep(2);
                            }
                        } else if (isExactMatch) {
                            // No saved state, but model is selected via URL and is EXACT, so go to Step 3
                            setStep(3);
                        } else {
                            // Generic model or fuzzy match, stay on Step 2
                            setStep(2);
                        }
                    }
                } else {
                    console.warn(`Model ${routeModel} not found in ${deviceType} for ${selectedBrand}`);
                }
                setIsInitialized(true);
                setIsTransitioning(false);

                // Final safety: Force step 3 ONLY if it's an EXACT match
                if (finalModelName && isExactMatch && step < 3) {
                    setStep(3);
                }
            }
        }
    }, [modelsData, deviceType, selectedBrand, searchParams, initialDevice, step]);

    // --- LOGIC: RESET STATES IF DOES NOT TURN ON ---
    useEffect(() => {
        if (turnsOn === false) {
            setWorksCorrectly(null);
            setIsUnlocked(null);
            setFaceIdWorking(null);
            setBatteryHealth('');
        }
    }, [turnsOn]);

    const handleBrandSelect = (brand: string) => {
        setIsTransitioning(false); // Disable overlay transition for smoother feel
        setSelectedBrand(brand);
        setSelectedModel('');
        router.push(`/${lang}/${typeSlug}/${createSlug(brand)}?category=${deviceType}`);
    };

    // Auto-scroll to model selector when data is ready (UX improvement for mobile)
    useEffect(() => {
        if (step === 2 && selectedBrand && !isLoadingData) {
            // Small timeout to ensure DOM layout is finalized after loading spinner disappears
            const timer = setTimeout(() => {
                modelSelectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [step, selectedBrand, isLoadingData]);

    // --- SEARCH LOGIC ---
    // --- SEARCH LOGIC ---
    useEffect(() => {
        if (searchTerm.length > 2) {
            setIsSearching(true);
            const results = Object.values(SEARCH_INDEX).filter((item) =>
                (item.keywords || []).some((k: string) => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
                item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.model.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 5);
            setSearchResults(results);
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }
    }, [searchTerm]);

    const handleSearchSelect = (item: { brand: string; model: string; category: string }) => {
        setDeviceType(item.category);
        setSearchTerm('');

        // Directly handle navigation with item data to avoid stale state
        setIsTransitioning(false);
        setSelectedBrand(item.brand);
        setSelectedModel('');

        if (item.model) {
            setSelectedModel(item.model);
            setTimeout(() => {
                const key = `buyback_state_${createSlug(item.brand)}_${createSlug(item.model)}`;
                localStorage.removeItem(key);
                router.push(`/${lang}/${typeSlug}/${createSlug(item.brand)}/${createSlug(item.model)}?category=${item.category}`);
                if (step < 3) setStep(3);
            }, 100);
        } else {
            router.push(`/${lang}/${typeSlug}/${createSlug(item.brand)}?category=${item.category}`);
        }
    };

    const handleModelSelect = (model: string) => {
        setIsInitialized(false);
        // setIsTransitioning(true); // Removed to stop "new page" effect
        setSelectedModel(model);

        // Reduced delay since we don't have the transition overlay
        setTimeout(() => {
            const key = `buyback_state_${createSlug(selectedBrand)}_${createSlug(model)}`;
            localStorage.removeItem(key);
            router.push(`/${lang}/${typeSlug}/${createSlug(selectedBrand)}/${createSlug(model)}?category=${deviceType}`);
            if (step < 3) setStep(3);
        }, 100);
    };

    // --- PRICING LOGIC ---
    const getSingleIssuePrice = useCallback((issueId: string) => {
        if (!deviceType || !selectedBrand || !selectedModel) return null;

        // 1. Dynamic Price (Admin Dashboard)
        if (dynamicRepairPrices) {
            // Special handling for screen to show "From X" (lowest price)
            if (issueId === 'screen') {
                const prices: number[] = [];
                if (dynamicRepairPrices['screen_generic'] !== undefined) prices.push(dynamicRepairPrices['screen_generic']);
                if (dynamicRepairPrices['screen_oled'] !== undefined) prices.push(dynamicRepairPrices['screen_oled']);
                if (dynamicRepairPrices['screen_original'] !== undefined) prices.push(dynamicRepairPrices['screen_original']);

                // If we have variant prices, return the lowest valid positive one
                const validPrices = prices.filter(p => p > 0);
                if (validPrices.length > 0) {
                    return Math.min(...validPrices);
                }

                // FALLBACK: If we have explicit "Call Us" (0) prices but no positive prices, return 0.
                // This ensures we don't hide the issue if it's "Call Us" only.
                const callUsPrices = prices.filter(p => p === 0);
                if (callUsPrices.length > 0) {
                    return 0; // "From Call Us"
                }

                // If only -1 exists, we return null (issue hidden).
                return null;
            }

            // Standard check
            if (dynamicRepairPrices[issueId] !== undefined) {
                return dynamicRepairPrices[issueId];
            }
        }

        return null;
    }, [deviceType, selectedBrand, selectedModel, dynamicRepairPrices]);

    // AUTO-SELECT SCREEN QUALITY
    useEffect(() => {
        if (type === 'repair' && repairIssues.includes('screen') && !selectedScreenQuality && dynamicRepairPrices) {
            // Auto-select based on priority and availability
            if (dynamicRepairPrices.screen_generic !== undefined && dynamicRepairPrices.screen_generic >= 0) {
                setSelectedScreenQuality('generic');
            } else if (dynamicRepairPrices.screen_oled !== undefined && dynamicRepairPrices.screen_oled >= 0) {
                setSelectedScreenQuality('oled');
            } else if (dynamicRepairPrices.screen_original !== undefined && dynamicRepairPrices.screen_original >= 0) {
                setSelectedScreenQuality('original');
            }
        } else if (!repairIssues.includes('screen') && selectedScreenQuality) {
            // Optional: Reset quality if screen is deselected?
            // User might want to keep selection if they re-select, but let's clear to stay clean.
            setSelectedScreenQuality('');
        }
    }, [repairIssues, type, selectedScreenQuality, dynamicRepairPrices]);


    const buybackEstimate = useMemo(() => {
        if (type !== 'buyback' || !selectedBrand || !selectedModel || !deviceType) return 0;

        // Dynamic Pricing
        if (dynamicBuybackPrices && dynamicBuybackPrices.length > 0) {
            // Find price for storage
            const storageMatch = dynamicBuybackPrices.find(p => p.storage === storage);
            let baseParamsPrice = storageMatch ? storageMatch.price : Math.max(...dynamicBuybackPrices.map(p => p.price));

            // CRITICAL: Deduct exact repair cost if damaged
            // Get Repair Prices for this device
            const screenRepairPrice = getSingleIssuePrice('screen') || 100; // Fallback
            const backRepairPrice = getSingleIssuePrice('back_glass') || 80;
            const batteryRepairPrice = getSingleIssuePrice('battery') || 60;
            // const cameraRepairPrice = getSingleIssuePrice('camera_rear') || 80;

            // Apply condition deductions
            if (turnsOn === false) baseParamsPrice = 0; // Dead device = Recycle only (or very low)
            else if (worksCorrectly === false) baseParamsPrice *= 0.50; // Generic logic fault
            if (isUnlocked === false) baseParamsPrice = 0; // Locked = 0

            // Specific Penalties
            if (selectedBrand === 'Apple' && (deviceType === 'smartphone' || deviceType === 'tablet')) {
                if (batteryHealth === 'service') baseParamsPrice -= batteryRepairPrice;
                if (faceIdWorking === false) baseParamsPrice -= 150; // Hard to fix
            }

            if (screenState === 'scratches') baseParamsPrice -= (screenRepairPrice * 0.3); // Polishing or discount
            if (screenState === 'cracked') baseParamsPrice -= screenRepairPrice; // Full repair cost

            if (bodyState === 'scratches') baseParamsPrice -= 20;
            if (bodyState === 'dents') baseParamsPrice -= backRepairPrice; // Needs housing
            if (bodyState === 'bent') baseParamsPrice -= (backRepairPrice + 40);

            // Camera issues (implied from 'worksCorrectly' if granular, but here generic)

            return Math.max(0, Math.round(baseParamsPrice));
        }

        return 0;
    }, [type, deviceType, selectedBrand, selectedModel, storage, turnsOn, worksCorrectly, isUnlocked, batteryHealth, faceIdWorking, screenState, bodyState, dynamicBuybackPrices, getSingleIssuePrice]);

    const repairEstimates = useMemo(() => {
        if (type !== 'repair' || !selectedModel || repairIssues.length === 0) return { standard: 0, original: 0, oled: 0, hasScreen: false };

        let standardTotal = 0;
        let originalTotal = 0;
        let oledTotal = 0;

        let isStandardValid = true;
        let isOriginalValid = true;
        let isOledValid = true;

        let hasScreen = false;

        repairIssues.forEach(issueId => {
            const basePrice = getSingleIssuePrice(issueId);
            if (basePrice !== null && basePrice !== undefined) {
                if (issueId === 'screen') {
                    hasScreen = true;
                    const d = dynamicRepairPrices;

                    let pGeneric, pOled, pOriginal;

                    if (d) {
                        pGeneric = (d.screen_generic !== undefined && d.screen_generic >= 0) ? d.screen_generic : -1;
                        pOled = (d.screen_oled !== undefined && d.screen_oled >= 0) ? d.screen_oled : -1;
                        pOriginal = (d.screen_original !== undefined && d.screen_original >= 0) ? d.screen_original : -1;
                    } else {
                        pGeneric = basePrice;
                        pOled = -1;
                        pOriginal = -1;
                    }

                    // Standard / Generic
                    if (pGeneric >= 0) {
                        if (pGeneric === 0) isStandardValid = false;
                        standardTotal += pGeneric;
                    } else {
                        isStandardValid = false; // Screen required but standard not available
                    }

                    // OLED
                    if (pOled >= 0) {
                        if (pOled === 0) isOledValid = false;
                        oledTotal = (oledTotal === 0 ? pOled : oledTotal + pOled);
                    } else {
                        isOledValid = false;
                    }

                    // Original
                    if (pOriginal >= 0) {
                        if (pOriginal === 0) isOriginalValid = false;
                        originalTotal = (originalTotal === 0 ? pOriginal : originalTotal + pOriginal);
                    } else {
                        isOriginalValid = false;
                    }

                } else {
                    if (basePrice === 0) {
                        isStandardValid = false;
                        isOledValid = false;
                        isOriginalValid = false;
                    }
                    standardTotal += basePrice;
                    oledTotal += basePrice;
                    originalTotal += basePrice;
                }
            }
        });

        return {
            standard: isStandardValid ? Math.round(standardTotal) : -1,
            oled: isOledValid ? Math.round(oledTotal) : -1,
            original: isOriginalValid ? Math.round(originalTotal) : -1,
            hasScreen
        };
    }, [type, selectedModel, repairIssues, dynamicRepairPrices, getSingleIssuePrice]);

    const handleBack = () => {
        if (step > 1) {
            setIsTransitioning(true);

            setTimeout(() => {
                let newStep;

                // For repair, step 4 doesn't exist, so going back from step 5 should go to step 3
                if (type === 'repair' && step === 5) {
                    newStep = 3;
                } else {
                    newStep = step - 1;
                }

                setStep(newStep);

                // Reset selections when arriving at step 1
                if (newStep === 1) {
                    setDeviceType('');
                    setSelectedBrand('');
                    setSelectedModel('');
                    // Clear URL params
                    router.push(`/${lang}/${typeSlug}`);
                }
                // When arriving at step 2 (Brand Selection), ensure URL reflects that (no model)
                else if (newStep === 2) {
                    setSelectedModel('');
                    router.push(`/${lang}/${typeSlug}/${createSlug(selectedBrand)}?category=${deviceType}`);
                }

                // Ensure transition overlay is removed after the update
                // The main useEffect tries to handle this, but explicit safety here helps for non-model routes
                setTimeout(() => setIsTransitioning(false), 100);
            }, 600);
        }
    };

    // --- DEFAULTS FOR BUYBACK STEP 3 ---
    useEffect(() => {
        if (step === 3 && type === 'buyback' && selectedModel) {
            const options = specsData[selectedModel] || ['64GB', '128GB', '256GB'];
            // Select max storage (last option) if not set
            if (!storage) setStorage(options[options.length - 1]);

            // Set "Best Case" defaults if not set
            if (turnsOn === null) setTurnsOn(true);
            if (worksCorrectly === null) setWorksCorrectly(true);
            if (isUnlocked === null) setIsUnlocked(true);

            if (selectedBrand?.toLowerCase() === 'apple' && (deviceType === 'smartphone' || deviceType === 'tablet')) {
                if (faceIdWorking === null) setFaceIdWorking(true);
                if (!batteryHealth) setBatteryHealth('normal');
            }
        }
    }, [step, type, selectedModel, specsData, selectedBrand, deviceType, storage, turnsOn, worksCorrectly, isUnlocked, faceIdWorking, batteryHealth]);

    const handleNext = () => {
        setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleRepairIssue = (id: string) => {
        setRepairIssues(prev => {
            if (id === 'other') return ['other'];
            if (prev.includes('other')) return [id];
            return prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
        });
    };

    const handleFileUpload = async (file: File): Promise<string> => {
        const storageRef = ref(firebaseStorage, `uploads/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const generatePDF = (orderId: string, data: Record<string, unknown>) => {
        const doc = new jsPDF();

        // --- DESIGN CONSTANTS ---
        const primaryColor = [67, 56, 202]; // Belmobile Blue (#4338ca)
        const lightGray = [245, 247, 250];
        const lineHeight = 7;
        let y = 0;

        // --- HELPER FUNCTIONS ---
        const addSectionTitle = (title: string, yPos: number) => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 30, 30);
            doc.text(title.toUpperCase(), 20, yPos);
            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPos + 2, 190, yPos + 2);
            return yPos + 10;
        };

        const addField = (label: string, value: string, yPos: number, xOffset: number = 20) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 100, 100);
            doc.text(label + ':', xOffset, yPos);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            // Handle long text wrapping if necessary? simplified for now
            doc.text(value || '-', xOffset + 40, yPos);
        };

        // --- HEADER ---
        // Blue Background
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');

        // Logo Text
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('BELMOBILE', 20, 23);
        doc.setTextColor(255, 222, 0); // Yellow
        doc.text('.BE', 70, 23);

        // Precise Justification for Slogan
        const brandWidth = doc.getTextWidth('BELMOBILE');
        const sloganText = 'BUYBACK & REPAIR';
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');

        const sloganWidth = doc.getTextWidth(sloganText);
        const charSpace = (brandWidth - sloganWidth) / (sloganText.length - 1);
        doc.text(sloganText, 20, 30, { charSpace });

        // Document Type
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(`${t('pdf_summary')} - ${type === 'buyback' ? t('Buyback') : t('Repair')}`, 190, 22, { align: 'right' });

        y = 60;

        // --- ORDER INFO ---
        const formattedOrderId = `ORD-${new Date().getFullYear()}-${orderId.substring(0, 6).toUpperCase()}`;
        const orderDate = new Date().toLocaleDateString(lang === 'fr' ? 'fr-BE' : lang === 'nl' ? 'nl-BE' : 'en-US');

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`${t('pdf_order_id')}:`, 20, 50);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(formattedOrderId, 80, 50);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`${t('pdf_date')}:`, 140, 50);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(orderDate, 155, 50);

        // --- CUSTOMER DETAILS ---
        // Use data object but fallback to state variables to ensure data presence
        const cName = (data.customerName as string) || (data.name as string) || customerName || '';
        const cEmail = (data.customerEmail as string) || (data.email as string) || customerEmail || '';
        const cPhone = (data.customerPhone as string) || (data.phone as string) || customerPhone || '';
        const cAddress = (data.customerAddress as string) || (data.address as string) || customerAddress || '';
        const cZip = (data.customerZip as string) || (data.zip as string) || customerZip || '';
        const cCity = (data.customerCity as string) || (data.city as string) || customerCity || '';
        const cIban = (data.iban as string) || iban || '';

        y = addSectionTitle(t('pdf_customer_details'), y);

        addField(t('Name'), cName, y);
        y += lineHeight;
        addField(t('Email'), cEmail, y);
        y += lineHeight;
        addField(t('Phone'), cPhone, y);
        y += lineHeight;

        if (deliveryMethod === 'send') {
            addField(t('Address'), `${cAddress}, ${cZip} ${cCity}`, y);
            y += lineHeight;
        }

        if (cIban) {
            addField(t('IBAN'), cIban, y);
            y += lineHeight;
        }
        y += 5; // Spacer

        // --- DEVICE DETAILS ---
        y = addSectionTitle(t('pdf_device_details'), y);

        const typeStr = (data.category as string) || deviceType || '';
        // Translate type (e.g. "smartphone" -> "Smartphone") and capitalize if translation missing
        const translatedType = t(typeStr);
        const displayType = translatedType !== typeStr ? translatedType : (typeStr.charAt(0).toUpperCase() + typeStr.slice(1));

        addField(t('pdf_device'), `${displayType} ${selectedBrand} ${selectedModel}`, y);
        y += lineHeight;

        if (data.storage || storage) {
            addField(t('Storage'), (data.storage as string) || storage, y);
            y += lineHeight;
        }

        // --- FUNCTIONALITY & SPECS (Buyback Only) ---
        if (type === 'buyback') {
            y = addSectionTitle(t('Functionality & Specs'), y);

            // Standard Checks
            addField(t('Turns On?'), turnsOn ? t('Yes') : t('No'), y);
            y += lineHeight;

            addField(t('Fully Functional?'), worksCorrectly ? t('Yes') : t('No'), y);
            y += lineHeight;

            addField(t('Unlocked?'), isUnlocked ? t('Yes') : t('No'), y);
            y += lineHeight;

            // Apple Specific
            if (selectedBrand === 'Apple' && (deviceType === 'smartphone' || deviceType === 'tablet')) {
                if (faceIdWorking !== null) {
                    addField(t('Face ID Working?'), faceIdWorking ? t('Yes') : t('No'), y);
                    y += lineHeight;
                }

                if (batteryHealth) {
                    // Translate the value if it's a known key (e.g. "Normal (Above 80%)")
                    addField(t('Battery Health'), t(batteryHealth), y);
                    y += lineHeight;
                }
            }
            y += 5;
        }

        // Issues / Condition Logic
        if (type === 'repair') {
            // Using state repairIssues directly as well
            const dIssues = data.issues as string[] | undefined;
            const issuesToPrint = (dIssues && dIssues.length > 0) ? dIssues : repairIssues;

            if (issuesToPrint && issuesToPrint.length > 0) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(100, 100, 100);
                doc.text(t('Repairs') + ':', 20, y);

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);

                issuesToPrint.forEach((issue: string, index: number) => {
                    let issueLabel = t(REPAIR_ISSUES.find(i => i.id === issue)?.label || issue);

                    if (issue === 'screen' && selectedScreenQuality) {
                        const qualityLabel = selectedScreenQuality === 'generic' ? t('Generic / LCD') :
                            selectedScreenQuality === 'oled' ? t('OLED / Soft') :
                                t('Original Refurb');
                        issueLabel += ` (${qualityLabel})`;
                    }

                    // Indented listing
                    if (index === 0) doc.text(`- ${issueLabel}`, 60, y);
                    else doc.text(`- ${issueLabel}`, 60, y + (index * lineHeight));
                });
                y += (issuesToPrint.length * lineHeight);
            }
        } else if (type === 'buyback') {
            // Condition
            const dCondition = data.condition as { screen?: string; body?: string } | undefined;
            addField(t('Screen'), t(screenState as string || dCondition?.screen || '-'), y);
            y += lineHeight;
            addField(t('Body'), t(bodyState as string || dCondition?.body || '-'), y);
            y += lineHeight;
        }

        // --- FUNCTIONALITY & SPECS (Buyback Only) ---
        if (type === 'buyback') {
            y += 5;
            y = addSectionTitle(t('Functionality & Specs'), y);

            // Standard Checks
            addField(t('Turns On?'), turnsOn ? t('Yes') : t('No'), y);
            y += lineHeight;

            addField(t('Fully Functional?'), worksCorrectly ? t('Yes') : t('No'), y);
            y += lineHeight;

            addField(t('Unlocked?'), isUnlocked ? t('Yes') : t('No'), y);
            y += lineHeight;

            // Apple Specific
            if (selectedBrand === 'Apple' && (deviceType === 'smartphone' || deviceType === 'tablet')) {
                if (faceIdWorking !== null) {
                    addField(t('Face ID Working?'), faceIdWorking ? t('Yes') : t('No'), y);
                    y += lineHeight;
                }

                if (batteryHealth) {
                    // Translate the value if it's a known key (e.g. "Normal (Above 80%)")
                    addField(t('Battery Health'), t(batteryHealth), y);
                    y += lineHeight;
                }
            }
        }

        y += 5;

        // --- FINANCIAL SUMMARY ---
        // Light background box for price
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(20, y, 170, 25, 3, 3, 'FD');

        const priceLabel = type === 'buyback' ? t('pdf_estimated_value') : t('pdf_total_cost');

        let calculatedPrice = 0;
        if (type === 'buyback') {
            calculatedPrice = buybackEstimate;
        } else {
            // Repair: use specific quality price if selected, otherwise fallback to original/standard
            if (selectedScreenQuality && repairEstimates[selectedScreenQuality as keyof typeof repairEstimates]) {
                calculatedPrice = repairEstimates[selectedScreenQuality as keyof typeof repairEstimates] as number;
            } else {
                calculatedPrice = repairEstimates.original > 0 ? repairEstimates.original : repairEstimates.standard || 0;
            }
        }

        const priceValue = (data.price as number) || calculatedPrice;

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(priceLabel.toUpperCase(), 30, y + 16);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 56, 202); // Belmobile Blue

        // Show "On Request" if price is 0 or negative (which indicates call for price in our logic)
        if (priceValue <= 0) {
            doc.text(t('contact_for_price'), 150, y + 17, { align: 'right' });
        } else {
            doc.text(`€${Math.round(priceValue)}`, 150, y + 17, { align: 'right' });
        }

        y += 40;

        // --- NEXT STEPS ---
        y = addSectionTitle(t('pdf_next_steps'), y);

        const step1 = type === 'buyback' ? t('success_step_backup') : t('repair_step_backup');
        const step2 = type === 'buyback'
            ? (deliveryMethod === 'send' ? t('success_step_post') : t('success_step_shop'))
            : (deliveryMethod === 'send' ? t('repair_step_post') : t('repair_step_shop'));
        const step3 = type === 'buyback'
            ? (deliveryMethod === 'send' ? t('success_step_payment_post') : t('success_step_payment_shop'))
            : (deliveryMethod === 'send' ? t('repair_step_payment_post') : t('repair_step_payment_shop'));

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');

        const nextSteps = [`1. ${step1}`, `2. ${step2}`, `3. ${step3}`];
        nextSteps.forEach(stepText => {
            const splitText = doc.splitTextToSize(stepText, 170);
            doc.text(splitText, 20, y);
            y += (splitText.length * 5) + 3;
        });

        // --- FOOTER ---
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Belmobile.be - Your Expert in Mobile Services', 105, pageHeight - 15, { align: 'center' });
        doc.text('www.belmobile.be', 105, pageHeight - 10, { align: 'center' });

        return doc;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (honeypot) {
            console.warn("Spam detected via honeypot");
            setSubmitted(true);
            window.scrollTo(0, 0);
            return;
        }

        // Validate shop selection for dropoff delivery
        if (deliveryMethod === 'dropoff' && !selectedShop) {
            setShopSelectionError(true);
            // Scroll to top to show the error
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setShopSelectionError(false);


        // ... (Validation logic)

        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;

        try {
            let idUrl = '';
            if (idFile) {
                idUrl = await handleFileUpload(idFile);
            }

            let shippingLabelUrl = null;
            let trackingNumber = null;

            // Generate Shipping Label if 'send' method
            if (deliveryMethod === 'send') {
                try {
                    const shippingResponse = await fetch('/api/shipping/create-label', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Admin-Token': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
                        },
                        body: JSON.stringify({
                            customer: {
                                name: (data.name as string),
                                email: (data.email as string),
                                phone: (data.phone as string),
                                address: (data.address as string),
                                city: (data.city as string),
                                zip: (data.zip as string),
                            },
                            servicePoint: servicePoint
                        })
                    });

                    if (shippingResponse.ok) {
                        const shippingData = await shippingResponse.json();
                        shippingLabelUrl = shippingData.labelUrl;
                        trackingNumber = shippingData.trackingNumber;
                    } else {
                        console.error('Failed to generate shipping label');
                    }
                } catch (err) {
                    console.error('Error generating shipping label:', err);
                }
            }

            const orderData = {
                customerName: (data.name as string) || '',
                customerEmail: (data.email as string) || '',
                customerPhone: (data.phone as string) || '',
                customerAddress: (data.address as string) || null,
                customerCity: (data.city as string) || null,
                customerZip: (data.zip as string) || null,
                brand: selectedBrand || '',
                model: selectedModel || '',
                type,
                status: 'new',
                date: new Date().toISOString().split('T')[0],
                createdAt: serverTimestamp(),
                price: Number(type === 'buyback' ? buybackEstimate : repairEstimates.standard) || 0,
                condition: type === 'buyback' ? { screen: screenState, body: bodyState } : null,
                issues: type === 'repair' ? repairIssues : null,
                deliveryMethod,
                iban: iban || null,
                idUrl: idUrl || null,
                shopId: selectedShop?.id || null, // No fallback - shop is required for dropoff
                shippingLabelUrl: shippingLabelUrl,
                trackingNumber: trackingNumber,
                servicePoint: servicePoint || null
            };

            const docRef = await addDoc(collection(db, 'quotes'), orderData);

            if (type === 'buyback' || type === 'repair') {
                const finalOrderData = { ...orderData, iban };
                const pdf = generatePDF(docRef.id, finalOrderData);

                // Trigger auto-download
                const safeFileName = `Belmobile_${type}_${docRef.id.substring(0, 6).toUpperCase()}.pdf`;
                pdf.save(safeFileName);

                // Automate Email dispatch via Firestore Trigger
                const pdfBase64 = pdf.output('datauristring').split(',')[1];

                // 1. Send to Customer
                await sendEmail(
                    customerEmail,
                    t('email_buyback_repair_subject', type === 'buyback' ? t('Buyback') : t('Repair'), docRef.id.substring(0, 6).toUpperCase()),
                    `
                    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #4338ca; padding: 30px; text-align: center;">
                            <div style="display: inline-block; text-align: left;">
                                <div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #ffffff; white-space: nowrap; margin-bottom: 2px; line-height: 1;">
                                    BELMOBILE<span style="color: #eab308;">.BE</span>
                                </div>
                                <div style="font-size: 10px; font-weight: 700; letter-spacing: 5.1px; text-transform: uppercase; color: #94a3b8; white-space: nowrap; line-height: 1; padding-left: 1px;">
                                    BUYBACK & REPAIR
                                </div>
                            </div>
                        </div>
                        <div style="padding: 30px; line-height: 1.6;">

                        <h2 style="color: #4338ca;">${t('email_buyback_repair_greeting', customerName)}</h2>
                        <p>${t('email_buyback_repair_thanks', type === 'buyback' ? t('Buyback') : t('Repair'))}</p>
                        <p>${t('email_buyback_repair_attachment')}</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #666;">${t('email_automatic_message')}</p>
                    </div>
                    <div style="padding: 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
                        <p style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0;">Belmobile.be</p>
                        <p style="font-size: 12px; color: #64748b; margin: 4px 0;">Rue Gallait 4, 1030 Schaerbeek, Brussels</p>
                        <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
                            &copy; ${new Date().getFullYear()} Belmobile. All rights reserved.
                        </p>
                    </div>
                </div>
                    `,
                    [{
                        filename: `Belmobile_${type}_${docRef.id.substring(0, 6)}.pdf`,
                        content: pdfBase64,
                        encoding: 'base64'
                    }]
                );

                // 2. Send to Admin (Copy)
                await sendEmail(
                    'info@belmobile.be',
                    `[ADMIN COPY] ${t('email_buyback_repair_subject', type === 'buyback' ? t('Buyback') : t('Repair'), docRef.id.substring(0, 6).toUpperCase())}`,
                    `
                    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #4338ca; padding: 30px; text-align: center;">
                            <div style="display: inline-block; text-align: left;">
                                <div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #ffffff; white-space: nowrap; margin-bottom: 2px; line-height: 1;">
                                    BELMOBILE<span style="color: #eab308;">.BE</span>
                                </div>
                                <div style="font-size: 10px; font-weight: 700; letter-spacing: 5.1px; text-transform: uppercase; color: #94a3b8; white-space: nowrap; line-height: 1; padding-left: 1px;">
                                    BUYBACK & REPAIR
                                </div>
                            </div>
                        </div>
                        <div style="padding: 30px; line-height: 1.6;">

                        <h2 style="color: #4338ca;">New ${type} Request</h2>
                        <p>A new ${type} request has been submitted by <strong>${customerName}</strong> (${customerEmail}).</p>
                        <p>ID: <strong>${docRef.id.substring(0, 6).toUpperCase()}</strong></p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #666;">This is an administrative copy.</p>
                    </div>
                    <div style="padding: 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e5e7eb;">
                        <p style="font-size: 14px; font-weight: bold; color: #1e293b; margin: 0;">Belmobile.be</p>
                        <p style="font-size: 12px; color: #64748b; margin: 4px 0;">Rue Gallait 4, 1030 Schaerbeek, Brussels</p>
                        <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
                            &copy; ${new Date().getFullYear()} Belmobile. All rights reserved.
                        </p>
                    </div>
                </div>
                    `,
                    [{
                        filename: `Belmobile_${type}_${docRef.id.substring(0, 6)}.pdf`,
                        content: pdfBase64,
                        encoding: 'base64'
                    }]
                );

                setSubmittedOrder({ id: docRef.id, data: finalOrderData });
            }

            setSubmitted(true);
            const key = `buyback_state_${createSlug(selectedBrand)}_${createSlug(selectedModel)}`;
            localStorage.removeItem(key);
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting form.');
        } finally {
        }
    };


    // --- UI COMPONENTS ---


    const StepIndicator = () => {
        // Dynamic labels based on type
        const getLabel = (id: number) => {
            if (id === 1) return t('Device');
            if (id === 2) return t('Model');
            if (id === 3) return type === 'buyback' ? t('Specs') : t('Diagnostics');
            if (id === 4) return type === 'buyback' ? t('Condition') : t('Details');
            if (id === 5) return t('Summary');
            return '';
        };

        const currentSteps = type === 'buyback' ? [1, 2, 3, 4, 5] : [1, 2, 3, 5];
        const currentStepIndex = currentSteps.indexOf(step);
        // Fallback for transition states where step might not be in array (unlikely but safe)
        const safeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

        return (
            <div className="flex flex-col w-full max-w-3xl mx-auto mb-8">
                <div className="flex justify-between items-center relative z-10">
                    {currentSteps.map((s, index) => {
                        // Check completion based on index, not just raw step value, 
                        // to handle the 4-step sequence correctly.
                        const isCompleted = safeIndex > index;
                        const isCurrent = safeIndex === index;

                        return (
                            <div key={s} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${isCurrent ? 'bg-bel-blue border-bel-blue text-white scale-110 shadow-lg shadow-blue-500/30' :
                                    isCompleted ? 'bg-bel-blue border-bel-blue text-white' :
                                        'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-400'
                                    }`}>
                                    {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : (index + 1)}
                                </div>
                                <span className={`mt-2 text-xs font-medium transition-colors duration-300 ${isCurrent ? 'text-bel-blue' : isCompleted ? 'text-bel-blue' : 'text-gray-400'
                                    }`}>
                                    {getLabel(s)}
                                </span>
                            </div>
                        );
                    })}
                    {/* Connecting Lines */}
                    <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 dark:bg-slate-800 -z-10" />
                    <div
                        className="absolute top-4 left-0 h-0.5 bg-bel-blue transition-all duration-500 -z-10"
                        style={{ width: `${(safeIndex / (currentSteps.length - 1)) * 100}%` }}
                    />
                </div>

                {step > 1 && (
                    <button
                        onClick={handleBack}
                        className="lg:hidden absolute top-0 left-0 p-4 text-gray-500"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                )}
            </div>
        );
    };

    const DesktopSidebar = ({ onNext, nextDisabled, nextLabel }: { onNext: () => void; nextDisabled?: boolean; nextLabel?: string }) => {
        const isBuyback = type === 'buyback';
        let estimateDisplay: React.ReactNode = null;

        if (isBuyback) {
            estimateDisplay = <>&euro;{buybackEstimate}</>;
        } else {
            // For Repairs
            if (repairIssues.length === 0) {
                estimateDisplay = <>&euro;0</>;
            } else if (repairIssues.includes('other')) {
                estimateDisplay = t('Diagnostic');
            } else {
                // If it has screen, check selected quality price
                if (repairEstimates.hasScreen && selectedScreenQuality) {
                    if (selectedScreenQuality === 'original') estimateDisplay = repairEstimates.original > 0 ? <>&euro;{repairEstimates.original}</> : <span className="text-lg text-bel-blue dark:text-blue-400">{t('contact_for_price')}</span>;
                    else if (selectedScreenQuality === 'oled') estimateDisplay = repairEstimates.oled > 0 ? <>&euro;{repairEstimates.oled}</> : <span className="text-lg text-bel-blue dark:text-blue-400">{t('contact_for_price')}</span>;
                    else if (selectedScreenQuality === 'generic') estimateDisplay = repairEstimates.standard > 0 ? <>&euro;{repairEstimates.standard}</> : <span className="text-lg text-bel-blue dark:text-blue-400">{t('contact_for_price')}</span>;
                    else estimateDisplay = <span className="text-bel-blue dark:text-blue-400 text-sm italic">{t('select_quality_short')}</span>;
                } else if (repairEstimates.hasScreen && !selectedScreenQuality) {
                    estimateDisplay = <span className="text-bel-blue dark:text-blue-400 text-sm italic">{t('select_quality_short')}</span>;
                } else {
                    // No screen, just standard
                    estimateDisplay = repairEstimates.standard > 0 ? <>&euro;{repairEstimates.standard}</> : <span className="text-lg text-bel-blue dark:text-blue-400">{t('contact_for_price')}</span>;
                }
            }
        }

        if (step === 1) return null;

        return (
            <div className="hidden lg:block w-80 xl:w-96 shrink-0 ml-8">
                <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="bg-bel-blue p-6 text-white text-center">
                        <h3 className="font-bold text-xl mb-2">{t('Summary')}</h3>
                        {(() => {

                            const specificImage = dynamicImage || (selectedModel ? getDeviceImage(createSlug(`${selectedBrand} ${selectedModel}`)) : null);
                            const brandImage = selectedBrand ? getDeviceImage(createSlug(selectedBrand)) : null;
                            const displayImage = specificImage || brandImage;
                            const isFallback = !specificImage;

                            return displayImage && (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={displayImage}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        className="relative w-32 h-32 mx-auto mb-3 bg-white/20 rounded-xl p-2 backdrop-blur-sm shadow-inner"
                                    >
                                        <Image
                                            src={displayImage}
                                            alt={`${selectedBrand} ${selectedModel} ${t(type === 'buyback' ? 'Buyback' : 'Repair')} service at Belmobile`}
                                            fill
                                            sizes="128px"
                                            className={`object-contain transition-all ${isFallback ? 'brightness-0 invert p-4 opacity-90' : 'hover:scale-105'}`}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            );
                        })()}
                        <p className="text-blue-100 text-sm font-medium">{(selectedBrand && selectedModel && selectedModel.toLowerCase().startsWith(selectedBrand.toLowerCase())) ? selectedModel : `${selectedBrand} ${selectedModel}`}</p>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-3 text-sm">
                            {deviceType && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('Device')}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{t(DEVICE_TYPES.find(d => d.id === deviceType)?.label || '')}</span>
                                </div>
                            )}
                            {selectedBrand && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('Model')}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{(selectedBrand && selectedModel && selectedModel.toLowerCase().startsWith(selectedBrand.toLowerCase())) ? selectedModel : `${selectedBrand} ${selectedModel}`}</span>
                                </div>
                            )}
                            {isBuyback && storage && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('Storage')}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{storage}</span>
                                </div>
                            )}
                            {!isBuyback && repairIssues.length > 0 && (
                                <div className="border-t border-gray-100 dark:border-slate-800 pt-3 mt-3">
                                    <span className="block text-gray-500 mb-2">{t('Repairs')}</span>
                                    <ul className="space-y-1">
                                        {repairIssues.map(issueId => {
                                            const issue = REPAIR_ISSUES.find(i => i.id === issueId);
                                            if (!issue) return null;

                                            let label = t(issue.id);
                                            if (issueId === 'screen') {
                                                const hasMultipleQualities = [
                                                    dynamicRepairPrices?.screen_generic !== undefined && dynamicRepairPrices.screen_generic >= 0,
                                                    dynamicRepairPrices?.screen_oled !== undefined && dynamicRepairPrices.screen_oled >= 0,
                                                    dynamicRepairPrices?.screen_original !== undefined && dynamicRepairPrices.screen_original >= 0
                                                ].filter(Boolean).length > 1;

                                                if (hasMultipleQualities && selectedScreenQuality) {
                                                    if (selectedScreenQuality === 'oled') label += ` (${t('OLED / Soft')})`;
                                                    else if (selectedScreenQuality === 'original') label += ` (${t('Original Refurb')})`;
                                                    else if (selectedScreenQuality === 'generic') label += ` (${t('Generic / LCD')})`;
                                                }
                                            }

                                            let price = 0;
                                            if (issueId === 'screen') {
                                                if (selectedScreenQuality === 'oled') price = repairEstimates.oled;
                                                else if (selectedScreenQuality === 'original') price = repairEstimates.original;
                                                else price = repairEstimates.standard;
                                            } else {
                                                price = getSingleIssuePrice(issueId) || 0;
                                            }

                                            return (
                                                <li key={issueId} className="flex justify-between text-gray-900 dark:text-white font-medium">
                                                    <span>{label}</span>
                                                    <span>
                                                        {issueId === 'other' ? <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span> : (price > 0 ? <>&euro;{price}</> : <span>-</span>)}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 dark:bg-slate-950/50 rounded-xl p-4 text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                {isBuyback ? t('Estimated Value') : t('Total Cost')}
                            </p>
                            <div className="text-3xl font-extrabold text-bel-dark dark:text-white">
                                {estimateDisplay}
                            </div>
                            <p className="text-xs font-medium text-gray-500 mt-2">
                                {isBuyback ? t('Paid instantly via cash or bank transfer') : t('Includes labor and premium parts')}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {step < 5 && (
                                <button
                                    onClick={onNext}
                                    disabled={nextDisabled}
                                    className="w-full bg-bel-blue text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {nextLabel || t('Next')}
                                </button>
                            )}
                            {step > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="w-full py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                                >
                                    {t('Back')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const MobileBottomBar = ({ onNext, nextDisabled, nextLabel, showEstimate }: { onNext: () => void; nextDisabled?: boolean; nextLabel?: string; showEstimate?: boolean }) => {
        const isBuyback = type === 'buyback';
        let estimateDisplay: React.ReactNode = null;

        if (showEstimate) {
            if (isBuyback) {
                estimateDisplay = <>&euro;{buybackEstimate}</>;
            } else {
                if (repairIssues.length === 0) {
                    estimateDisplay = <>&euro;0</>;
                } else if (repairIssues.includes('other')) {
                    estimateDisplay = <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span>;
                } else {
                    // If it has screen, check selected quality price
                    if (repairEstimates.hasScreen && selectedScreenQuality) {
                        if (selectedScreenQuality === 'original') estimateDisplay = repairEstimates.original > 0 ? <>&euro;{repairEstimates.original}</> : <span className="text-sm font-bold uppercase">{t('contact_for_price')}</span>;
                        else if (selectedScreenQuality === 'oled') estimateDisplay = repairEstimates.oled > 0 ? <>&euro;{repairEstimates.oled}</> : <span className="text-sm font-bold uppercase">{t('contact_for_price')}</span>;
                        else if (selectedScreenQuality === 'generic') estimateDisplay = repairEstimates.standard > 0 ? <>&euro;{repairEstimates.standard}</> : <span className="text-sm font-bold uppercase">{t('contact_for_price')}</span>;
                        else estimateDisplay = <span className="text-xs italic">{t('select_quality_short')}</span>;
                    } else if (repairEstimates.hasScreen && !selectedScreenQuality) {
                        estimateDisplay = <span className="text-xs italic">{t('select_quality_short')}</span>;
                    } else {
                        estimateDisplay = repairEstimates.standard > 0 ? <>&euro;{repairEstimates.standard}</> : <span className="text-sm font-bold uppercase">{t('contact_for_price')}</span>;
                    }
                }
            }
        }

        return (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform duration-300 transform translate-y-0">
                <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
                    {showEstimate && estimateDisplay && (
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-tight">{isBuyback ? t('Estimated Value') : t('Total Cost')}</span>
                            <span className="text-xl font-extrabold text-bel-dark dark:text-white leading-tight">{estimateDisplay}</span>
                        </div>
                    )}
                    <button
                        onClick={onNext}
                        disabled={nextDisabled}
                        className={`flex-1 bg-bel-blue text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-base flex items-center justify-center gap-2 transition-all ${!showEstimate || !estimateDisplay ? 'w-full' : ''}`}
                    >
                        <span>{nextLabel || t('Next')}</span>
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        );
    };

    const renderStep1 = () => (
        <div className="animate-fade-in w-full max-w-4xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8">
            {!hideStep1Title && (
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                    {t(type === 'buyback' ? 'buyback_step1_title' : 'repair_step1_title')}
                </h2>
            )}

            {/* Search Bar */}
            <div className={`relative max-w-lg mx-auto ${hideStep1Title ? 'mb-8' : 'mb-12'}`}>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                    <input
                        type="text"
                        placeholder={t('Search your device (e.g. iPhone 13, Samsung S21...)')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-bel-blue focus:ring-4 focus:ring-blue-500/10 transition-all text-lg"
                    />
                </div>

                {/* Search Results Dropdown */}
                {isSearching && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50">
                        {searchResults.map((item: { brand: string; model: string; category: string }, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => handleSearchSelect(item)}
                                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left border-b border-gray-50 dark:border-slate-800 last:border-0"
                            >
                                <div className="w-10 h-10 relative bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                                    {/* Simple icon fallback or utilize item data if available */}
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
                        onClick={() => { setDeviceType(dt.id); handleNext(); }}
                        className={`group flex flex-col items-center justify-center p-4 lg:p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${deviceType === dt.id
                            ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-bel-blue/50'
                            }`}
                    >
                        <div className={`relative w-16 h-16 p-4 rounded-2xl mb-4 transition-all duration-300 ${deviceType === dt.id ? 'bg-bel-blue scale-110 shadow-lg shadow-blue-500/30' : 'bg-transparent'}`}>
                            <Image
                                src={dt.icon}
                                alt={`${t(dt.label)} category icon`}
                                fill
                                priority
                                sizes="64px"
                                className={`object-contain p-2 transition-all duration-300 ${deviceType === dt.id ? 'brightness-0 invert' : 'opacity-60 dark:invert dark:opacity-80 group-hover:opacity-100'}`}
                            />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{t(dt.label)}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => {
        const brands = (DEVICE_BRANDS as Record<string, string[]>)[deviceType] || [];
        const nextDisabled = !selectedBrand || !selectedModel;
        const availableModels = modelsData[deviceType] ? Object.keys(modelsData[deviceType]) : [];

        return (
            <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">{t('Select Brand & Model')}</h2>

                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">{t('Brand')}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {brands.map((brand: string, index: number) => (
                                <button
                                    key={brand}
                                    onClick={() => handleBrandSelect(brand)}
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
                                {isLoadingData ? (
                                    <div className="absolute inset-0 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center space-x-3 z-10 transition-opacity duration-200">
                                        <div className="w-5 h-5 border-2 border-bel-blue border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-gray-500 font-medium animate-pulse">{t('Loading models...')}</span>
                                    </div>
                                ) : (
                                    <Select
                                        value={selectedModel}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleModelSelect(e.target.value)}
                                        options={[
                                            { value: "", label: t('Select your model...') },
                                            ...availableModels.map(model => ({ value: model, label: model }))
                                        ]}
                                        className="text-lg font-medium w-full"
                                        disabled={isLoadingData}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <DesktopSidebar onNext={handleNext} nextDisabled={nextDisabled} />

            </div >
        );
    };

    const renderStep3 = () => {
        if (type === 'buyback') {
            const isAppleSmartphone = selectedBrand?.toLowerCase() === 'apple' && (deviceType === 'smartphone' || deviceType === 'tablet');
            let nextDisabled = !storage || turnsOn === null;
            if (turnsOn !== false) {
                nextDisabled = nextDisabled || worksCorrectly === null || isUnlocked === null || (isAppleSmartphone && (!batteryHealth || faceIdWorking === null));
            }

            return (
                <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('Functionality & Specs')}</h2>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase">{t('Storage')}</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(() => {
                                    // Combine static specs with dynamic prices
                                    const staticOptions = specsData[selectedModel] || [];
                                    const dynamicOptions = dynamicBuybackPrices ? dynamicBuybackPrices.map(p => p.storage) : [];

                                    // LOGIC CHANGE: If we have dynamic prices, TRUST THEM completely.
                                    // Only fall back to static if dynamic is empty.
                                    // This prevents "Ghost" 64GB options from static data appearing even if DB doesn't have them.
                                    let finalOptions = [];

                                    if (dynamicOptions.length > 0) {
                                        finalOptions = Array.from(new Set(dynamicOptions));
                                    } else if (staticOptions.length > 0) {
                                        finalOptions = staticOptions;
                                    } else {
                                        finalOptions = ['64GB', '128GB', '256GB'];
                                    }

                                    // Sort helper (GB then TB)
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
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-500 uppercase">{t('Functionality')}</label>
                            {[
                                { label: 'Turns On?', state: turnsOn, setter: setTurnsOn },
                                { label: 'Everything Works?', state: worksCorrectly, setter: setWorksCorrectly },
                                { label: 'Unlocked?', state: isUnlocked, setter: setIsUnlocked },
                                ...(isAppleSmartphone ? [{ label: 'Face ID Working?', state: faceIdWorking, setter: setFaceIdWorking }] : [])
                            ].map((item, i) => {
                                const isDisabled = turnsOn === false && item.label !== 'Turns On?';
                                return (
                                    <div key={i} className={`flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <span className="font-medium text-gray-900 dark:text-white">{t(item.label)}</span>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => item.setter(true)}
                                                disabled={isDisabled}
                                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border ${item.state === true ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                                            >
                                                {t('Yes')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => item.setter(false)}
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
                        {isAppleSmartphone && (
                            <div className={turnsOn === false ? 'opacity-50 pointer-events-none' : ''}>
                                <label className="block text-sm font-bold text-gray-500 mb-3 uppercase">{t('Battery Health')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setBatteryHealth('normal')} disabled={turnsOn === false} className={`py-3 px-4 rounded-xl font-bold transition-all border ${batteryHealth === 'normal' ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}>{t('Normal (Above 80%)')}</button>
                                    <button type="button" onClick={() => setBatteryHealth('service')} disabled={turnsOn === false} className={`py-3 px-4 rounded-xl font-bold transition-all border ${batteryHealth === 'service' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>{t('Service Required (Below 80%)')}</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <DesktopSidebar onNext={handleNext} nextDisabled={nextDisabled} />
                    <MobileBottomBar onNext={handleNext} nextDisabled={nextDisabled} showEstimate={true} />
                </div>
            );
        } else {
            const nextDisabled = repairIssues.length === 0;
            const nextLabel = repairIssues.includes('other') ? t("Next") : t("Start Repair");
            const isNintendo = selectedBrand?.toLowerCase() === 'nintendo';

            // const isApple = selectedBrand?.toLowerCase() === 'apple';

            return (
                <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('What needs fixing?')}</h2>
                        <p className="text-gray-500 mb-8">{selectedBrand} {selectedModel}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {REPAIR_ISSUES.filter(issue => {
                                if (issue.devices && !issue.devices.includes(deviceType)) return false;
                                const brand = selectedBrand?.toLowerCase();

                                // GENERIC BRAND FILTER:
                                // If issue has specific brands listed, current brand must be one of them.
                                if (issue.brands && !issue.brands.some(b => b.toLowerCase() === brand)) {
                                    return false;
                                }

                                if (brand === 'nintendo') {
                                    if (issue.id === 'hdmi') return false;
                                    if (issue.id === 'disc') return false;
                                } else {
                                    if (issue.id === 'card_reader') return false;
                                }

                                // Prepare Foldable Check
                                const modelName = selectedModel || '';
                                const isFoldableModel = modelName.includes('Fold') || modelName.includes('Flip') || modelName.includes('Find N') || modelName.includes('Pixel Fold') || modelName.includes('Razr') || modelName.includes('Open');

                                // NEW: Soft Delete Logic (Hide if price is negative)
                                const p = getSingleIssuePrice(issue.id);
                                const isFoldableIssue = ['screen_foldable_inner', 'screen_foldable_outer'].includes(issue.id);

                                // Exception: Allow foldable screens to show on foldable devices even if price is missing (-1)
                                // This ensures new devices (like Pixel 9 Pro Fold) show the correct inputs (Contact for Price) instead of nothing.
                                // Soft Delete Exemptions
                                const isHandheldScreenIssue = ['screen_upper', 'screen_bottom', 'screen_digitizer', 'screen_lcd', 'screen_component'].includes(issue.id);
                                const isHandheldDevice = deviceType === 'console_portable' || deviceType === 'tablet'; // Allow tablets too for split parts

                                const isExemptFromSoftDelete = (isFoldableIssue && isFoldableModel) || (isHandheldDevice && isHandheldScreenIssue);

                                if (typeof p === 'number' && p < 0 && !isExemptFromSoftDelete) return false;

                                // STRICT FOLDABLE FILTER:
                                // Only show foldable screen options if the model name explicitly contains "Fold", "Flip", etc.
                                if (isFoldableIssue) {
                                    if (!isFoldableModel) return false;
                                }

                                // SMART FOLDABLE LOGIC: (Existing)
                                if (issue.id === 'screen') {
                                    const innerPrice = getSingleIssuePrice('screen_foldable_inner');
                                    const outerPrice = getSingleIssuePrice('screen_foldable_outer');
                                    const hasFoldablePrices = (typeof innerPrice === 'number' && innerPrice >= 0) || (typeof outerPrice === 'number' && outerPrice >= 0);

                                    if (isFoldableModel || hasFoldablePrices) return false;
                                }

                                // NINTENDO DS/3DS LOGIC:
                                // Split screens into Upper/Bottom/Glass Only

                                // UNIFIED CONFIGURATION LOGIC:
                                // Check if this model has a specific repair profile defined
                                const unifiedProfile = getRepairProfileForModel(modelName, deviceType);

                                if (unifiedProfile) {
                                    // If a profile exists, ONLY show issues listed in that profile
                                    if (!unifiedProfile.includes(issue.id)) return false;
                                } else {
                                    // Fallback for models without specific profiles (e.g. non-Nintendo/Sony handhelds)
                                    // Hide specific handheld parts if no profile matches
                                    if (['screen_upper', 'screen_bottom', 'screen_digitizer', 'screen_lcd'].includes(issue.id)) return false;
                                }

                                // Soft Delete Exemptions
                                // These lines were already present above, keeping the original one.
                                // const isHandheldScreenIssue = ['screen_upper', 'screen_bottom', 'screen_digitizer', 'screen_lcd', 'screen_component'].includes(issue.id);
                                // const isHandheldDevice = deviceType === 'console_portable' || deviceType === 'tablet'; 

                                // const isExemptFromSoftDelete = (isFoldableIssue && isFoldableModel) || (isHandheldDevice && isHandheldScreenIssue);

                                // if (typeof p === 'number' && p < 0 && !isExemptFromSoftDelete) return false;

                                return true;
                            }).map(issue => {
                                const isSelected = repairIssues.includes(issue.id);
                                // Ensure we display positive price or fallback
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
                                                    {pricesLoading ? (
                                                        <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 animate-pulse rounded"></div>
                                                    ) : (
                                                        !showScreenOptionsForIssue && (
                                                            <span className="text-sm font-bold bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300 animate-fade-in">
                                                                {isScreenIssue && displayPrice !== null && displayPrice > 0 && <span className="mr-1 text-xs font-normal opacity-70">{t('À partir de')}</span>}
                                                                {issue.id === 'other' ? <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span> : (displayPrice !== null && displayPrice > 0 ? <>&euro;{displayPrice}</> : <span className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">{t('contact_for_price')}</span>)}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{t(issue.id + '_desc')}</p>
                                            </div>
                                            {isSelected && !showScreenOptionsForIssue && <CheckCircleIcon className="h-6 w-6 text-bel-blue ml-2" />}
                                        </div>
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
                    </div>
                    <DesktopSidebar onNext={() => { setStep(5); window.scrollTo({ top: 0, behavior: 'smooth' }); }} nextDisabled={nextDisabled} nextLabel={nextLabel} />
                    <MobileBottomBar onNext={() => { setStep(5); window.scrollTo({ top: 0, behavior: 'smooth' }); }} nextDisabled={nextDisabled} nextLabel={nextLabel} showEstimate={true} />
                </div>
            );
        }
    };

    const renderStep4 = () => {
        if (type !== 'buyback') return null;
        return (
            <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-4 lg:p-8">
                <div className="flex-1 space-y-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('Cosmetic Condition')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase">{t('Screen Condition')}</label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'flawless', label: 'Flawless', desc: 'Like new, no scratches' },
                                    { id: 'scratches', label: 'Light Scratches', desc: 'Visible scratches but no cracks' },
                                    { id: 'cracked', label: 'Cracked / Broken', desc: 'Glass is cracked or display broken' }
                                ].map((s) => (
                                    <button type="button" key={s.id} onClick={() => setScreenState(s.id as 'flawless' | 'scratches' | 'cracked')} className={`p-4 rounded-xl border-2 text-left transition-all ${screenState === s.id ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                                        <div className="font-bold text-gray-900 dark:text-white">{t(s.label)}</div>
                                        <div className="text-sm text-gray-500">{t(s.desc)}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase">{t('Body Condition')}</label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'flawless', label: 'Flawless', desc: 'Like new, no dents or scratches' },
                                    { id: 'scratches', label: 'Scratches', desc: 'Visible scratches or scuffs' },
                                    { id: 'dents', label: 'Dents', desc: 'Visible dents on the frame' },
                                    { id: 'bent', label: 'Bent / Broken', desc: 'Frame is bent or structural damage' }
                                ].map((s) => (
                                    <button type="button" key={s.id} onClick={() => setBodyState(s.id as 'flawless' | 'scratches' | 'dents' | 'bent')} className={`p-4 rounded-xl border-2 text-left transition-all ${bodyState === s.id ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                                        <div className="font-bold text-gray-900 dark:text-white">{t(s.label)}</div>
                                        <div className="text-sm text-gray-500">{t(s.desc)}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <DesktopSidebar onNext={handleNext} nextDisabled={false} nextLabel={t('Accept & Recycle')} />
                <MobileBottomBar onNext={handleNext} nextDisabled={false} showEstimate={true} nextLabel={t('Accept & Recycle')} />
            </div>
        );
    };

    const MobileSummary = () => {
        const isBuyback = type === 'buyback';
        let estimateDisplay: React.ReactNode = null;
        if (isBuyback) {
            estimateDisplay = buybackEstimate > 0 ? <>&euro;{buybackEstimate}</> : <span className="text-bel-blue dark:text-blue-400 text-lg">{t('contact_for_price')}</span>;
        } else {
            if (repairIssues.length === 0) {
                estimateDisplay = <>&euro;0</>;
            } else if (repairIssues.includes('other')) {
                estimateDisplay = <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span>;
            } else {
                // If it has screen, check selected quality price
                if (repairEstimates.hasScreen && selectedScreenQuality) {
                    if (selectedScreenQuality === 'original') estimateDisplay = repairEstimates.original > 0 ? <>&euro;{repairEstimates.original}</> : <span className="text-bel-blue dark:text-blue-400 uppercase font-bold text-sm tracking-tighter">{t('contact_for_price')}</span>;
                    else if (selectedScreenQuality === 'oled') estimateDisplay = repairEstimates.oled > 0 ? <>&euro;{repairEstimates.oled}</> : <span className="text-bel-blue dark:text-blue-400 uppercase font-bold text-sm tracking-tighter">{t('contact_for_price')}</span>;
                    else if (selectedScreenQuality === 'generic') estimateDisplay = repairEstimates.standard > 0 ? <>&euro;{repairEstimates.standard}</> : <span className="text-bel-blue dark:text-blue-400 uppercase font-bold text-sm tracking-tighter">{t('contact_for_price')}</span>;
                    else estimateDisplay = <span className="text-bel-blue dark:text-blue-400 text-sm italic">{t('select_quality_short')}</span>;
                } else if (repairEstimates.hasScreen && !selectedScreenQuality) {
                    estimateDisplay = <span className="text-bel-blue dark:text-blue-400 text-sm italic">{t('select_quality_short')}</span>;
                } else {
                    estimateDisplay = repairEstimates.standard > 0 ? <>&euro;{repairEstimates.standard}</> : <span className="text-bel-blue dark:text-blue-400 uppercase font-bold text-sm tracking-tighter">{t('contact_for_price')}</span>;
                }
            }
        }
        return (
            <div className="lg:hidden bg-white dark:bg-slate-900 rounded-3xl p-6 mb-8 border border-gray-200 dark:border-slate-800 shadow-sm animate-fade-in">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4">{t('Summary')}</h3>
                {(selectedModel && getDeviceImage(createSlug(`${selectedBrand} ${selectedModel}`))) && (
                    <div className="relative w-full h-48 mb-4 bg-gray-50 dark:bg-slate-950 rounded-xl p-4">
                        <Image
                            src={getDeviceImage(createSlug(`${selectedBrand} ${selectedModel}`))!}
                            alt={`${selectedBrand} ${selectedModel}`}
                            fill
                            className="object-contain"
                        />
                    </div>
                )}
                <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between"><span className="text-gray-500">{t('Device')}</span><span className="font-medium text-gray-900 dark:text-white">{(selectedBrand && selectedModel && selectedModel.toLowerCase().startsWith(selectedBrand.toLowerCase())) ? selectedModel : `${selectedBrand} ${selectedModel}`}</span></div>
                    {isBuyback && storage && (<div className="flex justify-between"><span className="text-gray-500">{t('Storage')}</span><span className="font-medium text-gray-900 dark:text-white">{storage}</span></div>)}
                    {!isBuyback && repairIssues.length > 0 && (<div className="border-t border-gray-100 dark:border-slate-700 pt-2 mt-2">{repairIssues.map(issueId => {
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
                                <span>{t(issue.id)} {issueId === 'screen' && selectedScreenQuality !== 'generic' ? (selectedScreenQuality === 'oled' ? `(${t('OLED / Soft')})` : `(${t('Original Refurb')})`) : ''}</span>
                                <span>
                                    {issueId === 'other' ? <span className="text-bel-blue dark:text-blue-400 font-bold uppercase">{t('free')}</span> : (price > 0 ? <>&euro;{price}</> : <span>-</span>)}
                                </span>
                            </div>
                        );
                    })}</div>)}
                </div>
                <div className="bg-gray-50 dark:bg-slate-950/50 rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{isBuyback ? t('Estimated Value') : t('Total Cost')}</p>
                    <div className="text-3xl font-extrabold text-bel-dark dark:text-white">{estimateDisplay}</div>
                </div>
            </div>
        );
    };

    const renderStep5 = () => {
        if (submitted) {
            return (
                <div className="max-w-2xl mx-auto text-center py-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" /></div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('Request Received!')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">{t('success_description')}</p>
                    {(type === 'buyback' || type === 'repair') && (
                        <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-6 mb-8 text-left max-w-lg mx-auto border border-gray-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><span className="bg-bel-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">i</span>{t('success_steps_title')}</h3>
                            <ol className="space-y-4 text-gray-700 dark:text-gray-300">
                                <li className="flex gap-3"><span className="font-bold text-bel-blue">1.</span><span>{type === 'buyback' ? t('success_step_backup') : t('repair_step_backup')}</span></li>
                                <li className="flex gap-3"><span className="font-bold text-bel-blue">2.</span><span>{type === 'buyback' ? (deliveryMethod === 'send' ? t('success_step_post') : t('success_step_shop')) : (deliveryMethod === 'send' ? t('repair_step_post') : t('repair_step_shop'))}</span></li>
                                <li className="flex gap-3"><span className="font-bold text-bel-blue">3.</span><span>{type === 'buyback' ? (deliveryMethod === 'send' ? t('success_step_payment_post') : t('success_step_payment_shop')) : (deliveryMethod === 'send' ? t('repair_step_payment_post') : t('repair_step_payment_shop'))}</span></li>
                            </ol>
                        </div>
                    )}
                    <button onClick={() => window.location.href = '/'} className="bg-bel-blue text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition">{t('Return Home')}</button>
                    {submittedOrder && (type === 'buyback' || type === 'repair') && (
                        <div className="mt-6 flex flex-col gap-3 items-center">
                            <button
                                onClick={() => {
                                    const pdf = generatePDF(submittedOrder.id, submittedOrder.data);
                                    pdf.save(`Belmobile_${submittedOrder.id.substring(0, 6).toUpperCase()}.pdf`);
                                }}
                                className="text-bel-blue hover:text-blue-700 underline font-medium"
                            >
                                {t('Download Summary PDF')}
                            </button>
                            {(submittedOrder.data.shippingLabelUrl as string) && (
                                <button
                                    onClick={() => downloadLabel(submittedOrder.data.shippingLabelUrl as string)}
                                    className="flex items-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 dark:shadow-none"
                                >
                                    <TruckIcon className="h-5 w-5" />
                                    {t('Download Shipping Label')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8">
                <MobileSummary />
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('How would you like to proceed?')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div onClick={() => setDeliveryMethod('dropoff')} className={`cursor-pointer p-6 rounded-2xl border-2 text-left transition-all flex flex-col ${deliveryMethod === 'dropoff' ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20 ring-1 ring-bel-blue' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-bel-blue/50'}`}>
                                    <div className="flex items-start">
                                        <BuildingStorefrontIcon className={`h-8 w-8 mr-4 ${deliveryMethod === 'dropoff' ? 'text-bel-blue' : 'text-gray-400'}`} />
                                        <div><span className={`block font-bold text-lg mb-1 ${deliveryMethod === 'dropoff' ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>{t('Visit Store')}</span><p className="text-sm text-gray-500 dark:text-gray-400">{t('Come to one of our shops in Brussels. No appointment needed.')}</p></div>
                                    </div>
                                    {deliveryMethod === 'dropoff' && (
                                        <div className="mt-4 w-full animate-fade-in">
                                            {shopSelectionError && !selectedShop && (
                                                <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl text-red-700 dark:text-red-400 font-medium text-sm">
                                                    {"\u26A0\uFE0F"} {t('Please select a shop')}
                                                </div>
                                            )}
                                            {!selectedShop ? (
                                                <div className="space-y-3">
                                                    {!isShopListOpen ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsShopListOpen(true);
                                                            }}
                                                            className="w-full py-4 px-6 bg-white dark:bg-slate-900 text-left rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-bel-blue transition font-medium text-gray-900 dark:text-white flex items-center justify-between"
                                                        >
                                                            <span>{t('Select a shop')}</span>
                                                            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                                        </button>
                                                    ) : (
                                                        <div className="animate-fade-in border-2 border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden">
                                                            <div className="bg-gray-50 dark:bg-slate-950 px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                                                                <span className="font-bold text-sm text-gray-500 uppercase tracking-wider">{t('Available Shops')}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); setIsShopListOpen(false); }}
                                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                                >
                                                                    <XMarkIcon className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-slate-800 max-h-60 overflow-y-auto bg-white dark:bg-slate-900">
                                                                {shops.filter(s => s.status === 'open').map(shop => (
                                                                    <button
                                                                        key={shop.id}
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedShop(shop);
                                                                            setShopSelectionError(false);
                                                                            setIsShopListOpen(false);
                                                                        }}
                                                                        className="w-full py-4 px-6 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-center justify-between group"
                                                                    >
                                                                        <div>
                                                                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-bel-blue transition-colors">{shop.name.replace('Belmobile ', '')}</div>
                                                                            <div className="text-xs text-gray-500 mt-1">{shop.address}</div>
                                                                        </div>
                                                                        <ChevronRightIcon className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-bel-blue">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="font-bold text-bel-blue">{selectedShop.name.replace('Belmobile ', '')}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">{selectedShop.address}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedShop(null);
                                                                setIsShopListOpen(true);
                                                            }}
                                                            className="text-sm text-bel-blue hover:text-blue-700 font-medium underline"
                                                        >
                                                            {t('Change')}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div onClick={() => setDeliveryMethod('send')} className={`cursor-pointer p-6 rounded-2xl border-2 text-left transition-all flex flex-col ${deliveryMethod === 'send' ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20 ring-1 ring-bel-blue' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-bel-blue/50'}`}>
                                    <div className="flex items-start">
                                        <TruckIcon className={`h-8 w-8 mr-4 ${deliveryMethod === 'send' ? 'text-bel-blue' : 'text-gray-400'}`} />
                                        <div><span className={`block font-bold text-lg mb-1 ${deliveryMethod === 'send' ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>{t('Send by Post')}</span><p className="text-sm text-gray-500 dark:text-gray-400">{t('Free shipping label provided. Secure and insured.')}</p></div>
                                    </div>
                                    {deliveryMethod === 'send' && (
                                        <div className="mt-4 w-full animate-fade-in">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openServicePointPicker();
                                                }}
                                                className="w-full py-3 px-4 bg-bel-blue text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none"
                                            >
                                                {servicePoint ? t('Change Service Point') : t('Choose Service Point')}
                                            </button>
                                            {servicePoint && (
                                                <div className="mt-3 relative text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-800">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setServicePoint(null);
                                                        }}
                                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        title={t('Remove')}
                                                    >
                                                        <XMarkIcon className="h-5 w-5" />
                                                    </button>
                                                    <p className="font-bold text-bel-blue pr-6">{servicePoint.name}</p>
                                                    <p>{servicePoint.street} {servicePoint.house_number}</p>
                                                    <p>{servicePoint.postal_code} {servicePoint.city}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('Your Details')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <Input
                                    label={t('Name')}
                                    required
                                    name="name"
                                    autoCapitalize="words"
                                    value={customerName}
                                    placeholder="John Doe"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))}
                                />
                                <Input
                                    label={t('Phone')}
                                    required
                                    name="phone"
                                    type="tel"
                                    value={customerPhone}
                                    placeholder="+32 400 00 00 00"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
                                />
                            </div>
                            <div className="mb-6">
                                <Input
                                    label={t('Email')}
                                    required
                                    name="email"
                                    type="email"
                                    value={customerEmail}
                                    placeholder="john@example.com"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerEmail(e.target.value)}
                                />
                            </div>
                            {deliveryMethod === 'send' && (
                                <div className="animate-fade-in-up space-y-4 border-t border-gray-100 dark:border-slate-700 pt-4 mb-8">
                                    <h4 className="font-bold text-gray-900 dark:text-white">{t('Shipping Address')}</h4>
                                    <Input
                                        label={t('Address')}
                                        required
                                        name="address"
                                        autoCapitalize="words"
                                        placeholder="Rue de la Loi 16"
                                        value={customerAddress}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerAddress(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label={t('Postal Code')}
                                            required
                                            name="zip"
                                            value={customerZip}
                                            placeholder="1000"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerZip(e.target.value)}
                                        />
                                        <Input
                                            label={t('City')}
                                            required
                                            name="city"
                                            autoCapitalize="words"
                                            value={customerCity}
                                            placeholder="Bruxelles"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerCity(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))}
                                        />
                                    </div>
                                    {type === 'buyback' && (
                                        <>
                                            <Input
                                                label={t('IBAN Number')}
                                                required
                                                value={iban}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIban(e.target.value)}
                                                placeholder="BE00 0000 0000 0000"
                                            />
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1">{t('Upload ID Copy')}</label>
                                                <p className="text-xs text-gray-500 mb-3 ml-1">{t('id_upload_desc')}</p>

                                                {!idFile ? (
                                                    <div className="relative group">
                                                        <input
                                                            required
                                                            type="file"
                                                            accept="image/*,application/pdf"
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdFile(e.target.files ? e.target.files[0] : null)}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="w-full p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 group-hover:border-bel-blue group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 transition-all flex flex-col items-center justify-center text-center">
                                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                                <CloudArrowUpIcon className="h-6 w-6 text-bel-blue" />
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-700 dark:text-white mb-1 group-hover:text-bel-blue transition-colors">
                                                                {t('Click to upload')}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                PNG, JPG or PDF (max 5MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm animate-fade-in">
                                                        <div className="flex items-center space-x-3 overflow-hidden">
                                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg shrink-0">
                                                                <DocumentIcon className="h-5 w-5 text-bel-blue" />
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-xs">{idFile.name}</p>
                                                                <p className="text-xs text-gray-500">{(idFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIdFile(null)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {(type === 'buyback' || type === 'repair') && (
                                <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 mb-6 mt-4 relative z-10">
                                    <div style={{ display: 'none' }} aria-hidden="true">
                                        <input
                                            type="text"
                                            name="hp_email"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={honeypot}
                                            onChange={(e) => setHoneypot(e.target.value)}
                                        />
                                    </div>
                                    <label className="flex items-start cursor-pointer">
                                        <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 w-5 h-5 text-bel-blue rounded border-gray-300 focus:ring-bel-blue" />
                                        <div className="ml-3"><p className="font-bold text-gray-900 dark:text-white text-sm">{type === 'buyback' ? (selectedBrand?.toLowerCase() === 'apple' ? t('terms_icloud') : t('terms_android')) : t('terms_repair_backup')}</p><p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{t('terms_and_privacy')}</p></div>
                                    </label>
                                </div>
                            )}
                            <Button
                                type="submit"
                                disabled={!termsAccepted}
                                variant="primary"
                                className="w-full mt-6"
                            >
                                {t('Confirm Request')}
                            </Button>

                            {/* Trust Signals Block - Moved below button */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-bel-blue/20 mt-8">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5 text-bel-blue" />
                                    {t('trust_title')}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                            <BanknotesIcon className="h-5 w-5 text-bel-blue" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                {type === 'buyback' ? t('trust_price_title_buyback') : t('trust_price_title')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {type === 'buyback' ? t('trust_price_subtitle_buyback') : t('price_vat_included')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                            <ShieldCheckIcon className="h-5 w-5 text-bel-blue" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                {type === 'buyback' ? t('trust_warranty_title_buyback') : t('trust_warranty_title')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{type === 'buyback' ? t('buyback_payment_terms') : t('repair_payment_terms')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                            <DocumentTextIcon className="h-5 w-5 text-bel-blue" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                {type === 'buyback' ? t('trust_document_title_buyback') : t('trust_document_title')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{type === 'buyback' ? t('pdf_confirmation_buyback') : t('pdf_confirmation_repair')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                            <XMarkIcon className="h-5 w-5 text-bel-blue" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                {type === 'buyback' ? t('trust_flexibility_title_buyback') : t('Flexibility')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('cancellation_policy')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <DesktopSidebar onNext={() => { }} nextDisabled={true} />
            </div>
        );
    };

    return (
        <div className="bg-transparent pt-0 pb-12 px-4 relative min-h-[600px]">
            {/* Global Transition Overlay - Hoisted to root to prevent unmounting flickers */}
            {(isTransitioning || isLoadingData) && (
                <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl animate-fade-in pointer-events-none h-full w-full">
                    <div className="w-16 h-16 border-4 border-bel-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-gray-900 dark:text-white animate-pulse">{t('Loading details...')}</p>
                </div>
            )}
            <div className="max-w-6xl mx-auto">
                {/* SEO Component Removed */}
                {/* SchemaMarkup removed in favor of SEOContent */}
                <StepIndicator />
                <AnimatePresence mode="wait">
                    {step === 1 && <StepWrapper key="step1" stepKey={1}>{renderStep1()}</StepWrapper>}
                    {step === 2 && <StepWrapper key="step2" stepKey={2}>{renderStep2()}</StepWrapper>}
                    {step === 3 && <StepWrapper key="step3" stepKey={3}>{renderStep3()}</StepWrapper>}
                    {step === 4 && <StepWrapper key="step4" stepKey={4}>{renderStep4()}</StepWrapper>}
                    {step === 5 && <StepWrapper key="step5" stepKey={5}>{renderStep5()}</StepWrapper>}
                </AnimatePresence>
            </div>
            {/* SEO Content Section Removed for stability */}
        </div>
    );
};

export default BuybackRepair;
