'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { DEVICE_BRANDS } from '../../data/brands';
import { createSlug } from '../../utils/slugs';
import { RepairPricing } from '../../types';
import { MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { seedRepairPricing } from '../../utils/seedFirestore';
import { deleteField } from 'firebase/firestore';

const RepairPricingManagement: React.FC = () => {
    const { repairPrices, updateRepairPrice } = useData();
    const [selectedBrand, setSelectedBrand] = useState<string>('Apple');
    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Form State
    const [genericPrice, setGenericPrice] = useState<string>('');
    const [oledPrice, setOledPrice] = useState<string>('');
    const [originalPrice, setOriginalPrice] = useState<string>('');

    // Load Models when Brand changes
    useEffect(() => {
        const loadModels = async () => {
            setIsLoadingModels(true);
            setModels([]);
            setSelectedModel('');
            try {
                const brandSlug = createSlug(selectedBrand);
                // Dynamic import for Next.js
                const module = await import(`../../data/models/${brandSlug}`);
                // Flatten models from categories
                const allModels: string[] = [];
                Object.values(module.MODELS).forEach((categoryModels: any) => {
                    allModels.push(...Object.keys(categoryModels));
                });
                setModels(allModels.sort());
            } catch (error) {
                console.error("Failed to load models", error);
            } finally {
                setIsLoadingModels(false);
            }
        };

        if (selectedBrand) {
            loadModels();
        }
    }, [selectedBrand]);

    // Load existing pricing when Model changes
    useEffect(() => {
        if (selectedModel) {
            const slug = createSlug(`${selectedBrand} ${selectedModel}`);
            const pricing = repairPrices.find(p => p.id === slug);
            if (pricing) {
                setGenericPrice(pricing.screen_generic?.toString() || '');
                setOledPrice(pricing.screen_oled?.toString() || '');
                setOriginalPrice(pricing.screen_original?.toString() || '');
            } else {
                setGenericPrice('');
                setOledPrice('');
                setOriginalPrice('');
            }
        }
    }, [selectedModel, selectedBrand, repairPrices]);

    const handleSave = async () => {
        if (!selectedBrand || !selectedModel) return;

        setSaveStatus('saving');
        const slug = createSlug(`${selectedBrand} ${selectedModel}`);

        const pricingData: any = {
            id: slug,
            screen_generic: genericPrice ? parseFloat(genericPrice) : deleteField(),
            screen_oled: oledPrice ? parseFloat(oledPrice) : deleteField(),
            screen_original: originalPrice ? parseFloat(originalPrice) : deleteField(),
        };

        try {
            await updateRepairPrice(pricingData);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error("Failed to save pricing:", error);
            alert("Failed to save pricing");
            setSaveStatus('idle');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Repair Pricing</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage screen replacement costs</p>
                </div>
                <button
                    onClick={() => {
                        if (window.confirm('This will overwrite existing pricing for default models. Continue?')) {
                            seedRepairPricing();
                        }
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-bold text-center"
                >
                    Seed Defaults
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Brand Selector */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Brand</label>
                        <select
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none transition"
                        >
                            {Array.from(new Set(Object.values(DEVICE_BRANDS).flat())).map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>

                    {/* Model Selector */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Model</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            disabled={isLoadingModels || models.length === 0}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none transition disabled:opacity-50"
                        >
                            <option value="">Select a model...</option>
                            {models.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedModel && (
                    <div className="animate-fade-in border-t border-gray-100 dark:border-slate-700 pt-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Screen Replacement Prices (€)</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Leave empty to use the default calculated price.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Generic (LCD)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
                                    <input
                                        type="number"
                                        value={genericPrice}
                                        onChange={(e) => setGenericPrice(e.target.value)}
                                        className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none transition"
                                        placeholder="Auto"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">OLED / Soft</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
                                    <input
                                        type="number"
                                        value={oledPrice}
                                        onChange={(e) => setOledPrice(e.target.value)}
                                        className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none transition"
                                        placeholder="Auto"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Original Refurb</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
                                    <input
                                        type="number"
                                        value={originalPrice}
                                        onChange={(e) => setOriginalPrice(e.target.value)}
                                        className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none transition"
                                        placeholder="Auto"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saveStatus === 'saving'}
                                className={`flex items-center px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${saveStatus === 'saved'
                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                    : 'bg-bel-blue hover:bg-blue-700 shadow-blue-200'
                                    }`}
                            >
                                {saveStatus === 'saving' ? (
                                    <>Saving...</>
                                ) : saveStatus === 'saved' ? (
                                    <>
                                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                                        Saved!
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RepairPricingManagement;
