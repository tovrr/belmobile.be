'use client';

import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

export const useShop = () => {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};

