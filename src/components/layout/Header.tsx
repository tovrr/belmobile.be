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
    loading: () => <div className="absolute top-full left-0 right-0 mt-4 mx-4 h-96 rounded-3xl bg-white/50 backdrop-blur-sm animate-pulse z-40"></div>
});

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

    useEffect(() => {
        // Dispatch event for other components (like Chat Widget) to know menu state
        const event = new CustomEvent('mobile-menu-state', { detail: { isOpen: isMenuOpen } });
        window.dispatchEvent(event);
    }, [isMenuOpen]);

    const handleLanguageChange = (newLang: 'en' | 'fr' | 'nl') => {
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
                            ? 'glass-panel shadow-glow px-6 py-3'
                            : 'bg-transparent px-6 py-4'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link
                            href={`/${language}`}
                            className="flex items-center gap-3 group"
                            aria-label="Belmobile Home"
                            itemScope
                            itemType="https://schema.org/Organization"
                        >
                            <meta itemProp="name" content="Belmobile" />
                            <meta itemProp="url" content="https://belmobile.be" />
                            <div className="w-10 h-10 group-hover:scale-110 transition-transform duration-300 text-gray-900 dark:text-cyber-citron" itemProp="logo" itemScope itemType="https://schema.org/ImageObject">
                                <Logo className="w-full h-full" />
                                <meta itemProp="url" content="https://belmobile.be/logo.png" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-2xl tracking-tighter text-gray-900 dark:text-white leading-none">
                                    BELMOBILE<span className="text-cyber-citron">.BE</span>
                                </span>
                                <span className="text-[10px] font-bold tracking-[0.19em] text-slate-500 uppercase leading-none mt-0.5 group-hover:text-cyber-citron transition-colors">
                                    {t('logo_slogan')}
                                </span>
                            </div>
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
                                if (path === '/formation') {
                                    if (language === 'fr') path = '/formation';
                                    if (language === 'nl') path = '/opleiding';
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
                        <div className="flex items-center space-x-3">
                            {/* Call Support CTA - Desktop & Tablet */}
                            <div className="hidden md:flex items-center gap-3">
                                <span className="hidden xl:block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('need_help')}</span>
                                <a
                                    href="tel:+3222759867"
                                    aria-label={t('call_expert')}
                                    className="flex items-center gap-2 bg-cyber-citron hover:bg-cyber-citron/90 text-midnight rounded-full px-3 py-2 lg:px-5 lg:py-2.5 transition-all shadow-lg hover:shadow-cyber-citron/30 font-black text-sm tracking-wide group whitespace-nowrap"
                                >
                                    <PhoneIcon className="h-4 w-4 group-hover:animate-medical-pulse" aria-hidden="true" />
                                    <span className="hidden lg:inline">{t('call_expert')}</span>
                                    <span className="lg:hidden">{t('call_action_short')}</span>
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

