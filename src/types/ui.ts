import React from 'react';
import { Shop } from './models';

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

export type { MapProps } from '../components/store/Map';
