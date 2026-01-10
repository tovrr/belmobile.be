'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { createSlug } from '../../utils/slugs';
import {
    ArrowPathIcon,
    CalculatorIcon,
    ArrowUpTrayIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    AdjustmentsVerticalIcon
} from '@heroicons/react/24/outline';
import { DEVICE_BRANDS } from '../../data/brands';
import { useHaptic } from '../../hooks/useHaptic';

interface PricingAnchor {
    slug: string;
    deviceName: string;
    anchorPriceEur: number;
    currency?: string;
    lastUpdated?: string;
    category?: string;
    brand?: string;
    customSpecs?: string[];
}

interface BuybackRule {
    condition: 'new' | 'like-new' | 'good' | 'fair' | 'damaged';
    multiplier: number;
}

const DEFAULT_RULES: BuybackRule[] = [
    // { condition: 'new', multiplier: 0.82 }, // REMOVED per user request (unused)
    { condition: 'like-new', multiplier: 0.72 },
    { condition: 'good', multiplier: 0.62 },
    { condition: 'fair', multiplier: 0.45 },
    { condition: 'damaged', multiplier: 0.15 },
];

const STORAGE_STEP_UP = 0.06;

export const BuybackAnchorManager = () => {
    const haptic = useHaptic();
    const [anchors, setAnchors] = useState<PricingAnchor[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [rules, setRules] = useState<BuybackRule[]>(DEFAULT_RULES);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('Apple');
    const [fullCatalog, setFullCatalog] = useState<Record<string, any>>({});
    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [catalogSearch, setCatalogSearch] = useState('');

    const loadAnchors = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'pricing_anchors'));
            const data: PricingAnchor[] = [];
            snap.forEach(d => {
                const raw = d.data();
                if (raw.deviceId || raw.slug) {
                    data.push({
                        slug: raw.deviceId || raw.slug,
                        deviceName: raw.deviceName || (raw.deviceId || raw.slug).replace(/-/g, ' ').toUpperCase(),
                        anchorPriceEur: raw.basePriceEur || raw.anchorPriceEur || 0,
                        lastUpdated: raw.lastUpdated,
                        category: raw.category || 'smartphone',
                        brand: raw.brand || (raw.deviceId || raw.slug).split('-')[0],
                        customSpecs: raw.customSpecs || null
                    });
                }
            });
            setAnchors(data.sort((a, b) => a.deviceName.localeCompare(b.deviceName)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadCatalog = async () => {
        const brands = Object.values(DEVICE_BRANDS).flat().map(b => createSlug(b));
        const catalog: any = {};
        await Promise.all(brands.map(async (b) => {
            try {
                const mod = await import(`../../data/models/${b}`);
                catalog[b] = { models: mod.MODELS, specs: mod.SPECS };
            } catch (e) { }
        }));
        setFullCatalog(catalog);
    };

    useEffect(() => {
        loadAnchors();
        loadCatalog();
    }, []);

    const handleAddFromCatalog = async (brand: string, category: string, modelName: string) => {
        haptic.trigger('light');
        const slug = createSlug(`${brand} ${modelName}`);
        if (anchors.find(a => a.slug === slug)) {
            alert("This device is already in your pricing list.");
            return;
        }
        const newAnchor: PricingAnchor = {
            slug,
            deviceName: modelName,
            anchorPriceEur: 0,
            brand: brand.toLowerCase(),
            category: category,
            lastUpdated: new Date().toISOString()
        };
        try {
            await setDoc(doc(db, 'pricing_anchors', slug), {
                deviceId: slug,
                deviceName: modelName,
                basePriceEur: 0,
                brand: brand.toLowerCase(),
                category: category,
                lastUpdated: new Date().toISOString(),
                managedManually: true
            });
            setAnchors(prev => [...prev, newAnchor].sort((a, b) => a.deviceName.localeCompare(b.deviceName)));
            setCatalogSearch('');
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdatePrice = async (slug: string, price: number) => {
        setAnchors(prev => prev.map(a => a.slug === slug ? { ...a, anchorPriceEur: price } : a));
        try {
            await setDoc(doc(db, 'pricing_anchors', slug), { basePriceEur: price, lastUpdated: new Date().toISOString() }, { merge: true });
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteAnchor = async (slug: string) => {
        if (!confirm("Remove this device?")) return;
        try {
            await deleteDoc(doc(db, 'pricing_anchors', slug));
            setAnchors(prev => prev.filter(a => a.slug !== slug));
        } catch (e) {
            console.error(e);
        }
    };

    const executeSync = async () => {
        // Respect the current filter for sync scope
        const targetDesc = searchTerm ? `SEARCH "${searchTerm}"` : `${selectedBrand}`;
        if (!confirm(`🚀 PUBLISH PRICES FOR: ${targetDesc}?\n\nThis will update ${filteredAnchors.length} devices.`)) return;

        setProcessing(true);
        try {
            let batch = writeBatch(db);
            let ops = 0;
            let count = 0;

            const commitBatch = async () => {
                await batch.commit();
                batch = writeBatch(db);
                ops = 0;
            };

            // Use filteredAnchors directly
            for (const anchor of filteredAnchors) {
                if (!anchor.anchorPriceEur || anchor.anchorPriceEur <= 0) continue;

                const brandSlug = createSlug(anchor.brand || anchor.slug.split('-')[0]);

                // Fallback to basic spec logic if catalog lookup fails
                // NOTE: This relies on fullCatalog being loaded. 
                // If the user hasn't loaded the relevant brand file yet, specs might be default 128GB.
                // In a production app, we might want to ensure catalog is loaded for these items.
                let modelSpecs = ['128GB'];

                // Try to find specs in the loaded catalog
                if (fullCatalog[brandSlug]?.specs) {
                    const exact = fullCatalog[brandSlug].specs[anchor.deviceName];
                    if (exact) modelSpecs = exact;
                    else {
                        // Fuzzy search keys
                        const key = Object.keys(fullCatalog[brandSlug].specs).find(k =>
                            anchor.deviceName.toLowerCase().includes(k.toLowerCase()) ||
                            k.toLowerCase().includes(anchor.deviceName.toLowerCase())
                        );
                        if (key) modelSpecs = fullCatalog[brandSlug].specs[key];
                    }
                }

                for (let i = 0; i < modelSpecs.length; i++) {
                    const spec = modelSpecs[i];
                    const specMultiplier = 1 + (i * STORAGE_STEP_UP);

                    // Base calculation
                    const specBaseGood = anchor.anchorPriceEur * specMultiplier;

                    for (const rule of rules) {
                        const finalPrice = Math.round(specBaseGood * rule.multiplier);
                        const docId = `${anchor.slug}_${spec}_${rule.condition}`;
                        const docRef = doc(db, 'buyback_pricing', docId);

                        batch.set(docRef, {
                            deviceId: anchor.slug,
                            storage: spec,
                            condition: rule.condition,
                            price: finalPrice,
                            updatedAt: new Date().toISOString(),
                            managedBy: 'manual_command_center_v2'
                        }, { merge: true });

                        ops++;
                        count++;
                        if (ops >= 400) await commitBatch();
                    }
                }
            }
            if (ops > 0) await batch.commit();

            // Haptic Feedback
            if (count > 0) alert(`✅ Synced ${filteredAnchors.length} devices (${count} price points).`);
            else alert("⚠️ No valid prices found to sync.");

        } catch (e) {
            console.error(e);
            alert("Sync failed.");
        } finally {
            setProcessing(false);
        }
    };

    const filteredAnchors = useMemo(() => {
        const results = anchors.filter(a => {
            const b = a.brand?.toLowerCase() || '';
            const s = selectedBrand.toLowerCase();
            const matchesBrand = b === s || a.slug.startsWith(createSlug(selectedBrand));
            const matchesSearch = a.deviceName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesBrand && matchesSearch;
        });
        console.log(`[BuybackManager] Filtered: ${results.length} / Total: ${anchors.length} for brand: ${selectedBrand}`);
        return results;
    }, [anchors, selectedBrand, searchTerm]);

    const catalogResults = useMemo(() => {
        if (!catalogSearch) return [];
        const results: any[] = [];
        Object.entries(fullCatalog).forEach(([brandSlug, data]: [string, any]) => {
            Object.entries(data.models).forEach(([category, models]: [string, any]) => {
                Object.keys(models).forEach(modelName => {
                    if (modelName.toLowerCase().includes(catalogSearch.toLowerCase())) {
                        results.push({ brand: brandSlug, category, name: modelName });
                    }
                });
            });
        });
        return results.slice(0, 10);
    }, [catalogSearch, fullCatalog]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 p-4 rounded-2xl items-center">
                <div className="relative flex-1 w-full">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter activated..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl border-none text-sm focus:ring-2 focus:ring-indigo-500 font-bold"
                    />
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest whitespace-nowrap">
                            {loading ? 'Loading...' : `Count: ${anchors.length}`}
                        </span>
                    </div>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="flex-1 lg:flex-none bg-gray-50 dark:bg-slate-800 rounded-xl border-none text-sm font-black px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {Array.from(new Set(Object.values(DEVICE_BRANDS).flat())).sort().map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowCatalogModal(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl hover:bg-indigo-100 transition shadow-sm whitespace-nowrap uppercase tracking-widest"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Model
                    </button>

                    <button
                        onClick={executeSync}
                        disabled={processing}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap uppercase tracking-widest"
                    >
                        {processing ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowUpTrayIcon className="w-4 h-4" />}
                        Sync Prices
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {rules.map(r => (
                    <div key={r.condition} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 text-center shadow-xs">
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{r.condition}</label>
                        <div className="flex items-center justify-center gap-1">
                            <input
                                type="number"
                                value={r.multiplier}
                                step="0.01"
                                onChange={(e) => setRules(prev => prev.map(item => item.condition === r.condition ? { ...item, multiplier: Number(e.target.value) } : item))}
                                className="w-16 text-center text-xl font-black bg-transparent border-none p-0 focus:ring-0 text-indigo-600"
                            />
                            <span className="text-xs text-indigo-500 font-bold">%</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <tr>
                            <th className="px-6 py-5">Device Model</th>
                            <th className="px-6 py-5">Category</th>
                            <th className="px-6 py-5">Base Anchor (Good)</th>
                            <th className="px-6 py-5">Samples (Damaged / New)</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                        {filteredAnchors.map(anchor => (
                            <tr key={anchor.slug} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-black text-gray-900 dark:text-white">{anchor.deviceName}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{anchor.slug}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${anchor.category === 'smartphone' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                        anchor.category === 'laptop' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                                            anchor.category === 'console_home' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-gray-50 text-gray-600 dark:bg-slate-700/50 dark:text-gray-400'
                                        }`}>
                                        {anchor.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative flex items-center gap-2 group/input">
                                        <span className="text-xl font-black text-indigo-600/50">€</span>
                                        <input
                                            type="number"
                                            value={anchor.anchorPriceEur}
                                            onChange={(e) => handleUpdatePrice(anchor.slug, Number(e.target.value))}
                                            className="w-24 text-xl font-black bg-transparent border-none p-0 focus:ring-0 text-gray-900 dark:text-white"
                                        />
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-0 group-hover/input:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-tighter">
                                        {anchor.category === 'smartphone' ? 'Max Storage' : 'Base Config'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-center">
                                            <div className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Damaged</div>
                                            <div className="font-bold text-gray-400">€{Math.round(anchor.anchorPriceEur * (rules.find(r => r.condition === 'damaged')?.multiplier || 0))}</div>
                                        </div>
                                        <div className="w-px h-6 bg-gray-100 dark:bg-slate-800" />
                                        <div className="text-center">
                                            {/* 'New' removed, showing Like-New as top tier implies max value */}
                                            <div className="text-[9px] text-green-400 font-bold uppercase tracking-widest">Like New</div>
                                            <div className="font-bold text-gray-400">€{Math.round(anchor.anchorPriceEur * (rules.find(r => r.condition === 'like-new')?.multiplier || 0))}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDeleteAnchor(anchor.slug)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredAnchors.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <CalculatorIcon className="w-12 h-12 text-gray-200 dark:text-slate-800 mb-4" />
                                        <p className="text-gray-400 font-bold">No active models for this brand.</p>
                                        <button
                                            onClick={() => setShowCatalogModal(true)}
                                            className="mt-4 text-indigo-500 font-black hover:underline uppercase text-[10px] tracking-widest"
                                        >
                                            Activate first model
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showCatalogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-slate-800 scale-in-center">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Activate Catalog Model</h3>
                            <button onClick={() => setShowCatalogModal(false)} className="text-gray-400 hover:text-gray-600 tracking-widest text-[10px] font-black uppercase">Close</button>
                        </div>
                        <div className="relative mb-6">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search catalog... (S24, iPhone 16)"
                                value={catalogSearch}
                                onChange={(e) => setCatalogSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none text-lg font-bold focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-1 max-h-72 overflow-y-auto pr-2">
                            {catalogResults.map((res, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAddFromCatalog(res.brand, res.category, res.name)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-indigo-50 dark:hover:bg-slate-800/50 rounded-2xl transition group text-left"
                                >
                                    <div>
                                        <div className="font-black text-gray-900 dark:text-white capitalize">{res.name}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{res.brand} • {res.category}</div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlusIcon className="w-4 h-4" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuybackAnchorManager;
