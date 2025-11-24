
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../hooks/useShop';
import { useData } from '../hooks/useData';
import { NAV_LINKS } from '../constants';
import { BuildingStorefrontIcon, Bars3Icon, XMarkIcon, ChevronDownIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../hooks/useLanguage';

const Header: React.FC = () => {
    const { selectedShop, setSelectedShop } = useShop();
    const { shops } = useData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isShopSelectorOpen, setIsShopSelectorOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    const { language, t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
        setIsShopSelectorOpen(false);
    }, [location]);

    const toggleMenu = () => {
        if (!isMenuOpen) setIsShopSelectorOpen(false);
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleShopSelector = () => {
        if (!isShopSelectorOpen) setIsMenuOpen(false);
        setIsShopSelectorOpen(!isShopSelectorOpen);
    };

    const handleShopSelect = (shopId: number) => {
        const shop = shops.find(s => s.id === shopId);
        if (shop) {
            setSelectedShop(shop);
        }
        setIsShopSelectorOpen(false);
    };

    const handleLanguageChange = (newLang: 'en' | 'fr' | 'nl') => {
        const currentPath = location.pathname;
        // Replace the language prefix in the URL (e.g., /en/about -> /fr/about)
        const newPath = currentPath.replace(/^\/(en|fr|nl)/, `/${newLang}`);
        // Preserve query params (e.g., ?model=iPhone11)
        navigate(newPath + location.search);
    };

    const activeShops = shops.filter(s => s.status !== 'coming_soon');

    return (
        <>
            {/* Floating Island Navigation */}
            <header className={`fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-[1600px] z-50 transition-all duration-500 ease-in-out px-4 sm:px-0 flex justify-center`}>
                <div 
                    className={`
                        relative w-full max-w-6xl rounded-full transition-all duration-500
                        ${scrolled || isMenuOpen
                            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-glow border border-white/20 dark:border-white/10 px-6 py-3'
                            : 'bg-transparent px-6 py-4'
                        }
                    `}
                >
                    <div className="flex items-center justify-between">
                        {/* Official Logo */}
                        <Link to={`/${language}`} className="inline-flex flex-col items-start group select-none">
                            <div className={`text-2xl font-black tracking-tighter leading-none relative z-10 transition-colors ${scrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                                BELMOBILE<span className="text-cyber-citron">.BE</span>
                            </div>
                            <div className="text-[0.5rem] font-bold tracking-[0.34em] text-slate-500 group-hover:text-cyber-citron transition-colors mt-0.5 uppercase whitespace-nowrap ml-0.5">
                                BUYBACK & REPAIR
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-full p-1 border border-white/10 backdrop-blur-sm">
                            {NAV_LINKS.map(link => (
                                <NavLink
                                    key={link.name}
                                    to={`/${language}${link.path}`}
                                    className={({ isActive }) =>
                                        `px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                            isActive 
                                                ? 'bg-white dark:bg-slate-700 text-electric-indigo dark:text-indigo-300 shadow-sm scale-105' 
                                                : 'text-slate-600 dark:text-slate-300 hover:text-electric-indigo dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                        }`
                                    }
                                >
                                    {t(link.name)}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                             {/* Language Selector - Desktop */}
                            <div className="hidden md:flex items-center bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full px-1.5 py-1 border border-white/10">
                                {(['en', 'fr', 'nl'] as const).map(l => (
                                    <button
                                        key={l}
                                        onClick={() => handleLanguageChange(l)}
                                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all uppercase ${
                                            language === l 
                                            ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>

                            {/* Shop Selector */}
                            <div className="relative">
                                <button
                                    onClick={toggleShopSelector}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
                                        selectedShop 
                                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-gray-200 dark:border-slate-700 hover:border-bel-blue dark:hover:border-blue-400 shadow-sm' 
                                            : 'bg-cyber-citron text-slate-900 border-transparent hover:bg-yellow-400'
                                    }`}
                                >
                                    <BuildingStorefrontIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline max-w-[100px] truncate">
                                        {selectedShop ? selectedShop.name.replace('Belmobile ', '') : t('Select Shop')}
                                    </span>
                                    <ChevronDownIcon className="h-3 w-3" />
                                </button>

                                {isShopSelectorOpen && (
                                    <div className="absolute right-0 mt-4 w-64 p-2 glass-panel rounded-2xl shadow-2xl animate-fade-in-up origin-top-right z-50 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700">
                                        <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            {t('Select a Shop')}
                                        </div>
                                        {activeShops.map(shop => (
                                            <button
                                                key={shop.id}
                                                onClick={() => handleShopSelect(shop.id)}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all mb-1 flex items-center justify-between group ${
                                                    selectedShop?.id === shop.id 
                                                        ? 'bg-electric-indigo text-white shadow-lg shadow-indigo-500/30' 
                                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                                                }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{shop.name}</span>
                                                    <span className={`text-xs ${selectedShop?.id === shop.id ? 'text-indigo-100' : 'text-slate-400'}`}>{shop.address}</span>
                                                </div>
                                                {selectedShop?.id === shop.id && <div className="w-2 h-2 bg-cyber-citron rounded-full animate-pulse"></div>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Mobile Toggle */}
                            <button 
                                onClick={toggleMenu} 
                                className="md:hidden p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-700 dark:text-white backdrop-blur-sm transition-colors"
                            >
                                {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {isMenuOpen && (
                        <div className="absolute top-full left-0 right-0 mt-4 mx-4 glass-panel rounded-3xl p-2 shadow-2xl animate-fade-in md:hidden bg-white/95 dark:bg-slate-900/95 border border-white/20 z-40">
                            <div className="flex flex-col space-y-1">
                                {NAV_LINKS.map(link => (
                                    <NavLink
                                        key={link.name}
                                        to={`/${language}${link.path}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `px-6 py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-between ${
                                                isActive 
                                                    ? 'bg-slate-100 dark:bg-slate-800 text-electric-indigo dark:text-indigo-400' 
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            }`
                                        }
                                    >
                                        {t(link.name)}
                                        <span className="text-slate-300 dark:text-slate-600">→</span>
                                    </NavLink>
                                ))}
                            </div>
                            
                             {/* Mobile Language Selector */}
                            <div className="flex justify-center gap-4 p-4 border-t border-gray-100 dark:border-slate-800 mt-2">
                                {(['en', 'fr', 'nl'] as const).map(l => (
                                    <button
                                        key={l}
                                        onClick={() => { handleLanguageChange(l); setIsMenuOpen(false); }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase transition-all ${
                                            language === l
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
