'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PhoneIcon } from '@heroicons/react/24/outline';
import { NAV_LINKS } from '../../constants';
import { getLocalizedPath } from '@/utils/i18n-helpers';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { useHaptic } from '../../hooks/useHaptic';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    language: string;
    // We pass a simple translation function or dictionary
    t: (key: string) => string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, language, t }) => {
    const pathname = usePathname();
    const haptic = useHaptic();

    // Prevent background scroll when menu is open
    useLockBodyScroll(isOpen);

    const handleLanguageChange = (newLang: 'en' | 'fr' | 'nl' | 'tr') => {
        const currentPath = pathname;
        // Search params are tricky to access here without hook, but Header can pass handleLanguageChange callback
        // For now, let's keep it simple or accept a callback.
        // Actually best to accept a callback from Header to keep router logic central or safe.
        // But for lazy loading, self-contained is nice.
        // Let's implement localized path logic here or reuse helper.
        haptic.trigger('light');
        const newPath = getLocalizedPath(currentPath, newLang);
        window.location.href = newPath; // Simple client navigation for language switch in mobile menu
    };

    const [isProExpanded, setIsProExpanded] = React.useState(false);

    if (!isOpen) return null;

    return (
        <div className="absolute top-full right-4 left-4 sm:left-auto sm:right-8 sm:w-full sm:max-w-sm mt-4 rounded-3xl p-2 shadow-2xl animate-fade-in xl:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/20 z-40 ring-1 ring-black/5">
            <div className="flex flex-col space-y-1">
                {NAV_LINKS.map(link => {
                    const href = getLocalizedPath(link.path, language as any);
                    const isActive = pathname === href || pathname.startsWith(href + '/');

                    if (link.name === 'Business') {
                        return (
                            <div key={link.name} className="flex flex-col">
                                <button
                                    onClick={() => {
                                        haptic.trigger('light');
                                        setIsProExpanded(!isProExpanded);
                                    }}
                                    className={`w-full px-6 py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-between text-left active-press ${isProExpanded
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
                                            href={getLocalizedPath('/business', language as any)}
                                            onClick={() => { haptic.trigger('light'); onClose(); }}
                                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex items-center gap-2 active-press"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-electric-indigo/40" />
                                            B2B
                                        </Link>
                                        <Link
                                            href={getLocalizedPath('/franchise', language as any)}
                                            onClick={() => { haptic.trigger('light'); onClose(); }}
                                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex items-center gap-2 active-press"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-electric-indigo/40" />
                                            {t('Franchise')}
                                        </Link>
                                        <Link
                                            href={getLocalizedPath('/training', language as any)}
                                            onClick={() => { haptic.trigger('light'); onClose(); }}
                                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex items-center gap-2 active-press"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-electric-indigo/40" />
                                            {t('formation')}
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
                            onClick={() => { haptic.trigger('light'); onClose(); }}
                            aria-label={t(link.name)}
                            className={`px-6 py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-between cursor-pointer active-press ${isActive
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase transition-all cursor-pointer active-press ${language === l
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
