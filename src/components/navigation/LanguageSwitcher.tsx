'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getLocalizedPath } from '../../utils/i18n-helpers';

interface LanguageSwitcherProps {
    currentLang: string;
    variant?: 'header' | 'footer' | 'mobile';
}

const LANGUAGES = [
    { code: 'fr', label: 'FR', flag: '🇧🇪' },
    { code: 'nl', label: 'NL', flag: '🇧🇪' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'tr', label: 'TR', flag: '🇹🇷' }
] as const;

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, variant = 'header' }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleLanguageChange = (newLang: 'en' | 'fr' | 'nl' | 'tr') => {
        if (newLang === currentLang) return;

        // 1. Preserve Query Params
        const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

        // 2. Translate Path (State-Aware)
        const newPath = getLocalizedPath(pathname, newLang, search);

        // 3. Update Cookie (Client-Side)
        document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`;

        // 4. Navigate
        router.push(newPath);
    };

    if (variant === 'footer') {
        return (
            <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${currentLang === lang.code
                            ? 'bg-electric-indigo text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        );
    }

    if (variant === 'mobile') {
        return (
            <div className="grid grid-cols-4 gap-2 p-2 bg-gray-50 dark:bg-slate-900 rounded-xl">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`py-2 rounded-lg text-sm font-bold flex flex-col items-center justify-center transition-all ${currentLang === lang.code
                            ? 'bg-white dark:bg-slate-800 text-bel-blue shadow-md border border-gray-100 dark:border-slate-700'
                            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'
                            }`}
                    >
                        <span className="text-lg mb-1">{lang.flag}</span>
                        {lang.label}
                    </button>
                ))}
            </div>
        );
    }

    // Default (Header)
    return (
        <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-full p-1 border border-gray-200 dark:border-slate-700">
            {LANGUAGES.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${currentLang === lang.code
                        ? 'bg-white dark:bg-slate-700 text-bel-blue shadow-sm scale-105'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
};

export default LanguageSwitcher;
