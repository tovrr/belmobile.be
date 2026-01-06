'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { NAV_LINKS, MOCK_BLOG_POSTS } from '../../constants';
import { MenuIcon as Bars3Icon, CloseIcon as XMarkIcon, PhoneIcon } from '../ui/BrandIcons';
import { useLanguage } from '../../hooks/useLanguage';

import Logo from './Logo';
import { getLocalizedPath } from '@/utils/i18n-helpers';
import dynamic from 'next/dynamic';

const MobileMenu = dynamic(() => import('./MobileMenu'), {
    ssr: false,
    loading: () => <div className="absolute top-full right-4 left-4 sm:left-auto sm:right-8 sm:w-full sm:max-w-sm mt-4 h-96 rounded-3xl bg-white/50 backdrop-blur-sm animate-pulse z-40"></div>
});

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const { language, t } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isExpertOnline, setIsExpertOnline] = useState(false);

    useEffect(() => {
        const checkOnlineStatus = () => {
            try {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Europe/Brussels',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: false
                });
                const parts = formatter.formatToParts(now);
                const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
                const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
                const timeInMinutes = hour * 60 + minute;

                // Working hours: 10:30 - 19:00 (Every day as Schaerbeek is 7/7)
                const openingTime = 10 * 60 + 30;
                const closingTime = 19 * 60;

                setIsExpertOnline(timeInMinutes >= openingTime && timeInMinutes < closingTime);
            } catch (e) {
                // Fallback to true if timezone check fails
                setIsExpertOnline(true);
            }
        };

        checkOnlineStatus();
        const interval = setInterval(checkOnlineStatus, 60000);
        return () => clearInterval(interval);
    }, []);

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

    useEffect(() => {
        // Dispatch event for other components (like Chat Widget) to know menu state
        const event = new CustomEvent('mobile-menu-state', { detail: { isOpen: isMenuOpen } });
        window.dispatchEvent(event);
    }, [isMenuOpen]);

    const handleLanguageChange = (newLang: 'en' | 'fr' | 'nl' | 'tr') => {
        const currentPath = pathname;
        const search = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const newPath = getLocalizedPath(currentPath, newLang, search);
        router.push(newPath);
    };

    return (
        <>
            {/* Floating Island Navigation */}
            <header className={`fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-[1600px] z-60 transition-all duration-500 ease-in-out px-4 sm:px-0 flex justify-center`}>
                <div
                    className={`
                        relative w-full max-w-6xl rounded-full transition-all duration-500
                        ${scrolled || isMenuOpen
                            ? 'glass-panel shadow-glow px-4 py-2 sm:px-6 sm:py-3'
                            : 'bg-transparent px-4 py-3 sm:px-6 sm:py-4'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link
                            href={`/${language}`}
                            className="flex items-center gap-2 sm:gap-3 group"
                            aria-label="Belmobile Home"
                            itemScope
                            itemType="https://schema.org/Organization"
                        >
                            <meta itemProp="name" content="Belmobile" />
                            <meta itemProp="url" content="https://belmobile.be" />
                            <div className="w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-300 text-gray-900 dark:text-cyber-citron" itemProp="logo" itemScope itemType="https://schema.org/ImageObject">
                                <Logo className="w-full h-full" />
                                <meta itemProp="url" content="https://belmobile.be/belmobile-logo.png" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-lg sm:text-2xl tracking-tighter text-gray-900 dark:text-white leading-none">
                                    BELMOBILE<span className="text-cyber-citron">.BE</span>
                                </span>
                                <span className="text-[8px] sm:text-[10px] font-bold tracking-widest sm:tracking-[0.19em] text-slate-500 uppercase leading-none mt-1 group-hover:text-cyber-citron transition-colors">
                                    BUYBACK & REPAIR
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-full p-1 border border-white/10 backdrop-blur-sm">
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
                                if (path === '/formation') {
                                    if (language === 'fr') path = '/formation';
                                    if (language === 'nl') path = '/opleiding';
                                    if (language === 'tr') path = '/egitim';
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
                                        <div key={link.name} className="relative group/dropdown">
                                            <button
                                                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${isActive
                                                    ? 'bg-white dark:bg-slate-700 text-electric-indigo dark:text-indigo-300 shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-300 hover:text-electric-indigo dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                {t(link.name)}
                                                <svg className="w-4 h-4 transition-transform duration-300 group-hover/dropdown:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Dropdown Menu */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:translate-y-0 group-hover/dropdown:pointer-events-auto transition-all duration-300 z-50">
                                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-2 min-w-[180px]">
                                                    <Link
                                                        href={`/${language}${language === 'fr' ? '/business' : '/business'}`}
                                                        title={t('seo_nav_b2b') || 'Corporate Mobile Solutions'}
                                                        className="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-electric-indigo transition-all"
                                                    >
                                                        {t('B2B')}
                                                    </Link>
                                                    <Link
                                                        href={`/${language}${language === 'fr' ? '/franchise' : '/franchise'}`}
                                                        title={t('seo_nav_franchise') || 'Open Your Own Repair Shop'}
                                                        className="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-electric-indigo transition-all"
                                                    >
                                                        {t('Franchise')}
                                                    </Link>
                                                    <Link
                                                        href={`/${language}${language === 'nl' ? '/opleiding' : language === 'tr' ? '/egitim' : language === 'fr' ? '/formation' : '/training'}`}
                                                        title={t('seo_nav_training') || 'Become a Certified Technician'}
                                                        className="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-electric-indigo transition-all"
                                                    >
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
                                        aria-label={t(link.name)}
                                        title={
                                            link.name === 'Products' ? t('seo_nav_products') || 'Buy Refurbished Devices' :
                                                link.name === 'Repair' ? t('seo_nav_repair') || 'Professional Repair Service' :
                                                    link.name === 'Buyback' ? t('seo_nav_buyback') || 'Sell Your Device' :
                                                        link.name === 'Stores' ? t('seo_nav_stores') || 'Our Service Locations' :
                                                            t(link.name)
                                        }
                                        className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
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
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* Language Switcher - Desktop Only (Hidden when hamburger is visible) */}
                            <div className="hidden lg:flex items-center mr-1">
                                <div className="relative group/lang">
                                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors uppercase">
                                        {language}
                                        <span className="text-[9px] opacity-70">▼</span>
                                    </button>
                                    <div className="absolute top-full right-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/lang:opacity-100 group-hover/lang:translate-y-0 group-hover/lang:pointer-events-auto transition-all duration-300 z-50">
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-1 min-w-[60px]">
                                            {(['en', 'fr', 'nl', 'tr'] as const).map(l => (
                                                <button
                                                    key={l}
                                                    onClick={() => handleLanguageChange(l)}
                                                    className={`w-full text-center px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${language === l ? 'bg-electric-indigo/10 text-electric-indigo' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Call Support CTA - Visible on All Devices */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className="hidden sm:block lg:hidden xl:block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {t('need_help_short')}
                                </span>
                                <a
                                    href="tel:+3222759867"
                                    aria-label={t('call_expert')}
                                    className="relative flex items-center gap-2 bg-cyber-citron hover:bg-cyber-citron/90 text-midnight rounded-full p-2 sm:px-4 sm:py-2.5 lg:p-2.5 xl:px-5 xl:py-2.5 transition-all shadow-lg hover:shadow-cyber-citron/30 font-black text-xs sm:text-sm tracking-wide group whitespace-nowrap"
                                >
                                    {/* Online Indicator Dot */}
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        {isExpertOnline && (
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        )}
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${isExpertOnline ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'} border-2 border-white dark:border-slate-900`}></span>
                                    </span>

                                    <PhoneIcon className="h-5 w-5 sm:h-4 sm:w-4 group-hover:animate-medical-pulse" aria-hidden="true" />
                                    <span className="hidden sm:inline-flex lg:hidden xl:inline-flex">
                                        {t('call_action_short')}
                                    </span>
                                </a>
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                onClick={toggleMenu}
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                                className="lg:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-700 dark:text-white backdrop-blur-sm transition-colors"
                            >
                                {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>



                    {/* Mobile Menu Overlay */}
                    {isMenuOpen && (
                        <>
                            {/* Backdrop to capture outside clicks and block interaction with underlying elements */}
                            <div
                                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[-1] h-screen w-screen -top-4 -left-[calc(50vw-50%)]"
                                onClick={() => setIsMenuOpen(false)}
                                aria-hidden="true"
                            />
                            <MobileMenu
                                isOpen={isMenuOpen}
                                onClose={() => setIsMenuOpen(false)}
                                language={language}
                                t={t}
                            />
                        </>
                    )}
                </div>
            </header>
            {/* Spacer for fixed header */}
            <div className="h-24"></div>
        </>
    );
};

export default Header;
