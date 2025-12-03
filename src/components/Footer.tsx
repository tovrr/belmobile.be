'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';

const POPULAR_REPAIRS = [
    { name: 'iPhone 15 Pro Max', brand: 'Apple', model: 'iPhone 15 Pro Max', category: 'smartphone' },
    { name: 'iPhone 14', brand: 'Apple', model: 'iPhone 14', category: 'smartphone' },
    { name: 'iPhone 13', brand: 'Apple', model: 'iPhone 13', category: 'smartphone' },
    { name: 'iPhone 12', brand: 'Apple', model: 'iPhone 12', category: 'smartphone' },
    { name: 'Samsung S23 Ultra', brand: 'Samsung', model: 'Galaxy S23 Ultra', category: 'smartphone' },
    { name: 'Samsung A54', brand: 'Samsung', model: 'Galaxy A54', category: 'smartphone' },
    { name: 'Google Pixel 7', brand: 'Google', model: 'Pixel 7', category: 'smartphone' },
    { name: 'PlayStation 5', brand: 'Sony', model: 'PlayStation 5 (Disc)', category: 'console' },
    { name: 'Nintendo Switch OLED', brand: 'Nintendo', model: 'Switch OLED', category: 'console' },
    { name: 'MacBook Air M2', brand: 'Apple', model: 'MacBook Air M2', category: 'laptop' },
    { name: 'iPad 10th Gen', brand: 'Apple', model: 'iPad (10th Gen)', category: 'tablet' },
    { name: 'Xiaomi 13', brand: 'Xiaomi', model: 'Xiaomi 13', category: 'smartphone' },
];

