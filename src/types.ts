
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
    status: 'open' | 'coming_soon';
    googleMapUrl?: string;
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
    status: 'new' | 'processing' | 'responded' | 'closed';
    date: string;
    photoUrl?: string;
    price?: number;
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
    slug: string;
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

export interface RepairPricing {
    id: string; // model slug
    screen_generic?: number;
    screen_oled?: number;
    screen_original?: number;
    battery?: number;
    charging?: number;
    hdmi?: number;
    cleaning?: number;
    disc?: number;
    storage?: number;
    joystick?: number;
    card_reader?: number;
    keyboard?: number;
    trackpad?: number;
    other?: number;
    updatedAt?: any;
}
