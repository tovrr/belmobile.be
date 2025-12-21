import { ChartData, Service } from '../types';

export const RESERVATIONS_CHART_DATA: ChartData[] = [
    { name: 'Jan', value: 30 }, { name: 'Feb', value: 45 }, { name: 'Mar', value: 60 },
    { name: 'Apr', value: 55 }, { name: 'May', value: 75 }, { name: 'Jun', value: 80 },
];

export const QUOTES_CHART_DATA: ChartData[] = [
    { name: 'Jan', value: 20 }, { name: 'Feb', value: 25 }, { name: 'Mar', value: 30 },
    { name: 'Apr', value: 40 }, { name: 'May', value: 35 }, { name: 'Jun', value: 50 },
];

export const MOCK_SERVICES: Service[] = [
    { id: 1, name: 'Screen Replacement', type: 'repair', description: 'Cracked or unresponsive screen repair for all major brands (iPhone, Samsung, Huawei, etc.).' },
    { id: 2, name: 'Battery Replacement', type: 'repair', description: 'Extend the life of your device with a brand new battery. Fixes fast draining and shutdown issues.' },
    { id: 3, name: 'Water Damage Repair', type: 'repair', description: 'Expert service to revive water-damaged devices. Includes ultrasonic cleaning and board diagnostics.' },
    { id: 4, name: 'Charging Port Repair', type: 'repair', description: 'Fixes loose cables, slow charging, or devices that won\'t charge at all.' },
    { id: 5, name: 'Data Recovery', type: 'repair', description: 'Recover lost photos, contacts, and files from broken or dead devices.' },
    { id: 6, name: 'Microsoldering', type: 'repair', description: 'Advanced motherboard repair for complex issues (Touch IC, Audio IC, No Power).' },
    { id: 7, name: 'Console Repair', type: 'repair', description: 'HDMI port replacement, overheating/cleaning, and disc drive repairs for PS5, Xbox, Switch.' },
    { id: 8, name: 'Tablet Repair', type: 'repair', description: 'Screen, battery, and charging port repairs for iPad, Samsung Tab, and Surface.' },
    { id: 9, name: 'Laptop Repair', type: 'repair', description: 'Screen, keyboard, battery replacement, and software troubleshooting for MacBook and Windows laptops.' },
    { id: 10, name: 'Software Issues', type: 'repair', description: 'Boot loops, stuck on logo, updates, and data transfer services.' },
    { id: 11, name: 'Network Unlocking', type: 'repair', description: 'Unlock your device to use with any carrier worldwide.' },
    { id: 12, name: 'Smartphone Buyback', type: 'buyback', description: 'Get a great price for your old smartphone. Instant cash or bank transfer.' },
    { id: 13, name: 'Tablet Buyback', type: 'buyback', description: 'Trade in your old tablet for cash or store credit.' },
    { id: 14, name: 'Console Buyback', type: 'buyback', description: 'Sell your old gaming console for a competitive price.' },
    { id: 15, name: 'B2B Fleet Services', type: 'repair', description: 'Dedicated repair and maintenance services for company devices with volume discounts.' },
];
