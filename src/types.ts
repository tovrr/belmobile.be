
// Fix: Import React to provide the 'React' namespace for types like React.ElementType.
import React from 'react';

export interface Shop {
    id: number | string;
    name: string;
    slugs: { [lang: string]: string };
    address: string;
    city?: string;
    zip?: string;
    phone: string;
    email: string;
    openingHours: string[];
    coords: { lat: number; lng: number };
    status: 'open' | 'coming_soon' | 'temporarily_closed';
    isHub?: boolean;
    googleMapUrl?: string;
    googlePlaceId?: string;
    googleReviewUrl?: string;
    description?: string;
    photos?: string[];
    services?: string[];
}

export interface Product {
    id: number | string;
    name: string;
    name_fr?: string;
    name_nl?: string;
    description: string;
    description_fr?: string;
    description_nl?: string;
    price: number;
    imageUrl: string;
    altText?: string;
    altText_fr?: string;
    altText_nl?: string;
    category?: string;
    brand?: string;
    condition?: 'perfect' | 'very_good' | 'good';
    capacity?: string; // Single capacity for this specific SKU
    color?: string; // Single color for this specific SKU
    slug: string;
    availability: { [shopId: string]: number };
}

export interface Service {
    id: number | string;
    name: string;
    type: 'repair' | 'buyback';
    description: string;
    price?: number;
}

export interface Reservation {
    id: number | string;
    productId: number | string;
    productName: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shopId: number | string;
    status: 'pending' | 'approved' | 'cancelled';
    date: string;
    deliveryMethod?: 'pickup' | 'shipping';
    shippingAddress?: string;
    shippingCity?: string;
    shippingZip?: string;
    estimatedPrice?: number; // Added for Analytics (Potential Revenue)
}

export interface Quote {
    id: number | string;
    type: 'buyback' | 'repair';
    deviceType: string;
    brand: string;
    model: string;
    condition: string | { screen: string; body: string };
    issue?: string; // Legacy
    issues?: string[]; // New array format
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    customerCity?: string;
    customerZip?: string;
    deliveryMethod?: 'dropoff' | 'send';
    iban?: string;
    idUrl?: string;
    shopId: number | string;
    status: 'new' | 'processing' | 'waiting_parts' | 'repaired' | 'shipped' | 'responded' | 'closed';
    date: string;
    photoUrl?: string;
    price?: number;
    language?: string; // stored language for email notifications
    trackingNumber?: string;
    shippingLabelUrl?: string;
}

export interface FranchiseApplication {
    id: number | string;
    name: string;
    email: string;
    phone: string;
    locationPreference: string;
    investmentCapacity: string;
    background: string;
    status: 'new' | 'reviewing' | 'approved' | 'rejected';
    date: string;
    documentUrl?: string; // Optional link to an uploaded CV or business plan
}

export interface BlogPost {
    id: number | string;
    slug: string; // Default slug (usually FR or primary)
    slugs?: { [lang: string]: string }; // Localized slugs
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    imageUrl: string;
    category: string;
}

export interface Review {
    id: number | string;
    customerName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    platform: 'Google' | 'Website';
}

export interface FAQItem {
    q: string;
    a: string;
}

export interface FAQCategory {
    id: string;
    title: string;
    items: FAQItem[];
}


export interface NavLink {
    name: string;
    path: string;
}

export interface AdminStat {
    label: string;
    value: string;
    icon: React.ElementType;
    trend?: string;
    color?: string; // Text color class for icon/value e.g. "text-green-600"
}

export interface ChartData {
    name: string;
    value: number;
}

export interface MapProps {
    shops: Shop[];
    center: [number, number];
    zoom: number;
}

export interface RepairIssue {
    id: string;
    label: string;
    description?: string;
    base: number;
    devices: string[];
    brands?: string[];
    iconType: 'heroicon' | 'url';
    icon: string;
}

export interface RepairPricing {
    id: string; // model slug
    screen_generic?: number;
    screen_oled?: number;
    screen_original?: number;
    [key: string]: number | string | boolean | undefined; // Allow dynamic issue keys
}

// --- NEW ARCHITECTURE TYPES ---

export interface RepairDimension {
    key: string; // e.g., 'quality', 'position'
    label: string; // e.g., 'Quality', 'Position'
    options: string[]; // e.g., ['Generic', 'OLED', 'Original'], ['Top', 'Bottom']
}

export interface RepairIssueDefinition {
    id: string; // e.g., 'screen'
    label: string; // e.g., 'Screen Replacement'
    icon: string; // HeroIcon name
    description?: string;
    basePrice?: number; // Default base price
    defaultDimensions?: RepairDimension[]; // Default variations (can be overridden by device)
    brands?: string[]; // Optional: Restrict to specific brands (e.g. ['Apple'])
    devices?: string[]; // Optional: Restrict to specific device types (e.g. ['smartphone', 'tablet'])
}

export interface DeviceCategoryDefinition {
    id: string; // e.g., 'smartphone', 'console_portable'
    label: string;
    supportedIssues: string[]; // IDs of issues supported by this category
    issueOverrides?: {
        [issueId: string]: {
            dimensions?: RepairDimension[]; // Override dimensions for this category
        }
    };
}

export interface GlobalRepairSettings {
    issues: Record<string, RepairIssueDefinition>; // Map of all possible issues
    categories: Record<string, DeviceCategoryDefinition>; // Map of device categories
}

// The stored pricing record in Firestore 'repair_pricing_v2'
export interface RepairPriceRecord {
    id?: string;
    deviceId: string;
    issueId: string;
    variants?: Record<string, string>; // e.g. { color: 'black', quality: 'original' }
    price: number;
    currency: string;
    partCost?: number; // Part cost (Expert Mode)
    laborMinutes?: number; // Labor time (Expert Mode)
    isActive: boolean;
    isManual?: boolean; // Manual edit flag for priority boost
    migrationSource?: string; // Original legacy doc ID
    updatedAt: string;
}

// -- Buyback Types --
export type BuybackCondition = 'new' | 'like-new' | 'good' | 'fair' | 'damaged';

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

export interface BuybackPriceRecord {
    id?: string;
    deviceId: string; // "apple-iphone-13"
    storage: string; // "128gb", "256gb"
    condition: BuybackCondition;
    price: number; // The offer price we give to the customer
    marketValue?: number; // The "Like New" Resale Value used for calculation
    currency: string;
    updatedAt: string;
}

// -- Product (Sales) Types --
export type ProductCondition = 'new' | 'like-new' | 'good' | 'fair';

export interface ProductPriceRecord {
    id?: string;
    deviceId: string;
    storage: string;
    condition: ProductCondition;
    price: number; // Selling price
    currency: string;
    updatedAt: string;
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    date: string;
    createdAt: string;
}
