'use client';

import React, { useEffect } from 'react';
import { LEGACY_URL_MAP } from '../utils/legacyUrlMap';
import { SEARCH_INDEX } from '../data/search-index';
import { createSlug } from '../utils/slugs';

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
        // 1. Get the current path from the browser (ignoring the hash)
        const rawPath = window.location.pathname;

        // If we are at root, do nothing (React Router handles the Hash part)
        if (rawPath === '/' || rawPath === '/index.html') return;

        // Clean the path: decode accents, remove trailing slash
        let cleanPath = decodeURIComponent(rawPath);
        if (cleanPath.endsWith('/') && cleanPath.length > 1) {
            cleanPath = cleanPath.slice(0, -1);
        }

        console.log(`[SEO Migration] Intercepted Path: ${cleanPath}`);

        // 2. STRATEGY A: Explicit Exact Match
        if (LEGACY_URL_MAP[cleanPath]) {
            const targetRoute = LEGACY_URL_MAP[cleanPath];
            console.log(`[SEO Migration] Explicit Redirect found: ${targetRoute}`);

            // Construct full URL (Clean URL for BrowserRouter)
            const newUrl = `${window.location.origin}${targetRoute}`;
            window.location.replace(newUrl);
            return;
        }


        // 3. STRATEGY B: Smart Model Detection (Fuzzy Matching)
        // Example: /pages/reparation-ecran-iphone-13-pro -> matches "iphone 13 pro"
        const normalizedPath = cleanPath.toLowerCase().replace(/[-_]/g, ' ');

        let foundMatch = false;

        // Iterate over SEARCH_INDEX to find matches
        // SEARCH_INDEX keys are slugs like 'iphone-13-pro'
        // We check if the normalized path contains the model slug (normalized)

        // Optimization: Sort keys by length descending to match longest model names first
        // (e.g. match "iPhone 13 Pro" before "iPhone 13")
        const sortedKeys = Object.keys(SEARCH_INDEX).sort((a, b) => b.length - a.length);

        for (const slug of sortedKeys) {
            // Convert slug to space-separated for matching against normalized path
            // e.g. 'iphone-13-pro' -> 'iphone 13 pro'
            const normalizedSlug = slug.replace(/-/g, ' ');

            if (normalizedPath.includes(normalizedSlug)) {
                const match = SEARCH_INDEX[slug];

                // Determine intent
                const isBuyback = normalizedPath.includes('vendre') ||
                    normalizedPath.includes('sell') ||
                    normalizedPath.includes('rachat') ||
                    normalizedPath.includes('verkopen') ||
                    normalizedPath.includes('inkoop') ||
                    normalizedPath.includes('overname');

                const action = isBuyback ? 'buyback' : 'repair';

                // Detect language
                const langMatch = cleanPath.match(/^\/(nl|en|fr)\//);
                const detectedLang = langMatch ? langMatch[1] : 'fr';

                // Construct Destination
                const target = `/${detectedLang}/${action}/${createSlug(match.brand)}/${createSlug(match.model)}?category=${match.category}`;

                console.log(`[SEO Migration] Smart Redirect found: ${target}`);
                const newUrl = `${window.location.origin}${target}`;
                window.location.replace(newUrl);
                foundMatch = true;
                break;
            }
        }

        if (foundMatch) return;

        // 4. STRATEGY C: Fallback for Collections/Pages
        // If it looks like a Shopify path but wasn't matched above, send to a safe landing page
        if (cleanPath.startsWith('/pages/') || cleanPath.startsWith('/collections/') || cleanPath.startsWith('/products/')) {
            console.log(`[SEO Migration] Catch-all fallback triggered.`);
            // Default fallback to products page (preserve language if possible)
            const langMatch = cleanPath.match(/^\/(nl|en|fr)\//);
            const detectedLang = langMatch ? langMatch[1] : 'fr';
            const newUrl = `${window.location.origin}/${detectedLang}/products`;
            window.location.replace(newUrl);
        }

    }, []);

    return null;
};

export default SEOMigrationHandler;

