
import { useEffect } from 'react';
import { useLanguage } from './useLanguage';
import { createSlug, slugToDisplayName } from '../utils/slugs';
import { generateSeoMetadata } from '../utils/seo-templates';

import { useWizard } from '../context/WizardContext';

// Define slugs matching sitemap.ts
const SERVICE_SLUGS: Record<string, { buyback: string; repair: string }> = {
    en: { buyback: 'buyback', repair: 'repair' },
    fr: { buyback: 'rachat', repair: 'reparation' },
    nl: { buyback: 'inkoop', repair: 'reparatie' },
    tr: { buyback: 'geri-alim', repair: 'onarim' }
};

interface UseWizardSEOProps {
    type: 'buyback' | 'repair';
    step: number;
    selectedBrand?: string;
    selectedModel?: string;
    deviceCategory?: string; // Added category support
    estimateDisplay?: number | string | null;
    loading?: boolean;
}

export const useWizardSEO = ({
    type,
    step,
    selectedBrand,
    selectedModel,
    deviceCategory,
    estimateDisplay,
    loading
}: UseWizardSEOProps) => {
    const { t, language } = useLanguage();
    const { state } = useWizard();

    useEffect(() => {
        let title = "Belmobile.be";
        const brandName = selectedBrand ? slugToDisplayName(selectedBrand) : '';
        const modelName = selectedModel ? slugToDisplayName(selectedModel) : '';

        // --- 1. SSoT PRICING CALCULATIONS ---
        const currentBuybackPrices = (state as any).pricingData?.buybackPrices || [];
        let maxAvailablePrice = 0;
        if (Array.isArray(currentBuybackPrices) && currentBuybackPrices.length > 0) {
            // Filter out 'new' to show realistic used buyback quotes (match pricing.dal.ts)
            const validPrices = currentBuybackPrices
                .filter((p: any) => p.condition !== 'new' && typeof p.price === 'number')
                .map((p: any) => p.price);
            if (validPrices.length > 0) maxAvailablePrice = Math.max(...validPrices);
        }

        const effectivePrice = maxAvailablePrice > 0
            ? maxAvailablePrice
            : (typeof estimateDisplay === 'number' && estimateDisplay > 0 ? estimateDisplay : undefined);

        // --- 2. GENERATE SSoT METADATA ---
        const { title: seoTitle, description: metaDescText, ogTitle, ogSubtitle } = generateSeoMetadata({
            lang: language as 'fr' | 'nl' | 'en' | 'tr',
            serviceId: type,
            deviceValue: selectedBrand,
            deviceModel: selectedModel,
            deviceCategory: deviceCategory,
            price: effectivePrice,
            locationName: undefined
        });

        // --- 3. APPLY TITLE LOGIC (Wizard Context) ---
        if (type === 'buyback') {
            if (step === 1) {
                title = t('page_title_sell_device') !== 'page_title_sell_device' ? t('page_title_sell_device') : 'Vendre votre appareil | Belmobile';
            } else if (step === 2 && brandName) {
                const sellText = t('Sell') !== 'Sell' ? t('Sell') : 'Vendre';
                const selectText = t('page_title_select_model') !== 'page_title_select_model' ? t('page_title_select_model') : 'Sélectionnez le Modèle';
                title = `${sellText} ${brandName} - ${selectText} | Belmobile`;
            } else if (step === 3 && modelName) {
                // SSoT: Use exactly what Google sees for the model landing page
                title = seoTitle;
            } else if (step >= 4) {
                const confirmText = t('page_title_confirm_sale') !== 'page_title_confirm_sale' ? t('page_title_confirm_sale') : 'Confirmation';
                title = `${confirmText} - ${brandName} ${modelName} | Belmobile`;
            }
        } else {
            // Repair Flow
            if (step === 1) {
                title = t('page_title_repair_book') !== 'page_title_repair_book' ? t('page_title_repair_book') : 'Réparation Service 30 Min';
            } else if (step === 2 && brandName) {
                const repairText = t('Repair') !== 'Repair' ? t('Repair') : 'Réparer';
                const selectText = t('page_title_select_model') !== 'page_title_select_model' ? t('page_title_select_model') : 'Modèle';
                title = (language === 'nl' || language === 'tr') ? `${brandName} ${repairText} - ${selectText} | Belmobile` : `${repairText} ${brandName} - ${selectText} | Belmobile`;
            } else if (step === 3 && modelName) {
                title = seoTitle;
            } else if (step >= 4) {
                const confirmText = t('page_title_confirm_repair') !== 'page_title_confirm_repair' ? t('page_title_confirm_repair') : 'Confirmation';
                title = `${confirmText} - ${brandName} ${modelName} | Belmobile`;
            }
        }

        // Apply visual and meta updates
        document.title = title;

        const uiMetaDesc = document.querySelector('meta[name="description"]');
        if (uiMetaDesc && metaDescText) uiMetaDesc.setAttribute('content', metaDescText);

        const uiOgTitle = document.querySelector('meta[property="og:title"]');
        if (uiOgTitle && ogTitle) uiOgTitle.setAttribute('content', ogTitle);

        const uiOgDesc = document.querySelector('meta[property="og:description"]');
        if (uiOgDesc && metaDescText) uiOgDesc.setAttribute('content', metaDescText);

    }, [type, step, selectedBrand, selectedModel, deviceCategory, estimateDisplay, loading, t, language, state.pricingData.buybackPrices]);

    // 1.5 URL SYNCHRONIZATION (Deep Linking)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const langSlug = SERVICE_SLUGS[language]?.[type] || type;
        const baseUrl = `/${language}/${langSlug}`;

        let newPath = baseUrl;

        if (deviceCategory && deviceCategory !== 'smartphone') {
            // e.g. /fr/rachat/tablet
            newPath += `/${createSlug(t(deviceCategory) || deviceCategory)}`;
        }

        if (selectedBrand) {
            newPath += `/${createSlug(selectedBrand)}`;

            if (selectedModel) {
                newPath += `/${createSlug(selectedModel)}`;
            }
        }

        // Only update if path changed
        if (window.location.pathname !== newPath.toLowerCase()) {
            window.history.replaceState(null, '', newPath.toLowerCase());
        }

    }, [type, selectedBrand, selectedModel, deviceCategory, language]);

    // 2. SCHEMA GENERATION
    const generateSchema = () => {
        const brandName = selectedBrand ? slugToDisplayName(selectedBrand) : '';
        const modelName = selectedModel ? slugToDisplayName(selectedModel) : '';
        const langSlug = SERVICE_SLUGS[language]?.[type] || type;

        // Breadcrumbs
        const breadcrumbList = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": `https://belmobile.be/${language}`
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": type === 'buyback' ? t('Buyback') : t('Repair'),
                    "item": `https://belmobile.be/${language}/${langSlug}`
                },
                ...(brandName ? [{
                    "@type": "ListItem",
                    "position": 3,
                    "name": brandName,
                    "item": `https://belmobile.be/${language}/${langSlug}/${selectedBrand?.toLowerCase()}`
                }] : []),
                ...(modelName ? [{
                    "@type": "ListItem",
                    "position": 4,
                    "name": modelName,
                    "item": `https://belmobile.be/${language}/${langSlug}/${selectedBrand?.toLowerCase()}/${selectedModel?.toLowerCase().replace(/\s+/g, '-')}`
                }] : [])
            ]
        };

        // SoftwareApplication
        const softwareApp = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": type === 'buyback' ? "Belmobile Buyback Wizard" : "Belmobile Repair Booking",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
            }
        };

        return { breadcrumbList, softwareApp };
    };

    return generateSchema();
};
