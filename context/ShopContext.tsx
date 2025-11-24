
import React, { createContext, useState, ReactNode } from 'react';
import { Shop } from '../types';
// Fix: Corrected import from SHOPS to MOCK_SHOPS to match the exported member from constants.ts.
import { MOCK_SHOPS } from '../constants';

interface ShopContextType {
    selectedShop: Shop | null;
    setSelectedShop: (shop: Shop | null) => void;
}

export const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Fix: Used MOCK_SHOPS instead of the non-existent SHOPS variable.
    const [selectedShop, setSelectedShop] = useState<Shop | null>(MOCK_SHOPS[0] || null);

    return (
        <ShopContext.Provider value={{ selectedShop, setSelectedShop }}>
            {children}
        </ShopContext.Provider>
    );
};