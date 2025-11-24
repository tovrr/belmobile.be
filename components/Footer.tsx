


import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { SunIcon, MoonIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
    const { language, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLanguageChange = (newLang: 'en' | 'fr' | 'nl') => {
        if (newLang === language) return;
        const currentPath = location.pathname;
        const newPath = currentPath.replace(/^\/(en|fr|nl)/, `/${newLang}`);
        // Preserve query params (e.g., ?model=iPhone11)
        navigate(newPath + location.search);
    };

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
                    
                    {/* Brand Column */}
                    <div className="lg:col-span-4">
                        {/* Unified Brand Logo Lockup */}
                        <Link to={`/${language}`} className="inline-flex flex-col items-start group mb-6 select-none">
                            <div className="text-3xl font-black tracking-tighter text-white leading-none relative z-10">
                                BELMOBILE<span className="text-cyber-citron">.BE</span>
                            </div>
                            <div className="text-[0.65rem] font-bold tracking-[0.34em] text-slate-500 group-hover:text-cyber-citron transition-colors mt-1.5 uppercase whitespace-nowrap ml-0.5">
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
                        <div className="relative max-w-sm">
                            <input 
                                type="email" 
                                placeholder={t('newsletter_placeholder')} 
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none transition-all backdrop-blur-sm"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-electric-indigo rounded-lg text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30">
                                <PaperAirplaneIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Top Buybacks - SEO Booster */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-6 text-cyber-citron">{t('Top Buybacks')}</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link to={`/${language}/buyback?device=smartphone&brand=Apple&model=iPhone%2011`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('link_sell_iphone_11')}</Link></li>
                            <li><Link to={`/${language}/buyback?device=smartphone&brand=Apple&model=iPhone%2013`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('link_sell_iphone_13')}</Link></li>
                            <li><Link to={`/${language}/buyback?device=smartphone&brand=Apple&model=iPhone%2014`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('link_sell_iphone_14')}</Link></li>
                            <li><Link to={`/${language}/buyback?device=console&brand=Sony&model=PlayStation%205%20(Disc)`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('link_sell_ps5')}</Link></li>
                            <li><Link to={`/${language}/buyback?device=laptop&brand=Apple`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('link_sell_macbook')}</Link></li>
                        </ul>
                    </div>

                    {/* Popular Repairs - SEO Booster */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-6 text-cyber-citron">{t('Popular Repairs')}</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link to={`/${language}/repair?device=smartphone&brand=Apple&model=iPhone%2011`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('link_repair_iphone_11')}</Link></li>
                            <li><Link to={`/${language}/repair?device=smartphone&brand=Apple&model=iPhone%2012`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('link_repair_iphone_12')}</Link></li>
                            <li><Link to={`/${language}/repair?device=smartphone&brand=Apple&model=iPhone%2013`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('link_repair_iphone_13')}</Link></li>
                            <li><Link to={`/${language}/repair?device=smartphone&brand=Apple&model=iPhone%2014%20Pro`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('link_repair_iphone_14_pro')}</Link></li>
                            <li><Link to={`/${language}/repair?device=smartphone&brand=Samsung&model=Galaxy%20S23`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('link_repair_s23')}</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-6 text-cyber-citron">{t('Support')}</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link to={`/${language}/contact`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Contact Us')}</Link></li>
                            <li><Link to={`/${language}/faq`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Help Center')}</Link></li>
                            <li><Link to={`/${language}/blog`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Blog')}</Link></li>
                            <li><Link to={`/${language}/terms`} className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">{t('Terms & Privacy')}</Link></li>
                            <li><Link to={`/${language}/franchise`} className="text-white font-semibold hover:text-cyber-citron transition-colors mt-2 block border-b border-white/20 pb-1 w-fit">{t('Open Your Own Shop')}</Link></li>
                        </ul>
                    </div>

                    {/* Controls Column */}
                    <div className="lg:col-span-2 lg:flex lg:flex-col lg:items-end">
                        <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-6 text-cyber-citron">{t('Social')}</h4>
                        <div className="flex space-x-4 mb-8">
                           <a href="#" className="bg-white/5 p-3 rounded-xl hover:bg-electric-indigo hover:scale-110 transition-all border border-white/5"><span className="sr-only">FB</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                           <a href="#" className="bg-white/5 p-3 rounded-xl hover:bg-electric-indigo hover:scale-110 transition-all border border-white/5"><span className="sr-only">IG</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
                        </div>

                        <div className="flex items-center space-x-4 p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                             {/* Theme Toggle */}
                             <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                            </button>

                            {/* Language Selector */}
                            <div className="flex items-center space-x-1">
                                {(['en', 'fr', 'nl'] as const).map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => handleLanguageChange(lang)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                                            language === lang 
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

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Belmobile.be. {t('All rights reserved')}.</p>
                    <p className="mt-4 md:mt-0">Made with ❤️ by DevForge Systems</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to={`/${language}/terms`} className="hover:text-white transition-colors">{t('Privacy Policy')}</Link>
                        <Link to={`/${language}/terms`} className="hover:text-white transition-colors">{t('Terms of Service')}</Link>
                        <Link to="#" className="hover:text-white transition-colors">{t('Cookie Settings')}</Link>
                        <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{t('Sitemap')}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
