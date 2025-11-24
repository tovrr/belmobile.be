
import { Shop, Product, Service, Reservation, Quote, NavLink, AdminStat, ChartData, FranchiseApplication, BlogPost, Review, FAQCategory } from '../projects/belmobile.be-dev/types';
import { 
    ChartBarIcon, 
    CubeIcon, 
    PhoneIcon, 
    DocumentTextIcon, 
    BuildingStorefrontIcon, 
    WrenchScrewdriverIcon,
    DevicePhoneMobileIcon,
    DeviceTabletIcon,
    ComputerDesktopIcon,
    TvIcon,
    ClockIcon,
    Battery50Icon,
    BoltIcon,
    CameraIcon,
    NoSymbolIcon,
    SpeakerWaveIcon,
    UserGroupIcon,
    QuestionMarkCircleIcon,
    NewspaperIcon
} from '@heroicons/react/24/outline';

export const MOCK_SHOPS: Shop[] = [
    { 
        id: 1, 
        name: 'Belmobile Liedts', 
        address: 'Rue Gallait 4, 1030 Schaerbeek', 
        phone: '0484/83.75.60', 
        hours: 'Tue-Sat: 10:30 - 19:00\nFri: 10:30-12:30 & 14:30-19:00\nMon, Sun: Closed', 
        coords: { lat: 50.8635, lng: 4.3664 },
        status: 'open'
    },
    { 
        id: 2, 
        name: 'Belmobile Bara', 
        address: 'Rue Lambert Crickx 12, 1070 Anderlecht', 
        phone: '02/275.98.67', 
        hours: 'Mon-Sat: 10:30 - 19:00\nFri: 10:30-12:30 & 14:30-19:00\nSun: Closed', 
        coords: { lat: 50.8394, lng: 4.3346 },
        status: 'open'
    },
    { 
        id: 3, 
        name: 'Belmobile Tour & Taxis', 
        address: 'Rue Ulens 88, 1080 Molenbeek-Saint-Jean', 
        phone: '02/306.76.56', 
        hours: 'Mon-Sat: 10:30 - 19:00\nFri: 10:30-12:30 & 14:30-19:00\nSun: Closed', 
        coords: { lat: 50.8648, lng: 4.3472 },
        status: 'open'
    },
    { 
        id: 4, 
        name: 'Belmobile Antwerpen', 
        address: 'Antwerpen Region', 
        phone: 'Coming Soon', 
        hours: 'Coming Soon', 
        coords: { lat: 51.2194, lng: 4.4025 },
        status: 'coming_soon'
    },
    { 
        id: 5, 
        name: 'Belmobile Gent', 
        address: 'Gent Region', 
        phone: 'Coming Soon', 
        hours: 'Coming Soon', 
        coords: { lat: 51.0543, lng: 3.7174 },
        status: 'coming_soon'
    },
    { 
        id: 6, 
        name: 'Belmobile Hasselt', 
        address: 'Hasselt Region', 
        phone: 'Coming Soon', 
        hours: 'Coming Soon', 
        coords: { lat: 50.9307, lng: 5.3325 },
        status: 'coming_soon'
    }
];

export const MOCK_PRODUCTS: Product[] = [
    { 
        id: 1, 
        name: 'iPhone 13', 
        description: 'Reliable performance with A15 Bionic. Dual-camera system for stunning photos. Durable Ceramic Shield front.', 
        price: 549, 
        imageUrl: 'https://i.imgur.com/wQyD94n.jpeg', 
        availability: { 1: 3, 2: 2, 3: 0 } 
    },
    { 
        id: 2, 
        name: 'iPhone 13 Pro Max', 
        description: 'Pro camera system, bigger battery, and 120Hz ProMotion display. The ultimate iPhone 13 experience.', 
        price: 749, 
        imageUrl: 'https://i.imgur.com/0aM8qV9.jpeg', 
        availability: { 1: 1, 2: 0, 3: 2 } 
    },
    { 
        id: 3, 
        name: 'iPhone 15 Pro Max', 
        description: 'Titanium design, A17 Pro chip, and the most powerful iPhone camera ever with 5x Telephoto.', 
        price: 1199, 
        imageUrl: 'https://i.imgur.com/Qk5q8qj.jpeg', 
        availability: { 1: 2, 2: 4, 3: 1 } 
    },
    { 
        id: 4, 
        name: 'Samsung Galaxy S23 Ultra', 
        description: '200MP camera, embedded S Pen, and Snapdragon 8 Gen 2. The ultimate Android powerhouse.', 
        price: 949, 
        imageUrl: 'https://i.imgur.com/7k7q6k3.jpeg', 
        availability: { 1: 2, 2: 1, 3: 3 } 
    }
];

export const MOCK_SERVICES: Service[] = [
    { id: 1, name: 'Screen Replacement', type: 'repair', description: 'Cracked or unresponsive screen repair for all major brands.' },
    { id: 2, name: 'Battery Replacement', type: 'repair', description: 'Extend the life of your device with a brand new battery.' },
    { id: 3, name: 'Water Damage Repair', type: 'repair', description: 'Expert service to revive water-damaged devices.' },
    { id: 4, name: 'Smartphone Buyback', type: 'buyback', description: 'Get a great price for your old smartphone.' },
    { id: 5, name: 'Tablet Buyback', type: 'buyback', description: 'Trade in your old tablet for cash or store credit.' },
];

