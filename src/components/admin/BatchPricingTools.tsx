'use client';

import React, { useState } from 'react';
import { SEARCH_INDEX } from '../../data/search-index';
import { createSlug } from '../../utils/slugs';
const getAllModels = (brand: string): string[] => {
    const matches = Object.values(SEARCH_INDEX).filter(item => item.brand.toLowerCase() === brand.toLowerCase());
    const uniqueModels = Array.from(new Set(matches.map(m => m.model)));
    return uniqueModels;
};
import { collection, query, where, getDocs, getDoc, writeBatch, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useRepairDefaults } from '../../hooks/useRepairDefaults';
import { generateBuybackDefaults, BuybackDefaultOffer } from '../../hooks/useBuybackDefaults';
import { PricingEngine } from '../../utils/pricing-engine';
import { DEVICE_BRANDS } from '../../data/brands';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, ArrowDownTrayIcon, BoltIcon } from '@heroicons/react/24/outline';
import { RepairPriceRecord, BuybackPriceRecord, BuybackCondition } from '../../types';

import { BuybackAnchorManager } from './BuybackAnchorManager';

// Helper for CSV Export
const capitalizeSlug = (slug: string) => {
    return slug
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

interface BatchAnalysisResult {
    model: string;
    slug: string;
    status: 'ok' | 'partial' | 'empty';
    missingIssues: string[];
}

export const BatchPricingTools = () => {
    const [selectedBrand, setSelectedBrand] = useState('Apple');
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<BatchAnalysisResult[]>([]);
    const [generating, setGenerating] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [overwriteMode, setOverwriteMode] = useState(false); // Default false for safety
    const [targetedModel, setTargetedModel] = useState(''); // NEW: Target specific model slug
    const [selectedTab, setSelectedTab] = useState<'repair' | 'buyback'>('repair');

    const {
        generateAppleDefaults,
        generateSamsungDefaults,
        generateGoogleDefaults,
        generateHuaweiDefaults,
        generateSonyDefaults,
        generateXiaomiDefaults,
        generateOnePlusDefaults,
        generateOppoDefaults,
        generateGenericDefaults
    } = useRepairDefaults();

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setResults([]);
        try {
            const models = getAllModels(selectedBrand);
            const batchResults: BatchAnalysisResult[] = [];

            const brandSlug = createSlug(selectedBrand);
            const q = query(
                collection(db, 'repair_prices'),
                where('deviceId', '>=', brandSlug),
                where('deviceId', '<=', brandSlug + '\uf8ff')
            );

            const snapshot = await getDocs(q);
            const priceMap = new Set<string>(); // deviceId+issueId
            const deviceMap = new Set<string>(); // deviceId

            snapshot.forEach(doc => {
                const data = doc.data();
                priceMap.add(`${data.deviceId}_${data.issueId}`);
                deviceMap.add(data.deviceId);
            });

            for (const model of models) {
                const deviceSlug = createSlug(`${selectedBrand} ${model}`);

                // key issues to check
                const coreIssues = selectedBrand.toLowerCase() === 'sony' ? ['hdmi', 'cleaning'] : ['screen', 'battery'];
                const missingIssues: string[] = [];

                for (const issue of coreIssues) {
                    if (!priceMap.has(`${deviceSlug}_${issue}`)) {
                        missingIssues.push(issue);
                    }
                }

                const hasAny = deviceMap.has(deviceSlug);

                batchResults.push({
                    model,
                    slug: deviceSlug,
                    status: missingIssues.length === 0 ? 'ok' : (hasAny ? 'partial' : 'empty'),
                    missingIssues
                });
            }

            setResults(batchResults);

        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Analysis failed. See console.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleGenerateDefaults = async (targetModels: BatchAnalysisResult[]) => {
        if (!confirm(`Generate defaults for ${targetModels.length} models? This will add estimated prices.`)) return;

        setGenerating(true);
        try {
            const batch = writeBatch(db);
            let count = 0;

            for (const item of targetModels) {
                // Enrich with Market Data if available
                let marketData: { avgPrice: number, partCosts?: { screen: number, battery: number } } | null = null;
                try {
                    const snap = await getDoc(doc(db, 'market_values', item.slug));
                    if (snap.exists()) marketData = snap.data() as { avgPrice: number, partCosts?: { screen: number, battery: number } };
                } catch (e) {
                    console.warn("Failed to fetch market data for enrichment", e);
                }

                let defaults: RepairPriceRecord[] = [];
                const brandLower = selectedBrand.toLowerCase();

                if (brandLower === 'apple') defaults = generateAppleDefaults(item.slug);
                else if (brandLower === 'samsung') defaults = generateSamsungDefaults(item.slug);
                else if (brandLower === 'google') defaults = generateGoogleDefaults(item.slug);
                else if (brandLower === 'huawei') defaults = generateHuaweiDefaults(item.slug);
                else if (brandLower === 'sony') defaults = generateSonyDefaults(item.slug);
                else if (brandLower === 'xiaomi') defaults = generateXiaomiDefaults(item.slug);
                else if (brandLower === 'oneplus') defaults = generateOnePlusDefaults(item.slug);
                else if (brandLower === 'oppo') defaults = generateOppoDefaults(item.slug);
                else defaults = generateGenericDefaults(item.slug);

                for (const rec of defaults) {
                    if (item.status === 'ok') continue;
                    if (item.status === 'partial' && !item.missingIssues.includes(rec.issueId)) continue;

                    const variantSuffix = rec.variants ? Object.values(rec.variants).join('-') : 'base';
                    const docId = `${rec.deviceId}_${rec.issueId}_${variantSuffix}`;
                    const docRef = doc(db, 'repair_prices', docId);

                    // OVERRIDE with Market Data if available
                    if (marketData && marketData.partCosts) {
                        if (rec.issueId === 'screen' && marketData.partCosts.screen > 0) {
                            rec.partCost = marketData.partCosts.screen;
                            rec.price = PricingEngine.calculateRepairPrice(rec.partCost || 0, rec.laborMinutes || 45);
                        }
                        if (rec.issueId === 'battery' && marketData.partCosts.battery > 0) {
                            rec.partCost = marketData.partCosts.battery;
                            rec.price = PricingEngine.calculateRepairPrice(rec.partCost || 0, rec.laborMinutes || 30);
                        }
                    }

                    batch.set(docRef, rec);
                    count++;
                }
            }

            await batch.commit();
            alert(`Successfully generated ${count} price records.`);
            handleAnalyze(); // Refresh

        } catch (error) {
            console.error("Generation failed:", error);
            alert("Generation failed. See console.");
        } finally {
            setGenerating(false);
        }
    };

    const handleGlobalSeed = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        await new Promise(resolve => setTimeout(resolve, 100));

        if (!window.confirm(`⚠️ GLOBAL SEED ⚠️\n\nThis will generate default prices for ALL supported brands.\n\nOverwrite Mode: ${overwriteMode ? 'ON (Dangerous)' : 'OFF (Safe)'}\n\nContinue?`)) return;

        setGenerating(true);

        try {
            const SUPPORTED_BRANDS = Array.from(new Set(Object.values(DEVICE_BRANDS).flat())).sort();
            let totalCount = 0;

            for (const brand of SUPPORTED_BRANDS) {
                console.log(`Processing Brand: ${brand}...`);
                const models = getAllModels(brand);

                if (models.length === 0) continue;

                const CHUNK_SIZE = 20;
                for (let i = 0; i < models.length; i += CHUNK_SIZE) {
                    const modelChunk = models.slice(i, i + CHUNK_SIZE);
                    const batch = writeBatch(db);
                    let opsInBatch = 0;

                    const existingDocMap = new Set<string>();
                    if (!overwriteMode) {
                        const chunkSlugs = modelChunk.map(m => createSlug(`${brand} ${m}`));
                        const subChunks = [chunkSlugs.slice(0, 10), chunkSlugs.slice(10, 20)].filter(arr => arr.length > 0);

                        for (const sub of subChunks) {
                            const q = query(collection(db, 'repair_prices'), where('deviceId', 'in', sub));
                            const snap = await getDocs(q);
                            snap.forEach(d => {
                                existingDocMap.add(d.id);
                            });
                        }
                    }

                    const marketMap: Record<string, { avgPrice: number, partCosts?: { screen: number, battery: number } }> = {};
                    try {
                        const chunkSlugs = modelChunk.map(m => createSlug(`${brand} ${m}`));
                        const subChunks = [chunkSlugs.slice(0, 10), chunkSlugs.slice(10, 20)].filter(arr => arr.length > 0);
                        for (const sub of subChunks) {
                            const q = query(collection(db, 'market_values'), where('__name__', 'in', sub));
                            const snap = await getDocs(q);
                            snap.forEach(docSnap => {
                                const data = docSnap.data() as { avgPrice: number, partCosts?: { screen: number, battery: number } };
                                marketMap[docSnap.id] = data;
                            });
                        }
                    } catch { /* ignore */ }

                    for (const model of modelChunk) {
                        const slug = createSlug(`${brand} ${model}`);
                        let defaults: RepairPriceRecord[] = [];

                        const brandLower = brand.toLowerCase();
                        if (brandLower === 'apple') defaults = generateAppleDefaults(slug);
                        else if (brandLower === 'samsung') defaults = generateSamsungDefaults(slug);
                        else if (brandLower === 'google') defaults = generateGoogleDefaults(slug);
                        else if (brandLower === 'huawei') defaults = generateHuaweiDefaults(slug);
                        else if (brandLower === 'sony') defaults = generateSonyDefaults(slug);
                        else if (brandLower === 'xiaomi') defaults = generateXiaomiDefaults(slug);
                        else if (brandLower === 'oneplus') defaults = generateOnePlusDefaults(slug);
                        else if (brandLower === 'oppo') defaults = generateOppoDefaults(slug);
                        else defaults = generateGenericDefaults(slug);

                        for (const rec of defaults) {
                            const variantValues = rec.variants ? Object.values(rec.variants).map(v => String(v).toLowerCase()).sort() : [];
                            const suffix = variantValues.length > 0 ? variantValues.join('-') : 'base';
                            const docId = `${rec.deviceId}_${rec.issueId}_${suffix}`;

                            const forceUpdate = overwriteMode || !!targetedModel;
                            if (!forceUpdate && existingDocMap.has(docId)) continue;

                            const docRef = doc(db, 'repair_prices', docId);

                            const marketData = marketMap[slug];
                            if (marketData && marketData.partCosts) {
                                const pc = marketData.partCosts;
                                if (rec.issueId === 'screen' && pc.screen && pc.screen > 0) {
                                    rec.partCost = pc.screen;
                                    rec.price = PricingEngine.calculateRepairPrice(rec.partCost || 0, rec.laborMinutes || 45);
                                }
                                if (rec.issueId === 'battery' && pc.battery && pc.battery > 0) {
                                    rec.partCost = pc.battery;
                                    rec.price = PricingEngine.calculateRepairPrice(rec.partCost || 0, rec.laborMinutes || 30);
                                }
                            }

                            batch.set(docRef, rec, { merge: true });
                            opsInBatch++;
                        }
                    }

                    if (opsInBatch > 0) {
                        await batch.commit();
                        totalCount += opsInBatch;
                    }
                }
            }

            const msg = `Success! Seeded/Updated ${totalCount} price records across ${SUPPORTED_BRANDS.length} brands.`;
            alert(msg);
            handleAnalyze();
        } catch (e) {
            console.error("Seeding Error:", e);
        } finally {
            setGenerating(false);
        }
    };

    const handleSeedBuyback = async () => {
        setGenerating(true);
        try {
            const SUPPORTED_BRANDS = Array.from(new Set(Object.values(DEVICE_BRANDS).flat())).sort();
            let totalCount = 0;

            for (const brand of SUPPORTED_BRANDS) {
                console.log(`Processing Buyback for Brand: ${brand}...`);
                let models = getAllModels(brand);

                if (targetedModel) {
                    models = models.filter(m => createSlug(`${brand} ${m}`).includes(targetedModel));
                }

                console.log(`[${brand}] Found ${models.length} models (after target filter).`);

                let batch = writeBatch(db);
                let opsInBatch = 0;

                for (const model of models) {
                    const slug = createSlug(`${brand} ${model}`);
                    const offers = generateBuybackDefaults(slug);

                    if (targetedModel || overwriteMode) {
                        try {
                            const existingQuery = query(collection(db, 'buyback_pricing'), where('deviceId', '==', slug));
                            const existingDocs = await getDocs(existingQuery);

                            const validIds = new Set<string>();
                            const CONDITIONS: BuybackCondition[] = ['new', 'like-new', 'good', 'fair', 'damaged'];

                            offers.forEach((o: BuybackDefaultOffer) => {
                                validIds.add(`${slug}_${o.storage}`);
                                CONDITIONS.forEach(c => validIds.add(`${slug}_${o.storage}_${c}`));
                            });

                            existingDocs.forEach(d => {
                                if (!validIds.has(d.id)) {
                                    batch.delete(d.ref);
                                    opsInBatch++;
                                    totalCount++;
                                }
                            });
                        } catch (err) {
                            console.error("Error during cleanup query:", err);
                        }
                    } else {
                        const ALL_POSSIBLE_STORAGES = ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '4TB', '8TB'];
                        const validStorages = new Set(offers.map((o: BuybackDefaultOffer) => o.storage));
                        const CONDITIONS_FOR_CLEANUP: BuybackCondition[] = ['new', 'like-new', 'good', 'fair', 'damaged'];

                        for (const s of ALL_POSSIBLE_STORAGES) {
                            if (!validStorages.has(s)) {
                                batch.delete(doc(db, 'buyback_pricing', `${slug}_${s}`));
                                opsInBatch++;
                                for (const cond of CONDITIONS_FOR_CLEANUP) {
                                    batch.delete(doc(db, 'buyback_pricing', `${slug}_${s}_${cond}`));
                                    opsInBatch++;
                                }
                            }
                        }
                    }

                    const expandedOffers: BuybackPriceRecord[] = [];
                    const CONDITIONS: BuybackCondition[] = ['new', 'like-new', 'good', 'fair', 'damaged'];

                    for (const baseOffer of offers) {
                        for (const cond of CONDITIONS) {
                            const deduction = baseOffer.condition_deductions ? baseOffer.condition_deductions[cond] : 0;
                            const finalPrice = Math.round(baseOffer.price * (1 - deduction));

                            expandedOffers.push({
                                ...baseOffer,
                                id: `${slug}_${baseOffer.storage}_${cond}`,
                                deviceId: slug,
                                condition: cond,
                                price: finalPrice,
                                currency: 'EUR',
                                updatedAt: new Date().toISOString()
                            });
                        }
                    }

                    const existingDocMap = new Set<string>();
                    if (!overwriteMode && expandedOffers.length > 0) {
                        const offerIds = expandedOffers.map(o => o.id);
                        const idChunks = [];
                        for (let i = 0; i < offerIds.length; i += 10) idChunks.push(offerIds.slice(i, i + 10));

                        for (const chunk of idChunks) {
                            if (chunk.length === 0) continue;
                            const q = query(collection(db, 'buyback_pricing'), where('__name__', 'in', chunk));
                            const snap = await getDocs(q);
                            snap.forEach(d => existingDocMap.add(d.id));
                        }
                    }

                    const marketMap: Record<string, { avgPrice: number }> = {};
                    try {
                        const snap = await getDoc(doc(db, 'market_values', slug));
                        if (snap.exists()) {
                            marketMap[snap.id] = snap.data() as { avgPrice: number };
                        }
                    } catch { /* ignore */ }

                    for (const offer of expandedOffers) {
                        if (offer.id) {
                            if (!overwriteMode && existingDocMap.has(offer.id)) {
                                continue;
                            }

                            const marketData = marketMap[slug];
                            if (!targetedModel && marketData && marketData.avgPrice > 0) {
                                let conditionDeduction = 0;
                                if (offer.condition === 'new') conditionDeduction = 0;
                                else if (offer.condition === 'like-new') conditionDeduction = marketData.avgPrice * 0.10;
                                else if (offer.condition === 'good') conditionDeduction = marketData.avgPrice * 0.20;
                                else if (offer.condition === 'fair') conditionDeduction = marketData.avgPrice * 0.30;
                                else if (offer.condition === 'damaged') conditionDeduction = marketData.avgPrice * 0.50;

                                (offer as BuybackPriceRecord).marketValue = marketData.avgPrice;
                                const rawOffer = PricingEngine.calculateBuybackOffer(marketData.avgPrice, [{ label: 'Condition', amount: conditionDeduction }]);
                                offer.price = rawOffer;
                            }

                            const docRef = doc(db, 'buyback_pricing', offer.id);
                            batch.set(docRef, offer, { merge: true });
                            opsInBatch++;

                            if (opsInBatch >= 450) {
                                await batch.commit();
                                batch = writeBatch(db);
                                opsInBatch = 0;
                            }
                        }
                    }
                }

                if (opsInBatch > 0) {
                    await batch.commit();
                    totalCount += opsInBatch;
                }
            }

            setStatusMessage({ text: `✅ Successfully seeded ${totalCount} Buyback Offers!`, type: 'success' });

        } catch (e: unknown) {
            console.error("Buyback Seeding Failed CRITICAL ERROR:", e);
            if (e instanceof Error) {
                setStatusMessage({ text: `Buyback Seeding Failed: ${e.message}`, type: 'error' });
            } else {
                setStatusMessage({ text: `Buyback Seeding Failed: Unknown Error`, type: 'error' });
            }
        } finally {
            console.log("Seeding Finished (Finally Block)");
            setGenerating(false);
        }
    };

    const handleCleanInvalidFaceID = async () => {
        if (!confirm("Delete all 'face_id' repair records?")) return;
        setGenerating(true);
        try {
            const q = query(collection(db, 'repair_prices'), where('issueId', '==', 'face_id'));
            const snap = await getDocs(q);
            const batch = writeBatch(db);
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
            alert(`Deleted ${snap.size} Face ID records.`);
        } catch (e) {
            alert("Error: " + e);
        } finally {
            setGenerating(false);
        }
    };

    const handleLiveScan = async (model: string, slug: string) => {
        setStatusMessage({ text: `⚡ Scanning market for ${model}...`, type: 'info' });
        try {
            const res = await fetch('/api/admin/market-prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Token': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
                },
                body: JSON.stringify({ brand: selectedBrand, model: model })
            });
            const data = await res.json() as { avgPrice: number, error?: string };

            if (res.ok && data) {
                await setDoc(doc(db, 'market_values', slug), {
                    ...data,
                    deviceId: slug
                }, { merge: true });

                setStatusMessage({ text: `✅ Scan Complete! Market Avg: €${data.avgPrice}`, type: 'success' });
            } else {
                setStatusMessage({ text: `Scan failed: ${data.error || 'Unknown'}`, type: 'error' });
            }
        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : 'Unknown Error';
            setStatusMessage({ text: `Scan failed: ${msg}`, type: 'error' });
        }
    };

    const handleExportCSV = async (type: 'repair' | 'buyback' | 'stock') => {
        setGenerating(true);
        try {
            let csvContent = "";
            let filename = "";

            if (type === 'repair') {
                filename = "belmobile_repair_prices.csv";
                csvContent = "Model,Issue,Price,Description\n";

                const q = query(collection(db, 'repair_prices'), where('isActive', '==', true));
                const snap = await getDocs(q);

                snap.forEach(doc => {
                    const data = doc.data() as RepairPriceRecord;
                    const model = capitalizeSlug(data.deviceId);
                    const issue = capitalizeSlug(data.issueId);
                    csvContent += `"${model}","${issue}","${data.price}","Professional repair service for ${model} ${issue}"\n`;
                });

            } else if (type === 'buyback') {
                filename = "belmobile_buyback_offers.csv";
                csvContent = "Model,Storage,Condition,OfferPrice\n";

                const q = query(collection(db, 'buyback_pricing'));
                const snap = await getDocs(q);

                snap.forEach(doc => {
                    const data = doc.data() as BuybackPriceRecord;
                    if (!data.price || data.price <= 0) return;

                    const model = capitalizeSlug(data.deviceId);
                    csvContent += `"${model}","${data.storage}","${data.condition}","${data.price}"\n`;
                });

            } else if (type === 'stock') {
                filename = "belmobile_product_stock.csv";
                csvContent = "ID,Name,Price,StockStatus,Availability\n";

                const q = query(collection(db, 'products'));
                const snap = await getDocs(q);

                snap.forEach(doc => {
                    const data = doc.data();
                    const availability = data.availability as Record<string, number> | undefined;
                    const totalStock = availability ? Object.values(availability).reduce((a, b) => a + (Number(b) || 0), 0) : 0;

                    csvContent += `"${data.id}","${data.name}","${data.price}","${totalStock > 0 ? 'In Stock' : 'Out of Stock'}","${totalStock}"\n`;
                });
            }

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert(`✅ ${type.toUpperCase()} list exported successfully!`);

        } catch (e) {
            console.error("Export failed:", e);
            alert("Export failed. See console.");
        } finally {
            setGenerating(false);
        }
    };

    const missingList = results.filter(r => r.status === 'empty');
    const partialList = results.filter(r => r.status === 'partial');

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                🚀 Batch Pricing Tools & Export
            </h3>

            <div className="flex gap-4 items-end mb-8">
                <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Brand Target</label>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none min-w-[200px]"
                    >
                        {Array.from(new Set(Object.values(DEVICE_BRANDS).flat())).sort().map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="px-6 py-3 bg-bel-blue text-white rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-50"
                >
                    {analyzing ? 'Scanning...' : 'Analyze Missing Prices'}
                </button>
            </div>

            {statusMessage && (
                <div className={`mb-6 p-4 rounded-xl border ${statusMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : statusMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                    <p className="font-bold">{statusMessage.text}</p>
                </div>
            )}

            <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setSelectedTab('repair')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${selectedTab === 'repair'
                                ? 'border-bel-blue text-bel-blue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        🛠️ Repair Matrix (Manual)
                    </button>
                    <button
                        onClick={() => setSelectedTab('buyback')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${selectedTab === 'buyback'
                                ? 'border-bel-blue text-bel-blue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        ♻️ Buyback Engine (Automated)
                    </button>
                </nav>
            </div>

            {selectedTab === 'buyback' ? (
                <BuybackAnchorManager />
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <input
                            type="checkbox"
                            id="overwriteMode"
                            checked={overwriteMode}
                            onChange={(e) => setOverwriteMode(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <label htmlFor="overwriteMode" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            ⚠️ Overwrite Existing Prices? (Uncheck for &quot;Safe Mode&quot; to preserve custom edits)
                        </label>
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Target Specific Model (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. iphone-air"
                            value={targetedModel}
                            onChange={(e) => setTargetedModel(e.target.value)}
                            className="p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <div className="text-xs text-gray-500">Leave empty to seed ALL models. Enter a slug (e.g. &apos;iphone-14&apos;) to limit scope.</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={handleGlobalSeed}
                            disabled={generating}
                            className={`px-6 py-4 text-white rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 ${overwriteMode ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 dark:bg-slate-700 hover:bg-gray-800'}`}
                        >
                            🌍 Seed ALL Repair Prices {overwriteMode ? '(OVERWRITE)' : '(SAFE)'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCleanInvalidFaceID}
                            disabled={generating}
                            className="px-6 py-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-bold shadow-sm hover:bg-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            🧹 Clean FACE ID Data
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                    type="button"
                    onClick={async () => {
                        if (!confirm("⚠️ DEEP CLEAN & FIX GHOSTS ⚠️\n\nThis will scan for:\n1. Duplicate IDs (Ghost Records)\n2. Invalid Variant Names (e.g. 'generic' vs 'generic-lcd')\n\nIt will DELETE any record for standard issues (Screen, Battery) that does not match the strict schema.\n\nThis ensures a clean database for deployment.\n\nContinue?")) return;

                        setGenerating(true);
                        try {
                            const SUPPORTED_BRANDS = Array.from(new Set(Object.values(DEVICE_BRANDS).flat())).sort();
                            let fixedCount = 0;
                            let ghostsFound = 0;

                            for (const brand of SUPPORTED_BRANDS) {
                                const models = getAllModels(brand);
                                if (models.length === 0) continue;

                                let generator: ((id: string) => RepairPriceRecord[]) | null = null;
                                const brandL = brand.toLowerCase();
                                if (brandL === 'apple') generator = generateAppleDefaults;
                                else if (brandL === 'samsung') generator = generateSamsungDefaults;
                                else if (brandL === 'google') generator = generateGoogleDefaults;

                                const CHUNK_SIZE = 10;
                                for (let i = 0; i < models.length; i += CHUNK_SIZE) {
                                    const modelChunk = models.slice(i, i + CHUNK_SIZE);
                                    const chunkSlugs = modelChunk.map(m => createSlug(`${brand} ${m}`));

                                    const q = query(collection(db, 'repair_prices'), where('deviceId', 'in', chunkSlugs));
                                    const snap = await getDocs(q);

                                    const batch = writeBatch(db);
                                    let ops = 0;

                                    snap.docs.forEach(docSnap => {
                                        const data = docSnap.data() as RepairPriceRecord;
                                        if (!data.deviceId || !data.issueId) return;

                                        if (generator && ['screen', 'battery'].includes(data.issueId)) {
                                            const blueprints = generator(data.deviceId);
                                            const validVariants = blueprints
                                                .filter(b => b.issueId === data.issueId)
                                                .map(b => JSON.stringify(b.variants || {}));

                                            const currentVariant = JSON.stringify(data.variants || {});
                                            const isValid = validVariants.includes(currentVariant);

                                            if (!isValid) {
                                                console.log(`[Deep Clean] Invalid Variant for ${data.deviceId} ${data.issueId}:`, currentVariant);
                                                batch.delete(docSnap.ref);
                                                ops++;
                                                ghostsFound++;
                                                return;
                                            }
                                        }

                                        const variantValues = data.variants ? Object.values(data.variants).map(v => String(v).toLowerCase()).sort() : [];
                                        const suffix = variantValues.length > 0 ? variantValues.join('-') : 'base';
                                        const expectedId = `${data.deviceId}_${data.issueId}_${suffix}`;

                                        if (docSnap.id !== expectedId) {
                                            const standardExists = snap.docs.some(d => d.id === expectedId);
                                            if (standardExists) {
                                                batch.delete(docSnap.ref);
                                                ops++;
                                                ghostsFound++;
                                            } else {
                                                const newRef = doc(db, 'repair_prices', expectedId);
                                                batch.set(newRef, data);
                                                batch.delete(docSnap.ref);
                                                ops++;
                                                fixedCount++;
                                            }
                                        }
                                    });

                                    if (ops > 0) await batch.commit();
                                }
                            }
                            alert(`Deep Clean Complete!\n\nDeleted ${ghostsFound} invalid/ghost records.\nFixed ${fixedCount} ID mismatches.`);
                        } catch (e: unknown) {
                            const msg = e instanceof Error ? e.message : 'Unknown Error';
                            alert("Error cleaning: " + msg);
                        } finally {
                            setGenerating(false);
                        }
                    }}
                    disabled={generating}
                    className="w-full px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
                >
                    🧹 Deep Clean Database (Strict)
                </button>
            </div>

            {/* MARKETPLACE EXPORT SECTION - SHARED */}
            <div className="mt-12 mb-8 p-6 bg-blue-50 dark:bg-slate-800/80 rounded-2xl border border-blue-100 dark:border-slate-700">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-4">Marketplace Exports (CSV)</h4>
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => handleExportCSV('repair')}
                        disabled={generating}
                        className="px-4 py-3 bg-white dark:bg-slate-700 text-gray-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl font-bold hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-2"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        Export Repairs
                    </button>
                    <button
                        onClick={() => handleExportCSV('buyback')}
                        disabled={generating}
                        className="px-4 py-3 bg-white dark:bg-slate-700 text-gray-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl font-bold hover:border-green-500 hover:text-green-600 transition flex items-center justify-center gap-2"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        Export Buyback
                    </button>
                    <button
                        onClick={() => handleExportCSV('stock')}
                        disabled={generating}
                        className="px-4 py-3 bg-white dark:bg-slate-700 text-gray-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl font-bold hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        Export Stock
                    </button>
                </div>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/50 mt-3 text-center">
                    Use these CSV files for 2dehands.be / 2ememain.be bulk upload or other marketplace tools.
                </p>
            </div>

            {results.length > 0 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{results.filter(r => r.status === 'ok').length}</div>
                            <div className="text-sm font-bold text-green-800 dark:text-green-300">Fully Configured</div>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
                            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{partialList.length}</div>
                            <div className="text-sm font-bold text-yellow-800 dark:text-yellow-300">Partial Missing</div>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{missingList.length}</div>
                            <div className="text-sm font-bold text-red-800 dark:text-red-300">Completely Empty</div>
                        </div>
                    </div>

                    {(missingList.length > 0 || partialList.length > 0) && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleGenerateDefaults([...missingList, ...partialList])}
                                disabled={generating}
                                className="flex-1 px-6 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                            >
                                {generating ? 'Generating...' : `✨ Auto-Fill ${missingList.length + partialList.length} Missing Models (Estimated)`}
                            </button>
                        </div>
                    )}

                    <div className="border rounded-xl overflow-hidden dark:border-slate-700">
                        <div className="max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 font-bold sticky top-0">
                                    <tr>
                                        <th className="p-4">Model</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Missing Core Issues</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {results.map(r => (
                                        <tr key={r.slug} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                            <td className="p-4 font-medium">{r.model}</td>
                                            <td className="p-4">
                                                {r.status === 'ok' && <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold"><CheckCircleIcon className="h-4 w-4" /> OK</span>}
                                                {r.status === 'partial' && <span className="inline-flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-bold"><ExclamationTriangleIcon className="h-4 w-4" /> Partial</span>}
                                                {r.status === 'empty' && <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold"><XCircleIcon className="h-4 w-4" /> Empty</span>}
                                            </td>
                                            <td className="p-4 text-gray-400">
                                                {r.missingIssues.join(', ') || '-'}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleLiveScan(r.model, r.slug)}
                                                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-xs font-bold flex items-center gap-1"
                                                >
                                                    <BoltIcon className="h-3 w-3" /> Scan
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
