'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useShop } from '../hooks/useShop';
import Input from './ui/Input';
import Button from './ui/Button';
import Select from './ui/Select';
import { useData } from '../hooks/useData';
import { db, storage as firebaseStorage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { jsPDF } from 'jspdf';
import { Quote } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import {
    CheckCircleIcon,
    ArrowLeftIcon,
    SparklesIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    TvIcon,
    PuzzlePieceIcon,
    PencilSquareIcon,
    BuildingStorefrontIcon,
    TruckIcon,
    Battery50Icon,
    FaceSmileIcon,
    XMarkIcon,
    CloudArrowUpIcon,
    DocumentIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { DEVICE_TYPES, REPAIR_ISSUES, SEO_CONTENT, MOCK_SHOPS, MOCK_REPAIR_PRICES } from '../constants';
import { DEVICE_BRANDS } from '../data/brands';
import { createSlug } from '../utils/slugs';
// import SEO from '../components/SEO'; // SEO handled by page metadata
import SchemaMarkup from '../components/SchemaMarkup';
import LocalSEOContent from './LocalSEOContent';
import { getDeviceImage } from '../data/deviceImages';
import Image from 'next/image';

interface BuybackRepairProps {
    type: 'buyback' | 'repair';
    initialShop?: string;
    initialCategory?: string;
    initialDevice?: {
        brand: string;
        model: string;
    };
}

const BuybackRepair: React.FC<BuybackRepairProps> = ({ type, initialShop, initialCategory, initialDevice }) => {
    const { selectedShop, setSelectedShop } = useShop();
    const { addQuote, repairPrices, shops } = useData();
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();

    // Ensure lang is defined
    const lang = language || params.lang || 'fr';

    // State
    const [step, setStep] = useState(1);
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
    const [idFile, setIdFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedScreenQuality, setSelectedScreenQuality] = useState<'generic' | 'oled' | 'original'>('generic');
    const [shopSelectionError, setShopSelectionError] = useState(false);

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
    const [isShopListOpen, setIsShopListOpen] = useState(false);
    const [submittedOrder, setSubmittedOrder] = useState<{ id: string, data: any } | null>(null);

    // Service Point State
    const [servicePoint, setServicePoint] = useState<any>(null);

    // URL Params State
    const [routeBrand, setRouteBrand] = useState<string | null>(null);
    const [routeModel, setRouteModel] = useState<string | null>(null);

    // SendCloud Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://embed.sendcloud.sc/spp/1.0.0/api.min.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

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
        if (initialCategory) {
            setDeviceType(initialCategory);
        }
    }, [initialCategory]);

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

        // For now, let's just ensure routeBrand/routeModel are set correctly.
        const pBrand = searchParams.get('brand') || (initialDevice?.brand ? createSlug(initialDevice.brand) : null);
        const pModel = searchParams.get('model') || (initialDevice?.model ? createSlug(initialDevice.model) : null);

        if (pBrand) setRouteBrand(createSlug(pBrand));
        if (pModel) setRouteModel(createSlug(pModel));

        // Sync deviceType with category param if present
        const pCategory = searchParams.get('category');
        if (pCategory && pCategory !== deviceType) {
            setDeviceType(pCategory);
        }

    }, [searchParams, initialDevice, deviceType]);

    const openServicePointPicker = () => {
        // @ts-ignore
        if (window.sendcloud) {
            // @ts-ignore
            window.sendcloud.servicePoints.open(
                {
                    apiKey: process.env.NEXT_PUBLIC_SENDCLOUD_API_KEY,
                    country: 'be',
                    language: 'en-us',
                    carriers: ['bpost'],
                },
                (servicePointObject: any) => {
                    console.log('Selected service point:', servicePointObject);
                    setServicePoint(servicePointObject);
                    // Update address fields with service point data
                    setCustomerAddress(servicePointObject.street + ' ' + servicePointObject.house_number);
                    setCustomerCity(servicePointObject.city);
                    setCustomerZip(servicePointObject.postal_code);
                },
                (errors: any) => {
                    console.error('Service Point Picker errors:', errors);
                }
            );
        } else {
            console.error('SendCloud script not loaded');
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
    const loadBrandData = async (brandSlug: string) => {
        setIsLoadingData(true);
        try {
            const module = await import(`../data/models/${brandSlug}`);
            setModelsData(module.MODELS);
            setSpecsData(module.SPECS);
        } catch (error) {
            console.error(`Failed to load data for ${brandSlug}:`, error);
            console.error(`Failed to load data for ${brandSlug}`, error);
            setModelsData({});
            setSpecsData({});
        } finally {
            setIsLoadingData(false);
        }
    };

    // Trigger data loading when selectedBrand changes
    useEffect(() => {
        if (selectedBrand) {
            loadBrandData(createSlug(selectedBrand));
            if (!selectedModel && step === 1) {
                setStep(2);
            }
        }
    }, [selectedBrand, deviceType]);

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
                    Object.keys(modelsData[cat]).some(m => createSlug(m) === routeModel)
                );
                if (foundCategory) {
                    setDeviceType(foundCategory);
                    categoryModels = modelsData[foundCategory];
                }
            }

            if (categoryModels) {
                const modelName = Object.keys(categoryModels).find(m => createSlug(m) === routeModel);
                if (modelName) {
                    setSelectedModel(modelName);

                    const pStorage = searchParams.get('storage');
                    const pCondition = searchParams.get('condition');

                    if (pStorage) {
                        setStorage(pStorage);
                        if (pCondition === 'flawless') {
                            setTurnsOn(true); setWorksCorrectly(true); setIsUnlocked(true);
                            setBatteryHealth('normal'); setFaceIdWorking(true);
                            setScreenState('flawless'); setBodyState('flawless');
                            setStep(5);
                        } else {
                            setStep(3);
                        }
                    } else {
                        const key = `buyback_state_${createSlug(selectedBrand)}_${createSlug(modelName)}`;
                        const savedState = localStorage.getItem(key);

                        if (savedState) {
                            try {
                                const parsed = JSON.parse(savedState);
                                setStep(parsed.step || 3);
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
                                setStep(3);
                            }
                        } else {
                            // No saved state, but model is selected via URL, so go to Step 3
                            setStep(3);
                        }
                    }
                } else {
                    console.warn(`Model ${routeModel} not found in ${deviceType} for ${selectedBrand}`);
                }
                setIsInitialized(true);
                setIsTransitioning(false);

                // Force step 3 if we have a valid model selected from URL and we are not already on a later step
                if (modelName && step < 3) {
                    setStep(3);
                }
            }
        }
    }, [modelsData, routeModel, deviceType, selectedBrand, searchParams]);

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
        setIsTransitioning(true);
        setSelectedBrand(brand);
        setSelectedModel('');
        router.push(`/${lang}/${typeSlug}/${createSlug(brand)}?category=${deviceType}`);
    };

    const handleModelSelect = (model: string) => {
        setIsInitialized(false);
        setIsTransitioning(true);
        setSelectedModel(model);

        // Add artificial delay to ensure overlay is visible and transition is smooth
        setTimeout(() => {
            const key = `buyback_state_${createSlug(selectedBrand)}_${createSlug(model)}`;
            localStorage.removeItem(key);
            router.push(`/${lang}/${typeSlug}/${createSlug(selectedBrand)}/${createSlug(model)}?category=${deviceType}`);
            if (step < 3) setStep(3);
        }, 800);
    };

    // --- PRICING LOGIC ---
    const getSingleIssuePrice = (issueId: string) => {
        if (!deviceType || !selectedBrand || !selectedModel) return null;
        const slug = createSlug(`${selectedBrand} ${selectedModel}`);
        const override = repairPrices.find(p => p.id === slug);
        const fallback = MOCK_REPAIR_PRICES.find(p => p.id === slug);

        if (override || fallback) {
            const pricingSource = override || fallback;
            // Simplified check for brevity, assuming structure matches
            if (issueId === 'screen') return pricingSource?.screen_generic;
            // ... (Add other fields if needed, or rely on generic logic below if missing)
            // For now, let's just return if found in either
            const val = (pricingSource as any)?.[issueId];
            if (val !== undefined) return val;
        }

        const modelValue = modelsData[deviceType]?.[selectedModel] || 200;
        const issueData = REPAIR_ISSUES.find(i => i.id === issueId);
        if (!issueData || issueId === 'other') return null;

        let tierMultiplier = 1;
        if (modelValue > 800) tierMultiplier = 2.5;
        else if (modelValue > 400) tierMultiplier = 1.8;
        else if (modelValue > 200) tierMultiplier = 1.2;

        return Math.round(issueData.base * tierMultiplier);
    };

    const buybackEstimate = useMemo(() => {
        if (type !== 'buyback' || !selectedBrand || !selectedModel || !deviceType) return 0;
        const brandCatalog = modelsData[deviceType];
        let price = brandCatalog?.[selectedModel] || 0;

        if (storage === '256GB') price += 20;
        if (storage === '512GB') price += 50;
        if (storage === '1TB') price += 80;
        if (storage === '2TB') price += 120;

        if (turnsOn === false) price *= 0.10;
        else if (worksCorrectly === false) price *= 0.50;
        if (isUnlocked === false) price *= 0.20;

        if (selectedBrand === 'Apple' && (deviceType === 'smartphone' || deviceType === 'tablet')) {
            if (batteryHealth === 'service') price -= 40;
            if (faceIdWorking === false) price -= 50;
        }

        if (screenState === 'scratches') price -= 30;
        if (screenState === 'cracked') price -= 100;
        if (bodyState === 'scratches') price -= 20;
        if (bodyState === 'dents') price -= 50;
        if (bodyState === 'bent') price -= 80;

        price = price * 0.48;
        return Math.max(0, Math.round(price));
    }, [type, deviceType, selectedBrand, selectedModel, storage, turnsOn, worksCorrectly, isUnlocked, batteryHealth, faceIdWorking, screenState, bodyState, modelsData]);

    const repairEstimates = useMemo(() => {
        if (type !== 'repair' || !selectedModel || repairIssues.length === 0) return { standard: 0, original: 0, oled: 0, hasScreen: false };

        let standardTotal = 0;
        let originalTotal = 0;
        let oledTotal = 0;
        let hasScreen = false;

        repairIssues.forEach(issueId => {
            const basePrice = getSingleIssuePrice(issueId);
            if (basePrice !== null) {
                if (issueId === 'screen') {
                    hasScreen = true;
                    const slug = createSlug(`${selectedBrand} ${selectedModel}`);
                    const override = repairPrices.find(p => p.id === slug);
                    const fallback = MOCK_REPAIR_PRICES.find(p => p.id === slug);
                    const pricingSource = override || fallback;

                    if (pricingSource) {
                        standardTotal += (pricingSource.screen_generic !== undefined ? pricingSource.screen_generic : basePrice);
                        oledTotal += (pricingSource.screen_oled !== undefined ? pricingSource.screen_oled : (basePrice * 1.3));
                        originalTotal += (pricingSource.screen_original !== undefined ? pricingSource.screen_original : (basePrice * 1.6));
                    } else {
                        standardTotal += basePrice;
                        oledTotal += (basePrice * 1.3);
                        originalTotal += (basePrice * 1.6);
                    }
                } else {
                    standardTotal += basePrice;
                    oledTotal += basePrice;
                    originalTotal += basePrice;
                }
            }
        });

        return {
            standard: Math.round(standardTotal),
            oled: Math.round(oledTotal),
            original: Math.round(originalTotal),
            hasScreen
        };
    }, [type, deviceType, selectedBrand, selectedModel, repairIssues, repairPrices, modelsData]);

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

    const handleNext = () => {
        setStep(step + 1);
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

    const generatePDF = (orderId: string, data: any) => {
        const doc = new jsPDF();
        const lineHeight = 10;
        let y = 20;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(67, 56, 202); // Belmobile Blue
        doc.text('Belmobile.be', 20, y);
        y += lineHeight;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`${t('Summary')} - ${type === 'buyback' ? t('Buyback') : t('Repair')}`, 20, y);
        y += lineHeight * 1.5;

        // Order Details
        doc.setFontSize(12);
        doc.text(`${t('Order ID')}: ${orderId}`, 20, y);
        y += lineHeight;
        doc.text(`${t('Date')}: ${new Date().toLocaleDateString()}`, 20, y);
        y += lineHeight * 1.5;

        // Customer Info
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(t('Customer Details'), 20, y);
        y += lineHeight;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`${t('Name')}: ${data.name || ''}`, 20, y);
        y += lineHeight;
        doc.text(`${t('Email')}: ${data.email || ''}`, 20, y);
        y += lineHeight;
        doc.text(`${t('Phone')}: ${data.phone || ''}`, 20, y);
        y += lineHeight;
        if (data.deliveryMethod === 'send') {
            doc.text(`${t('Address')}: ${data.address || ''}, ${data.zip || ''} ${data.city || ''}`, 20, y);
            y += lineHeight;
        }
        if (data.iban) {
            doc.text(`${t('IBAN')}: ${data.iban}`, 20, y);
            y += lineHeight;
        }
        y += lineHeight;

        // Device Info
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(t('Device Details'), 20, y);
        y += lineHeight;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`${t('Device')}: ${data.brand} ${data.model}`, 20, y);
        y += lineHeight;
        if (data.storage) {
            doc.text(`${t('Storage')}: ${data.storage}`, 20, y);
            y += lineHeight;
        }

        // Issues / Condition
        if (type === 'repair' && data.issues) {
            doc.text(`${t('Repairs')}:`, 20, y);
            y += lineHeight;
            data.issues.forEach((issue: string) => {
                const issueLabel = REPAIR_ISSUES.find(i => i.id === issue)?.label || issue;
                doc.text(`- ${t(issueLabel)}`, 30, y);
                y += lineHeight;
            });
        } else if (type === 'buyback' && data.condition) {
            doc.text(`${t('Condition')}:`, 20, y);
            y += lineHeight;
            doc.text(`- ${t('Screen')}: ${t(data.condition.screen)}`, 30, y);
            y += lineHeight;
            doc.text(`- ${t('Body')}: ${t(data.condition.body)}`, 30, y);
            y += lineHeight;
        }
        y += lineHeight;

        // Price
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const priceLabel = type === 'buyback' ? t('Estimated Value') : t('Total Cost');
        doc.text(`${priceLabel}: €${data.price}`, 20, y);
        y += lineHeight * 2;

        // Next Steps
        doc.setFontSize(14);
        doc.text(t('Next Steps'), 20, y);
        y += lineHeight;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        const step1 = type === 'buyback' ? t('success_step_backup') : t('repair_step_backup');
        const step2 = type === 'buyback'
            ? (data.deliveryMethod === 'send' ? t('success_step_post') : t('success_step_shop'))
            : (data.deliveryMethod === 'send' ? t('repair_step_post') : t('repair_step_shop'));
        const step3 = type === 'buyback'
            ? (data.deliveryMethod === 'send' ? t('success_step_payment_post') : t('success_step_payment_shop'))
            : (data.deliveryMethod === 'send' ? t('repair_step_payment_post') : t('repair_step_payment_shop'));

        const splitStep1 = doc.splitTextToSize(`1. ${step1}`, 170);
        doc.text(splitStep1, 20, y);
        y += lineHeight * splitStep1.length + 2;

        const splitStep2 = doc.splitTextToSize(`2. ${step2}`, 170);
        doc.text(splitStep2, 20, y);
        y += lineHeight * splitStep2.length + 2;

        const splitStep3 = doc.splitTextToSize(`3. ${step3}`, 170);
        doc.text(splitStep3, 20, y);
        y += lineHeight * splitStep3.length + 2;

        // Footer
        y += lineHeight;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(t('Thank you for choosing Belmobile.be'), 20, y);

        doc.save(`belmobile-order-${orderId}.pdf`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate shop selection for dropoff delivery
        if (deliveryMethod === 'dropoff' && !selectedShop) {
            setShopSelectionError(true);
            // Scroll to top to show the error
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setShopSelectionError(false);

        setIsUploading(true);
        // ... (Validation logic)

        const formData = new FormData(e.target as HTMLFormElement);
        const data: any = Object.fromEntries(formData.entries());

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
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            customer: {
                                name: data.name,
                                email: data.email,
                                phone: data.phone,
                                address: data.address,
                                city: data.city,
                                zip: data.zip,
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
                customerName: data.name || '',
                customerEmail: data.email || '',
                customerPhone: data.phone || '',
                customerAddress: data.address || null,
                customerCity: data.city || null,
                customerZip: data.zip || null,
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
                generatePDF(docRef.id, finalOrderData);
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
            setIsUploading(false);
        }
    };


    // --- UI COMPONENTS ---
    const TransitionOverlay = () => {
        if (!isTransitioning) return null;

        return (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl animate-fade-in">
                <div className="w-16 h-16 border-4 border-bel-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-gray-900 dark:text-white animate-pulse">{t('Loading details...')}</p>
            </div>
        );
    };

    const StepIndicator = () => {
        const steps = type === 'buyback' ? [1, 2, 3, 4, 5] : [1, 2, 3, 5];

        return (
            <div className="flex items-center justify-center mb-8 relative">
                {step > 1 && (
                    <button
                        onClick={handleBack}
                        className="lg:hidden absolute left-0 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                )}
                <div className="flex items-center space-x-2">
                    {steps.map((s, index) => (
                        <div key={s} className={`h-2 w-8 rounded-full transition-all duration-300 ${step >= s ? 'bg-bel-blue' : 'bg-gray-200 dark:bg-slate-800'}`} />
                    ))}
                </div>
            </div>
        );
    };

    const DesktopSidebar = ({ onNext, nextDisabled, nextLabel }: any) => {
        const isBuyback = type === 'buyback';
        let estimateDisplay = null;

        if (isBuyback) {
            estimateDisplay = buybackEstimate > 0 ? `€${buybackEstimate}` : '-';
        } else {
            if (repairIssues.includes('other')) estimateDisplay = t('Diagnostic');
            else if (repairEstimates.hasScreen) {
                if (selectedScreenQuality === 'original') estimateDisplay = `€${repairEstimates.original}`;
                else if (selectedScreenQuality === 'oled') estimateDisplay = `€${repairEstimates.oled}`;
                else estimateDisplay = `€${repairEstimates.standard}`;
            }
            else estimateDisplay = `€${repairEstimates.standard}`;
        }

        if (step === 1) return null;

        return (
            <div className="hidden lg:block w-80 xl:w-96 shrink-0 ml-8">
                <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="bg-bel-blue p-6 text-white text-center">
                        <h3 className="font-bold text-xl mb-2">{t('Summary')}</h3>
                        {(() => {
                            const specificImage = selectedModel ? getDeviceImage(createSlug(`${selectedBrand} ${selectedModel}`)) : null;
                            const brandImage = selectedBrand ? getDeviceImage(createSlug(selectedBrand)) : null;
                            const displayImage = specificImage || brandImage;
                            const isFallback = !specificImage;

                            return displayImage && (
                                <div className="relative w-32 h-32 mx-auto mb-3 bg-white/20 rounded-xl p-2 backdrop-blur-sm shadow-inner">
                                    <Image
                                        src={displayImage}
                                        alt={`${selectedBrand} ${selectedModel} ${t(type === 'buyback' ? 'Buyback' : 'Repair')}`}
                                        fill
                                        className={`object-contain transition-all ${isFallback ? 'brightness-0 invert p-4 opacity-90' : 'hover:scale-105'}`}
                                    />
                                </div>
                            );
                        })()}
                        <p className="text-blue-100 text-sm font-medium">{selectedBrand} {selectedModel}</p>
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
                                    <span className="font-medium text-gray-900 dark:text-white">{selectedBrand} {selectedModel}</span>
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

                                            let label = t(issue.label);
                                            if (issueId === 'screen') {
                                                if (selectedScreenQuality === 'oled') label += ` (${t('OLED / Soft')})`;
                                                else if (selectedScreenQuality === 'original') label += ` (${t('Original Refurb')})`;
                                                else label += ` (${t('Generic / LCD')})`;
                                            }

                                            return (
                                                <li key={issueId} className="flex justify-between text-gray-900 dark:text-white font-medium">
                                                    <span>{label}</span>
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

    const MobileBottomBar = ({ onNext, nextDisabled, nextLabel, showEstimate }: any) => {
        const isBuyback = type === 'buyback';
        let estimateDisplay = null;

        if (showEstimate) {
            if (isBuyback) {
                estimateDisplay = buybackEstimate > 0 ? `€${buybackEstimate}` : '-';
            } else {
                if (repairIssues.includes('other')) estimateDisplay = t('Diagnostic');
                else if (repairEstimates.hasScreen) {
                    if (selectedScreenQuality === 'original') estimateDisplay = `€${repairEstimates.original}`;
                    else if (selectedScreenQuality === 'oled') estimateDisplay = `€${repairEstimates.oled}`;
                    else estimateDisplay = `€${repairEstimates.standard}`;
                }
                else estimateDisplay = `€${repairEstimates.standard}`;
            }
        }
        return (
            <div className="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-xs p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200 dark:border-slate-800 transition-all duration-300 animate-slide-up">
                <div className="flex items-center justify-between gap-3 pl-2">
                    {showEstimate && estimateDisplay && (
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-tight">{isBuyback ? t('Estimated Value') : t('Total Cost')}</span>
                            <span className="text-lg font-extrabold text-bel-dark dark:text-white leading-tight">{estimateDisplay}</span>
                        </div>
                    )}
                    <button
                        onClick={onNext}
                        disabled={nextDisabled}
                        className={`flex-1 bg-bel-blue text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-blue-500/30 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-base flex items-center justify-center gap-2 transition-all ${!showEstimate || !estimateDisplay ? 'w-full' : ''}`}
                    >
                        <span>{nextLabel || t('Next')}</span>
                        <ChevronRightIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    };

    const renderStep1 = () => (
        <div className="animate-fade-in w-full max-w-4xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                {t(type === 'buyback' ? 'buyback_step1_title' : 'repair_step1_title')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DEVICE_TYPES.map((dt) => (
                    <button
                        key={dt.id}
                        onClick={() => { setDeviceType(dt.id); handleNext(); }}
                        className={`group flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${deviceType === dt.id
                            ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-bel-blue/50'
                            }`}
                    >
                        <div className={`relative w-16 h-16 p-4 rounded-2xl mb-4 transition-all duration-300 ${deviceType === dt.id ? 'bg-bel-blue scale-110 shadow-lg shadow-blue-500/30' : 'bg-transparent'}`}>
                            <Image
                                src={dt.icon as any}
                                alt={t(dt.label)}
                                fill
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
        const brands = (DEVICE_BRANDS as any)[deviceType] || [];
        const nextDisabled = !selectedBrand || !selectedModel;
        const availableModels = modelsData[deviceType] ? Object.keys(modelsData[deviceType]) : [];

        return (
            <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8">
                <div className="flex-1 animate-fade-in">
                    <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">{t('Select Brand & Model')}</h2>

                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">{t('Brand')}</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {brands.map((brand: string) => (
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
                                                alt={`${brand} ${t(type === 'buyback' ? 'Buyback' : 'Repair')}`}
                                                fill
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
                        <div className="mb-8 animate-fade-in">
                            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">{t('Model')}</label>
                            {isLoadingData ? (
                                <div className="flex items-center space-x-2 p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                                    <div className="w-5 h-5 border-2 border-bel-blue border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-500">{t('Loading models...')}</span>
                                </div>
                            ) : (
                                <Select
                                    value={selectedModel}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleModelSelect(e.target.value)}
                                    options={[
                                        { value: "", label: t('Select your model...') },
                                        ...availableModels.map(model => ({ value: model, label: model }))
                                    ]}
                                    className="text-lg font-medium"
                                />
                            )}
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
                <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8">
                    <div className="flex-1 animate-fade-in space-y-8">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('Functionality & Specs')}</h2>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase">{t('Storage')}</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(specsData[selectedModel] || ['64GB', '128GB', '256GB']).map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setStorage(opt)}
                                        className={`py-3 rounded-xl font-bold transition-all ${storage === opt ? 'bg-bel-blue text-white' : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-500 uppercase">{t('Functionality')}</label>
                            {[
                                { label: 'Turns On?', state: turnsOn, setter: setTurnsOn },
                                { label: 'Everything Works?', state: worksCorrectly, setter: setWorksCorrectly },
                                { label: 'Unlocked (No Simlock)?', state: isUnlocked, setter: setIsUnlocked },
                                ...(isAppleSmartphone ? [{ label: 'Face ID Working?', state: faceIdWorking, setter: setFaceIdWorking }] : [])
                            ].map((item, i) => {
                                const isDisabled = turnsOn === false && item.label !== 'Turns On?';
                                return (
                                    <div key={i} className={`flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <span className="font-medium text-gray-900 dark:text-white">{t(item.label)}</span>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => item.setter(true)}
                                                disabled={isDisabled}
                                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border ${item.state === true ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                                            >
                                                {t('Yes')}
                                            </button>
                                            <button
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
                                    <button onClick={() => setBatteryHealth('normal')} disabled={turnsOn === false} className={`py-3 px-4 rounded-xl font-bold transition-all border ${batteryHealth === 'normal' ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}>{t('Normal (Above 80%)')}</button>
                                    <button onClick={() => setBatteryHealth('service')} disabled={turnsOn === false} className={`py-3 px-4 rounded-xl font-bold transition-all border ${batteryHealth === 'service' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}>{t('Service Required (Below 80%)')}</button>
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
            const showScreenOptions = repairIssues.includes('screen') && (deviceType === 'smartphone' || isNintendo);
            const isApple = selectedBrand?.toLowerCase() === 'apple';

            return (
                <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-1 sm:p-4 lg:p-8">
                    <div className="flex-1 animate-fade-in">
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('What needs fixing?')}</h2>
                        <p className="text-gray-500 mb-8">{selectedBrand} {selectedModel}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {REPAIR_ISSUES.filter(issue => {
                                if (issue.devices && !issue.devices.includes(deviceType)) return false;
                                const brand = selectedBrand?.toLowerCase();
                                if (brand === 'nintendo') {
                                    if (issue.id === 'hdmi') return false;
                                    if (issue.id === 'disc') return false;
                                } else {
                                    if (issue.id === 'card_reader') return false;
                                }
                                return true;
                            }).map(issue => {
                                const isSelected = repairIssues.includes(issue.id);
                                const price = getSingleIssuePrice(issue.id);
                                const isScreenIssue = issue.id === 'screen';
                                const showScreenOptionsForIssue = isScreenIssue && isSelected && (deviceType === 'smartphone' || isNintendo);

                                return (
                                    <div key={issue.id} className={`flex flex-col p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900'} ${showScreenOptionsForIssue ? 'md:col-span-2' : ''}`}>
                                        <div className="flex items-center cursor-pointer" onClick={() => toggleRepairIssue(issue.id)}>
                                            <div className={`p-3 rounded-xl mr-4 ${isSelected ? 'bg-bel-blue text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}><issue.icon className="h-6 w-6" /></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <span className={`font-bold ${isSelected ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>{t(issue.label)}</span>
                                                    {price && !showScreenOptionsForIssue && <span className="text-sm font-bold bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">€{price}</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{t(issue.desc)}</p>
                                            </div>
                                            {isSelected && !showScreenOptionsForIssue && <CheckCircleIcon className="h-6 w-6 text-bel-blue ml-2" />}
                                        </div>
                                        {showScreenOptionsForIssue && (
                                            <div className="mt-4 space-y-3 animate-fade-in border-t border-blue-100 dark:border-blue-800 pt-4">
                                                <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedScreenQuality === 'generic' ? 'border-gray-400 bg-white dark:bg-slate-900' : 'border-transparent hover:bg-white/50'}`}>
                                                    <input type="radio" name="screenQuality" value="generic" checked={selectedScreenQuality === 'generic'} onChange={() => setSelectedScreenQuality('generic')} className="w-5 h-5 text-gray-600 focus:ring-gray-500 border-gray-300" />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex justify-between"><span className="font-bold text-gray-900 dark:text-white">{isNintendo ? t('Touchscreen / Glass Only') : t('Generic / LCD')}</span><span className="font-bold text-gray-900 dark:text-white">€{repairEstimates.standard}</span></div>
                                                    </div>
                                                </label>
                                                {(isApple || isNintendo) && (
                                                    <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedScreenQuality === 'oled' ? 'border-blue-500 bg-white dark:bg-slate-900' : 'border-transparent hover:bg-white/50'}`}>
                                                        <input type="radio" name="screenQuality" value="oled" checked={selectedScreenQuality === 'oled'} onChange={() => setSelectedScreenQuality('oled')} className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300" />
                                                        <div className="ml-3 flex-1">
                                                            <div className="flex justify-between"><span className="font-bold text-gray-900 dark:text-white">{isNintendo ? t('Full LCD Assembly') : t('OLED / Soft')}</span><span className="font-bold text-gray-900 dark:text-white">€{repairEstimates.oled}</span></div>
                                                        </div>
                                                    </label>
                                                )}
                                                <label className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedScreenQuality === 'original' ? 'border-purple-500 bg-white dark:bg-slate-900' : 'border-transparent hover:bg-white/50'}`}>
                                                    <input type="radio" name="screenQuality" value="original" checked={selectedScreenQuality === 'original'} onChange={() => setSelectedScreenQuality('original')} className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300" />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex justify-between"><span className="font-bold text-gray-900 dark:text-white">{t('Original Refurb')}</span><span className="font-bold text-gray-900 dark:text-white">€{repairEstimates.original}</span></div>
                                                    </div>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <DesktopSidebar onNext={() => setStep(5)} nextDisabled={nextDisabled} nextLabel={nextLabel} />
                    <MobileBottomBar onNext={() => setStep(5)} nextDisabled={nextDisabled} nextLabel={nextLabel} showEstimate={true} />
                </div>
            );
        }
    };

    const renderStep4 = () => {
        if (type !== 'buyback') return null;
        return (
            <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8">
                <div className="flex-1 animate-fade-in space-y-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('Cosmetic Condition')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase">{t('Screen Condition')}</label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'flawless', label: 'Flawless', desc: 'Like new, no scratches' },
                                    { id: 'scratches', label: 'Light Scratches', desc: 'Visible scratches but no cracks' },
                                    { id: 'cracked', label: 'Cracked / Broken', desc: 'Glass is cracked or display broken' }
                                ].map((s: any) => (
                                    <button key={s.id} onClick={() => setScreenState(s.id)} className={`p-4 rounded-xl border-2 text-left transition-all ${screenState === s.id ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
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
                                ].map((s: any) => (
                                    <button key={s.id} onClick={() => setBodyState(s.id)} className={`p-4 rounded-xl border-2 text-left transition-all ${bodyState === s.id ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
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
        let estimateDisplay = null;
        if (isBuyback) {
            estimateDisplay = buybackEstimate > 0 ? `€${buybackEstimate}` : '-';
        } else {
            if (repairIssues.includes('other')) estimateDisplay = t('Diagnostic');
            else if (repairEstimates.hasScreen) {
                if (selectedScreenQuality === 'original') estimateDisplay = `€${repairEstimates.original}`;
                else if (selectedScreenQuality === 'oled') estimateDisplay = `€${repairEstimates.oled}`;
                else estimateDisplay = `€${repairEstimates.standard}`;
            }
            else estimateDisplay = `€${repairEstimates.standard}`;
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
                    <div className="flex justify-between"><span className="text-gray-500">{t('Device')}</span><span className="font-medium text-gray-900 dark:text-white">{selectedBrand} {selectedModel}</span></div>
                    {isBuyback && storage && (<div className="flex justify-between"><span className="text-gray-500">{t('Storage')}</span><span className="font-medium text-gray-900 dark:text-white">{storage}</span></div>)}
                    {!isBuyback && repairIssues.length > 0 && (<div className="border-t border-gray-100 dark:border-slate-700 pt-2 mt-2">{repairIssues.map(issueId => { const issue = REPAIR_ISSUES.find(i => i.id === issueId); if (!issue) return null; return (<div key={issueId} className="flex justify-between text-gray-900 dark:text-white"><span>{t(issue.label)}</span></div>); })}</div>)}
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
                <div className="animate-fade-in max-w-2xl mx-auto text-center py-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8">
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
                            <button onClick={() => generatePDF(submittedOrder.id, submittedOrder.data)} className="text-bel-blue hover:text-blue-700 underline font-medium">
                                {t('Download Summary PDF')}
                            </button>
                            {submittedOrder.data.shippingLabelUrl && (
                                <a
                                    href={`/api/shipping/download-label?url=${encodeURIComponent(submittedOrder.data.shippingLabelUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 dark:shadow-none"
                                >
                                    <TruckIcon className="h-5 w-5" />
                                    {t('Download Shipping Label')}
                                </a>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto pb-32 lg:pb-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-8">
                <MobileSummary />
                <div className="flex-1 animate-fade-in">
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
                                                    ⚠️ {t('Please select a shop')}
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
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </div>
            {/* SEO Content Section Removed for stability */}
        </div>
    );
};

export default BuybackRepair;