// Reordered: Repair > Buyback > Products > Stores.
export const NAV_LINKS: NavLink[] = [
    { name: 'Repair', path: '/repair' },
    { name: 'Buyback', path: '/buyback' },
    { name: 'Products', path: '/products' },
    { name: 'Store Locator', path: '/stores' },
];

export const ADMIN_STATS: AdminStat[] = [
    { label: 'Total Reservations', value: '128', icon: PhoneIcon },
    { label: 'New Quotes', value: '34', icon: DocumentTextIcon },
    { label: 'Products in Stock', value: '281', icon: CubeIcon },
    { label: 'Managed Shops', value: '3', icon: BuildingStorefrontIcon },
];

export const RESERVATIONS_CHART_DATA: ChartData[] = [
    { name: 'Jan', value: 30 }, { name: 'Feb', value: 45 }, { name: 'Mar', value: 60 },
    { name: 'Apr', value: 55 }, { name: 'May', value: 75 }, { name: 'Jun', value: 80 },
];

export const QUOTES_CHART_DATA: ChartData[] = [
    { name: 'Jan', value: 20 }, { name: 'Feb', value: 25 }, { name: 'Mar', value: 30 },
    { name: 'Apr', value: 40 }, { name: 'May', value: 35 }, { name: 'Jun', value: 50 },
];

export const MOCK_RESERVATIONS: Reservation[] = [
    { id: 1, productId: 1, productName: 'Smartphone Pro X', customerName: 'John Doe', customerEmail: 'john@example.com', customerPhone: '123-456-7890', shopId: 1, status: 'pending', date: '2024-07-28' },
    { id: 2, productId: 3, productName: 'Tablet Air', customerName: 'Jane Smith', customerEmail: 'jane@example.com', customerPhone: '234-567-8901', shopId: 2, status: 'approved', date: '2024-07-27' },
];

export const MOCK_QUOTES: Quote[] = [
    { id: 1, type: 'repair', deviceType: 'Smartphone', brand: 'Apple', model: 'iPhone 13', condition: 'Good', issue: 'Cracked screen', customerName: 'Peter Jones', customerEmail: 'peter@example.com', customerPhone: '345-678-9012', shopId: 3, status: 'new', date: '2024-07-28' },
    { id: 2, type: 'buyback', deviceType: 'Smartphone', brand: 'Samsung', model: 'Galaxy S21', condition: 'Excellent', issue: 'N/A', customerName: 'Mary Williams', customerEmail: 'mary@example.com', customerPhone: '456-789-0123', shopId: 1, status: 'responded', date: '2024-07-26' },
];

export const MOCK_FRANCHISE_APPLICATIONS: FranchiseApplication[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice.j@email.com', phone: '555-0101', locationPreference: 'Liège', investmentCapacity: '€100,000 - €150,000', background: '10 years in retail management, electronics sector.', status: 'new', date: '2024-07-29' },
    { id: 2, name: 'Bob Miller', email: 'bob.m@email.com', phone: '555-0102', locationPreference: 'Namur', investmentCapacity: '€150,000+', background: 'Previous experience owning a small business.', status: 'reviewing', date: '2024-07-25' },
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        slug: 'extend-battery-life',
        title: '5 Tips to Extend Your Smartphone Battery Life',
        excerpt: 'Struggling with a phone that dies by noon? Here are expert tips to keep your battery healthy for longer.',
        content: 'Content placeholder for battery tips...',
        author: 'David Tech',
        date: '2024-07-15',
        imageUrl: 'https://picsum.photos/seed/battery/800/400',
        category: 'Tips & Tricks'
    },
    {
        id: 2,
        slug: 'refurbished-vs-new',
        title: 'Why You Should Buy Refurbished Instead of New',
        excerpt: 'Save money and the planet. Discover the benefits of choosing a certified refurbished device from Belmobile.',
        content: 'Content placeholder for refurbished benefits...',
        author: 'Sarah Green',
        date: '2024-07-10',
        imageUrl: 'https://picsum.photos/seed/refurb/800/400',
        category: 'Buying Guide'
    },
    {
        id: 3,
        slug: 'water-damage-guide',
        title: 'Dropped Your Phone in Water? Do This Immediately!',
        excerpt: 'Panic mode off. Follow these immediate steps to increase the chances of saving your water-damaged device.',
        content: 'Content placeholder for water damage...',
        author: 'Mike Repair',
        date: '2024-07-05',
        imageUrl: 'https://picsum.photos/seed/water/800/400',
        category: 'Repair'
    },
    // --- MIGRATED SEO POSTS ---
    {
        id: 4,
        slug: 'reparation-face-id-iphone',
        title: 'Face ID Repair Cost & Solutions in Brussels',
        excerpt: 'Face ID not working? Discover the causes and repair prices for Face ID issues on iPhone X, 11, 12, 13 and 14.',
        content: 'Content about Face ID repair prices and technical details...',
        author: 'Belmobile Expert',
        date: '2024-01-15',
        imageUrl: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?q=80&w=800&auto=format&fit=crop',
        category: 'Repair'
    },
    {
        id: 5,
        slug: 'iphone-display-battery-message',
        title: 'iPhone "Unknown Part" Message Explained',
        excerpt: 'Seeing a warning message after a screen or battery repair? Here is what you need to know about Apple serialization.',
        content: 'Explanation of the Genuine Apple Part message...',
        author: 'Belmobile Expert',
        date: '2024-02-20',
        imageUrl: 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?q=80&w=800&auto=format&fit=crop',
        category: 'Troubleshooting'
    },
    {
        id: 6,
        slug: 'iphone-14-pro-max-review',
        title: 'Is the iPhone 14 Pro Max Still Worth It?',
        excerpt: 'A comprehensive review of the iPhone 14 Pro Max in 2024. Should you buy it refurbished or upgrade?',
        content: 'Review content...',
        author: 'Tech Team',
        date: '2024-03-10',
        imageUrl: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=800&auto=format&fit=crop',
        category: 'Reviews'
    },
    {
        id: 7,
        slug: 'boost-slow-laptop',
        title: '10 Tips to Speed Up a Slow Laptop',
        excerpt: 'Is your computer dragging? Before buying a new one, try these 10 tricks to boost performance instantly.',
        content: 'Tips about SSD upgrade, RAM, cleaning malware...',
        author: 'Belmobile IT',
        date: '2024-01-05',
        imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&auto=format&fit=crop',
        category: 'Tips & Tricks'
    },
    {
        id: 8,
        slug: 'samsung-s23-ultra-test',
        title: 'Samsung Galaxy S23 Ultra: The Complete Test',
        excerpt: 'Our verdict on Samsung\'s flagship. Camera, battery life, and S-Pen features reviewed in detail.',
        content: 'Deep dive into S23 Ultra features...',
        author: 'Tech Team',
        date: '2023-11-15',
        imageUrl: 'https://images.unsplash.com/photo-1677772263728-654264609dfc?q=80&w=800&auto=format&fit=crop',
        category: 'Reviews'
    }
];

