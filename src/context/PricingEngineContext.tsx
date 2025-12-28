'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { MarketData } from '../lib/market-intelligence/scrapers';
import { CompetitorPrice, getCompetitorPrices } from '../lib/market-intelligence/brussels-radar';

interface PricingEngineContextType {
    // Selection State
    selectedBrand: string;
    setSelectedBrand: (brand: string) => void;
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    deviceId: string; // Derived slug

    // View State
    viewMode: 'single' | 'grid' | 'batch';
    setViewMode: (mode: 'single' | 'grid' | 'batch') => void;

    // Data State
    prices: Record<string, any>; // Real-time prices
    marketData: CompetitorPrice[];
    loadingMarket: boolean;
    refreshMarketData: () => Promise<void>;

    // Actions
    syncStatus: 'idle' | 'saving' | 'synced';
    scanMarket: () => Promise<void>;
    updatePrice: (issueKey: string, newPrice: number) => Promise<void>;
}

const PricingEngineContext = createContext<PricingEngineContextType | undefined>(undefined);

export function PricingEngineProvider({ children }: { children: ReactNode }) {
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [viewMode, setViewMode] = useState<'single' | 'grid' | 'batch'>('single');
    const [prices, setPrices] = useState<Record<string, any>>({});
    const [marketData, setMarketData] = useState<CompetitorPrice[]>([]);
    const [loadingMarket, setLoadingMarket] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'synced'>('idle');

    // Derived ID
    const deviceId = selectedBrand && selectedModel
        ? `${selectedBrand.toLowerCase().replace(/ /g, '-')}-${selectedModel.toLowerCase().replace(/ /g, '-')}`
        : '';

    // Real-time Price Sync
    useEffect(() => {
        if (!deviceId) {
            setPrices({});
            return;
        }

        const unsub = onSnapshot(doc(db, 'repair_prices', deviceId), (doc) => {
            if (doc.exists()) {
                setPrices(doc.data());
            } else {
                setPrices({});
            }
        });

        return () => unsub();
    }, [deviceId]);

    // --- Market Data Connection ---
    const scanMarket = async () => {
        if (!selectedModel) return;
        try {
            await fetch('/api/admin/scan-market', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId, modelName: selectedModel })
            });
        } catch (e) {
            console.error("Scan failed", e);
        }
    };

    const refreshMarketData = async () => {
        // Kept for interface compatibility, but logic is now real-time
        scanMarket();
    }

    useEffect(() => {
        if (!selectedModel) {
            setMarketData([]);
            return;
        }

        setLoadingMarket(true);

        // Normalize ID for the scraper's convention
        const docId = selectedModel.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        const marketRef = doc(db, 'competitor_prices', docId);

        const unsubscribe = onSnapshot(marketRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                // Transform the map "competitors" { "fixnow": { price: 100 } } into Array
                const transformed: CompetitorPrice[] = [];
                if (data.competitors) {
                    Object.entries(data.competitors).forEach(([key, val]: [string, any]) => {
                        transformed.push({
                            competitor: val.competitor || key,
                            price: val.price,
                            product: selectedModel,
                            url: val.url,
                            lastUpdated: val.lastUpdated || new Date().toISOString(),
                            type: 'screen_generic'
                        });
                    });
                }
                setMarketData(transformed);
            } else {
                // If no real data, fall back to Mock if it's iPhone 13 for demo
                if (selectedModel.toLowerCase().includes('iphone 13')) {
                    getCompetitorPrices(selectedModel).then(setMarketData);
                } else {
                    setMarketData([]);
                }
            }
            setLoadingMarket(false);
        });

        return () => unsubscribe();
    }, [selectedModel]);

    // --- Actions ---
    const updatePrice = async (issueKey: string, newPrice: number) => {
        if (!deviceId) return;
        setSyncStatus('saving');

        // Optimistic Update
        const updatedPrices = { ...prices, [issueKey]: newPrice };
        setPrices(updatedPrices);

        try {
            await setDoc(doc(db, 'repair_prices', deviceId), {
                [issueKey]: newPrice,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setSyncStatus('synced');
            // Reset to idle after 2 seconds
            setTimeout(() => setSyncStatus('idle'), 2000);
        } catch (e) {
            console.error("Failed to update price", e);
            setSyncStatus('idle'); // TODO: Add error state
        }
    };

    return (
        <PricingEngineContext.Provider value={{
            selectedBrand, setSelectedBrand,
            selectedModel, setSelectedModel,
            deviceId,
            viewMode, setViewMode,
            prices,
            marketData, loadingMarket, refreshMarketData,
            syncStatus, scanMarket, updatePrice
        }}>
            {children}
        </PricingEngineContext.Provider>
    );
}

export function usePricingEngine() {
    const context = useContext(PricingEngineContext);
    if (context === undefined) {
        throw new Error('usePricingEngine must be used within a PricingEngineProvider');
    }
    return context;
}
