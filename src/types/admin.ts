
export type UserRole = 'super_admin' | 'shop_manager' | 'technician';

export interface AdminProfile {
    uid: string;
    email: string;
    displayName?: string;
    role: UserRole;
    shopId?: string; // Forced if shop_manager, optional/all for super_admin
    createdAt: string;
}

// -- Stock & Audit Types --
export interface StockLog {
    id?: string;
    productId: string;
    productName: string;
    type: 'stock_update' | 'price_update' | 'creation' | 'deletion';
    change: string; // e.g., "Stock updated: 5 -> 10", "Price: €500 -> €450"
    userEmail: string;
    date: string;
    targetShopId?: string; // If specific to a shop
}
