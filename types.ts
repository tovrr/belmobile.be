
// Fix: Import React to provide the 'React' namespace for types like React.ElementType.
import React from 'react';

export interface Shop {
    id: number;
    name: string;
    address: string;
    phone: string;
    hours: string;
    coords: { lat: number; lng: number };
    status: 'open' | 'coming_soon';
}

export interface Product {
    id: number;
    name:string;
    description: string;
    price: number;
    imageUrl: string;
    availability: { [shopId: number]: number }; // shopId -> quantity
}

export interface Service {
    id: number;
    name: string;
    type: 'repair' | 'buyback';
    description: string;
}

export interface Reservation {
    id: number;
    productId: number;
    productName: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shopId: number;
    status: 'pending' | 'approved' | 'cancelled';
    date: string;
}

export interface Quote {
    id: number;
    type: 'buyback' | 'repair';
    deviceType: string;
    brand: string;
    model: string;
    condition: string;
    issue: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shopId: number;
    status: 'new' | 'processing' | 'responded' | 'closed';
    date: string;
    photoUrl?: string;
}

export interface FranchiseApplication {
    id: number;
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
    id: number;
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
    id: number;
    customerName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    platform: 'Google' | 'Website';
}

export interface FAQCategory {
    id: string;
    title: string;
    items: { q: string; a: string }[];
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
