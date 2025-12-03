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
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

    React.useEffect(() => {
        if (shops.length > 0 && !selectedShop) {
            setSelectedShop(shops[0]);
        }
    }, [shops, selectedShop]);

    return (
        <ShopContext.Provider value={{ selectedShop, setSelectedShop }}>
            {children}
        </ShopContext.Provider>
    );
};
