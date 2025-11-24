
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

interface MetaTagsProps {
    title: string;
    description: string;
    imageUrl?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({ title, description, imageUrl }) => {
    const location = useLocation();
    const { language } = useLanguage();
    const productionUrl = 'https://belmobile.be'; 

    const pathWithoutLang = location.pathname.replace(/^\/(en|fr|nl)/, '');
    
    // SEO Fix: Removed '/#' - Canonical should point to the clean URL
    const canonicalUrl = `${productionUrl}${location.pathname}`;

    const getPathForLang = (lang: 'en' | 'fr' | 'nl') => {
        // Simple path translation, can be expanded
        let translatedPath = pathWithoutLang;
        if (lang === 'fr') {
            translatedPath = translatedPath.replace('/products', '/produits').replace('/stores', '/magasins').replace('/contact', '/contactez-nous');
        } else if (lang === 'nl') {
             translatedPath = translatedPath.replace('/products', '/producten').replace('/stores', '/winkels').replace('/contact', '/contacteer-ons');
        }
        return `/${lang}${translatedPath || '/'}`;
    };

    useEffect(() => {
        const hostname = window.location.hostname;
        // Check if we are on the production domain
        const isProduction = hostname === 'belmobile.be' || hostname === 'www.belmobile.be';

        // 1. SEO Safety: If we are on dev, staging, or localhost, tell Google NOT to index this.
        if (!isProduction) {
            updateMetaTag('name', 'robots', 'noindex, nofollow');
            console.debug('SEO: Non-production environment detected. Indexing disabled.');
        } else {
            updateMetaTag('name', 'robots', 'index, follow');
        }

        // 2. Update Title
        document.title = title;

        // 3. Update Meta Description
        updateMetaTag('name', 'description', description);

        // 4. Update Canonical Link (Crucial for avoiding duplicate content penalties)
        updateLinkTag('rel', 'canonical', canonicalUrl);

        // 5. Update Hreflang Links
        // SEO Fix: Removed '/#' from all hreflang links
        updateLinkTag('rel', 'alternate', `${productionUrl}${getPathForLang('en')}`, 'en-BE');
        updateLinkTag('rel', 'alternate', `${productionUrl}${getPathForLang('fr')}`, 'fr-BE');
        updateLinkTag('rel', 'alternate', `${productionUrl}${getPathForLang('nl')}`, 'nl-BE');
        updateLinkTag('rel', 'alternate', `${productionUrl}${getPathForLang('en')}`, 'x-default');

        // 6. Open Graph & Twitter Cards
        updateMetaTag('property', 'og:title', title);
        updateMetaTag('property', 'og:description', description);
        updateMetaTag('property', 'og:url', canonicalUrl);
        updateMetaTag('property', 'og:type', 'website');
        updateMetaTag('property', 'og:site_name', 'Belmobile.be');
        if (imageUrl) {
            updateMetaTag('property', 'og:image', imageUrl);
        }

        updateMetaTag('name', 'twitter:card', 'summary_large_image');
        updateMetaTag('name', 'twitter:title', title);
        updateMetaTag('name', 'twitter:description', description);
        if (imageUrl) {
            updateMetaTag('name', 'twitter:image', imageUrl);
        }

    }, [title, description, canonicalUrl, language, imageUrl, location.pathname]);

    const updateMetaTag = (attr: 'name' | 'property', key: string, value: string) => {
        let element = document.querySelector(`meta[${attr}="${key}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attr, key);
            document.head.appendChild(element);
        }
        element.setAttribute('content', value);
    };

    const updateLinkTag = (attr: string, key: string, href: string, hreflang?: string) => {
        let selector = `link[${attr}="${key}"]`;
        if (hreflang) {
             selector += `[hreflang="${hreflang}"]`;
        }
        let element = document.querySelector(selector);
        if (!element) {
            element = document.createElement('link');
            element.setAttribute(attr, key);
            if (hreflang) {
                 element.setAttribute('hreflang', hreflang);
            }
            document.head.appendChild(element);
        }
        element.setAttribute('href', href);
    };


    return null; // This component does not render anything visual
};

export default MetaTags;
