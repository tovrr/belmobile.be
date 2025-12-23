'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { NAV_LINKS } from '../constants';
import { Bars3Icon, XMarkIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../hooks/useLanguage';

import Logo from './Logo';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const { language, t } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Close menu when route changes
        const handleRouteChange = () => setIsMenuOpen(false);
        // Use a small timeout to avoid conflict with current render cycle
        const timer = setTimeout(handleRouteChange, 10);
        return () => clearTimeout(timer);
    }, [pathname]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLanguageChange = (newLang: 'en' | 'fr' | 'nl') => {
        const currentPath = pathname;
        const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

        // Split path into segments
        const segments = currentPath.split('/').filter(Boolean);

        // Check if first segment is a language code
        if (['en', 'fr', 'nl'].includes(segments[0])) {
            segments[0] = newLang;
        } else {
            // If no language prefix (shouldn't happen in MainLayout, but safe fallback)
            segments.unshift(newLang);
        }

        // Handle Product Translations
        const productTerms = { en: 'products', fr: 'produits', nl: 'producten' };
        const repairTerms = { en: 'repair', fr: 'reparation', nl: 'reparatie' };
        const buybackTerms = { en: 'buyback', fr: 'rachat', nl: 'inkoop' };
        const storeTerms = { en: 'stores', fr: 'magasins', nl: 'winkels' };

        // Helper to translate a segment if it matches any known term
        const translateSegment = (segment: string, terms: Record<string, string>) => {
            if (Object.values(terms).includes(segment)) {
                return terms[newLang];
            }
            return segment;
        };

        // Iterate through segments and translate known terms
        for (let i = 0; i < segments.length; i++) {
            segments[i] = translateSegment(segments[i], productTerms);
            segments[i] = translateSegment(segments[i], repairTerms);
            segments[i] = translateSegment(segments[i], buybackTerms);
            segments[i] = translateSegment(segments[i], storeTerms);
        }

        const newPath = '/' + segments.join('/');
        router.push(newPath + search);
    };

    return (
        <>
            {/* Floating Island Navigation */}
            <header className={`fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-[1600px] z-50 transition-all duration-500 ease-in-out px-4 sm:px-0 flex justify-center`}>
                <div
                    className={`
                        relative w-full max-w-6xl rounded-full transition-all duration-500
                        ${scrolled || isMenuOpen
                            ? 'glass-panel shadow-glow px-6 py-3'
                            : 'bg-transparent px-6 py-4'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href={`/${language}`} className="flex flex-col group leading-none">
                            <Logo variant="dark" />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-full p-1 border border-white/10 backdrop-blur-sm">
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
                                        aria-label={t(link.name)}
                                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                            ? 'bg-white dark:bg-slate-700 text-electric-indigo dark:text-indigo-300 shadow-sm scale-105'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-electric-indigo dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 hover:scale-105'
                                            }`
                                        }
                                    >
                                        {t(link.name)}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                            {/* Call Support CTA - Desktop */}
                            <div className="hidden md:flex items-center gap-3">
                                <span className="hidden lg:block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('need_help')}</span>
                                <a
                                    href="tel:+3222759867"
                                    aria-label={t('call_support')}
                                    className="flex items-center gap-2 bg-electric-indigo/90 hover:bg-electric-indigo text-white rounded-full px-4 py-2 transition-all shadow-lg hover:shadow-indigo-500/30 font-bold text-sm tracking-wide group"
                                >
                                    <PhoneIcon className="h-4 w-4 group-hover:animate-pulse" aria-hidden="true" />
                                    <span>{t('call_support')}</span>
                                </a>
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                onClick={toggleMenu}
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                                className="md:hidden p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-700 dark:text-white backdrop-blur-sm transition-colors"
                            >
                                {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {isMenuOpen && (
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
                                            onClick={() => setIsMenuOpen(false)}
                                            aria-label={t(link.name)}
                                            className={`px-6 py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-between ${isActive
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
                                        onClick={() => { handleLanguageChange(l); setIsMenuOpen(false); }}
                                        aria-label={`Switch to ${l.toUpperCase()}`}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase transition-all ${language === l
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
                                <a href="tel:+3222759867" className="block w-full py-3 bg-electric-indigo text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30">
                                    {t('call_support')}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </header>
            {/* Spacer for fixed header */}
            <div className="h-24"></div>
        </>
    );
};

export default Header;