export const MOCK_REVIEWS: Review[] = [
    { id: 1, customerName: 'Thomas D.', rating: 5, comment: 'Super fast service! Replaced my iPhone screen in under an hour at Liedts.', date: '2024-07-20', platform: 'Google' },
    { id: 2, customerName: 'Sophie M.', rating: 5, comment: 'Got a great price for my old Samsung. The transfer was instant. Highly recommend.', date: '2024-07-18', platform: 'Website' },
    { id: 3, customerName: 'Jonas V.', rating: 4, comment: 'Very professional team. A bit busy on Saturday but worth the wait for the quality.', date: '2024-07-15', platform: 'Google' },
    { id: 4, customerName: 'Elise B.', rating: 5, comment: 'Bought a refurbished iPad here, looks brand new! Saved me €200.', date: '2024-07-12', platform: 'Website' }
];

export const MOCK_FAQ_CATEGORIES: FAQCategory[] = [
    {
        id: 'services',
        title: 'Repair & Technical',
        items: [
            { q: 'faq_services_q', a: 'faq_services_a' },
            { q: 'faq_device_types_q', a: 'faq_device_types_a' },
            { q: 'faq_motherboard_q', a: 'faq_motherboard_a' },
            { q: 'faq_screen_price_q', a: 'faq_screen_price_a' },
            { q: 'faq_q2', a: 'faq_a2' }, // Repair time
        ]
    },
    {
        id: 'orders',
        title: 'Orders & Delivery',
        items: [
            { q: 'faq_delivery_q', a: 'faq_delivery_a' },
            { q: 'faq_tracking_q', a: 'faq_tracking_a' },
            { q: 'faq_returns_q', a: 'faq_returns_a' },
        ]
    },
    {
        id: 'buyback_warranty',
        title: 'Buyback & Warranty',
        items: [
            { q: 'faq_home_q5', a: 'faq_home_a5' }, // Payment methods
            { q: 'faq_warranty_policy_q', a: 'faq_warranty_policy_a' },
            { q: 'faq_geo_q3', a: 'faq_geo_a3' }, // Selling broken phones
        ]
    }
];

