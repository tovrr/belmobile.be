'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../hooks/useLanguage';
import { ArrowRightIcon, BoltIcon, StarIcon, CheckCircleIcon, SearchIcon, XMarkIcon } from '../../ui/BrandIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { modelsData } from '../../../data/deviceData';

// Helper Interface
interface DeviceOption {
    id: string; // unique key
    brand: string;
    model: string;
    price: number;
    label: string;
}

interface ApolloHeroProps {
    mode: 'repair' | 'buyback';
    setMode: (mode: 'repair' | 'buyback') => void;
}

const ApolloHero: React.FC<ApolloHeroProps> = ({ mode, setMode }) => {
    const { language, t } = useLanguage();
    const router = useRouter();

    // --- APOLLO ENGINE: State ---
    // Mode is now controlled by parent

    // Smart Search State
    const [query, setQuery] = useState('');
    const [selectedDevice, setSelectedDevice] = useState<DeviceOption | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Click outside to close results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- APOLLO ENGINE: Smart Indexing ---
    const deviceIndex = useMemo(() => {
        const index: DeviceOption[] = [];
        Object.entries(modelsData).forEach(([brandKey, seriesData]) => {
            Object.values(seriesData).forEach(models => {
                Object.entries(models).forEach(([modelName, price]) => {
                    const brandLabel = brandKey.charAt(0).toUpperCase() + brandKey.slice(1);
                    index.push({
                        id: `${brandKey}-${modelName}`,
                        brand: brandKey,
                        model: modelName,
                        price: price,
                        label: `${brandLabel} ${modelName}`
                    });
                });
            });
        });
        return index;
    }, []);

    // Filter Logic
    const filteredDevices = useMemo(() => {
        if (!query || query.length < 2) return [];
        const lowerQ = query.toLowerCase();
        return deviceIndex
            .filter(d => d.label.toLowerCase().includes(lowerQ))
            .slice(0, 6);
    }, [query, deviceIndex]);

    // --- APOLLO ENGINE: Actions ---
    const handleSelect = (device: DeviceOption) => {
        setSelectedDevice(device);
        setQuery(device.label);
        setShowResults(false);
        // Instant feedback vibration for mobile if supported
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }
    };

    const handleClear = () => {
        setQuery('');
        setSelectedDevice(null);
    };

    const handleAction = () => {
        if (!selectedDevice) return;
        setIsAnimating(true);
        setTimeout(() => {
            const baseUrl = `/${language}/${mode === 'repair' ? (language === 'fr' ? 'reparation' : 'repair') : (language === 'fr' ? 'rachat' : 'buyback')}`;
            const queryParams = `?brand=${selectedDevice.brand}&model=${encodeURIComponent(selectedDevice.model)}`;
            router.push(baseUrl + queryParams);
        }, 400); // Faster transition for Apollo feel
    };

    const getTitle = () => {
        if (mode === 'repair') {
            const titles = {
                en: { t1: "Repairs.", t2: "Instant." },
                fr: { t1: "Réparations.", t2: "Instantanées." },
                nl: { t1: "Reparaties.", t2: "Direct." },
                tr: { t1: "Tamir.", t2: "Anında." }
            };
            // @ts-ignore
            return titles[language] || titles.en;
        } else {
            const titlesBuyback = {
                en: { t1: "Buyback.", t2: "Instant." },
                fr: { t1: "Rachats.", t2: "Instantanés." },
                nl: { t1: "Inkoop.", t2: "Direct." },
                tr: { t1: "Satış.", t2: "Anında." }
            };
            // @ts-ignore
            return titlesBuyback[language] || titlesBuyback.en;
        }
    };

    const titleTxt = getTitle();

    return (
        <section className="relative bg-slate-50 dark:bg-deep-space pt-6 pb-12 overflow-hidden flex flex-col justify-center min-h-[85vh]">
            {/* Optimized Speed Background */}
            <div className="absolute top-0 right-0 w-full h-[120%] bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-deep-space dark:via-slate-900 dark:to-slate-950 -z-20 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-md mx-auto text-center mb-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-citron text-slate-900 font-black uppercase tracking-tighter text-[10px] mb-4 shadow-xl shadow-cyber-citron/20"
                    >
                        <BoltIcon className="w-3 h-3" />
                        <span>Apollo Engine v2.0</span>
                    </motion.div>

                    <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-2 leading-tight tracking-tighter">
                        {titleTxt.t1}
                        <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-cyber-citron to-lime-500">
                            {titleTxt.t2}
                        </span>
                    </h1>
                </div>

                {/* THE APOLLO WIDGET - THUMB OPTIMIZED */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto relative"
                >
                    {/* Glowing Aura - Optimized for no-jank */}
                    <div className={`absolute -inset-0.5 bg-linear-to-r rounded-2xl blur-sm opacity-20 transition-all duration-300 ${mode === 'repair' ? 'from-electric-indigo to-purple-600' : 'from-cyber-citron to-lime-500'}`}></div>

                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col z-20 overflow-hidden">
                        {/* Mode Switcher - Large Touch Targets */}
                        <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 gap-1.5 border-b border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setMode('repair')}
                                className={`flex-1 py-3 px-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 ${mode === 'repair' ? 'bg-white dark:bg-slate-900 text-electric-indigo shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                            >
                                {t('Repair')}
                            </button>
                            <button
                                onClick={() => setMode('buyback')}
                                className={`flex-1 py-3 px-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 ${mode === 'buyback' ? 'bg-white dark:bg-slate-900 text-cyber-citron shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                            >
                                {t('Buyback')}
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Smart Search Bar - Input Optimized */}
                            <div className="relative" ref={searchRef}>
                                <div className={`flex items-center bg-slate-50 dark:bg-slate-950 border-2 rounded-xl transition-all h-16 ${showResults && filteredDevices.length > 0 ? 'border-electric-indigo ring-4 ring-electric-indigo/10 rounded-b-none border-b-0'
                                    : 'border-slate-100 dark:border-slate-800 focus-within:border-electric-indigo'
                                    }`}>
                                    <div className="pl-4 text-slate-400 shrink-0">
                                        <SearchIcon className="w-6 h-6" />
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="search"
                                        enterKeyHint="search"
                                        spellCheck={false}
                                        value={query}
                                        onChange={(e) => {
                                            setQuery(e.target.value);
                                            setSelectedDevice(null);
                                            setShowResults(true);
                                        }}
                                        onFocus={() => setShowResults(true)}
                                        placeholder={language === 'fr' ? "Modèle (ex: iPhone 14)" : "Model (e.g. iPhone 14)"}
                                        className="w-full h-full px-3 bg-transparent font-bold text-lg text-slate-900 dark:text-white outline-none placeholder:text-slate-400 placeholder:font-medium [-webkit-appearance:none]"
                                        autoComplete="off"
                                    />
                                    {query && (
                                        <button onClick={handleClear} className="px-4 text-slate-400 h-full shrink-0">
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Results Dropdown - Fast List */}
                                <AnimatePresence>
                                    {showResults && filteredDevices.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scaleY: 0.95 }}
                                            animate={{ opacity: 1, scaleY: 1 }}
                                            exit={{ opacity: 0, scaleY: 0.95 }}
                                            className="absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-2 border-t-0 border-electric-indigo rounded-b-xl shadow-2xl overflow-hidden z-50 origin-top"
                                        >
                                            {filteredDevices.map((device, idx) => (
                                                <button
                                                    key={device.id}
                                                    onClick={() => handleSelect(device)}
                                                    className="w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center border-b border-slate-100 dark:border-slate-900 last:border-0"
                                                >
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{device.label}</span>
                                                    {mode === 'buyback' && (
                                                        <span className="text-xs font-black text-cyber-citron bg-cyber-citron/10 px-2 py-1 rounded-lg">
                                                            ~€{device.price}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Dynamic Feedback - No Layout Shift (Fixed Height Area) */}
                            <div className="h-14 flex items-center">
                                <AnimatePresence mode="wait">
                                    {selectedDevice ? (
                                        <motion.div
                                            key="selected"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                {mode === 'buyback' ? (
                                                    <div className="p-1.5 bg-cyber-citron/20 rounded-lg">
                                                        <BoltIcon className="w-5 h-5 text-cyber-citron" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1.5 bg-electric-indigo/20 rounded-lg">
                                                        <CheckCircleIcon className="w-5 h-5 text-electric-indigo" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                                                        {mode === 'buyback'
                                                            ? (language === 'fr' ? 'Offre Estimée' : 'Estimated Offer')
                                                            : (language === 'fr' ? 'Disponibilité' : 'Availability')}
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                                        {mode === 'buyback'
                                                            ? `€${selectedDevice.price} Cash`
                                                            : (language === 'fr' ? 'Aujourd\'hui: 30-45min' : 'Today: 30-45min')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="placeholder"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.5 }}
                                            className="w-full text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                                        >
                                            {language === 'fr' ? 'Choisissez votre appareil ci-dessus' : 'Pick your device above'}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Action Button - Massive Thumb Target */}
                            <button
                                onClick={handleAction}
                                disabled={!selectedDevice || isAnimating}
                                className={`w-full py-5 rounded-xl font-black text-lg uppercase tracking-tighter shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 ${selectedDevice
                                    ? (mode === 'repair'
                                        ? 'bg-electric-indigo text-white shadow-electric-indigo/40'
                                        : 'bg-cyber-citron text-slate-900 shadow-cyber-citron/40')
                                    : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-700 grayscale pointer-events-none'
                                    }`}
                            >
                                {isAnimating ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ...
                                    </span>
                                ) : (
                                    <>
                                        {selectedDevice ? (
                                            mode === 'repair' ? (language === 'fr' ? 'Réparer Maintenant' : 'Repair Now') : (language === 'fr' ? 'Vendre en 30s' : 'Sell in 30s')
                                        ) : (
                                            language === 'fr' ? 'Commencer' : 'Start'
                                        )}
                                        <ArrowRightIcon className="w-6 h-6" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Micro Trust - Vertical for mobile reach */}
                <div className="mt-8 flex flex-col items-center gap-3 text-center">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm border border-slate-200 dark:border-slate-700/50">
                        <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tighter">4.9/5 Google</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-60">
                        Powered by Belmobile.be
                    </p>
                </div>
            </div>
        </section>
    );
}

export default ApolloHero;
