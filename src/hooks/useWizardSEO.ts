
import { useEffect } from 'react';
import { useLanguage } from './useLanguage';
import { createSlug, slugToDisplayName } from '../utils/slugs';
import { generateSeoMetadata } from '../utils/seo-templates';

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

    useEffect(() => {
        let title = "Belmobile.be";
        const brandName = selectedBrand ? slugToDisplayName(selectedBrand) : '';
        const modelName = selectedModel ? slugToDisplayName(selectedModel) : '';

        // 1. DYNAMIC META TITLE LOGIC
        if (type === 'buyback') {
            if (step === 1) {
                title = t('page_title_sell_device') !== 'page_title_sell_device' ? t('page_title_sell_device') : 'Vendre votre appareil | Belmobile';
            } else if (step === 2 && brandName) {
                // Fallback safe keys
                const sellText = t('Sell') !== 'Sell' ? t('Sell') : 'Vendre';
                const selectText = t('page_title_select_model') !== 'page_title_select_model' ? t('page_title_select_model') : 'Sélectionnez le Modèle';
                title = `${sellText} ${brandName} - ${selectText} | Belmobile`;
            } else if (step === 3 && modelName) {
                const sellText = t('Sell') !== 'Sell' ? t('Sell') : 'Vendre';
                const instantQuote = t('page_title_instant_quote') !== 'page_title_instant_quote' ? t('page_title_instant_quote') : 'Devis Instantané';

                const showPrice = !loading && typeof estimateDisplay === 'number' && estimateDisplay > 0;

                if (showPrice) {
                    if (language === 'nl') {
                        // NL: "iPhone 13 Verkopen voor €140"
                        title = `${brandName} ${modelName} ${sellText} ${t('for')} €${estimateDisplay} | Belmobile`;
                    } else if (language === 'tr') {
                        // TR: "iPhone 13 Sat - €140" (Simplified to avoid complex vowel harmony suffixes like 'unuzu/'ya)
                        title = `${brandName} ${modelName} Sat - €${estimateDisplay} | Belmobile`;
                    } else {
                        // EN/FR: "Sell iPhone 13 for €140"
                        title = `${sellText} ${brandName} ${modelName} ${t('for')} €${estimateDisplay} | Belmobile`;
                    }
                } else {
                    title = `${sellText} ${brandName} ${modelName} - ${instantQuote} | Belmobile`;
                }
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
                if (language === 'nl' || language === 'tr') {
                    title = `${brandName} ${repairText} - ${selectText} | Belmobile`;
                } else {
                    title = `${repairText} ${brandName} - ${selectText} | Belmobile`;
                }
            } else if (step === 3 && modelName) {
                const repairText = t('Repair') !== 'Repair' ? t('Repair') : 'Réparer';
                const diagText = t('page_title_diagnostics') !== 'page_title_diagnostics' ? t('page_title_diagnostics') : 'Diagnostic';
                if (language === 'nl' || language === 'tr') {
                    title = `${brandName} ${modelName} ${repairText} - ${diagText} | Belmobile`;
                } else {
                    title = `${repairText} ${brandName} ${modelName} - ${diagText} | Belmobile`;
                }
            } else if (step >= 4) {
                const confirmText = t('page_title_confirm_repair') !== 'page_title_confirm_repair' ? t('page_title_confirm_repair') : 'Confirmation';
                title = `${confirmText} - ${brandName} ${modelName} | Belmobile`;
            }
        }

        // Apply visual title
        document.title = title;

        // 1.5 DYNAMIC METADATA UPDATE (SSoT via seo-templates)
        // This ensures the <meta name="description"> updates as the user selects devices
        const { description: metaDescText, ogTitle, ogSubtitle } = generateSeoMetadata({
            lang: language as 'fr' | 'nl' | 'en' | 'tr',
            serviceId: type,
            deviceValue: selectedBrand,
            deviceModel: selectedModel,
            deviceCategory: deviceCategory, // Pass category for better templates
            price: (typeof estimateDisplay === 'number' && estimateDisplay > 0) ? estimateDisplay : undefined,
            locationName: undefined // Defaults to Brussels
        });

        // Update Description
        const uiMetaDesc = document.querySelector('meta[name="description"]');
        if (uiMetaDesc && metaDescText) uiMetaDesc.setAttribute('content', metaDescText);

        // Update OG Tags (for sharing mid-flow)
        const uiOgTitle = document.querySelector('meta[property="og:title"]');
        if (uiOgTitle && ogTitle) uiOgTitle.setAttribute('content', ogTitle);

        const uiOgDesc = document.querySelector('meta[property="og:description"]');
        if (uiOgDesc && metaDescText) uiOgDesc.setAttribute('content', metaDescText);

        // 1.5 DYNAMIC METADATA UPDATE (SSoT via seo-templates)
        // ...
    }, [type, step, selectedBrand, selectedModel, deviceCategory, estimateDisplay, loading, t, language]);

    // 1.5 URL SYNCHRONIZATION (Deep Linking)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const langSlug = SERVICE_SLUGS[language]?.[type] || type;
        const baseUrl = `/${language}/${langSlug}`;

        let newPath = baseUrl;

        if (selectedBrand) {
            newPath += `/${createSlug(selectedBrand)}`;

            if (selectedModel) {
                newPath += `/${createSlug(selectedModel)}`;
            }
        } else if (deviceCategory) {
            // If no brand selected, show category in URL (e.g. /fr/rachat/smartphone)
            newPath += `/${createSlug(deviceCategory)}`;
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
