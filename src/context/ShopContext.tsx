'use client';

import React, { createContext, useState, ReactNode } from 'react';
import { Shop } from '../types';
import { useData } from '../hooks/useData';

interface ShopContextType {
    selectedShop: Shop | null;
    setSelectedShop: (shop: Shop | null) => void;
}

export const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { shops } = useData();
    const [selectedShop, setSelectedShopState] = useState<Shop | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount and when shops are available
    React.useEffect(() => {
        if (shops.length > 0 && !isInitialized) {
            const savedShopId = localStorage.getItem('selectedShopId');
            if (savedShopId) {
                // Find shop by comparing both as strings and numbers to handle mixed ID types
                const shop = shops.find(s =>
                    String(s.id) === String(savedShopId) ||
                    s.id === savedShopId ||
                    s.id === Number(savedShopId)
                );
                // Only restore if shop exists and is OPEN (not coming_soon)
                if (shop && shop.status === 'open') {
                    setSelectedShopState(shop);
                } else if (savedShopId) {
                    // If saved shop is not open or doesn't exist, clear it from localStorage
                    localStorage.removeItem('selectedShopId');
                }
            }
            setIsInitialized(true);
        }
    }, [shops, isInitialized]);

    const setSelectedShop = (shop: Shop | null) => {
        setSelectedShopState(shop);
        if (shop) {
            localStorage.setItem('selectedShopId', String(shop.id));
        } else {
            localStorage.removeItem('selectedShopId');
        }
    };

    return (
        <ShopContext.Provider value={{ selectedShop, setSelectedShop }}>
            {children}
        </ShopContext.Provider>
    );
};
