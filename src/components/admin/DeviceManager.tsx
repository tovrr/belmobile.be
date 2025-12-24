'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DEVICE_BRANDS } from '../../data/brands';
import { modelsData } from '../../data/deviceData';
import { createSlug } from '../../utils/slugs';
import { useRepairData } from '../../hooks/useRepairData';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { compressImage } from '../../utils/imageUtils';
import { DevicePhoneMobileIcon, PhotoIcon, ArrowPathIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';

const getAllModels = (brand: string) => {
    if (!brand) return [];
    const brandKey = brand.toLowerCase();
    const data = modelsData[brandKey];
    if (!data) return [];

    const models: string[] = [];
    Object.values(data).forEach((category: unknown) => {
        if (typeof category === 'object' && category !== null) {
            models.push(...Object.keys(category as Record<string, unknown>));
        }
    });
    return models.sort();
};

const DeviceManager = () => {
    // Selection State
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    // Data Hook (fetches DB + Static)
    const { data: repairData } = useRepairData(selectedBrand, selectedModel);

    // Form State
    const [priceData, setPriceData] = useState<Record<string, number>>({});
    const [customImage, setCustomImage] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Update models when brand changes
    useEffect(() => {
        if (selectedBrand) {
            setAvailableModels(getAllModels(selectedBrand));
            setSelectedModel('');
        } else {
            setAvailableModels([]);
        }
    }, [selectedBrand]);

    // Update form when data loads
    useEffect(() => {
        if (repairData) {
            const getNum = (val: unknown) => typeof val === 'number' ? val : 0;
            setPriceData({
                screen_generic: getNum(repairData.screen_generic),
                screen_oled: getNum(repairData.screen_oled),
                screen_original: getNum(repairData.screen_original),
                battery: getNum(repairData.battery),
                charging: getNum(repairData.charging),
                other: getNum(repairData.other),
                storage: getNum(repairData.storage),
            });
            setCustomImage(repairData.imageUrl || '');
        } else {
            // Reset
            setPriceData({});
            setCustomImage('');
        }
    }, [repairData]);


    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // Compress
            const compressedBlob = await compressImage(file);

            // Upload
            const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const storage = getStorage();
            // Naming convention: brands/apple/iphone-13-uuid.webp
            const filename = `devices/${createSlug(selectedBrand)}/${createSlug(selectedModel)}-${Date.now()}.webp`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, compressedBlob);
            const downloadURL = await getDownloadURL(storageRef);

            setCustomImage(downloadURL);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedBrand || !selectedModel) return;
        setSaving(true);
        try {
            const slug = createSlug(`${selectedBrand} ${selectedModel}`);
            const docRef = doc(db, 'repair_prices', slug);

            // Save merged data
            await setDoc(docRef, {
                brand: selectedBrand,
                model: selectedModel,
                updatedAt: new Date(),
                imageUrl: customImage,
                ...priceData
            }, { merge: true });

            alert("Saved successfully!");
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    // Flatten brands list
    const allBrands = Array.from(new Set(Object.values(DEVICE_BRANDS).flat())).sort();

    return (
        <div className="p-6 space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Device Price & Image Manager</h1>
            </div>

            {/* Selection Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Select Brand</label>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 font-bold"
                    >
                        <option value="">-- Choose Brand --</option>
                        {allBrands.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Select Model</label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        disabled={!selectedBrand}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 font-bold disabled:opacity-50"
                    >
                        <option value="">-- Choose Model --</option>
                        {availableModels.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedBrand && selectedModel && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col: Image */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <PhotoIcon className="h-5 w-5 text-bel-blue" />
                            Device Image
                        </h3>

                        <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-900 mb-4 border border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center group">
                            {customImage ? (
                                <Image src={customImage} alt="Device" fill className="object-contain p-4" sizes="200px" />
                            ) : (
                                <div className="text-gray-400 text-center">
                                    <DevicePhoneMobileIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <span className="text-sm">No custom image</span>
                                </div>
                            )}

                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-bold">
                                <span>{uploading ? 'Uploading...' : 'Change Image'}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            Upload a standard or custom image. WebP optimized automatically.
                        </p>
                    </div>

                    {/* Right Col: Pricing */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <CurrencyEuroIcon className="h-5 w-5 text-bel-blue" />
                                Repair Pricing
                            </h3>
                            {repairData?.isCustom && (
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded hidden sm:inline-block">
                                    Using Custom DB Prices
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Screen Section */}
                            <div className="sm:col-span-2 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                <label className="block text-sm font-bold text-bel-blue mb-3">Screen Replacement</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 mb-1 block">Generic/LCD</span>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                            <input
                                                type="number"
                                                value={priceData.screen_generic}
                                                onChange={e => setPriceData({ ...priceData, screen_generic: Number(e.target.value) })}
                                                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 mb-1 block">OLED/Soft</span>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                            <input
                                                type="number"
                                                value={priceData.screen_oled}
                                                onChange={e => setPriceData({ ...priceData, screen_oled: Number(e.target.value) })}
                                                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-gray-500 mb-1 block">Original Refurb</span>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                            <input
                                                type="number"
                                                value={priceData.screen_original}
                                                onChange={e => setPriceData({ ...priceData, screen_original: Number(e.target.value) })}
                                                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Other Parts */}
                            {[
                                { k: 'battery', l: 'Battery' },
                                { k: 'charging', l: 'Charging Port' },
                                { k: 'storage', l: 'Storage / Data' },
                                { k: 'other', l: 'Other / Diagnostic' }
                            ].map(({ k, l }) => (
                                <div key={k}>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">{l}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                        <input
                                            type="number"
                                            value={priceData[k] || 0}
                                            onChange={e => setPriceData({ ...priceData, [k]: Number(e.target.value) })}
                                            className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-bel-blue text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : null}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceManager;