// --- DEVICE CATALOG DATA ---
// Catalog structure: Category -> Brand -> Model -> Base Price
export const DEVICE_CATALOG: Record<string, Record<string, Record<string, number>>> = {
    smartphone: {
        Apple: { 
            'iPhone 17 Pro Max': 1150, 'iPhone 17 Pro': 1050, 'iPhone 17 Plus': 900, 'iPhone 17': 850,
            'iPhone 16 Pro Max': 1050, 'iPhone 16 Pro': 950, 'iPhone 16 Plus': 800, 'iPhone 16': 750, 'iPhone 16E': 600,
            'iPhone 15 Pro Max': 950, 'iPhone 15 Pro': 850, 'iPhone 15 Plus': 700, 'iPhone 15': 650,
            'iPhone 14 Pro Max': 750, 'iPhone 14 Pro': 680, 'iPhone 14 Plus': 550, 'iPhone 14': 500,
            'iPhone 13 Pro Max': 580, 'iPhone 13 Pro': 500, 'iPhone 13': 400, 'iPhone 13 mini': 350,
            'iPhone 12 Pro Max': 380, 'iPhone 12 Pro': 330, 'iPhone 12': 280, 'iPhone 12 mini': 230,
            'iPhone 11 Pro Max': 280, 'iPhone 11 Pro': 240, 'iPhone 11': 200,
            'iPhone XS Max': 200, 'iPhone XS': 170, 'iPhone XR': 150, 'iPhone X': 140,
            'iPhone SE (3rd Gen)': 200, 'iPhone SE (2020)': 150
        },
        Samsung: { 
            // S Series
            'Galaxy S25 Ultra': 1100, 'Galaxy S25+': 950, 'Galaxy S25': 850, 'Galaxy S25 FE': 700,
            'Galaxy S24 Ultra': 900, 'Galaxy S24+': 750, 'Galaxy S24': 650, 'Galaxy S24 FE': 550,
            'Galaxy S23 Ultra': 700, 'Galaxy S23+': 600, 'Galaxy S23': 480, 'Galaxy S23 FE': 400,
            'Galaxy S22 Ultra': 550, 'Galaxy S22+': 450, 'Galaxy S22': 380,
            'Galaxy S21 Ultra': 400, 'Galaxy S21+': 320, 'Galaxy S21': 280, 'Galaxy S21 FE': 250,
            'Galaxy S20 Ultra': 300, 'Galaxy S20+': 250, 'Galaxy S20': 220, 'Galaxy S20 FE': 200,
            'Galaxy S9': 120, 'Galaxy S9+': 140, 'Galaxy S8': 100, 'Galaxy S8+': 120, 'Galaxy S7 Edge': 80, 'Galaxy S7': 70,

            // Z Series (Fold & Flip)
            'Galaxy Z Fold7': 1300, 'Galaxy Z Flip7': 900,
            'Galaxy Z Fold6': 1100, 'Galaxy Z Flip6': 750,
            'Galaxy Z Fold5': 850, 'Galaxy Z Flip5': 550,
            'Galaxy Z Fold4': 600, 'Galaxy Z Flip4': 400,
            'Galaxy Z Fold3': 450, 'Galaxy Z Flip3': 300,
            'Galaxy Z Flip 5G': 250, 'Galaxy Z Fold2': 350,

            // Note Series
            'Galaxy Note 20 Ultra': 350, 'Galaxy Note 20': 280,
            'Galaxy Note 10+': 250, 'Galaxy Note 10': 200, 'Galaxy Note 10 Lite': 180,
            'Galaxy Note 9': 150, 'Galaxy Note 8': 120,

            // A Series (Expanded for Legacy SEO)
            'Galaxy A56': 320, 'Galaxy A55': 280, 'Galaxy A54': 220, 'Galaxy A53': 180, 'Galaxy A52': 150, 'Galaxy A51': 120, 'Galaxy A50': 100,
            'Galaxy A72': 180, 'Galaxy A71': 150, 'Galaxy A70': 130,
            'Galaxy A36': 240, 'Galaxy A35': 200, 'Galaxy A34': 160, 'Galaxy A32': 130, 'Galaxy A31': 110, 'Galaxy A30': 100,
            'Galaxy A26': 180, 'Galaxy A25': 150, 'Galaxy A24': 120, 'Galaxy A23': 110, 'Galaxy A22': 100, 'Galaxy A21s': 90, 'Galaxy A20e': 80,
            'Galaxy A17': 130, 'Galaxy A16': 110, 'Galaxy A15': 90, 'Galaxy A14': 70, 'Galaxy A13': 60, 'Galaxy A12': 50, 'Galaxy A10': 40,
            'Galaxy A04s': 50, 'Galaxy A03s': 40, 'Galaxy A02s': 35,
        },
        Google: { 
            'Pixel 10 Pro XL': 1100, 'Pixel 10 Pro': 1000, 'Pixel 10': 850,
            'Pixel 9 Pro Fold': 1400,
            'Pixel 9 Pro XL': 950, 'Pixel 9 Pro': 900, 'Pixel 9': 750,
            'Pixel Fold': 800,
            'Pixel 8 Pro': 600, 'Pixel 8': 450, 'Pixel 8a': 350,
            'Pixel 7 Pro': 350, 'Pixel 7': 300, 'Pixel 7a': 250,
            'Pixel 6 Pro': 250, 'Pixel 6': 200, 'Pixel 6a': 150
        },
        Huawei: {
            'P40 Pro': 200, 'P40 Lite': 120, 'P30 Pro': 150, 'P30': 120, 'P30 Lite': 80,
            'P20 Pro': 100, 'P20': 80, 'Mate 20 Pro': 120, 'Mate 20 Lite': 70
        },
        OnePlus: { 
            'OnePlus 15': 950, 'OnePlus 14': 850, 'OnePlus 13': 750,
            'OnePlus 12': 650, 'OnePlus 12R': 450,
            'OnePlus 11': 450, 'OnePlus 11R': 350,
            'OnePlus 10 Pro': 350, 'OnePlus 10T': 300, 'OnePlus 10R': 280,
            'OnePlus 9 Pro': 280, 'OnePlus 9': 230, 'OnePlus 9RT': 220,
            'OnePlus 8 Pro': 200, 'OnePlus 8T': 180, 'OnePlus 8': 160,
            'OnePlus Open': 1000,
            // Nord Series
            'OnePlus Nord 4': 300, 'OnePlus Nord 3': 250, 'OnePlus Nord 2T': 200, 'OnePlus Nord 2': 180,
            'OnePlus Nord CE 4': 250, 'OnePlus Nord CE 3': 200,
            'OnePlus Nord CE 4 Lite': 200, 'OnePlus Nord CE 3 Lite': 150
        },
        Xiaomi: {
            // Xiaomi Number Series
            'Xiaomi 14 Ultra': 850, 'Xiaomi 14': 650,
            'Xiaomi 13 Ultra': 600, 'Xiaomi 13 Pro': 450, 'Xiaomi 13': 380, 'Xiaomi 13 Lite': 200,
            'Xiaomi 13T Pro': 400, 'Xiaomi 13T': 300,
            'Xiaomi 12 Pro': 280, 'Xiaomi 12': 220, 'Xiaomi 12T Pro': 250, 'Xiaomi 12T': 200,
            'Xiaomi 11T Pro': 180, 'Xiaomi 11T': 150, 'Mi 11 Ultra': 250, 'Mi 11': 180, 'Mi 11 Lite': 120,

            // Redmi Note Series
            'Redmi Note 13 Pro+': 250, 'Redmi Note 13 Pro': 200, 'Redmi Note 13': 150,
            'Redmi Note 12 Pro+': 180, 'Redmi Note 12 Pro': 140, 'Redmi Note 12': 100,
            'Redmi Note 11 Pro': 110, 'Redmi Note 11': 80,
            
            // Redmi Series
            'Redmi 13C': 80, 'Redmi 12': 70, 'Redmi 10': 50, 'Redmi 9': 40,

            // POCO Series
            'POCO F6 Pro': 350, 'POCO F6': 280,
            'POCO X6 Pro': 220, 'POCO X6': 180,
            'POCO F5 Pro': 220, 'POCO F5': 180,
            'POCO X5 Pro': 140, 'POCO X5': 120
        },
        Oppo: {
            // Find X Series
            'Find X7 Ultra': 900, 'Find X7': 750,
            'Find X6 Pro': 600, 'Find X6': 450,
            'Find X5 Pro': 350, 'Find X5': 280,
            // Foldables
            'Find N3': 1000, 'Find N3 Flip': 650,
            'Find N2': 700, 'Find N2 Flip': 450,
            // Reno Series
            'Reno 12 Pro': 450, 'Reno 12': 350,
            'Reno 11 Pro': 350, 'Reno 11': 280,
            'Reno 10 Pro+': 320, 'Reno 10 Pro': 260, 'Reno 10': 200,
            // A Series
            'Oppo A98 5G': 200, 'Oppo A79 5G': 150, 'Oppo A78': 130
        }
    },
    tablet: {
        Apple: { 
            'iPad Pro 12.9 M2': 800, 'iPad Pro 12.9 (2022)': 750, 'iPad Pro 12.9 (2021)': 650, 'iPad Pro 12.9 (2020)': 550, 'iPad Pro 12.9 (2018)': 450,
            'iPad Pro 11 (2022)': 600, 'iPad Pro 11 (2021)': 500, 'iPad Pro 11 (2020)': 400, 'iPad Pro 11 (2018)': 350,
            'iPad Air 5': 450, 'iPad Air 4': 350, 'iPad Air 3': 250,
            'iPad mini 6': 350, 'iPad mini 5': 250, 'iPad mini 4': 180,
            'iPad (10th Gen)': 300, 'iPad 9': 220, 'iPad 8': 180 
        },
        Samsung: { 
            'Galaxy Tab S9 Ultra': 800, 'Galaxy Tab S9': 600, 
            'Galaxy Tab S8 Ultra': 550, 'Galaxy Tab S8+': 450, 'Galaxy Tab S8': 400,
            'Galaxy Tab S7+': 350, 'Galaxy Tab S7 FE': 250, 'Galaxy Tab S7': 280,
            'Galaxy Tab S6 Lite': 150, 'Galaxy Tab S6': 180,
            'Galaxy Tab A8': 120, 'Galaxy Tab A7': 100
        },
        Microsoft: { 'Surface Pro 9': 700, 'Surface Go 3': 300 },
        Lenovo: { 'Tab P11 Pro': 250, 'Yoga Tab 13': 350 }
    },
    laptop: {
        Apple: { 
            'MacBook Pro 16 M2': 1800, 'MacBook Pro 14 M2': 1500, 
            'MacBook Pro 16 (M2 Pro/Max)': 1600, 'MacBook Pro 14 (M2 Pro/Max)': 1400,
            'MacBook Pro 13 M2': 1000, 'MacBook Air M2': 900, 'MacBook Air M1': 600,
            'MacBook Air 13 (2018-2020)': 400, 'MacBook Air 13 (2010-2017)': 250
        },
        Samsung: { 'Galaxy Book3 Pro': 1000, 'Galaxy Book3': 700 },
        HP: { 'Spectre x360': 850, 'Envy 13': 600 },
        Dell: { 'XPS 13': 900, 'Inspiron 15': 400 },
        Lenovo: { 'ThinkPad X1 Carbon': 1000, 'IdeaPad 5': 450 }
    },
    smartwatch: {
        Apple: { 
            'Apple Watch Ultra 2': 600, 'Apple Watch Ultra': 500, 
            'Apple Watch Series 9': 350, 'Apple Watch Series 8': 280, 'Apple Watch Series 7': 220,
            'Apple Watch SE 2': 180, 'Apple Watch SE': 140
        },
        Samsung: { 
            'Galaxy Watch 6 Classic': 250, 'Galaxy Watch 6': 180, 
            'Galaxy Watch 5 Pro': 150, 'Galaxy Watch 5': 120, 
            'Galaxy Watch 4 Classic': 100
        }
    },
    console: {
        Sony: { 'PlayStation 5 (Disc)': 350, 'PlayStation 5 (Digital)': 300, 'PlayStation 4 Pro': 120, 'PlayStation 4 Slim': 100, 'PlayStation 3 Slim': 60 },
        Xbox: { 'Xbox Series X': 350, 'Xbox Series S': 180, 'Xbox One': 80, 'Xbox 360': 40 },
        Nintendo: { 'Switch OLED': 200, 'Switch V2': 160, 'Switch Lite': 100, '3DS XL': 80 }
    }
};

