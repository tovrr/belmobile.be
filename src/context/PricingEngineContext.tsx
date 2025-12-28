'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
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

    // Market Data Sync
    const refreshMarketData = async () => {
        if (!selectedModel) return;
        setLoadingMarket(true);
        try {
            const data = await getCompetitorPrices(selectedModel);
            setMarketData(data);
        } catch (e) {
            console.error("Market sync failed", e);
        } finally {
            setLoadingMarket(false);
        }
    };

    // Auto-refresh market data when device changes
    useEffect(() => {
        refreshMarketData();
    }, [selectedModel]);

    return (
        <PricingEngineContext.Provider value={{
            selectedBrand, setSelectedBrand,
            selectedModel, setSelectedModel,
            deviceId,
            viewMode, setViewMode,
            prices,
            marketData, loadingMarket, refreshMarketData,
            syncStatus
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
