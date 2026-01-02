'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PhoneIcon } from '@heroicons/react/24/outline';
import { NAV_LINKS } from '../../constants';
import { getLocalizedPath } from '@/utils/i18n-helpers';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    language: string;
    // We pass a simple translation function or dictionary
    t: (key: string) => string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, language, t }) => {
    const pathname = usePathname();

    const handleLanguageChange = (newLang: 'en' | 'fr' | 'nl' | 'tr') => {
        const currentPath = pathname;
        // Search params are tricky to access here without hook, but Header can pass handleLanguageChange callback
        // For now, let's keep it simple or accept a callback.
        // Actually best to accept a callback from Header to keep router logic central or safe.
        // But for lazy loading, self-contained is nice.
        // Let's implement localized path logic here or reuse helper.
        const newPath = getLocalizedPath(currentPath, newLang);
        window.location.href = newPath; // Simple client navigation for language switch in mobile menu
    };

    const [isProExpanded, setIsProExpanded] = React.useState(false);

    if (!isOpen) return null;

    return (
        <div className="absolute top-full right-4 left-4 sm:left-auto sm:right-8 sm:w-full sm:max-w-sm mt-4 rounded-3xl p-2 shadow-2xl animate-fade-in xl:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/20 z-40 ring-1 ring-black/5">
            <div className="flex flex-col space-y-1">
                {NAV_LINKS.map(link => {
                    let path = link.path;
                    if (path === '/products') {
                        if (language === 'fr') path = '/produits';
                        if (language === 'nl') path = '/producten';
                        if (language === 'tr') path = '/urunler';
                    }
                    if (path === '/repair') {
                        if (language === 'fr') path = '/reparation';
                        if (language === 'nl') path = '/reparatie';
                        if (language === 'tr') path = '/onarim';
                    }
                    if (path === '/buyback') {
                        if (language === 'fr') path = '/rachat';
                        if (language === 'nl') path = '/inkoop';
                        if (language === 'tr') path = '/geri-alim';
                    }
                    if (path === '/stores') {
                        if (language === 'fr') path = '/magasins';
                        if (language === 'nl') path = '/winkels';
                        if (language === 'tr') path = '/magazalar';
                    }

                    const href = `/${language}${path}`;
                    const isActive = pathname === href || pathname.startsWith(href + '/');

                    if (link.name === 'Business') {
                        return (
                            <div key={link.name} className="flex flex-col">
                                <button
                                    onClick={() => setIsProExpanded(!isProExpanded)}
                                    className={`w-full px-6 py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-between text-left ${isProExpanded
                                        ? 'bg-slate-50 dark:bg-slate-800/50 text-electric-indigo dark:text-indigo-400'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    {t(link.name)}
                                    <span className={`transition-transform duration-300 text-slate-300 dark:text-slate-600 font-bold ${isProExpanded ? 'rotate-90' : ''}`}>
                                        →
                                    </span>
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ${isProExpanded ? 'max-h-64 mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="grid grid-cols-1 gap-1 px-4 mb-2">
                                        <Link
                                            href={`/${language}/business`}
                                            onClick={onClose}
                                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex items-center gap-2"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-electric-indigo/40" />
                                            B2B
                                        </Link>
                                        <Link
                                            href={`/${language}/franchise`}
                                            onClick={onClose}
                                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex items-center gap-2"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-electric-indigo/40" />
                                            {t('Franchise')}
                                        </Link>
                                        <Link
                                            href={`/${language}/formation`}
                                            onClick={onClose}
                                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex items-center gap-2"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-electric-indigo/40" />
                                            {t('Formation')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={link.name}
                            href={href}
                            onClick={onClose}
                            aria-label={t(link.name)}
                            className={`px-6 py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-between cursor-pointer ${isActive
                                ? 'bg-slate-100 dark:bg-slate-800 text-electric-indigo dark:text-indigo-400'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`
                            }
                        >
                            {t(link.name)}
                            <span className="text-slate-300 dark:text-slate-600">→</span>
                        </Link>
                    );
                })}
            </div>

            {/* Mobile Language Selector */}
            <div className="flex justify-center gap-4 p-4 border-t border-gray-100 dark:border-slate-800 mt-2">
                {(['en', 'fr', 'nl', 'tr'] as const).map(l => (
                    <button
                        key={l}
                        onClick={() => { handleLanguageChange(l); onClose(); }}
                        aria-label={`Switch to ${l.toUpperCase()}`}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase transition-all cursor-pointer ${language === l
                            ? 'bg-electric-indigo text-white shadow-md'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        {l}
                    </button>
                ))}
            </div>


        </div>
    );
};

export default MobileMenu;
