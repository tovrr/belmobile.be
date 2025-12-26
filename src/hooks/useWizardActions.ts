'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWizard } from '../context/WizardContext';
import { createSlug } from '../utils/slugs';
import { useLanguage } from './useLanguage';

export const useWizardActions = (type: 'buyback' | 'repair') => {
    const { state, dispatch } = useWizard();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { language: lang } = useLanguage();

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

                if (newStep === 1) {
                    dispatch({ type: 'SET_DEVICE_INFO', payload: { deviceType: '', selectedBrand: '', selectedModel: '' } });
                    router.push(`/${lang}/${typeSlug}`);
                } else if (newStep === 2) {
                    dispatch({ type: 'SET_DEVICE_INFO', payload: { selectedModel: '' } });
                    router.push(`/${lang}/${typeSlug}/${createSlug(state.selectedBrand)}?category=${state.deviceType}`);
                }

                setTimeout(() => {
                    dispatch({ type: 'SET_UI_STATE', payload: { isTransitioning: false } });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            }, 300);
        }
    }, [dispatch, state.step, state.selectedBrand, state.deviceType, router, lang, typeSlug]);

    const handleBrandSelect = useCallback((brand: string) => {
        dispatch({ type: 'SET_DEVICE_INFO', payload: { selectedBrand: brand, selectedModel: '' } });
        router.push(`/${lang}/${typeSlug}/${createSlug(brand)}?category=${state.deviceType}`, { scroll: false });
    }, [dispatch, lang, typeSlug, state.deviceType, router]);

    const handleModelSelect = useCallback((model: string) => {
        dispatch({ type: 'SET_DEVICE_INFO', payload: { selectedModel: model } });
        dispatch({ type: 'SET_UI_STATE', payload: { isInitialized: false } });

        setTimeout(() => {
            const key = `buyback_state_${createSlug(state.selectedBrand)}_${createSlug(model)}`;
            localStorage.removeItem(key);
            router.push(`/${lang}/${typeSlug}/${createSlug(state.selectedBrand)}/${createSlug(model)}?category=${state.deviceType}`);
            if (state.step < 3) dispatch({ type: 'SET_STEP', payload: 3 });
        }, 100);
    }, [dispatch, state.selectedBrand, state.deviceType, state.step, lang, typeSlug, router]);

    // Brand data loading logic
    const loadedBrandRef = useRef<string | null>(null);
    const loadBrandData = useCallback(async (brandSlug: string) => {
        if (loadedBrandRef.current === brandSlug) return;
        loadedBrandRef.current = brandSlug;
        dispatch({ type: 'SET_UI_STATE', payload: { isLoadingData: true } });

        try {
            const brandModule = await import(`../data/models/${brandSlug}`);
            if (brandModule && brandModule.MODELS) {
                // This would normally be handled by a local models state, 
                // but we'll add it to the context if we want to be fully centralized.
                // For now, let's assume WizardContext handles it.
                dispatch({ type: 'SET_DEVICE_INFO', payload: { modelsData: brandModule.MODELS, specsData: brandModule.SPECS || {} } as any });
            }
        } catch (error) {
            console.error(`Failed to load data for ${brandSlug}:`, error);
            loadedBrandRef.current = null;
        } finally {
            dispatch({ type: 'SET_UI_STATE', payload: { isLoadingData: false } });
        }
    }, [dispatch]);

    return {
        handleNext,
        handleBack,
        handleBrandSelect,
        handleModelSelect,
        loadBrandData,
        typeSlug
    };
};