const Footer: React.FC = () => {
    const { language, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsSubscribed(true);
            setEmail('');
            // Here you would typically send the email to your backend
            setTimeout(() => setIsSubscribed(false), 5000);
        }
    };

    const handleLanguageChange = (newLang: 'en' | 'fr' | 'nl') => {
        if (newLang === language) return;
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

    const createSlug = (text: string) => text.toLowerCase().replace(/\s+/g, '-');

    return (
        <footer className="relative bg-slate-950 text-white pt-16 pb-8 overflow-hidden">
            {/* Modern Electronic Circuit Background Pattern */}
            <div
                className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23eab308' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
            ></div>

            {/* Gradient Overlay for Sleek Look */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/40 pointer-events-none"></div>

            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-electric-indigo to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">

                    {/* Brand Column (Span 4) */}
                    <div className="lg:col-span-4">
                        <Link href={`/${language}`} className="block mb-6 group">
                            <div className="text-3xl font-black tracking-tighter text-white leading-none">
                                BELMOBILE<span className="text-cyber-citron">.BE</span>
                            </div>
                            <div className="text-xs font-bold tracking-[0.25em] text-slate-500 group-hover:text-cyber-citron transition-colors mt-2 uppercase">
                                BUYBACK & REPAIR
                            </div>
                        </Link>
                        <p className="text-slate-400 leading-relaxed mb-8 max-w-sm">
                            {language === 'fr'
                                ? "Redéfinir l'expérience mobile à Bruxelles. Appareils premium, réparations certifiées et solutions de rachat durables."
                                : language === 'nl'
                                    ? "De mobiele ervaring in Brussel herdefiniëren. Premium toestellen, gecertificeerde herstellingen en duurzame overname-oplossingen."
                                    : "Redefining the mobile experience in Brussels. Premium devices, certified repairs, and sustainable buyback solutions powered by technology."
                            }
                        </p>

                        {/* Newsletter Input */}
                        <div className="relative max-w-sm mb-8">
                            {isSubscribed ? (
                                <div className="bg-green-500/20 border border-green-500/50 rounded-xl py-3 px-4 text-sm text-green-200 flex items-center">
                                    <SparklesIcon className="h-5 w-5 mr-2 text-green-400" />
                                    {t('newsletter_success')}
                                </div>
                            ) : (
                                <form onSubmit={handleSubscribe} className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('newsletter_placeholder')}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none transition-all backdrop-blur-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-electric-indigo rounded-lg text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30"
                                    >
                                        <PaperAirplaneIcon className="h-4 w-4" />
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Social Icons (Moved Here) */}
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com/Belmobile.be" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-xl hover:bg-electric-indigo hover:scale-110 transition-all border border-white/5"><span className="sr-only">Facebook</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></a>
                            <a href="https://www.instagram.com/belmobile.be" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-xl hover:bg-electric-indigo hover:scale-110 transition-all border border-white/5"><span className="sr-only">Instagram</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg></a>
                            <a href="https://www.youtube.com/@belmobile-rachatreparation3659" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-xl hover:bg-electric-indigo hover:scale-110 transition-all border border-white/5"><span className="sr-only">YouTube</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" /></svg></a>

                            <a href="https://www.tiktok.com/@belmobile.be" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-xl hover:bg-electric-indigo hover:scale-110 transition-all border border-white/5"><span className="sr-only">TikTok</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" /></svg></a>
                        </div>
                    </div>

                    {/* Services Column (Span 2) */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-6 text-cyber-citron">{t('Services')}</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href={`/${language}/${language === 'fr' ? 'reparation' : language === 'nl' ? 'reparatie' : 'repair'}`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Repair')}</Link></li>
                            <li><Link href={`/${language}/${language === 'fr' ? 'rachat' : language === 'nl' ? 'inkoop' : 'buyback'}`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Buyback')}</Link></li>
                            <li><Link href={`/${language}${language === 'fr' ? '/produits' : language === 'nl' ? '/producten' : '/products'}`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Products')}</Link></li>
                            <li><Link href={`/${language}/business`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Business Solutions')}</Link></li>
                            <li><Link href={`/${language}/franchise`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Become a Partner')}</Link></li>
                            <li><Link href={`/${language}/${language === 'fr' ? 'carrieres' : language === 'nl' ? 'vacatures' : 'jobs'}`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Careers')}</Link></li>
                        </ul>
                    </div>

                    {/* Support Column (Span 3) */}
                    <div className="lg:col-span-3">
                        <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-6 text-cyber-citron">{t('Support')}</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href={`/${language}/contact`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Contact Us')}</Link></li>
                            <li><Link href={`/${language}/${language === 'fr' ? 'magasins' : language === 'nl' ? 'winkels' : 'stores'}`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Store Locator')}</Link></li>
                            <li><Link href={`/${language}/faq`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Help Center')}</Link></li>
                            <li><Link href={`/${language}/track-order`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Track Order')}</Link></li>
                            <li><Link href={`/${language}/blog`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Blog')}</Link></li>
                        </ul>
                    </div>

                    {/* Legal Column (Span 3) */}
                    <div className="lg:col-span-3">
                        <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-6 text-cyber-citron">{t('Legal')}</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href={`/${language}/terms`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Terms of Service')}</Link></li>
                            <li><Link href={`/${language}/privacy`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Privacy Policy')}</Link></li>
                            <li><Link href={`/${language}/cookies`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Cookie Policy')}</Link></li>
                            <li><Link href={`/${language}/warranty`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Warranty Info')}</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Popular Repairs (Integrated with Spacing) */}
                <div className="border-t border-white/10 pt-8 mb-12">
                    <h4 className="text-sm font-bold text-cyber-citron uppercase tracking-widest mb-6 text-center md:text-left">
                        {t('Popular Repairs')}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {POPULAR_REPAIRS.map((item, index) => (
                            <Link
                                key={index}
                                href={`/${language}/${language === 'fr' ? 'reparation' : language === 'nl' ? 'reparatie' : 'repair'}/${createSlug(item.brand)}/${createSlug(item.model)}?category=${item.category}`}
                                className="text-xs text-slate-500 hover:text-white transition-colors flex items-center group"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-cyber-citron mr-2 transition-colors"></span>
                                {t('Repair')} {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar: Copyright + Controls */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <p>&copy; {new Date().getFullYear()} Belmobile.be. All rights reserved.</p>
                        <span className="hidden md:inline text-slate-700 dark:text-slate-700">|</span>
                        <p className="flex items-center gap-1">
                            Made with <span className="text-red-500 animate-pulse">❤️</span> by <a href="https://devforge.systems" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-bold">Devforge.Systems</a>
                        </p>
                    </div>

                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                        <Link href={`/${language}/sitemap`} className="hover:text-white transition-colors">{t('Sitemap')}</Link>



                        {/* Language Selector */}
                        <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
                            {(['en', 'fr', 'nl'] as const).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${language === lang
                                        ? 'bg-electric-indigo text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