// VALID STORAGE CONFIGURATIONS PER MODEL
export const DEVICE_SPECS: Record<string, string[]> = {
    // Apple Recent
    'iPhone 17 Pro Max': ['256GB', '512GB', '1TB'],
    'iPhone 17 Pro': ['128GB', '256GB', '512GB', '1TB'],
    'iPhone 17 Plus': ['128GB', '256GB', '512GB'],
    'iPhone 17': ['128GB', '256GB', '512GB'],
    
    'iPhone 16 Pro Max': ['256GB', '512GB', '1TB'],
    'iPhone 16 Pro': ['128GB', '256GB', '512GB', '1TB'],
    'iPhone 16 Plus': ['128GB', '256GB', '512GB'],
    'iPhone 16': ['128GB', '256GB', '512GB'],
    'iPhone 16E': ['128GB', '256GB'],

    'iPhone 15 Pro Max': ['256GB', '512GB', '1TB'],
    'iPhone 15 Pro': ['128GB', '256GB', '512GB', '1TB'],
    'iPhone 15 Plus': ['128GB', '256GB', '512GB'],
    'iPhone 15': ['128GB', '256GB', '512GB'],
    'iPhone 14 Pro Max': ['128GB', '256GB', '512GB', '1TB'],
    'iPhone 14 Pro': ['128GB', '256GB', '512GB', '1TB'],
    'iPhone 14 Plus': ['128GB', '256GB', '512GB'],
    'iPhone 14': ['128GB', '256GB', '512GB'],
    'iPhone 13 Pro Max': ['128GB', '256GB', '512GB', '1TB'],
    'iPhone 13 Pro': ['128GB', '256GB', '512GB', '1TB'],
    'iPhone 13': ['128GB', '256GB', '512GB'],
    'iPhone 13 mini': ['128GB', '256GB', '512GB'],
    'iPhone 12 Pro Max': ['128GB', '256GB', '512GB'],
    'iPhone 12 Pro': ['128GB', '256GB', '512GB'],
    'iPhone 12': ['64GB', '128GB', '256GB'],
    'iPhone 12 mini': ['64GB', '128GB', '256GB'],
    'iPhone 11 Pro Max': ['64GB', '256GB', '512GB'],
    'iPhone 11 Pro': ['64GB', '256GB', '512GB'],
    'iPhone 11': ['64GB', '128GB', '256GB'],
    'iPhone XS Max': ['64GB', '256GB', '512GB'],
    'iPhone XS': ['64GB', '256GB', '512GB'],
    'iPhone XR': ['64GB', '128GB', '256GB'],
    'iPhone X': ['64GB', '256GB'],
    'iPhone SE (3rd Gen)': ['64GB', '128GB', '256GB'],

    // Samsung S Series
    'Galaxy S25 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S25+': ['256GB', '512GB'], 'Galaxy S25': ['128GB', '256GB', '512GB'], 'Galaxy S25 FE': ['128GB', '256GB'],
    'Galaxy S24 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S24+': ['256GB', '512GB'], 'Galaxy S24': ['128GB', '256GB'], 'Galaxy S24 FE': ['128GB', '256GB'],
    'Galaxy S23 Ultra': ['256GB', '512GB', '1TB'], 'Galaxy S23+': ['256GB', '512GB'], 'Galaxy S23': ['128GB', '256GB'], 'Galaxy S23 FE': ['128GB', '256GB'],
    'Galaxy S22 Ultra': ['128GB', '256GB', '512GB', '1TB'], 'Galaxy S22+': ['128GB', '256GB'], 'Galaxy S22': ['128GB', '256GB'],
    'Galaxy S21 Ultra': ['128GB', '256GB', '512GB'], 'Galaxy S21+': ['128GB', '256GB'], 'Galaxy S21': ['128GB', '256GB'], 'Galaxy S21 FE': ['128GB', '256GB'],
    'Galaxy S20 Ultra': ['128GB', '512GB'], 'Galaxy S20+': ['128GB', '512GB'], 'Galaxy S20': ['128GB'], 'Galaxy S20 FE': ['128GB', '256GB'],

    // Samsung Z Series
    'Galaxy Z Fold7': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip7': ['256GB', '512GB'],
    'Galaxy Z Fold6': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip6': ['256GB', '512GB'],
    'Galaxy Z Fold5': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip5': ['256GB', '512GB'],
    'Galaxy Z Fold4': ['256GB', '512GB', '1TB'], 'Galaxy Z Flip4': ['128GB', '256GB', '512GB'],
    'Galaxy Z Fold3': ['256GB', '512GB'], 'Galaxy Z Flip3': ['128GB', '256GB'],

    // Samsung Note Series
    'Galaxy Note 20 Ultra': ['256GB', '512GB'], 'Galaxy Note 20': ['256GB'],
    'Galaxy Note 10+': ['256GB', '512GB'], 'Galaxy Note 10': ['256GB'], 'Galaxy Note 10 Lite': ['128GB'],

    // Samsung A Series
    'Galaxy A56': ['128GB', '256GB'], 'Galaxy A55': ['128GB', '256GB'], 'Galaxy A54': ['128GB', '256GB'], 'Galaxy A53': ['128GB', '256GB'],
    'Galaxy A36': ['128GB', '256GB'], 'Galaxy A35': ['128GB', '256GB'], 'Galaxy A34': ['128GB', '256GB'],
    'Galaxy A26': ['128GB', '256GB'], 'Galaxy A25': ['128GB', '256GB'], 'Galaxy A24': ['128GB'],
    'Galaxy A17': ['64GB', '128GB'], 'Galaxy A16': ['128GB', '256GB'], 'Galaxy A15': ['128GB', '256GB'], 'Galaxy A14': ['64GB', '128GB'],
    'Galaxy A07': ['64GB', '128GB'], 'Galaxy A06': ['64GB', '128GB'], 'Galaxy A05': ['64GB', '128GB'],

    // Google Pixel
    'Pixel 10 Pro XL': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 10 Pro': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 10': ['128GB', '256GB'],
    'Pixel 9 Pro Fold': ['256GB', '512GB'],
    'Pixel 9 Pro XL': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 9 Pro': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 9': ['128GB', '256GB'],
    'Pixel Fold': ['256GB', '512GB'],
    'Pixel 8 Pro': ['128GB', '256GB', '512GB', '1TB'], 'Pixel 8': ['128GB', '256GB'], 'Pixel 8a': ['128GB', '256GB'],
    'Pixel 7 Pro': ['128GB', '256GB', '512GB'], 'Pixel 7': ['128GB', '256GB'], 'Pixel 7a': ['128GB'],
    'Pixel 6 Pro': ['128GB', '256GB', '512GB'], 'Pixel 6': ['128GB', '256GB'], 'Pixel 6a': ['128GB'],
    
    // OnePlus
    'OnePlus 15': ['256GB', '512GB', '1TB'],
    'OnePlus 14': ['256GB', '512GB', '1TB'],
    'OnePlus 13': ['256GB', '512GB', '1TB'],
    'OnePlus 12': ['256GB', '512GB', '1TB'], 'OnePlus 12R': ['128GB', '256GB'],
    'OnePlus 11': ['128GB', '256GB'], 'OnePlus 11R': ['128GB', '256GB'],
    'OnePlus 10 Pro': ['128GB', '256GB', '512GB'], 'OnePlus 10T': ['128GB', '256GB'], 'OnePlus 10R': ['128GB', '256GB'],
    'OnePlus 9 Pro': ['128GB', '256GB'], 'OnePlus 9': ['128GB', '256GB'], 'OnePlus 9RT': ['128GB', '256GB'],
    'OnePlus 8 Pro': ['128GB', '256GB'], 'OnePlus 8T': ['128GB', '256GB'], 'OnePlus 8': ['128GB', '256GB'],
    'OnePlus Open': ['512GB', '1TB'],
    'OnePlus Nord 4': ['128GB', '256GB', '512GB'], 'OnePlus Nord 3': ['128GB', '256GB'], 
    'OnePlus Nord 2T': ['128GB', '256GB'], 'OnePlus Nord 2': ['128GB', '256GB'],
    'OnePlus Nord CE 4': ['128GB', '256GB'], 'OnePlus Nord CE 3': ['128GB', '256GB'],
    'OnePlus Nord CE 4 Lite': ['128GB', '256GB'], 'OnePlus Nord CE 3 Lite': ['128GB', '256GB'],
    
    // Xiaomi Number Series
    'Xiaomi 14 Ultra': ['256GB', '512GB', '1TB'], 'Xiaomi 14': ['256GB', '512GB', '1TB'],
    'Xiaomi 13 Ultra': ['256GB', '512GB', '1TB'], 'Xiaomi 13 Pro': ['128GB', '256GB', '512GB'], 'Xiaomi 13': ['128GB', '256GB', '512GB'],
    'Xiaomi 13T Pro': ['256GB', '512GB', '1TB'], 'Xiaomi 13T': ['256GB'],
    'Xiaomi 12 Pro': ['128GB', '256GB'], 'Xiaomi 12': ['128GB', '256GB'], 
    'Xiaomi 12T Pro': ['128GB', '256GB'], 'Xiaomi 12T': ['128GB', '256GB'],
    'Xiaomi 11T Pro': ['128GB', '256GB'], 'Xiaomi 11T': ['128GB', '256GB'],
    'Mi 11 Ultra': ['256GB', '512GB'], 'Mi 11': ['128GB', '256GB'],

    // Redmi Note Series
    'Redmi Note 13 Pro+': ['256GB', '512GB'], 'Redmi Note 13 Pro': ['128GB', '256GB', '512GB'], 'Redmi Note 13': ['128GB', '256GB'],
    'Redmi Note 12 Pro+': ['256GB'], 'Redmi Note 12 Pro': ['128GB', '256GB'], 'Redmi Note 12': ['64GB', '128GB'],
    'Redmi Note 11 Pro': ['64GB', '128GB'], 'Redmi Note 11': ['64GB', '128GB'],
    
    // Redmi Series
    'Redmi 13C': ['128GB', '256GB'], 'Redmi 12': ['128GB', '256GB'], 'Redmi 10': ['64GB', '128GB'],

    // POCO Series
    'POCO F6 Pro': ['256GB', '512GB', '1TB'], 'POCO F6': ['256GB', '512GB'],
    'POCO X6 Pro': ['256GB', '512GB'], 'POCO X6': ['256GB', '512GB'],
    'POCO F5 Pro': ['256GB', '512GB'], 'POCO F5': ['256GB'],
    'POCO X5 Pro': ['128GB', '256GB'],
    
    // Oppo
    'Find X7 Ultra': ['256GB', '512GB'], 'Find X7': ['256GB', '512GB'],
    'Find X6 Pro': ['256GB', '512GB'], 'Find X6': ['256GB', '512GB'],
    'Find X5 Pro': ['256GB', '512GB'], 'Find X5': ['256GB'],
    'Find N3': ['512GB', '1TB'], 'Find N3 Flip': ['256GB', '512GB'],
    'Find N2': ['256GB', '512GB'], 'Find N2 Flip': ['256GB', '512GB'],
    'Reno 12 Pro': ['256GB', '512GB'], 'Reno 12': ['256GB', '512GB'],
    'Reno 11 Pro': ['256GB', '512GB'], 'Reno 11': ['128GB', '256GB'],
    'Reno 10 Pro+': ['256GB', '512GB'], 'Reno 10 Pro': ['256GB'], 'Reno 10': ['128GB', '256GB'],
    'Oppo A98 5G': ['256GB'], 'Oppo A79 5G': ['128GB'], 'Oppo A78': ['128GB'],
    
    // Tablets
    'iPad Pro 12.9 M2': ['128GB', '256GB', '512GB', '1TB', '2TB'],
    'iPad Air 5': ['64GB', '256GB'],
    'iPad mini 6': ['64GB', '256GB'],
    'iPad (10th Gen)': ['64GB', '256GB'],
    'Galaxy Tab S9 Ultra': ['256GB', '512GB', '1TB'],
    'Galaxy Tab S9': ['128GB', '256GB'],
    'Surface Pro 9': ['128GB', '256GB', '512GB', '1TB'],

    // Laptops (Simplified)
    'MacBook Pro 16 M2': ['512GB', '1TB', '2TB', '4TB', '8TB'],
    'MacBook Pro 14 M2': ['512GB', '1TB', '2TB'],
    'MacBook Air M2': ['256GB', '512GB', '1TB', '2TB'],
    'MacBook Air M1': ['256GB', '512GB', '1TB', '2TB'],
    'Galaxy Book3 Pro': ['512GB', '1TB'],
    'XPS 13': ['512GB', '1TB'],

    // Smartwatches
    'Apple Watch Ultra 2': ['49mm'],
    'Apple Watch Series 9': ['41mm', '45mm'],
    'Apple Watch SE 2': ['40mm', '44mm'],
    'Galaxy Watch 6': ['40mm', '44mm'],
    
    // Consoles
    'PlayStation 5 (Disc)': ['825GB', '1TB'],
    'PlayStation 5 (Digital)': ['825GB', '1TB'],
    'Xbox Series X': ['1TB'],
    'Xbox Series S': ['512GB', '1TB'],
    'Switch OLED': ['64GB']
};

