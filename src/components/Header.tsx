'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { NAV_LINKS, MOCK_BLOG_POSTS } from '../constants';
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

        // Handle Comprehensive Slug Translations
        const slugMappings: Record<string, Record<string, string>> = {
            products: { en: 'products', fr: 'produits', nl: 'producten' },
            repair: { en: 'repair', fr: 'reparation', nl: 'reparatie' },
            buyback: { en: 'buyback', fr: 'rachat', nl: 'inkoop' },
            stores: { en: 'stores', fr: 'magasins', nl: 'winkels' },
            services: { en: 'services', fr: 'services', nl: 'diensten' }, // Added diensten
            about: { en: 'about', fr: 'a-propos', nl: 'over-ons' }, // Main about page
            sustainability: { en: 'sustainability', fr: 'durabilite', nl: 'duurzaamheid' },
            students: { en: 'students', fr: 'etudiants', nl: 'studenten' },
            courier: { en: 'express-courier', fr: 'coursier-express', nl: 'express-koerier' },
            careers: { en: 'careers', fr: 'carrieres', nl: 'vacatures' },
            warranty: { en: 'warranty', fr: 'garantie', nl: 'garantie' },
            privacy: { en: 'privacy', fr: 'vie-privee', nl: 'privacy' },
            terms: { en: 'terms', fr: 'conditions-generales', nl: 'algemene-voorwaarden' },
            track: { en: 'track-order', fr: 'suivi-commande', nl: 'bestelling-volgen' },
            business: { en: 'business', fr: 'business', nl: 'zakelijk' },
            support: { en: 'support', fr: 'support', nl: 'ondersteuning' },
            franchise: { en: 'franchise', fr: 'devenir-partenaire', nl: 'word-partner' },
            // Extra specific segments
            'a-propos': { en: 'about', fr: 'a-propos', nl: 'over-ons' },
            'over-ons': { en: 'about', fr: 'a-propos', nl: 'over-ons' },
            'durabilite': { en: 'sustainability', fr: 'durabilite', nl: 'duurzaamheid' },
            'duurzaamheid': { en: 'sustainability', fr: 'durabilite', nl: 'duurzaamheid' }
        };

        // Helper to translate a segment if it matches any known term
        const translateSegment = (segment: string) => {
            for (const key in slugMappings) {
                const terms = slugMappings[key];
                if (Object.values(terms).includes(segment)) {
                    return terms[newLang];
                }
            }
            return segment;
        };

        // Iterate through segments and translate known terms
        for (let i = 0; i < segments.length; i++) {
            segments[i] = translateSegment(segments[i]);
        }

        // Special Handling for Blog Posts (Dynamic Slugs)
        if (segments.includes('blog') && segments.length > segments.indexOf('blog') + 1) {
            const blogIndex = segments.indexOf('blog');
            const currentSlug = segments[blogIndex + 1];
            const post = MOCK_BLOG_POSTS.find(p =>
                p.slug === currentSlug ||
                (p.slugs && Object.values(p.slugs).includes(currentSlug))
            );
            if (post && post.slugs) {
                segments[blogIndex + 1] = post.slugs[newLang] || post.slug;
            }
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
                        <Link href={`/${language}`} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 group-hover:scale-110 transition-transform duration-300">
                                <Logo className="w-full h-full" />
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
                            {/* Call Support CTA - Desktop */}
                            <div className="hidden lg:flex items-center gap-3">
                                <span className="hidden xl:block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('need_help')}</span>
                                <a
                                    href="tel:+3222759867"
                                    aria-label={t('call_support')}
                                    className="flex items-center gap-2 bg-electric-indigo/90 hover:bg-electric-indigo text-white rounded-full px-4 py-2 transition-all shadow-lg hover:shadow-indigo-500/30 font-bold text-sm tracking-wide group whitespace-nowrap"
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
                                <a href="tel:+3222759867" className="flex items-center justify-center gap-2 w-full py-3 bg-electric-indigo text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 group">
                                    <PhoneIcon className="h-5 w-5 group-hover:animate-pulse" aria-hidden="true" />
                                    <span>{t('call_support')}</span>
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
