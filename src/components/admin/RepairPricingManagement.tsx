'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';
import { createSlug } from '../../utils/slugs';
import { RepairPricingMatrix } from './RepairPricingMatrix';
import BuybackPricingMatrix from './BuybackPricingMatrix';
import ProductPricingMatrix from './ProductPricingMatrix';
import {
    MagnifyingGlassIcon,
    PhotoIcon,
    DevicePhoneMobileIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../hooks/useLanguage';
import { SEARCH_INDEX } from '../../data/search-index';
import { DEVICE_TYPES } from '../../constants';
import { DEVICE_BRANDS } from '../../data/brands';
import { normalizeCategoryLabel } from '../../utils/pricing-utils';
import { compressImage } from '../../utils/imageUtils';

import { BatchPricingTools } from './BatchPricingTools';

export default function RepairPricingManagement() {
    const { robustSettings, loading, seedDefaults } = useGlobalSettings();
    const { t } = useLanguage();

    // View Mode
    const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Dropdown states
    const [selectedCategory, setSelectedCategory] = useState('Smartphone');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [models, setModels] = useState<string[]>([]);

    // Final selected device
    const [selectedDevice, setSelectedDevice] = useState<{ brand: string, model: string, category: string } | null>(null);

    // Image state
    const [deviceImage, setDeviceImage] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);

    // Derived device ID
    const deviceId = selectedDevice ? createSlug(`${selectedDevice.brand} ${selectedDevice.model}`) : '';
    const categorySlug = selectedDevice?.category.toLowerCase() || 'smartphone';

    // Get brands for selected category
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

    // Update selected brand when category changes
    useEffect(() => {
        setSelectedBrand(availableBrands[0] || '');
    }, [availableBrands]);

    // Load models when brand changes
    useEffect(() => {
        const loadModels = async () => {
            if (!selectedBrand) {
                setModels([]);
                setSelectedModel('');
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
                setSelectedModel('');
            } catch (error) {
                console.error("Failed to load models", error);
                setModels([]);
            }
        };
        loadModels();
    }, [selectedBrand, selectedCategory]);

    // Update selectedDevice when dropdown model changes
    useEffect(() => {
        if (selectedModel && selectedBrand) {
            const categoryMap: Record<string, string> = {
                'Smartphone': 'smartphone',
                'Tablet': 'tablet',
                'Laptop': 'laptop',
                'Smartwatch': 'smartwatch',
                'Console (Home)': 'console_home',
                'Console (Portable)': 'console_portable'
            };
            const categorySlugVal = categoryMap[selectedCategory] || selectedCategory.toLowerCase();
            setSelectedDevice({
                brand: selectedBrand,
                model: selectedModel,
                category: categorySlugVal
            });
        }
    }, [selectedModel, selectedBrand, selectedCategory]);

    // Fetch Device Image
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

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !deviceId) return;

        setUploadingImage(true);
        try {
            // Compress
            const compressedBlob = await compressImage(file);

            // Upload
            const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const storage = getStorage();
            const filename = `devices/${createSlug(selectedBrand)}/${deviceId}-${Date.now()}.webp`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, compressedBlob);
            const downloadURL = await getDownloadURL(storageRef);

            // Save URL to Firestore
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../../firebase');
            await setDoc(doc(db, 'repair_prices', deviceId), {
                imageUrl: downloadURL,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setDeviceImage(downloadURL);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Check console.");
        } finally {
            setUploadingImage(false);
        }
    };

    // Search logic
    const searchResults = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        const term = searchTerm.toLowerCase();
        const results: { brand: string, model: string, category: string }[] = [];
        const seen = new Set<string>();

        Object.values(SEARCH_INDEX).forEach((item) => {
            const matchesModel = item.model?.toLowerCase().includes(term);
            const matchesKeyword = item.keywords?.some((k: string) => k.toLowerCase().includes(term));

            if (matchesModel || matchesKeyword) {
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
        setSelectedDevice({ brand, model, category });
        setSearchTerm('');
        setSelectedCategory(normalizeCategoryLabel(category, brand));
        setSelectedBrand(brand);
        setTimeout(() => setSelectedModel(model), 100);
    };

    if (loading || !robustSettings) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Master Pricing Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage Images, Repair, Buyback, and Product prices in one place.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('single')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'single' ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        {t('Single Device')}
                    </button>
                    <button
                        onClick={() => setViewMode('batch')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'batch' ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        {t('Batch Tools')}
                    </button>
                </div>
            </div>

            {viewMode === 'batch' ? (
                <BatchPricingTools />
            ) : (
                <>
                    {/* Device Selection & Configuration */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                        {/* Global Search Bar */}
                        <div className="max-w-2xl mx-auto relative z-20 mb-8">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for any device (e.g., 'iPhone 13', 'Galaxy S24')..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none shadow-xl"
                                />
                            </div>
                            {/* Search Results */}
                            {searchTerm.length >= 2 && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 max-h-80 overflow-y-auto z-50">
                                    {searchResults.map((res, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSearchResultClick(res.brand, res.model, res.category)}
                                            className="w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-slate-800 last:border-0 transition-colors flex items-center gap-4"
                                        >
                                            <div className="bg-gray-100 dark:bg-slate-800 p-2.5 rounded-xl">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{res.brand} {res.model}</div>
                                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full w-fit mt-1">
                                                    {(DEVICE_TYPES.find(d => d.id === res.category)?.label) || res.category}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-8">
                            {/* Dropdowns */}
                            <div className="w-full space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Device Type</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none"
                                        >
                                            <option>Smartphone</option>
                                            <option>Tablet</option>
                                            <option>Laptop</option>
                                            <option>Smartwatch</option>
                                            <option>Console (Home)</option>
                                            <option>Console (Portable)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Brand</label>
                                        <select
                                            value={selectedBrand}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'NEW__BRAND') {
                                                    const newBrand = prompt("Enter new brand name:");
                                                    if (newBrand) {
                                                        setSelectedBrand(newBrand);
                                                        setModels([]); // Reset models for new brand
                                                    }
                                                } else {
                                                    setSelectedBrand(val);
                                                }
                                            }}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none"
                                        >
                                            {availableBrands.map(brand => (
                                                <option key={brand} value={brand}>{brand}</option>
                                            ))}
                                            <option disabled>──────────</option>
                                            <option value="NEW__BRAND">➕ Add New Brand</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Model</label>
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'NEW__MODEL') {
                                                    const newModel = prompt("Enter new model name:");
                                                    if (newModel) {
                                                        // Update models list locally to include it immediately
                                                        setModels(prev => [...prev, newModel].sort());
                                                        setTimeout(() => setSelectedModel(newModel), 50);
                                                    }
                                                } else {
                                                    setSelectedModel(val);
                                                }
                                            }}
                                            disabled={!selectedBrand}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none disabled:opacity-50"
                                        >
                                            <option value="">Select model...</option>
                                            {models.map(model => (
                                                <option key={model} value={model}>{model}</option>
                                            ))}
                                            <option disabled>──────────</option>
                                            <option value="NEW__MODEL">➕ Add New Model</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Selected Device Banner */}
                                {selectedDevice && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                                                📱 {selectedDevice.brand} {selectedDevice.model}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setSelectedDevice(null);
                                                    setSelectedModel('');
                                                }}
                                                className="text-xs text-blue-700 dark:text-blue-400 hover:underline"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing Matrices */}
                    {deviceId && selectedDevice && (
                        <div className="space-y-8">
                            <RepairPricingMatrix
                                key={`${deviceId}-repair`}
                                deviceId={deviceId}
                                category={categorySlug}
                                globalSettings={robustSettings}
                            />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <BuybackPricingMatrix
                                    key={`${deviceId}-buyback`}
                                    deviceId={deviceId}
                                    modelName={`${selectedDevice.brand} ${selectedDevice.model}`}
                                />

                                <ProductPricingMatrix
                                    key={`${deviceId}-product`}
                                    deviceId={deviceId}
                                    modelName={`${selectedDevice.brand} ${selectedDevice.model}`}
                                />
                            </div>

                            {/* Image Uploader */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <PhotoIcon className="h-6 w-6 text-bel-blue" />
                                    Device Image
                                </h3>
                                <div className="flex items-start gap-8">
                                    <div className="w-48 aspect-square relative rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center group shrink-0">
                                        {deviceImage ? (
                                            <img src={deviceImage} alt="Device" className="w-full h-full object-contain p-4" />
                                        ) : (
                                            <div className="text-gray-400 text-center">
                                                <DevicePhoneMobileIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <span className="text-xs">No image</span>
                                            </div>
                                        )}

                                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-bold backdrop-blur-sm">
                                            <div className="text-center">
                                                <PhotoIcon className="h-6 w-6 mx-auto mb-1" />
                                                <span className="text-xs">{uploadingImage ? 'Uploading...' : 'Change Image'}</span>
                                                {uploadingImage && <ArrowPathIcon className="h-4 w-4 animate-spin mx-auto mt-2" />}
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                            />
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-500 mb-4">
                                            Upload a high-quality image of the device. Optimized to WebP format.
                                        </p>
                                        <div className="text-sm text-gray-400">
                                            <p>• Recommended Size: 800x800px</p>
                                            <p>• Format: PNG or JPG (Transparent background preferred)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bulk Tools */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">⚡ Global Settings</h3>
                        <div className="space-y-3">
                            <button
                                onClick={async () => {
                                    if (confirm('Sync global settings?')) {
                                        await seedDefaults();
                                    }
                                }}
                                className="w-full px-4 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-sm font-bold hover:bg-purple-200 transition"
                            >
                                ⚡ Sync All Global Settings
                            </button>

                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
