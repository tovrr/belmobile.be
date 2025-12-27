'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import {
    Product, Service, RepairPricing, StockLog, BuybackPriceRecord
} from '../types';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import {
    useProducts,
    useServices,
    useRepairPrices,
    useBuybackPrices,
    useStockLogs
} from '../hooks/useFirestore';

interface InventoryContextType {
    products: Product[];
    services: Service[];
    repairPrices: RepairPricing[];
    buybackPrices: BuybackPriceRecord[];
    stockLogs: StockLog[];
    loadingProducts: boolean;
    loadingServices: boolean;
    addProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (id: number | string) => Promise<void>;
    addService: (serviceData: Omit<Service, 'id'>) => Promise<void>;
    updateService: (service: Service) => Promise<void>;
    deleteService: (id: number | string) => Promise<void>;
    updateRepairPrice: (pricing: RepairPricing) => Promise<void>;
    logStockMovement: (logData: Omit<StockLog, 'id' | 'date'>) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { products, loading: loadingProducts } = useProducts();
    const { services, loading: loadingServices } = useServices();
    const { prices: repairPrices } = useRepairPrices();
    const { prices: buybackPrices } = useBuybackPrices();
    const { logs: stockLogs } = useStockLogs(user);

    const addProduct = async (productData: Omit<Product, 'id'>) => {
        try {
            await addDoc(collection(db, 'products'), productData);
        } catch (error) {
            console.error("Error adding product: ", error);
        }
    };

    const updateProduct = async (product: Product) => {
        try {
            const { id, ...data } = product;
            await updateDoc(doc(db, 'products', String(id)), data);
        } catch (error) {
            console.error("Error updating product: ", error);
        }
    };

    const deleteProduct = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'products', String(id)));
        } catch (error) {
            console.error("Error deleting product: ", error);
        }
    };

    const addService = async (serviceData: Omit<Service, 'id'>) => {
        try {
            await addDoc(collection(db, 'services'), serviceData);
        } catch (error) {
            console.error("Error adding service: ", error);
        }
    };

    const updateService = async (service: Service) => {
        try {
            const { id, ...data } = service;
            await updateDoc(doc(db, 'services', String(id)), data);
        } catch (error) {
            console.error("Error updating service: ", error);
        }
    };

    const deleteService = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, 'services', String(id)));
        } catch (error) {
            console.error("Error deleting service: ", error);
        }
    };

    const updateRepairPrice = async (pricing: RepairPricing) => {
        try {
            const { id, ...data } = pricing;
            if (id) {
                await updateDoc(doc(db, 'repair_prices', String(id)), data);
            } else {
                await addDoc(collection(db, 'repair_prices'), data);
            }
        } catch (error) {
            console.error("Error updating repair price: ", error);
        }
    };

    const logStockMovement = async (logData: Omit<StockLog, 'id' | 'date'>) => {
        try {
            await addDoc(collection(db, 'stock_logs'), {
                ...logData,
                date: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error logging stock movement: ", error);
        }
    };

    const value = {
        products,
        services,
        repairPrices,
        buybackPrices,
        stockLogs,
        loadingProducts,
        loadingServices,
        addProduct,
        updateProduct,
        deleteProduct,
        addService,
        updateService,
        deleteService,
        updateRepairPrice,
        logStockMovement
    };

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
