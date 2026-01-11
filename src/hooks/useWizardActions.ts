'use client';

import { useCallback, useEffect, useRef, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWizard } from '../context/WizardContext';
import { createSlug } from '../utils/slugs';
import { findDefaultBrandCategory } from '../utils/deviceLogic';
import { useLanguage } from './useLanguage';
import { orderService } from '../services/orderService';
import { useData } from './useData';
import { useShop } from './useShop';
import * as Sentry from "@sentry/nextjs";
import { sendGAEvent } from '../utils/analytics';
import { useToast } from '../components/ui/Toast';

const BRAND_DATA_CACHE = new Set<string>();

export const useWizardActions = (type: 'buyback' | 'repair') => {
    const { state, dispatch } = useWizard();
    const { selectedShop } = useShop();
    const router = useRouter();
    const { language: lang, t } = useLanguage();
    const { sendEmail } = useData();
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();

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

            // AEGIS: Track step progression for marketing funnel
            sendGAEvent({
                action: 'wizard_step_advance',
                category: 'Wizard',
                label: `${type} - Step ${state.step + 1}`,
                value: state.step + 1
            });

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
                    if (!state.isKiosk) router.push(`/${lang}/${typeSlug}`);
                } else if (newStep === 2) {
                    dispatch({ type: 'SET_DEVICE_INFO', payload: { selectedModel: '' } });

                    const brandSlug = createSlug(state.selectedBrand);
                    const defaultMatch = findDefaultBrandCategory(brandSlug);
                    const defaultCategory = defaultMatch?.deviceType;
                    const isImplicit = state.deviceType === defaultCategory;

                    if (!isImplicit && state.deviceType) {
                        if (!state.isKiosk) router.push(`/${lang}/${typeSlug}/${state.deviceType}/${brandSlug}`);
                    } else {
                        if (!state.isKiosk) router.push(`/${lang}/${typeSlug}/${brandSlug}`);
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

        // AEGIS: Analytics - Category selection
        sendGAEvent({
            action: 'select_category',
            category: 'Wizard',
            label: `${type} - ${category}`
        });

        dispatch({ type: 'SET_DEVICE_INFO', payload: { deviceType: category } });
        dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: true } });

        startTransition(() => {
            // Push to /reparation/smartphone etc.
            if (!state.isKiosk) router.push(`/${lang}/${typeSlug}/${category}`);
            // Explicitly advance to Step 2 (Device Selection) as Provider might not re-init on soft nav
            dispatch({ type: 'SET_STEP', payload: 2 });
            dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: false } });
        });
    }, [dispatch, lang, typeSlug, router]);

    const handleBrandSelect = useCallback((brand: string, categoryOverride?: string) => {
        Sentry.addBreadcrumb({
            category: "wizard",
            message: `User selected brand: ${brand}`,
            level: "info",
        });

        // AEGIS: Analytics - Brand selection
        sendGAEvent({
            action: 'select_brand',
            category: 'Wizard',
            label: `${type} - ${brand}`
        });

        const category = categoryOverride || state.deviceType;
        dispatch({ type: 'SET_DEVICE_INFO', payload: { selectedBrand: brand, selectedModel: '' } });
        dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: true } });

        startTransition(() => {
            const brandSlug = createSlug(brand);
            // Enhanced Routing: Use /category/brand for multi-category brands to avoid ambiguity
            const isMultiCategory = ['apple', 'samsung'].includes(brandSlug);
            const isDefaultCategory = category === 'smartphone';

            if (isMultiCategory && !isDefaultCategory && category) {
                // e.g. /reparation/tablet/apple
                if (!state.isKiosk) router.push(`/${lang}/${typeSlug}/${category}/${brandSlug}`, { scroll: false });
            } else {
                // Standard: /reparation/apple
                if (!state.isKiosk) router.push(`/${lang}/${typeSlug}/${brandSlug}`, { scroll: false });
            }
            dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: false } });
        });
    }, [dispatch, lang, typeSlug, state.deviceType, router]);

    const handleModelSelect = useCallback(async (model: string) => {
        Sentry.addBreadcrumb({
            category: "wizard",
            message: `User selected model: ${model}`,
            level: "info",
            data: { modelName: model },
        });

        // AEGIS: Analytics - Model selection
        sendGAEvent({
            action: 'select_model',
            category: 'Wizard',
            label: `${type} - ${state.selectedBrand} ${model}`
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
                if (!state.isKiosk) router.push(`/${lang}/${typeSlug}/${state.deviceType}/${brandSlug}/${modelSlug}`, { scroll: false });
            } else {
                // Implicit: /reparation/samsung/galaxy-s23
                if (!state.isKiosk) router.push(`/${lang}/${typeSlug}/${brandSlug}/${modelSlug}`, { scroll: false });
            }

            if (state.step < 3) dispatch({ type: 'SET_STEP', payload: 3 });

            // AEGIS: Reset transitioning after a small delay to allow UI to catch up
            setTimeout(() => {
                dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: false } });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
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

            // Start Submission Feedback
            dispatch({ type: 'SET_UI_STATE', payload: { isSubmitting: true } });

            // Use Server-Calculated Estimate (SSOT) instead of client-side math
            const price = state.currentEstimate;

            // AEGIS: Analytics - Track conversion (Lead Generation)
            const { trackRepairRequest, trackBuybackRequest } = await import('../utils/analytics');
            if (type === 'repair') {
                trackRepairRequest(`${state.selectedBrand} ${state.selectedModel}`, state.repairIssues.join(', '), price);
            } else {
                trackBuybackRequest(`${state.selectedBrand} ${state.selectedModel}`, state.screenState || 'unknown', price);
            }

            const { readableId, firestoreData, trackingToken } = await orderService.submitOrder({
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
                partnerId: state.partnerId,
                deviceType: state.deviceType || 'smartphone',
                shopId: selectedShop?.id || 'online'
            }, t);

            if (state.isKiosk) {
                dispatch({ type: 'SET_WIZARD_DATA', payload: { kioskSuccessData: { readableId } } });
                dispatch({ type: 'SET_UI_STATE', payload: { isSubmitting: false } });
                return;
            }

            // 4. Redirect Immediately to Success Page
            // The emails are now handled server-side in the /api/orders/submit route
            // to avoid race conditions during navigation.
            const emailParam = encodeURIComponent(state.customerEmail);
            router.push(`/${lang}/track-order?id=${readableId}&token=${trackingToken || ''}&email=${emailParam}&success=true`);

        } catch (error: any) {
            console.error('Submission error:', error);
            console.error('Submission error:', error);
            showToast('error', t('error_submitting_order'), t('please_try_again'));
            dispatch({ type: 'SET_UI_STATE', payload: { isSubmitting: false } });
        }
        // Note: isTransitioning is NOT set to false in finally because we want the spinner 
        // to persist until the next page (TrackOrder) loads and takes over.
    }, [dispatch, state, type, lang, t, sendEmail, router, selectedShop]);

    const loadBrandData = useCallback(async (brandSlug: string) => {
        if (loadedBrandRef.current === brandSlug) return;

        // GUARD: Prevent loading categories as brands (Fix for console-portable route issue)
        // We use technical slugs (English) internally, so this covers all languages.
        const categorySlugs = [
            'smartphone', 'smartphones',
            'tablet', 'tablets',
            'laptop', 'laptops',
            'smartwatch', 'smartwatches',
            'console', 'consoles',
            'console-home',
            'console-portable'
        ];

        if (categorySlugs.includes(brandSlug)) {
            console.warn(`[useWizardActions] Attempted to load category '${brandSlug}' as a brand. Aborting.`);
            return;
        }

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
