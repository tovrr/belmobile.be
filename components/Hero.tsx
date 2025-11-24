
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { ArrowRightIcon, StarIcon } from '@heroicons/react/24/solid';

const Hero: React.FC = () => {
    const { language, t } = useLanguage();
    
    return (
        <div className="relative overflow-hidden bg-gray-50 dark:bg-deep-space pt-10 pb-20 lg:pt-20 lg:pb-32">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-electric-indigo/20 dark:bg-electric-indigo/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyber-citron/10 dark:bg-cyber-citron/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* Left: Content */}
                    <div className="text-center lg:text-left z-10">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-8 animate-fade-in-up">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-cyber-citron mr-3 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wide">{t('New iPhone 17 Series Available')}</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white mb-8">
                            {t('Your One-Stop')} <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-indigo via-electric-violet to-cyan-400">
                                {t('Mobile Shop')}
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0 font-light">
                            {t("From the latest devices to expert repairs and buybacks, we've got you covered.")}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link
                                to={`/${language}/buyback`}
                                className="group relative px-8 py-4 w-full sm:w-auto bg-electric-indigo text-white text-lg font-bold rounded-2xl shadow-glow hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative z-10 flex items-center justify-center">
                                    {t('Sell Your Device')}
                                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                            
                            <Link
                                to={`/${language}/repair`}
                                className="group px-8 py-4 w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-cyber-citron dark:hover:border-cyber-citron hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center"
                            >
                                {t('Repair Your Device')}
                            </Link>
                        </div>

                        {/* Social Proof */}
                        <div className="mt-12 flex items-center justify-center lg:justify-start space-x-6">
                            <div className="flex -space-x-3">
                                <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
                                <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900" src="https://randomuser.me/api/portraits/women/44.jpg" alt="" />
                                <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900" src="https://randomuser.me/api/portraits/men/86.jpg" alt="" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex text-cyber-citron">
                                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4" />)}
                                </div>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">500+ {t('Happy Customers')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: 3D Visual */}
                    <div className="relative lg:h-[600px] flex items-center justify-center perspective-1000">
                        <div className="relative w-full max-w-md aspect-[4/5] rounded-[3rem] bg-gradient-to-br from-slate-900 to-black p-3 shadow-2xl transform rotate-y-12 hover:rotate-y-0 transition-transform duration-700 ease-out border-4 border-slate-800">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                            <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-800 relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1000&auto=format&fit=crop" 
                                    alt="App Interface" 
                                    className="w-full h-full object-cover opacity-80 mix-blend-overlay" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-electric-indigo/50 to-transparent flex flex-col justify-end p-8">
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl mb-4 transform translate-y-4 animate-float">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="h-2 w-20 bg-white/50 rounded-full"></div>
                                            <div className="h-2 w-8 bg-green-400 rounded-full"></div>
                                        </div>
                                        <div className="h-4 w-32 bg-white rounded-full mb-2"></div>
                                        <div className="h-3 w-24 bg-white/50 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Floating Elements */}
                        <div className="absolute -right-12 top-20 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl shadow-indigo-500/20 animate-float border border-slate-100 dark:border-slate-700" style={{animationDelay: '1s'}}>
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                                    <span className="font-bold text-xl">€</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">{t('Best Price')}</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t('Guaranteed')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -left-4 bottom-32 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl shadow-indigo-500/20 animate-float border border-slate-100 dark:border-slate-700" style={{animationDelay: '2s'}}>
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">{t('Repair Time')}</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t('Less than 30 mins')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hero;
