
import React, { useEffect } from 'react';
import { LEGACY_URL_MAP } from '../utils/legacyUrlMap';
import { DEVICE_CATALOG } from '../constants';

/**
 * SEOMigrationHandler
 * 
 * Acts as a traffic controller for legacy URLs.
 * 1. Checks explicit mappings in LEGACY_URL_MAP.
 * 2. Performs "Smart Matching" for repair pages based on keywords.
 * 3. Uses window.location.replace to swap the URL cleanly.
 */
const SEOMigrationHandler: React.FC = () => {

    useEffect(() => {
        // 1. Get the current path from the browser
        const rawPath = window.location.pathname;
        
        // If we are at root, or specifically on the admin panel, do nothing.
        // This explicitly protects your admin access.
        if (rawPath === '/' || rawPath === '/index.html' || rawPath.startsWith('/admin')) return;

        // Clean the path: decode accents, remove ALL trailing slashes
        let cleanPath = decodeURIComponent(rawPath).replace(/\/+$/, "");
        
        // If path became empty after strip, it was just root, so return
        if (cleanPath === '') return;

        console.log(`[SEO Migration] Intercepted Path: ${cleanPath}`);

        // 2. STRATEGY A: Explicit Exact Match
        if (LEGACY_URL_MAP[cleanPath]) {
            const targetRoute = LEGACY_URL_MAP[cleanPath];
            console.log(`[SEO Migration] Explicit Redirect found: ${targetRoute}`);
            
            // Construct full URL
            const newUrl = `${window.location.origin}${targetRoute}`;
            window.location.replace(newUrl);
            return;
        }

        // 3. STRATEGY B: Smart Model Detection (Fuzzy Matching)
        // Example: /pages/reparation-ecran-iphone-13-pro -> matches "iphone 13 pro"
        const normalizedPath = cleanPath.toLowerCase().replace(/[-_]/g, ' '); 

        let foundMatch = false;

        // Iterate over catalog to find deep link matches
        Object.entries(DEVICE_CATALOG).some(([category, brands]) => {
            return Object.entries(brands).some(([brand, models]) => {
                return Object.keys(models).some(model => {
                    const normalizedModel = model.toLowerCase();
                    
                    // Heuristic: Check if URL contains the full model name
                    if (normalizedPath.includes(normalizedModel)) {
                        
                        // Determine intent: Buyback (vendre/sell) or Repair (reparation/repair)?
                        const isBuyback = normalizedPath.includes('vendre') || normalizedPath.includes('sell') || normalizedPath.includes('rachat');
                        const action = isBuyback ? 'buyback' : 'repair';

                        // Construct Destination
                        const target = `/fr/${action}?device=${category}&brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`;
                        
                        console.log(`[SEO Migration] Smart Redirect found: ${target}`);
                        const newUrl = `${window.location.origin}${target}`;
                        window.location.replace(newUrl);
                        foundMatch = true;
                        return true;
                    }
                    return false;
                });
            });
        });

        if (foundMatch) return;

        // 4. STRATEGY C: Fallback for Collections/Pages/Blogs
        // If it looks like a Shopify path but wasn't matched above, send to a safe landing page
        if (cleanPath.startsWith('/pages/') || cleanPath.startsWith('/collections/') || cleanPath.startsWith('/products/') || cleanPath.startsWith('/blogs/') || cleanPath.startsWith('/articles/')) {
             console.log(`[SEO Migration] Catch-all fallback triggered.`);
             
             // Default fallback
             let fallbackUrl = `${window.location.origin}/fr/products`;

             // Smart fallback based on keywords
             if (normalizedPath.includes('reparation') || normalizedPath.includes('repair') || normalizedPath.includes('ecran') || normalizedPath.includes('batterie')) {
                 fallbackUrl = `${window.location.origin}/fr/repair`;
             } else if (normalizedPath.includes('rachat') || normalizedPath.includes('vendre') || normalizedPath.includes('sell')) {
                 fallbackUrl = `${window.location.origin}/fr/buyback`;
             } else if (normalizedPath.includes('contact')) {
                 fallbackUrl = `${window.location.origin}/fr/contact`;
             } else if (normalizedPath.includes('blog') || normalizedPath.includes('news') || normalizedPath.includes('article')) {
                 fallbackUrl = `${window.location.origin}/fr/blog`;
             }

             window.location.replace(fallbackUrl);
        }

    }, []);

    return null;
};

export default SEOMigrationHandler;
    