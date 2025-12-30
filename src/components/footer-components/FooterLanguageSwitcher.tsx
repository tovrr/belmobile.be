'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getLocalizedPath } from '@/utils/i18n-helpers';

interface FooterLanguageSwitcherProps {
    currentLang: string;
}

const FooterLanguageSwitcher: React.FC<FooterLanguageSwitcherProps> = ({ currentLang }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleLanguageChange = (newLang: 'en' | 'fr' | 'nl') => {
        if (newLang === currentLang) return;
        const search = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const newPath = getLocalizedPath(pathname, newLang, search);
        router.push(newPath);
    };

    return (
        <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
            {(['en', 'fr', 'nl'] as const).map((lang) => (
                <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${currentLang === lang
                        ? 'bg-electric-indigo text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    {lang}
                </button>
            ))}
        </div>
    );
};

export default FooterLanguageSwitcher;
