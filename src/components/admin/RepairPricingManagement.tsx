'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';
import { createSlug } from '../../utils/slugs';
import { RepairPricingMatrix } from './RepairPricingMatrix';
import { usePricingEngine, PricingEngineProvider } from '../../context/PricingEngineContext';
import {
    MagnifyingGlassIcon,
    PhotoIcon,
    DevicePhoneMobileIcon,
    SignalIcon,
    TableCellsIcon,
    CpuChipIcon,
    ChartBarIcon,
    CurrencyEuroIcon,
    WrenchScrewdriverIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../hooks/useLanguage';
import { SEARCH_INDEX } from '../../data/search-index';
import { DEVICE_BRANDS } from '../../data/brands';
import { normalizeCategoryLabel } from '../../utils/pricing-utils';
import { compressImage } from '../../utils/imageUtils';

import { BatchPricingTools } from './BatchPricingTools';
import { BulkPriceEditor } from './BulkPriceEditor';

function RepairPricingContent() {
    const { robustSettings, loading: settingsLoading } = useGlobalSettings();

    // Context State
    const {
        selectedBrand, setSelectedBrand,
        selectedModel, setSelectedModel,
        deviceId,
        viewMode, setViewMode,
        marketData, loadingMarket,
        scanMarket, syncStatus, prices, updatePrice
    } = usePricingEngine();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Smartphone');
    const [models, setModels] = useState<string[]>([]);

    // Device Image State (Local)
    const [deviceImage, setDeviceImage] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);

    // Derived
    const categorySlug = selectedCategory.toLowerCase().replace(' ', '_');

    // --- EFFECT: Load Models ---
    const availableBrands = useMemo(() => {
        const categoryMap: Record<string, string> = {
            'Smartphone': 'smartphone',
            'Tablet': 'tablet',
            'Laptop': 'laptop',
            'Smartwatch': 'smartwatch',
            'Console (Home)': 'console_home',
            'Console (Portable)': 'console_portable'
        };
        const categoryKey = categoryMap[selectedCategory] as keyof typeof DEVICE_BRANDS;
        return DEVICE_BRANDS[categoryKey] || [];
    }, [selectedCategory]);

    useEffect(() => {
        const loadModels = async () => {
            if (!selectedBrand) {
                setModels([]);
                return;
            }
            try {
                const brandSlug = createSlug(selectedBrand);
                const modelsModule = await import(`../../data/models/${brandSlug}`);
                const allModels: string[] = [];
                const categoryMap: Record<string, string> = {
                    'Smartphone': 'smartphone',
                    'Tablet': 'tablet',
                    'Laptop': 'laptop',
                    'Smartwatch': 'smartwatch',
                    'Console (Home)': 'console_home',
                    'Console (Portable)': 'console_portable'
                };
                const categoryKey = categoryMap[selectedCategory] || selectedCategory.toLowerCase();
                const categoryModels = modelsModule.MODELS[categoryKey];
                if (categoryModels) {
                    allModels.push(...Object.keys(categoryModels));
                }
                setModels(allModels.sort());
            } catch (error) {
                console.error("Failed to load models", error);
                setModels([]);
            }
        };
        loadModels();
    }, [selectedBrand, selectedCategory]);

    // --- EFFECT: Fetch Image ---
    useEffect(() => {
        const fetchImage = async () => {
            if (!deviceId) {
                setDeviceImage('');
                return;
            }
            try {
                const { doc, getDoc } = await import('firebase/firestore');
                const { db } = await import('../../firebase');
                const docRef = doc(db, 'repair_prices', deviceId);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setDeviceImage(snap.data().imageUrl || '');
                } else {
                    setDeviceImage('');
                }
            } catch (e) {
                console.error("Error fetching image", e);
            }
        };
        fetchImage();
    }, [deviceId]);

    // --- HANDLER: Image Upload ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !deviceId) return;
        setUploadingImage(true);
        try {
            const compressedBlob = await compressImage(file);
            const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const storage = getStorage();
            const filename = `devices/${createSlug(selectedBrand)}/${deviceId}-${Date.now()}.webp`;
            const storageRef = ref(storage, filename);
            await uploadBytes(storageRef, compressedBlob);
            const downloadURL = await getDownloadURL(storageRef);
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../../firebase');
            await setDoc(doc(db, 'repair_prices', deviceId), {
                imageUrl: downloadURL,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            setDeviceImage(downloadURL);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed.");
        } finally {
            setUploadingImage(false);
        }
    };

    // --- SEARCH ---
    const searchResults = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        const term = searchTerm.toLowerCase();
        const results: { brand: string, model: string, category: string }[] = [];
        const seen = new Set<string>();
        Object.values(SEARCH_INDEX).forEach((item) => {
            if (item.model?.toLowerCase().includes(term) || item.keywords?.some((k: string) => k.toLowerCase().includes(term))) {
                const uniqueKey = `${item.brand}-${item.model}`;
                if (!seen.has(uniqueKey)) {
                    results.push({ brand: item.brand, model: item.model, category: item.category });
                    seen.add(uniqueKey);
                }
            }
        });
        return results.slice(0, 20);
    }, [searchTerm]);

    const handleSearchResultClick = (brand: string, model: string, category: string) => {
        setSelectedBrand(brand);
        setSelectedCategory(normalizeCategoryLabel(category, brand));
        setTimeout(() => setSelectedModel(model), 100);
        setSearchTerm('');
    };

    if (settingsLoading || !robustSettings) {
        return <div className="p-8 text-center">Loading Pricing Engine...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        Master Pricing Dashboard
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">v2.0 Beta</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Unified Repair & Buyback Engine with Market Radar 📡
                    </p>
                </div>

                <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                    <button onClick={() => setViewMode('single')} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${viewMode === 'single' ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>
                        <CpuChipIcon className="h-4 w-4" /> Single
                    </button>
                    <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>
                        <TableCellsIcon className="h-4 w-4" /> Grid
                    </button>
                    <button onClick={() => setViewMode('batch')} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${viewMode === 'batch' ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>
                        Batch
                    </button>
                </div>
            </div>

            {/* --- VIEWS --- */}

            {/* GRID VIEW */}
            <div className={viewMode === 'grid' ? 'block' : 'hidden'}>
                <BulkPriceEditor />
            </div>

            {/* BATCH VIEW */}
            <div className={viewMode === 'batch' ? 'block' : 'hidden'}>
                <BatchPricingTools />
            </div>

            {/* SINGLE VIEW */}
            <div className={viewMode === 'single' ? 'block' : 'hidden'}>

                {/* 1. SELECTION CARD */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 mb-8">
                    {/* Search */}
                    <div className="max-w-2xl mx-auto relative z-20 mb-8">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search device..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none shadow-xl"
                            />
                        </div>
                        {searchTerm.length >= 2 && searchResults.length > 0 && (
                            <div className="absolute top-full w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl z-50 mt-2 max-h-60 overflow-y-auto">
                                {searchResults.map((res, i) => (
                                    <button key={i} onClick={() => handleSearchResultClick(res.brand, res.model, res.category)} className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-slate-800">
                                        {res.brand} {res.model}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="p-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                            {['Smartphone', 'Tablet', 'Laptop', 'Smartwatch', 'Console (Home)', 'Console (Portable)'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="p-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                            {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={!selectedBrand} className="p-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                            <option value="">Select Model...</option>
                            {models.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>

                {/* 3. CONTENT (Split View) */}
                {deviceId && selectedModel ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: Pricing Matrix */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <CurrencyEuroIcon className="w-5 h-5 text-indigo-600" />
                                        Repair Price Matrix
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => scanMarket && scanMarket()}
                                            className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                                        >
                                            <SignalIcon className={`w-3 h-3 ${loadingMarket ? 'animate-pulse' : ''}`} />
                                            {loadingMarket ? 'Scanning...' : 'Scan Market'}
                                        </button>
                                        <span className={`text-xs px-2 py-1 rounded-full ${syncStatus === 'synced' ? 'bg-green-100 text-green-700' :
                                            syncStatus === 'saving' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                            {syncStatus === 'synced' ? 'All changes saved' :
                                                syncStatus === 'saving' ? 'Saving...' : 'Ready'}
                                        </span>
                                    </div>
                                </div>

                                {/* Re-integrating the core matrix here but enhanced */}
                                <div className="space-y-4">
                                    {/* This renders the actual matrix inputs */}
                                    {/* We are simplifying and wrapping the core Logic for Demo */}
                                    <RepairPricingMatrix
                                        key={`${deviceId}-repair`}
                                        deviceId={deviceId}
                                        category={categorySlug}
                                        globalSettings={robustSettings}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Market Pulse Radar */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <SignalIcon className="w-5 h-5 text-indigo-600" />
                                Brussels Radar
                            </h3>

                            {marketData.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <p>No market data found.</p>
                                    <button
                                        onClick={() => scanMarket && scanMarket()}
                                        className="mt-2 text-indigo-600 text-sm font-medium hover:underline"
                                    >
                                        Run Scan Now
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {marketData.map((data, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{data.competitor}</p>
                                                <a href={data.url} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-indigo-500 truncate block max-w-[120px]">
                                                    {data.url}
                                                </a>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">€{data.price}</p>
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(data.lastUpdated).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Settings</h4>
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900">Auto-Match Lowest</span>
                                </label>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
                        <DevicePhoneMobileIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">Select a device to start</h3>
                    </div>
                )}
            </div>
        </div>
    );
}

// Wrap with Provider
export default function RepairPricingManagement() {
    return (
        <PricingEngineProvider>
            <RepairPricingContent />
        </PricingEngineProvider>
    );
}
