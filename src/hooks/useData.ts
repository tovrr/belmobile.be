'use client';

import { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { useInventory } from '../context/InventoryContext';
import { useOrders } from '../context/OrderContext';

export const useData = () => {
    const dataContext = useContext(DataContext);
    const inventoryContext = useInventory();
    const orderContext = useOrders();

    if (dataContext === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }

    // Merge for backward compatibility
    return {
        ...dataContext,
        ...inventoryContext,
        ...orderContext,
        // Resolve field name conflicts or specialized names if any
        loading: dataContext.loading || inventoryContext.loadingProducts || orderContext.loadingOrders
    };
};
