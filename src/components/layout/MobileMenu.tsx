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

    const handleLanguageChange = (newLang: 'en' | 'fr' | 'nl') => {
        const currentPath = pathname;
        // Search params are tricky to access here without hook, but Header can pass handleLanguageChange callback
        // For now, let's keep it simple or accept a callback.
        // Actually best to accept a callback from Header to keep router logic central or safe.
        // But for lazy loading, self-contained is nice.
        // Let's implement localized path logic here or reuse helper.
        const newPath = getLocalizedPath(currentPath, newLang);
        window.location.href = newPath; // Simple client navigation for language switch in mobile menu
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-4 mx-4 rounded-3xl p-2 shadow-2xl animate-fade-in md:hidden bg-white dark:bg-slate-900 border border-white/20 z-40">
            <div className="flex flex-col space-y-1">
                {NAV_LINKS.map(link => {
                    let path = link.path;
                    if (path === '/products') {
                        if (language === 'fr') path = '/produits';
                        if (language === 'nl') path = '/producten';
                    }
                    if (path === '/repair') {
                        if (language === 'fr') path = '/reparation';
                        if (language === 'nl') path = '/reparatie';
                    }
                    if (path === '/buyback') {
                        if (language === 'fr') path = '/rachat';
                        if (language === 'nl') path = '/inkoop';
                    }
                    if (path === '/stores') {
                        if (language === 'fr') path = '/magasins';
                        if (language === 'nl') path = '/winkels';
                    }

                    const href = `/${language}${path}`;
                    const isActive = pathname === href || pathname.startsWith(href + '/');

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
                {(['en', 'fr', 'nl'] as const).map(l => (
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

            <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">{t('need_help')}</p>
                <a href="tel:+3222759867" className="flex items-center justify-center gap-2 w-full py-3 bg-electric-indigo text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 group">
                    <PhoneIcon className="h-5 w-5 group-hover:animate-pulse" aria-hidden="true" />
                    <span>{t('call_support')}</span>
                </a>
            </div>
        </div>
    );
};

export default MobileMenu;