export const DEVICE_TYPES = [
    { id: 'smartphone', label: 'Smartphone', icon: DevicePhoneMobileIcon, applicableIssues: ['screen', 'battery', 'charging', 'camera', 'audio', 'water', 'other'] },
    { id: 'tablet', label: 'Tablet', icon: DeviceTabletIcon, applicableIssues: ['screen', 'battery', 'charging', 'water', 'other'] },
    { id: 'laptop', label: 'Laptop', icon: ComputerDesktopIcon, applicableIssues: ['screen', 'battery', 'charging', 'water', 'other'] },
    { id: 'console', label: 'Gaming Console', icon: TvIcon, applicableIssues: ['hdmi', 'disk', 'power', 'other'] },
    { id: 'smartwatch', label: 'Smartwatch', icon: ClockIcon, applicableIssues: ['screen', 'battery', 'other'] },
];

export const REPAIR_ISSUES = [
    { id: 'screen', label: 'Screen / Glass', icon: DevicePhoneMobileIcon, desc: 'Cracked or unresponsive', base: 80 },
    { id: 'battery', label: 'Battery Issue', icon: Battery50Icon, desc: 'Drains fast / won\'t charge', base: 50 },
    { id: 'charging', label: 'Charging Port', icon: BoltIcon, desc: 'Cable loose or not working', base: 60 },
    { id: 'audio', label: 'Audio / Sound', icon: SpeakerWaveIcon, desc: 'Speaker, mic, or volume', base: 55 },
    { id: 'camera', label: 'Camera', icon: CameraIcon, desc: 'Blurry, spots, or broken lens', base: 70 },
    { id: 'water', label: 'Water Damage', icon: NoSymbolIcon, desc: 'Device got wet', base: 40 },
    { id: 'hdmi', label: 'HDMI Port', icon: TvIcon, desc: 'No signal or broken port', base: 70 },
    { id: 'disk', label: 'Disk Drive', icon: DocumentTextIcon, desc: 'Games not reading or ejecting', base: 60 },
    { id: 'power', label: 'Power Issue', icon: BoltIcon, desc: 'Doesn\'t turn on or shuts down', base: 50 },
    { id: 'other', label: 'Other / Unknown', icon: WrenchScrewdriverIcon, desc: 'Diagnostic required', base: 30 },
];
