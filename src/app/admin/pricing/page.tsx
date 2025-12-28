'use client';

import React, { useState } from 'react';
import { BatchPricingTools } from '../../../components/admin/BatchPricingTools';
import { RepairPricingMatrix } from '../../../components/admin/RepairPricingMatrix';
import { useGlobalSettings } from '../../../hooks/useGlobalSettings';
import { DEVICE_BRANDS } from '../../../data/brands';
import { SEARCH_INDEX } from '../../../data/search-index';
import { createSlug } from '../../../utils/slugs';
import {
    WrenchScrewdriverIcon,
    TableCellsIcon,
    DevicePhoneMobileIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function AdminPricingPage() {
    const { robustSettings, loading, seedDefaults } = useGlobalSettings();
    const [activeTab, setActiveTab] = useState<'matrix' | 'batch'>('batch');

    // Matrix Selection State
    const [selectedBrand, setSelectedBrand] = useState('Apple');
    const [selectedModel, setSelectedModel] = useState('');

    // Helper to get models for brand
    const getModelsForBrand = (brand: string) => {
        const matches = Object.values(SEARCH_INDEX).filter(item => item.brand.toLowerCase() === brand.toLowerCase());
        return Array.from(new Set(matches.map(m => m.model))).sort();
    };

    const models = getModelsForBrand(selectedBrand);
    const selectedSlug = selectedModel ? createSlug(`${selectedBrand} ${selectedModel}`) : '';

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bel-blue"></div>
            </div>
        );
    }

    if (!robustSettings) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">Global Settings Not Initialized</h2>
                <button
                    onClick={() => seedDefaults()}
                    className="px-6 py-3 bg-bel-blue text-white rounded-xl font-bold"
                >
                    Initialize Settings
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-slate-700 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Pricing Management</h1>
                    <p className="text-gray-500">Manage repair prices, bulk updates, and buyback offers</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('batch')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'batch'
                                ? 'bg-white dark:bg-slate-700 text-bel-blue shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <TableCellsIcon className="h-4 w-4" />
                        Batch Tools
                    </button>
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'matrix'
                                ? 'bg-white dark:bg-slate-700 text-bel-blue shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <WrenchScrewdriverIcon className="h-4 w-4" />
                        Device Matrix
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="animate-fade-in">
                {activeTab === 'batch' ? (
                    <BatchPricingTools />
                ) : (
                    <div className="space-y-6">
                        {/* Selector Toolbar */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full md:w-1/3">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Brand</label>
                                <select
                                    value={selectedBrand}
                                    onChange={(e) => { setSelectedBrand(e.target.value); setSelectedModel(''); }}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 font-bold outline-none focus:ring-2 focus:ring-bel-blue"
                                >
                                    {Array.from(new Set(Object.values(DEVICE_BRANDS).flat())).sort().map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full md:w-1/3">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Model</label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 font-bold outline-none focus:ring-2 focus:ring-bel-blue disabled:opacity-50"
                                    disabled={!selectedBrand}
                                >
                                    <option value="">-- Select Model --</option>
                                    {models.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full md:w-auto pb-1">
                                {!selectedModel && (
                                    <span className="text-sm text-gray-400 italic flex items-center gap-2">
                                        <DevicePhoneMobileIcon className="h-5 w-5" />
                                        Select a model to edit
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* MATRIX EDITOR */}
                        {selectedSlug ? (
                            <RepairPricingMatrix
                                key={selectedSlug} // Force re-mount on change
                                deviceId={selectedSlug}
                                category="smartphone" // TODO: Dynamic category detection if needed (tablet/laptop)
                                globalSettings={robustSettings}
                            />
                        ) : (
                            <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                                <WrenchScrewdriverIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">Ready to Edit</h3>
                                <p className="text-gray-400">Select a device above to configure repair prices.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
