'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ResumeLoaderProps {
    wizardStateStr: string;
    lang: string;
    token: string;
}

export const ResumeLoader = ({ wizardStateStr, lang, token }: ResumeLoaderProps) => {
    const router = useRouter();

    useEffect(() => {
        if (wizardStateStr) {
            try {
                // 1. Save state to session storage for the Wizard to pick up
                sessionStorage.setItem('belmobile_recovery_state', wizardStateStr);

                const state = JSON.parse(wizardStateStr);

                // 2. Determine Service Type (Heuristic: Buyback has grading)
                // If bodyState is present, it's likely a buyback flow
                const isBuyback = !!(state.bodyState || state.screenState);

                // 3. Resolve localized service slug
                let serviceSlug = 'repair';
                if (isBuyback) {
                    if (lang === 'fr') serviceSlug = 'rachat';
                    if (lang === 'nl') serviceSlug = 'inkoop';
                    if (lang === 'tr') serviceSlug = 'geri-alim';
                    if (lang === 'en') serviceSlug = 'buyback';
                } else {
                    if (lang === 'fr') serviceSlug = 'reparation';
                    if (lang === 'nl') serviceSlug = 'reparatie';
                    if (lang === 'tr') serviceSlug = 'onarim';
                    if (lang === 'en') serviceSlug = 'repair';
                }

                // 4. Construct URL
                // We redirect to the device specific page so the wizard mounts correctly
                const brand = (state.selectedBrand || 'apple').toLowerCase();
                const model = (state.selectedModel || '').toLowerCase().replace(/\s+/g, '-');

                const finalUrl = `/${lang}/${serviceSlug}/${brand}/${model}`;

                console.log(`[ResumeLoader] Restoring session ${token} -> ${finalUrl}`);
                router.replace(finalUrl);

            } catch (e) {
                console.error("Failed to parse wizard state:", e);
                router.push(`/${lang}`);
            }
        }
    }, [wizardStateStr, lang, router, token]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                    <div className="relative w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reloader...</h2>
                    <p className="text-slate-500 dark:text-slate-400">Restoring your price estimate</p>
                </div>
            </div>
        </div>
    );
};
