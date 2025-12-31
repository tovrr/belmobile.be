'use client';

import { useCallback, useEffect, useRef, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWizard } from '../context/WizardContext';
import { createSlug } from '../utils/slugs';
import { findDefaultBrandCategory } from '../utils/deviceLogic';
import { useLanguage } from './useLanguage';
import { orderService } from '../services/orderService';
import { useData } from './useData';
import { calculateBuybackPriceShared, calculateRepairPriceShared } from '../utils/pricingLogic';
import * as Sentry from "@sentry/nextjs";

const BRAND_DATA_CACHE = new Set<string>();

export const useWizardActions = (type: 'buyback' | 'repair') => {
    const { state, dispatch } = useWizard();
    const router = useRouter();
    const { language: lang, t } = useLanguage();
    const { sendEmail } = useData();
    const [isPending, startTransition] = useTransition();

    const getLocalizedTypeSlug = useCallback((currentType: 'buyback' | 'repair') => {
        if (currentType === 'repair') {
            if (lang === 'fr') return 'reparation';
            if (lang === 'nl') return 'reparatie';
            return 'repair';
        } else {
            if (lang === 'fr') return 'rachat';
            if (lang === 'nl') return 'inkoop';
            return 'buyback';
        }
    }, [lang]);

    const typeSlug = getLocalizedTypeSlug(type);

    const handleNext = useCallback(() => {
        const isLastStep = (type === 'buyback' && state.step === 5) || (type === 'repair' && state.step === 4);

        if (!isLastStep) {
            Sentry.addBreadcrumb({
                category: "wizard",
                message: `User advanced to step ${state.step + 1}`,
                level: "info",
                data: { fromStep: state.step, toStep: state.step + 1 }
            });
            dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: true } });
            setTimeout(() => {
                dispatch({ type: 'SET_STEP', payload: state.step + 1 });
                dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: false } });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
        }
    }, [dispatch, state.step, type]);

    const handleBack = useCallback(() => {
        if (state.step > 1) {
            dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: true } });

            setTimeout(() => {
                const newStep = state.step - 1;
                dispatch({ type: 'SET_STEP', payload: newStep });

                Sentry.addBreadcrumb({
                    category: "wizard",
                    message: `User navigated back to step ${newStep}`,
                    level: "info",
                    data: { currentStep: state.step, newStep: newStep },
                });

                if (newStep === 1) {
                    dispatch({ type: 'SET_DEVICE_INFO', payload: { deviceType: '', selectedBrand: '', selectedModel: '' } });
                    router.push(`/${lang}/${typeSlug}`);
                } else if (newStep === 2) {
                    dispatch({ type: 'SET_DEVICE_INFO', payload: { selectedModel: '' } });

                    const brandSlug = createSlug(state.selectedBrand);
                    const defaultMatch = findDefaultBrandCategory(brandSlug);
                    const defaultCategory = defaultMatch?.deviceType;
                    const isImplicit = state.deviceType === defaultCategory;

                    if (!isImplicit && state.deviceType) {
                        router.push(`/${lang}/${typeSlug}/${state.deviceType}/${brandSlug}`);
                    } else {
                        router.push(`/${lang}/${typeSlug}/${brandSlug}`);
                    }
                }

                setTimeout(() => {
                    dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: false } });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            }, 300);
        }
    }, [dispatch, state.step, state.selectedBrand, state.deviceType, router, lang, typeSlug]);

    const handleCategorySelect = useCallback((category: string) => {
        Sentry.addBreadcrumb({
            category: "wizard",
            message: `User selected category: ${category}`,
            level: "info",
        });
        dispatch({ type: 'SET_DEVICE_INFO', payload: { deviceType: category } });
        dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: true } });

        startTransition(() => {
            // Push to /reparation/smartphone etc.
            router.push(`/${lang}/${typeSlug}/${category}`);
        });
    }, [dispatch, lang, typeSlug, router]);

    const handleBrandSelect = useCallback((brand: string, categoryOverride?: string) => {
        Sentry.addBreadcrumb({
            category: "wizard",
            message: `User selected brand: ${brand}`,
            level: "info",
        });
        const category = categoryOverride || state.deviceType;
        dispatch({ type: 'SET_DEVICE_INFO', payload: { selectedBrand: brand, selectedModel: '' } });

        startTransition(() => {
            const brandSlug = createSlug(brand);
            // Enhanced Routing: Use /category/brand for multi-category brands to avoid ambiguity
            const isMultiCategory = ['apple', 'samsung'].includes(brandSlug);
            const isDefaultCategory = category === 'smartphone';

            if (isMultiCategory && !isDefaultCategory && category) {
                // e.g. /reparation/tablet/apple
                router.push(`/${lang}/${typeSlug}/${category}/${brandSlug}`, { scroll: false });
            } else {
                // Standard: /reparation/apple
                router.push(`/${lang}/${typeSlug}/${brandSlug}`, { scroll: false });
            }
        });
    }, [dispatch, lang, typeSlug, state.deviceType, router]);

    const handleModelSelect = useCallback(async (model: string) => {
        Sentry.addBreadcrumb({
            category: "wizard",
            message: `User selected model: ${model}`,
            level: "info",
            data: { modelName: model },
        });

        // IMMEDIATE: Set transitioning to hide sidebar price update glitch
        dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: true } });

        dispatch({ type: 'SET_DEVICE_INFO', payload: { selectedModel: model } });
        dispatch({ type: 'SET_UI_STATE', payload: { isInitialized: false } });

        const slug = createSlug(`${state.selectedBrand} ${model}`);
        if (state.pricingData.loadedForModel !== slug) {
            dispatch({ type: 'SET_PRICING_DATA', payload: { isLoading: true } });
            try {
                const { pricingService } = await import('../services/pricingService');
                const data = await pricingService.fetchDevicePricing(slug);
                dispatch({
                    type: 'SET_PRICING_DATA',
                    payload: {
                        repairPrices: data.repairPrices,
                        buybackPrices: data.buybackPrices,
                        deviceImage: data.deviceImage,
                        isLoading: false,
                        loadedForModel: slug
                    }
                });
            } catch (err) {
                console.error("Pricing fetch failed", err);
                dispatch({ type: 'SET_PRICING_DATA', payload: { isLoading: false } });
            }
        }

        startTransition(() => {
            const key = `buyback_state_${createSlug(state.selectedBrand)}_${createSlug(model)}`;
            localStorage.removeItem(key);

            const brandSlug = createSlug(state.selectedBrand);
            const modelSlug = createSlug(model);

            const defaultMatch = findDefaultBrandCategory(brandSlug);
            const defaultCategory = defaultMatch?.deviceType;
            const isImplicit = state.deviceType === defaultCategory;

            if (!isImplicit && state.deviceType) {
                // Explicit: /reparation/laptop/samsung/galaxy-book3-pro
                router.push(`/${lang}/${typeSlug}/${state.deviceType}/${brandSlug}/${modelSlug}`, { scroll: false });
            } else {
                // Implicit: /reparation/samsung/galaxy-s23
                router.push(`/${lang}/${typeSlug}/${brandSlug}/${modelSlug}`, { scroll: false });
            }

            if (state.step < 3) dispatch({ type: 'SET_STEP', payload: 3 });
        });
    }, [dispatch, state.selectedBrand, state.deviceType, state.step, state.pricingData.loadedForModel, lang, typeSlug, router]);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            Sentry.addBreadcrumb({
                category: "wizard",
                message: "User initiated order submission",
                level: "info",
                data: { brand: state.selectedBrand, model: state.selectedModel, type }
            });

            dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: true } });

            const pricingParams = {
                ...state,
                type,
                brand: state.selectedBrand,
                model: state.selectedModel
            };

            const price = type === 'buyback'
                ? calculateBuybackPriceShared(pricingParams, state.pricingData)
                : calculateRepairPriceShared(pricingParams, state.pricingData);

            const { readableId, firestoreData } = await orderService.submitOrder({
                ...state,
                type,
                price,
                condition: type === 'buyback' ? { screen: state.screenState, body: state.bodyState } : null,
                issues: type === 'repair' ? state.repairIssues : null,
                language: lang || 'fr',
                brand: state.selectedBrand,
                model: state.selectedModel,
                isCompany: state.isCompany,
                companyName: state.companyName,
                vatNumber: state.vatNumber,
                partnerId: state.partnerId
            }, t);

            // 4. Redirect Immediately to Success Page
            // The emails are now handled server-side in the /api/orders/submit route
            // to avoid race conditions during navigation.
            const emailParam = encodeURIComponent(state.customerEmail);
            router.push(`/${lang}/track-order?id=${readableId}&email=${emailParam}&success=true`);

        } catch (error: any) {
            console.error('Submission error:', error);
            alert(t('error_submitting_order'));
            dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: false } });
        }
        // Note: isTransitioning is NOT set to false in finally because we want the spinner 
        // to persist until the next page (TrackOrder) loads and takes over.
    }, [dispatch, state, type, lang, t, sendEmail, router]);

    const loadBrandData = useCallback(async (brandSlug: string) => {
        if (loadedBrandRef.current === brandSlug) return;
        loadedBrandRef.current = brandSlug;

        const shouldShowLoading = !BRAND_DATA_CACHE.has(brandSlug);
        if (shouldShowLoading) {
            dispatch({ type: 'SET_UI_STATE', payload: { isLoadingData: true } });
        }

        try {
            const brandModule = await import(`../data/models/${brandSlug}`);
            if (brandModule && brandModule.MODELS) {
                BRAND_DATA_CACHE.add(brandSlug);
                dispatch({ type: 'SET_DEVICE_INFO', payload: { modelsData: brandModule.MODELS, specsData: brandModule.SPECS || {} } as any });
            }
        } catch (error) {
            console.error(`Failed to load data for ${brandSlug}:`, error);
            loadedBrandRef.current = null;
        } finally {
            if (shouldShowLoading) {
                dispatch({ type: 'SET_UI_STATE', payload: { isLoadingData: false } });
            }
        }
    }, [dispatch]);

    const loadedBrandRef = useRef<string | null>(null);

    return {
        handleNext,
        handleBack,
        handleSubmit,
        handleBrandSelect,
        handleModelSelect,
        handleCategorySelect,
        loadBrandData,
        typeSlug,
        isPending
    };
};
