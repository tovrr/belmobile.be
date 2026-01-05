'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, writeBatch, getDoc, WriteBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { createSlug } from '../../utils/slugs';
import { ArrowPathIcon, CalculatorIcon, ArrowUpTrayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { DEVICE_BRANDS } from '../../data/brands';
import { PricingEngine } from '../../utils/pricing-engine';

interface PricingAnchor {
    slug: string;
    deviceName: string;
    anchorPriceEur: number;
    currency?: string;
    lastScraped: string;
    specs?: { storage?: string };
    dataFlag?: 'ok' | 'manual_review';
    conversionNote?: string;
}

interface BuybackRule {
    condition: 'new' | 'like-new' | 'good' | 'fair' | 'damaged';
    multiplier: number; // 0.65 = 65%
}

const DEFAULT_RULES: BuybackRule[] = [
    { condition: 'new', multiplier: 0.80 },
    { condition: 'like-new', multiplier: 0.70 },
    { condition: 'good', multiplier: 0.60 },
    { condition: 'fair', multiplier: 0.45 },
    { condition: 'damaged', multiplier: 0.15 },
];

const STORAGE_BUMPS = {
    '64GB': 0,
    '128GB': 0, // Base usually
    '256GB': 30,
    '512GB': 60,
    '1TB': 100
};

export const BuybackAnchorManager = () => {
    const [anchors, setAnchors] = useState<PricingAnchor[]>([]);
    const [loading, setLoading] = useState(false);
    const [rules, setRules] = useState<BuybackRule[]>(DEFAULT_RULES);
    const [processing, setProcessing] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState('Apple');

    // LOAD ANCHORS
    const loadAnchors = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'pricing_anchors'));
            const data: PricingAnchor[] = [];
            snap.forEach(d => {
                const raw = d.data();
                if (raw.slug && raw.anchorPriceEur) {
                    data.push(raw as PricingAnchor);
                }
            });
            setAnchors(data.sort((a, b) => b.anchorPriceEur - a.anchorPriceEur));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnchors();
    }, []);

    // FILTER BY BRAND
    const filteredAnchors = anchors.filter(a => a.slug && a.slug.startsWith(createSlug(selectedBrand)));

    // CALCULATOR SIMULATION
    const simulateOffer = (basePrice: number) => {
        const goodRule = rules.find(r => r.condition === 'good');
        return Math.round(basePrice * (goodRule?.multiplier || 0.6));
    };

    const handleRuleChange = (condition: string, val: string) => {
        const newRules = rules.map(r => r.condition === condition ? { ...r, multiplier: Number(val) } : r);
        setRules(newRules);
    };

    // EXECUTE BATCH UPDATE
    const executeSync = async () => {
        if (!confirm("⚠️ GENERATE & CLEAN OFFERS?\n\nThis will:\n1. Generate offers for valid storages (based on specs).\n2. DELETE ghost offers for invalid storages (e.g. removing 128GB if device starts at 256GB).\n\nAre you sure?")) return;

        setProcessing(true);
        try {
            let batch = writeBatch(db);
            let ops = 0;
            let count = 0;
            let deletedCount = 0;

            const STORAGES = ['64GB', '128GB', '256GB', '512GB', '1TB'];
            const CONDITIONS = ['new', 'like-new', 'good', 'fair', 'damaged'];

            const commitBatch = async () => {
                await batch.commit();
                batch = writeBatch(db);
                ops = 0;
            };

            for (const anchor of filteredAnchors) {
                if ((anchor.anchorPriceEur || 0) <= 0) continue;

                // 1. DETERMINE VALID STORAGES
                let validStorages = STORAGES;
                if (anchor.specs && anchor.specs.storage) {
                    const specString = anchor.specs.storage.toUpperCase();
                    validStorages = STORAGES.filter(s => specString.includes(s));
                    if (validStorages.length === 0) validStorages = STORAGES;
                }

                // 2. CLEANUP: Fetch existing offers for this device and delete invalid ones
                const invalidStorages = STORAGES.filter(s => !validStorages.includes(s));

                for (const badStorage of invalidStorages) {
                    for (const cond of CONDITIONS) {
                        const ghostId = `${anchor.slug}_${badStorage}_${cond}`;
                        const ghostRef = doc(db, 'buyback_pricing', ghostId);
                        batch.delete(ghostRef);
                        ops++;
                        deletedCount++;

                        if (ops >= 450) await commitBatch();
                    }
                }

                // 3. GENERATE VALID OFFERS
                for (const storage of validStorages) {
                    const bump = STORAGE_BUMPS[storage as keyof typeof STORAGE_BUMPS] || 0;
                    const tierBase = anchor.anchorPriceEur + bump;

                    for (const rule of rules) {
                        const finalOffer = Math.round(tierBase * rule.multiplier);
                        const docId = `${anchor.slug}_${storage}_${rule.condition}`;
                        const docRef = doc(db, 'buyback_pricing', docId);

                        batch.set(docRef, {
                            deviceId: anchor.slug,
                            storage,
                            condition: rule.condition,
                            price: finalOffer,
                            currency: 'EUR',
                            updatedAt: new Date().toISOString(),
                            calculationMethod: 'anchor_v1',
                            anchorPrice: anchor.anchorPriceEur
                        }, { merge: true });

                        ops++;
                        count++;

                        if (ops >= 450) await commitBatch();
                    }
                }
            }

            if (ops > 0) await batch.commit();
            alert(`✅ Sync Complete!\n\nGenerated: ${count}\nCleaned/Deleted: ${deletedCount}`);

        } catch (e) {
            console.error(e);
            alert("Sync Failed.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* HERDER */}
            <div className="flex justify-between items-center bg-indigo-50 dark:bg-slate-800 p-6 rounded-2xl border border-indigo-100 dark:border-slate-700">
                <div>
                    <h2 className="text-xl font-black text-indigo-900 dark:text-white flex items-center gap-2">
                        <CalculatorIcon className="w-6 h-6" />
                        Anchor Pricing Engine
                    </h2>
                    <p className="text-sm text-indigo-600 dark:text-indigo-300">
                        {filteredAnchors.length} Anchors Found • {rules.find(r => r.condition === 'good')?.multiplier! * 100}% Margin Target
                    </p>
                </div>
                <div className="flex gap-4">
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-indigo-200"
                    >
                        {Array.from(new Set(Object.values(DEVICE_BRANDS).flat())).sort().map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    <button
                        onClick={loadAnchors}
                        className="p-2 bg-white rounded-lg text-indigo-600 hover:bg-indigo-50 shadow-sm"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={executeSync}
                        disabled={processing}
                        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {processing ? 'Generating...' : '🚀 Generate Offers'}
                    </button>
                </div>
            </div>

            {/* RULES EDITOR */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                {rules.map(r => (
                    <div key={r.condition} className="text-center">
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-2">{r.condition}</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.05"
                                value={r.multiplier}
                                onChange={(e) => handleRuleChange(r.condition, e.target.value)}
                                className="w-full text-center text-xl font-bold p-2 rounded-lg border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ANCHOR TABLE */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-3">Device Model</th>
                            <th className="px-6 py-3">GSMArena Anchor</th>
                            <th className="px-6 py-3 text-center">Good Offer (Est)</th>
                            <th className="px-6 py-3 text-center">Damaged (Est)</th>
                            <th className="px-6 py-3 text-right">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {filteredAnchors.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-400">
                                    No anchors found. Run `scripts/sync-device-data.mjs` first.
                                </td>
                            </tr>
                        ) : filteredAnchors.map(anchor => (
                            <tr key={anchor.slug} className="hover:bg-indigo-50/30 transition">
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {anchor.dataFlag === 'manual_review' && <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" title="Review Needed" />}
                                    {anchor.deviceName || anchor.slug.replace(/-/g, ' ').toUpperCase().replace('APPLE ', '')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-mono font-bold text-indigo-600">€{anchor.anchorPriceEur}</span>
                                        {anchor.conversionNote && <span className="text-[10px] bg-orange-100 text-orange-700 px-1 rounded">EST</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-green-600 bg-green-50/30">
                                    €{simulateOffer(anchor.anchorPriceEur)}
                                </td>
                                <td className="px-6 py-4 text-center text-gray-500">
                                    €{Math.round(anchor.anchorPriceEur * (rules.find(r => r.condition === 'damaged')?.multiplier || 0.15))}
                                </td>
                                <td className="px-6 py-4 text-right text-xs text-gray-400">
                                    {anchor.lastScraped ? new Date(anchor.lastScraped).toLocaleDateString() : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
