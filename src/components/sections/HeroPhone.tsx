import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { Battery, Wifi, FileText, ShieldCheck, Clock, Leaf, CheckCircle2, Search } from 'lucide-react';

const HeroPhone = () => {
    const { t } = useLanguage();
    const [time, setTime] = React.useState("10:30");

    React.useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            setTime(`${hours}:${minutes < 10 ? '0' : ''}${minutes}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full flex items-center justify-center lg:justify-center pt-12 pb-12 lg:py-0">

            <div className="relative">
                {/* 1. The Ultimate CSS Phone Mockup - Static & Interactive */}
                <motion.div
                    className="relative z-10 w-full max-w-[320px] sm:max-w-[480px] lg:max-w-none lg:w-auto lg:h-[75vh] lg:max-h-[750px] aspect-9/18 transform-gpu perspective-1000 mx-auto lg:mx-0"
                    initial={{ y: 0, rotateY: 10 }}
                    whileHover={{
                        rotateY: 0,
                        scale: 1.02,
                        transition: { duration: 0.5, ease: "easeOut" }
                    }}
                    transition={{ duration: 1 }}
                >
                    {/* Phone Body / Chassis */}
                    {/* A thick Matte Slate-900 outer frame + thin glossy inner bezel */}
                    <div className="relative aspect-9/18 bg-slate-900 rounded-[3.5rem] border-8 border-slate-900 shadow-2xl overflow-hidden ring-1 ring-white/10 ring-inset">

                        {/* Inner Black Bezel */}
                        <div className="absolute inset-1 rounded-[3.2rem] bg-black border-2 border-black">
                            {/* The Screen */}
                            <div className="absolute inset-0 rounded-[3rem] overflow-hidden bg-slate-950 w-full h-full">

                                {/* Wallpaper Image */}
                                <Image
                                    src="/images/iphone-repair-schaerbeek-brussels-belmobile.webp"
                                    alt="Belmobile Premium Repair"
                                    fill
                                    priority
                                    className="object-cover z-0"
                                />

                                {/* Overlay Gradient for contrast */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/10 pointer-events-none z-10"></div>

                                {/* Dynamic Island / Notch */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-30 flex items-center justify-center gap-3">
                                    <div className="w-16 h-[60%] rounded-full bg-slate-900/50"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800/80"></div>
                                </div>

                                {/* Status Bar */}
                                <div className="absolute top-4 left-8 z-30 text-[10px] font-bold text-white tracking-widest">{time}</div>
                                <div className="absolute top-4 right-8 z-30 flex items-center gap-1.5 text-white">
                                    <Wifi size={12} strokeWidth={3} />
                                    <Battery size={12} strokeWidth={3} />
                                </div>

                                {/* The "Smart Dock" - Bottom 24% Compact Panel */}
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-[24%] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-white/20 dark:border-slate-800 rounded-t-[2.5rem] p-3.5 flex flex-col justify-center gap-4 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]"
                                    initial={{ y: 0 }}
                                >
                                    {/* Compact Status Header */}
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="bg-green-100 dark:bg-green-500/20 p-1.5 rounded-full text-green-600 dark:text-green-400 shrink-0">
                                                <CheckCircle2 size={16} strokeWidth={3} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">iPhone 13 Pro</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{t('Screen Replacement')}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full shrink-0 ml-2">{t('Completed')}</span>
                                    </div>

                                    {/* Action Buttons - Icons + Short Text */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex items-center justify-center gap-2 py-2.5 px-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            <Search size={14} />
                                            <span className="truncate">{t('Track')}</span>
                                        </button>
                                        <button className="flex items-center justify-center gap-2 py-2.5 px-2 bg-blue-600 rounded-xl text-[10px] font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                            <FileText size={14} />
                                            <span className="truncate">PDF</span>
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Home Indicator */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-black/20 dark:bg-white/20 rounded-full z-40"></div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 3. The Ecosystem (Orbiting Badges) - Static & Overlapping */}

                {/* Top Right: Best Price */}
                <div className="absolute top-[8%] -right-6 md:top-[15%] md:-right-20 z-20 scale-[0.7] sm:scale-75 md:scale-100 origin-bottom-left">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 flex items-center gap-3 transform hover:scale-105 transition-transform">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl text-yellow-600 dark:text-yellow-400 font-bold">€</div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{t('Best Price')}</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{t('Guaranteed')}</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Right: Eco Friendly */}
                <div className="absolute bottom-[18%] -right-6 md:bottom-[26%] md:-right-20 z-20 scale-[0.7] sm:scale-75 md:scale-100 origin-top-left">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 flex items-center gap-3 transform hover:scale-105 transition-transform">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <Leaf size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{t('Eco-Friendly')}</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">100%</p>
                        </div>
                    </div>
                </div>

                {/* Top Left: Warranty */}
                <div className="absolute top-[12%] -left-6 md:top-[25%] md:-left-20 z-20 scale-[0.7] sm:scale-75 md:scale-100 origin-bottom-right">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 flex items-center gap-3 transform hover:scale-105 transition-transform">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl text-purple-600 dark:text-purple-400">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{t('trust_warranty')}</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{t('badge_warranty_time')}</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Left: Repair Time */}
                <div className="absolute bottom-[22%] -left-6 md:bottom-[35%] md:-left-20 z-20 scale-[0.7] sm:scale-75 md:scale-100 origin-top-right">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700 flex items-center gap-3 transform hover:scale-105 transition-transform">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                            <Clock size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{t('Repair Time')}</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">30 Min</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default HeroPhone;
