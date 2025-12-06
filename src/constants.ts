
import { Shop, Product, Service, Reservation, Quote, NavLink, AdminStat, ChartData, FranchiseApplication, BlogPost, Review, FAQCategory, RepairPricing } from './types';
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
    SparklesIcon,
    CpuChipIcon,
    CircleStackIcon,
    CursorArrowRaysIcon,
    QuestionMarkCircleIcon,
    NewspaperIcon,
    CloudIcon
} from '@heroicons/react/24/outline';

export const MOCK_SHOPS: Shop[] = [
    {
        id: 'schaerbeek',
        name: 'Belmobile Liedts',
        address: 'Rue Gallait 4, 1030 Schaerbeek',
        phone: '0484/83.75.60',
        email: 'schaerbeek@belmobile.be',
        openingHours: ['Tue-Sat: 10:30 - 19:00', 'Fri: 10:30-12:30 & 14:30-19:00', 'Mon, Sun: Closed'],
        slugs: { fr: 'schaerbeek', nl: 'schaarbeek', en: 'schaerbeek' },
        coords: { lat: 50.867210, lng: 4.369310 },
        status: 'open',
        googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Belmobile+Liedts+Rue+Gallait+4+1030+Schaerbeek'
    },
    {
        id: 'anderlecht',
        name: 'Belmobile Bara',
        address: 'Rue Lambert Crickx 12, 1070 Anderlecht',
        phone: '02/275.98.67',
        email: 'anderlecht@belmobile.be',
        openingHours: ['Mon-Sat: 10:30 - 19:00', 'Fri: 10:30-12:30 & 14:30-19:00', 'Sun: Closed'],
        slugs: { fr: 'anderlecht', nl: 'anderlecht', en: 'anderlecht' },
        coords: { lat: 50.840820, lng: 4.337250 },
        status: 'open',
        googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Belmobile+Bara+Rue+Lambert+Crickx+12+1070+Anderlecht'
    },
    {
        id: 'molenbeek',
        name: 'Belmobile Tour & Taxis',
        address: 'Rue Ulens 88, 1080 Molenbeek-Saint-Jean',
        phone: '02/306.76.56',
        email: 'molenbeek@belmobile.be',
        openingHours: ['Mon-Sat: 10:30 - 19:00', 'Fri: 10:30-12:30 & 14:30-19:00', 'Sun: Closed'],
        slugs: { fr: 'molenbeek', nl: 'molenbeek', en: 'molenbeek' },
        coords: { lat: 50.865650, lng: 4.331420 },
        status: 'open',
        googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Belmobile+Tour+Taxis+Rue+Ulens+88+1080+Molenbeek'
    },
    {
        id: 4,
        name: 'Belmobile Antwerpen',
        address: 'Antwerpen Region',
        phone: 'Coming Soon',
        email: 'antwerpen@belmobile.be',
        openingHours: ['Coming Soon'],
        slugs: { fr: 'antwerpen', nl: 'antwerpen', en: 'antwerp' },
        coords: { lat: 51.2194, lng: 4.4025 },
        status: 'coming_soon',
        googleMapUrl: ''
    },
    {
        id: 5,
        name: 'Belmobile Gent',
        address: 'Gent Region',
        phone: 'Coming Soon',
        email: 'gent@belmobile.be',
        openingHours: ['Coming Soon'],
        slugs: { fr: 'gand', nl: 'gent', en: 'ghent' },
        coords: { lat: 51.0543, lng: 3.7174 },
        status: 'coming_soon',
        googleMapUrl: ''
    },
    {
        id: 6,
        name: 'Belmobile Hasselt',
        address: 'Hasselt Region',
        phone: 'Coming Soon',
        email: 'hasselt@belmobile.be',
        openingHours: ['Coming Soon'],
        slugs: { fr: 'hasselt', nl: 'hasselt', en: 'hasselt' },
        coords: { lat: 50.9307, lng: 5.3325 },
        status: 'coming_soon',
        googleMapUrl: ''
    }
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "iPhone 13",
        price: 599,
        description: "A15 Bionic chip, advanced dual-camera system.",
        imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop",
        category: "smartphone",
        brand: "Apple",
        condition: 'perfect',
        capacity: '128GB',
        color: 'Blue',
        slug: 'apple-iphone-13-128gb-blue-perfect',
        availability: { 1: 5, 2: 2, 3: 0 }
    },
    {
        id: 2,
        name: "iPhone 13",
        price: 649,
        description: "A15 Bionic chip, advanced dual-camera system.",
        imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop",
        category: "smartphone",
        brand: "Apple",
        condition: 'very_good',
        capacity: '256GB',
        color: 'Midnight',
        slug: 'apple-iphone-13-256gb-midnight-very-good',
        availability: { 1: 2, 2: 0, 3: 1 }
    },
    {
        id: 3,
        name: "iPhone 15 Pro Max",
        price: 1299,
        description: "Titanium design, A17 Pro chip.",
        imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop",
        category: "smartphone",
        brand: "Apple",
        condition: 'perfect',
        capacity: '256GB',
        color: 'Natural Titanium',
        slug: 'apple-iphone-15-pro-max-256gb-natural-titanium-perfect',
        availability: { 1: 10, 2: 5, 3: 8 }
    },
    {
        id: 4,
        name: "Samsung Galaxy S23 Ultra",
        price: 1199,
        description: "200MP camera, embedded S Pen.",
        imageUrl: "https://images.unsplash.com/photo-1675802525546-2092c422c958?q=80&w=800&auto=format&fit=crop",
        category: "smartphone",
        brand: "Samsung",
        condition: 'good',
        capacity: '512GB',
        color: 'Phantom Black',
        slug: 'samsung-galaxy-s23-ultra-512gb-phantom-black-good',
        availability: { 1: 3, 2: 3, 3: 3 }
    },
    {
        id: 5,
        name: "PlayStation 5",
        price: 450,
        description: "Next-gen gaming console.",
        imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800&auto=format&fit=crop",
        category: "console",
        brand: "Sony",
        condition: 'perfect',
        capacity: '825GB',
        color: 'White',
        slug: 'sony-playstation-5-825gb-white-perfect',
        availability: { 1: 2, 2: 1, 3: 0 }
    },
    {
        id: 6,
        name: "MacBook Air M2",
        price: 950,
        description: "Supercharged by M2.",
        imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop",
        category: "computer",
        brand: "Apple",
        condition: 'very_good',
        capacity: '256GB',
        color: 'Midnight',
        slug: 'apple-macbook-air-m2-256gb-midnight-very-good',
        availability: { 1: 1, 2: 0, 3: 1 }
    },
    {
        id: 7,
        name: "Apple Watch Series 9",
        price: 350,
        description: "Smarter, brighter, and mightier.",
        imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop",
        category: "smartwatch",
        brand: "Apple",
        condition: 'perfect',
        capacity: '45mm',
        color: 'Midnight',
        slug: 'apple-watch-series-9-45mm-midnight-perfect',
        availability: { 1: 4, 2: 4, 3: 4 }
    },
    {
        id: 8,
        name: "USB-C Fast Charger",
        price: 25,
        description: "20W USB-C Power Adapter.",
        imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop",
        category: "accessories",
        brand: "Belmobile",
        condition: 'perfect',
        color: 'White',
        slug: 'belmobile-usb-c-fast-charger-white-perfect',
        availability: { 1: 20, 2: 15, 3: 10 }
    }
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



export const MOCK_REVIEWS: Review[] = [
    { id: 1, customerName: 'Thomas D.', rating: 5, comment: 'Super fast service! Replaced my iPhone screen in under an hour at Liedts.', date: '2024-07-20', platform: 'Google' },
    { id: 2, customerName: 'Sophie M.', rating: 5, comment: 'Got a great price for my old Samsung. The transfer was instant. Highly recommend.', date: '2024-07-18', platform: 'Website' },
    { id: 3, customerName: 'Jonas V.', rating: 4, comment: 'Very professional team. A bit busy on Saturday but worth the wait for the quality.', date: '2024-07-15', platform: 'Google' },
    { id: 4, customerName: 'Elise B.', rating: 5, comment: 'Bought a refurbished iPad here, looks brand new! Saved me €200.', date: '2024-07-12', platform: 'Website' }
];

export const MOCK_FAQ_CATEGORIES: FAQCategory[] = [
    {
        id: 'general',
        title: 'General Questions',
        items: [
            { q: 'faq_q1', a: 'faq_a1' }, // Using translation keys

        ]
    },
    {
        id: 'repair',
        title: 'Repairs',
        items: [
            { q: 'faq_q2', a: 'faq_a2' },
            { q: 'faq_q3', a: 'faq_a3' },
            { q: 'faq_q5', a: 'faq_a5' }
        ]
    },
    {
        id: 'buyback',
        title: 'Buyback & Sales',
        items: [
            { q: 'faq_q6', a: 'faq_a6' },
            { q: 'faq_q7', a: 'faq_a7' }
        ]
    }
];

// --- DEVICE CATALOG DATA ---
// NOTE: Data has been moved to src/data/ for performance optimization (lazy loading).
// See src/data/brands.ts and src/data/models/*.ts


export const DEVICE_TYPES = [
    { id: 'smartphone', label: 'Smartphone', icon: DevicePhoneMobileIcon },
    { id: 'tablet', label: 'Tablet', icon: DeviceTabletIcon },
    { id: 'laptop', label: 'Laptop', icon: ComputerDesktopIcon },
    { id: 'console', label: 'Gaming Console', icon: TvIcon },
    { id: 'smartwatch', label: 'Smartwatch', icon: ClockIcon },
];

export const REPAIR_ISSUES = [
    { id: 'screen', label: 'Screen / Glass', icon: DevicePhoneMobileIcon, desc: 'Cracked or unresponsive', base: 80, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch'] },
    { id: 'battery', label: 'Battery Issue', icon: Battery50Icon, desc: 'Drains fast / won\'t charge', base: 50, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch'] },
    { id: 'charging', label: 'Charging Port', icon: BoltIcon, desc: 'Cable loose or not working', base: 60, devices: ['smartphone', 'tablet', 'laptop'] },
    { id: 'hdmi', label: 'HDMI / Video Port', icon: TvIcon, desc: 'No signal to TV/Monitor', base: 70, devices: ['console', 'laptop'] },
    { id: 'disc', label: 'Disc Drive Issue', icon: CircleStackIcon, desc: 'Not reading discs / jammed', base: 80, devices: ['console'] },
    { id: 'card_reader', label: 'Game Card Slot', icon: CpuChipIcon, desc: 'Not reading game cards', base: 60, devices: ['console', 'tablet'] },
    { id: 'cleaning', label: 'Cleaning + Thermal Paste', icon: SparklesIcon, desc: 'Overheating / Loud fan', base: 60, devices: ['console'] },
    { id: 'joystick', label: 'Joystick Repair', icon: CursorArrowRaysIcon, desc: 'Drift or buttons not working', base: 25, devices: ['console'] },
    { id: 'audio', label: 'Audio / Sound', icon: SpeakerWaveIcon, desc: 'Speaker, mic, or volume', base: 55, devices: ['smartphone', 'tablet', 'laptop'] },
    { id: 'camera', label: 'Camera', icon: CameraIcon, desc: 'Blurry, spots, or broken lens', base: 70, devices: ['smartphone', 'tablet'] },
    { id: 'water', label: 'Water Damage', icon: CloudIcon, desc: 'Device got wet', base: 40, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch'] },
    { id: 'storage', label: 'Storage / Drive', icon: CubeIcon, desc: 'Hard Drive / SSD issue', base: 80, devices: ['laptop', 'console'] },
    { id: 'keyboard', label: 'Keyboard', icon: ComputerDesktopIcon, desc: 'Keys stuck or not working', base: 100, devices: ['laptop'] },
    { id: 'trackpad', label: 'Trackpad', icon: CursorArrowRaysIcon, desc: 'Not clicking or moving', base: 80, devices: ['laptop'] },
    { id: 'other', label: 'Other / Unknown', icon: WrenchScrewdriverIcon, desc: 'Diagnostic required', base: 30, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console'] },
];

export const SEO_CONTENT: any = {
    buyback_step1: {
        title: "Sell Your Device for the Best Price",
        text: "Belmobile offers the highest buyback rates in Belgium. Whether it's an iPhone, Samsung, or MacBook, get an instant quote and fast payment. We recycle responsibly and give your device a second life.",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=800&auto=format&fit=crop"
    },
    repair_step1: {
        title: "Expert Repair Services",
        text: "Broken screen? Battery draining fast? Our certified technicians use premium parts to restore your device to perfect condition. Most repairs are done in under 30 minutes.",
        image: "https://images.unsplash.com/photo-1581092921461-eab62e97a782?q=80&w=800&auto=format&fit=crop"
    },
    buyback_smartphone: {
        title: "Sell Your Smartphone",
        text: "Upgrade to the latest model by selling your old smartphone. We accept all major brands including Apple, Samsung, Xiaomi, and more. Best price guaranteed.",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"
    },
    repair_smartphone: {
        title: "Smartphone Repair Specialists",
        text: "From cracked screens to water damage, we fix it all. We specialize in iPhone and Samsung repairs with a lifetime warranty on screens.",
        image: "https://images.unsplash.com/photo-1592899671815-51527a557a7d?q=80&w=800&auto=format&fit=crop"
    },
    buyback_console: {
        title: "Trade-in Your Console",
        text: "Ready for the next gen? Sell your PS4, PS5, Xbox, or Nintendo Switch. We offer competitive prices for consoles and controllers.",
        image: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?q=80&w=800&auto=format&fit=crop"
    },
    repair_console: {
        title: "Console Repair Service",
        text: "Overheating PS5? HDMI port broken? Our gaming experts can fix your console quickly so you can get back to gaming.",
        image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop"
    }
};

export const MOCK_BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        slug: '5-tips-extend-battery-life',
        title: '5 Tips to Extend Your Smartphone Battery Life',
        excerpt: 'Struggling with a phone that dies by noon? Here are expert tips to keep your battery healthy for longer.',
        content: 'Battery life is crucial. 1. Reduce brightness. 2. Close unused apps. 3. Use low power mode. 4. Update software. 5. Avoid extreme temperatures.',
        date: '2024-03-15',
        author: 'Belmobile Team',
        category: 'Tips & Tricks',
        imageUrl: 'https://images.unsplash.com/photo-1574612199671-5c83380908b4?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: 2,
        slug: 'why-buy-refurbished',
        title: 'Why You Should Buy Refurbished Instead of New',
        excerpt: 'Save money and the planet. Discover the benefits of choosing a certified refurbished device from Belmobile.',
        content: 'Refurbished devices are inspected, repaired, and tested. They are cheaper and eco-friendly. You get a warranty too!',
        date: '2024-03-10',
        author: 'Sarah Jenkins',
        category: 'Buying Guide',
        imageUrl: 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: 3,
        slug: 'water-damage-guide',
        title: 'Dropped Your Phone in Water? Do This Immediately!',
        excerpt: 'Panic mode off. Follow these immediate steps to increase the chances of saving your water-damaged device.',
        content: '1. Turn it off. 2. Remove SIM/SD. 3. Dry exterior. 4. Do NOT use rice (it\'s a myth). 5. Bring it to Belmobile ASAP.',
        date: '2024-03-05',
        author: 'Mike The Tech',
        category: 'Repair',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: 4,
        slug: 'data-privacy-repairs',
        title: 'Data Privacy: How We Protect Your Info During Repairs',
        excerpt: 'Your privacy matters. Learn about our strict data protection protocols and why you can trust Belmobile with your device.',
        content: 'We take data privacy seriously. Our technicians are trained to respect your data. We recommend backing up and resetting if possible, but we also have strict non-disclosure agreements.',
        date: '2024-03-20',
        author: 'Belmobile Security',
        category: 'Security',
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop'
    },

    {
        id: 5,
        slug: 'reparation-face-id-iphone-prix-bruxelles',
        title: 'Réparation Problèmes Face-id iPhone XS-11-12-13 Pro Max Bruxelles',
        excerpt: 'Vous avez un problème avec la fonction Face ID de votre iPhone ou iPad ? Vous ne savez pas comment la réparer ou à qui vous adresser ? Pas de panique, nous sommes là pour vous aider !',
        content: `## Qu’est-ce que Face ID et comment ça marche ?
Face ID est une technologie de reconnaissance faciale développée par Apple et disponible sur certains modèles d’iPhone et d’iPad. Elle permet de déverrouiller votre appareil, d’effectuer des paiements, d’accéder à des applications sécurisées et plus encore, simplement en regardant l’écran. Face ID utilise une caméra infrarouge, un projecteur de points et un illuminateur pour créer une carte 3D de votre visage et la comparer à celle enregistrée dans votre appareil. Face ID est conçue pour être sûre, rapide et facile à utiliser.

## Comment réparer Face ID si elle ne fonctionne pas ?
Il peut arriver que Face ID ne fonctionne pas correctement ou pas du tout. Cela peut être dû à plusieurs raisons, telles qu’une mauvaise configuration, un problème logiciel, un obstacle sur la caméra ou un dommage matériel. Voici quelques solutions possibles à essayer vous-même avant de contacter un service de réparation :
- Vérifiez que votre appareil est compatible avec Face ID.
- Vérifiez que Face ID est activée dans les réglages de votre appareil.
- Vérifiez que rien n’obstrue la caméra TrueDepth située en haut de l’écran.
- Vérifiez que votre visage est bien visible et éclairé.
- Réinitialisez Face ID et configurez-la à nouveau.
- Redémarrez votre appareil.

Si aucune de ces solutions ne résout le problème, il se peut que votre caméra TrueDepth soit endommagée ou défectueuse. Dans ce cas, il faut faire appel à un service de réparation professionnel.

## Pourquoi choisir Belmobile.be pour réparer Face ID ?
Belmobile.be est le spécialiste de la réparation d’iPhone et d’iPad à Bruxelles. Nous vous offrons plusieurs avantages pour réparer Face ID :
1. Un diagnostic gratuit : nous examinons votre appareil et nous vous indiquons le problème et le coût de la réparation sans engagement.
2. Une garantie de 12 mois : nous utilisons des pièces de qualité et nous vous offrons une garantie d’un an sur toutes nos réparations.
3. Une expérience reconnue : nous avons plus de 10 ans d’expérience dans la réparation d’appareils Apple et nous sommes certifiés par la marque.
4. Une rapidité inégalée : nous réparons votre appareil en moins d’une heure dans la plupart des cas et sans rendez-vous.`,
        author: 'Belmobile Team',
        date: '2024-05-20',
        imageUrl: 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        category: 'Repair Tips'
    }
];

export const MOCK_REPAIR_PRICES: RepairPricing[] = [
    // iPhone 17 Series (Newest - Competitive vs Apple)
    { id: 'apple-iphone-17-pro-max', screen_generic: 220, screen_oled: 320, screen_original: 450, battery: 90, charging: 100 },
    { id: 'apple-iphone-17-pro', screen_generic: 200, screen_oled: 290, screen_original: 380, battery: 90, charging: 100 },
    { id: 'apple-iphone-17-plus', screen_generic: 160, screen_oled: 250, screen_original: 340, battery: 90, charging: 100 },
    { id: 'apple-iphone-17', screen_generic: 150, screen_oled: 240, screen_original: 320, battery: 90, charging: 100 },

    // iPhone 16 Series (1 Year Old)
    { id: 'apple-iphone-16-pro-max', screen_generic: 180, screen_oled: 280, screen_original: 400, battery: 85, charging: 95 },
    { id: 'apple-iphone-16-pro', screen_generic: 170, screen_oled: 260, screen_original: 350, battery: 85, charging: 95 },
    { id: 'apple-iphone-16-plus', screen_generic: 140, screen_oled: 220, screen_original: 300, battery: 85, charging: 95 },
    { id: 'apple-iphone-16', screen_generic: 130, screen_oled: 200, screen_original: 280, battery: 85, charging: 95 },
    { id: 'apple-iphone-16e', screen_generic: 120, screen_oled: 190, screen_original: 260, battery: 85, charging: 95 },

    // iPhone 15 Series (2 Years Old)
    { id: 'apple-iphone-15-pro-max', screen_generic: 150, screen_oled: 240, screen_original: 350, battery: 80, charging: 90 },
    { id: 'apple-iphone-15-pro', screen_generic: 140, screen_oled: 220, screen_original: 320, battery: 80, charging: 90 },
    { id: 'apple-iphone-15-plus', screen_generic: 120, screen_oled: 190, screen_original: 260, battery: 80, charging: 90 },
    { id: 'apple-iphone-15', screen_generic: 110, screen_oled: 180, screen_original: 250, battery: 80, charging: 90 },

    // iPhone 14 Series (3 Years Old)
    { id: 'apple-iphone-14-pro-max', screen_generic: 130, screen_oled: 200, screen_original: 300, battery: 75, charging: 85 },
    { id: 'apple-iphone-14-pro', screen_generic: 120, screen_oled: 190, screen_original: 280, battery: 75, charging: 85 },
    { id: 'apple-iphone-14-plus', screen_generic: 100, screen_oled: 160, screen_original: 220, battery: 75, charging: 85 },
    { id: 'apple-iphone-14', screen_generic: 90, screen_oled: 150, screen_original: 200, battery: 75, charging: 85 },

    // iPhone 13 Series
    { id: 'apple-iphone-13-pro-max', screen_generic: 110, screen_oled: 170, screen_original: 250, battery: 70, charging: 80 },
    { id: 'apple-iphone-13-pro', screen_generic: 100, screen_oled: 160, screen_original: 230, battery: 70, charging: 80 },
    { id: 'apple-iphone-13', screen_generic: 80, screen_oled: 130, screen_original: 180, battery: 60, charging: 70 },
    { id: 'apple-iphone-13-mini', screen_generic: 70, screen_oled: 120, screen_original: 160, battery: 60, charging: 70 },

    // iPhone 12 Series
    { id: 'apple-iphone-12-pro-max', screen_generic: 90, screen_oled: 140, screen_original: 200, battery: 65, charging: 75 },
    { id: 'apple-iphone-12-pro', screen_generic: 80, screen_oled: 120, screen_original: 170, battery: 65, charging: 75 },
    { id: 'apple-iphone-12', screen_generic: 80, screen_oled: 120, screen_original: 170, battery: 60, charging: 70 },
    { id: 'apple-iphone-12-mini', screen_generic: 70, screen_oled: 110, screen_original: 160, battery: 60, charging: 70 },

    // iPhone 11 Series
    { id: 'apple-iphone-11-pro-max', screen_generic: 70, screen_oled: 110, screen_original: 150, battery: 60, charging: 70 },
    { id: 'apple-iphone-11-pro', screen_generic: 65, screen_oled: 100, screen_original: 140, battery: 60, charging: 70 },
    { id: 'apple-iphone-11', screen_generic: 60, screen_oled: undefined, screen_original: 110, battery: 50, charging: 60 }, // LCD only

    // iPhone X / XR / XS Series
    { id: 'apple-iphone-xs-max', screen_generic: 65, screen_oled: 100, screen_original: 140, battery: 55, charging: 65 },
    { id: 'apple-iphone-xs', screen_generic: 60, screen_oled: 90, screen_original: 130, battery: 55, charging: 65 },
    { id: 'apple-iphone-xr', screen_generic: 60, screen_oled: undefined, screen_original: 100, battery: 50, charging: 60 }, // LCD only
    { id: 'apple-iphone-x', screen_generic: 60, screen_oled: 90, screen_original: 130, battery: 50, charging: 60 },

    // iPhone SE / 8 Series
    { id: 'apple-iphone-se-2022', screen_generic: 50, screen_oled: undefined, screen_original: 90, battery: 45, charging: 55 },
    { id: 'apple-iphone-se-2020', screen_generic: 45, screen_oled: undefined, screen_original: 80, battery: 40, charging: 50 },
    { id: 'apple-iphone-8-plus', screen_generic: 50, screen_oled: undefined, screen_original: 90, battery: 45, charging: 55 },
    { id: 'apple-iphone-8', screen_generic: 45, screen_oled: undefined, screen_original: 80, battery: 40, charging: 50 },

    // iPad Pro 12.9 Series (Single Price)
    { id: 'apple-ipad-pro-129-m2', screen_generic: 450, screen_oled: 450, screen_original: 450, battery: 120, charging: 100 },
    { id: 'apple-ipad-pro-129-2022', screen_generic: 420, screen_oled: 420, screen_original: 420, battery: 120, charging: 100 },
    { id: 'apple-ipad-pro-129-2021', screen_generic: 380, screen_oled: 380, screen_original: 380, battery: 110, charging: 90 },
    { id: 'apple-ipad-pro-129-2020', screen_generic: 350, screen_oled: 350, screen_original: 350, battery: 100, charging: 90 },
    { id: 'apple-ipad-pro-129-2018', screen_generic: 300, screen_oled: 300, screen_original: 300, battery: 90, charging: 80 },

    // iPad Pro 11 Series (Single Price)
    { id: 'apple-ipad-pro-11-2022', screen_generic: 350, screen_oled: 350, screen_original: 350, battery: 100, charging: 90 },
    { id: 'apple-ipad-pro-11-2021', screen_generic: 320, screen_oled: 320, screen_original: 320, battery: 100, charging: 90 },
    { id: 'apple-ipad-pro-11-2020', screen_generic: 280, screen_oled: 280, screen_original: 280, battery: 90, charging: 80 },
    { id: 'apple-ipad-pro-11-2018', screen_generic: 250, screen_oled: 250, screen_original: 250, battery: 80, charging: 80 },

    // iPad Air Series (Single Price)
    { id: 'apple-ipad-air-5', screen_generic: 280, screen_oled: 280, screen_original: 280, battery: 90, charging: 80 },
    { id: 'apple-ipad-air-4', screen_generic: 250, screen_oled: 250, screen_original: 250, battery: 80, charging: 80 },
    { id: 'apple-ipad-air-3', screen_generic: 200, screen_oled: 200, screen_original: 200, battery: 70, charging: 70 },

    // iPad Mini Series (Single Price)
    { id: 'apple-ipad-mini-6', screen_generic: 250, screen_oled: 250, screen_original: 250, battery: 80, charging: 80 },
    { id: 'apple-ipad-mini-5', screen_generic: 200, screen_oled: 200, screen_original: 200, battery: 70, charging: 70 },
    { id: 'apple-ipad-mini-4', screen_generic: 150, screen_oled: 150, screen_original: 150, battery: 60, charging: 60 },

    // iPad Base Series (Single Price)
    { id: 'apple-ipad-10th-gen', screen_generic: 220, screen_oled: 220, screen_original: 220, battery: 80, charging: 80 },
    { id: 'apple-ipad-9', screen_generic: 150, screen_oled: 150, screen_original: 150, battery: 70, charging: 70 },
    { id: 'apple-ipad-8', screen_generic: 130, screen_oled: 130, screen_original: 130, battery: 60, charging: 60 },

    // Samsung S24 Series
    { id: 'samsung-galaxy-s24-ultra', screen_generic: 250, screen_oled: 350, screen_original: 420, battery: 85, charging: 95 },
    { id: 'samsung-galaxy-s24-plus', screen_generic: 200, screen_oled: 280, screen_original: 350, battery: 85, charging: 95 },
    { id: 'samsung-galaxy-s24', screen_generic: 180, screen_oled: 250, screen_original: 300, battery: 80, charging: 90 },

    // Samsung S23 Series
    { id: 'samsung-galaxy-s23-ultra', screen_generic: 220, screen_oled: 300, screen_original: 380, battery: 80, charging: 90 },
    { id: 'samsung-galaxy-s23-plus', screen_generic: 180, screen_oled: 250, screen_original: 320, battery: 80, charging: 90 },
    { id: 'samsung-galaxy-s23', screen_generic: 150, screen_oled: 200, screen_original: 250, battery: 75, charging: 85 },

    // Samsung S22 Series
    { id: 'samsung-galaxy-s22-ultra', screen_generic: 200, screen_oled: 280, screen_original: 350, battery: 75, charging: 85 },
    { id: 'samsung-galaxy-s22-plus', screen_generic: 160, screen_oled: 220, screen_original: 280, battery: 75, charging: 85 },
    { id: 'samsung-galaxy-s22', screen_generic: 140, screen_oled: 190, screen_original: 240, battery: 70, charging: 80 },

    // Samsung S21 Series
    { id: 'samsung-galaxy-s21-ultra', screen_generic: 180, screen_oled: 250, screen_original: 320, battery: 70, charging: 80 },
    { id: 'samsung-galaxy-s21-plus', screen_generic: 150, screen_oled: 200, screen_original: 260, battery: 70, charging: 80 },
    { id: 'samsung-galaxy-s21', screen_generic: 130, screen_oled: 180, screen_original: 220, battery: 65, charging: 75 },
    { id: 'samsung-galaxy-s21-fe', screen_generic: 120, screen_oled: 160, screen_original: 200, battery: 65, charging: 75 },

    // Samsung A Series (Popular)
    { id: 'samsung-galaxy-a55', screen_generic: 100, screen_oled: 140, screen_original: 180, battery: 60, charging: 70 },
    { id: 'samsung-galaxy-a54', screen_generic: 90, screen_oled: 130, screen_original: 160, battery: 60, charging: 70 },
    { id: 'samsung-galaxy-a53', screen_generic: 80, screen_oled: 120, screen_original: 150, battery: 55, charging: 65 },
    { id: 'samsung-galaxy-a52', screen_generic: 70, screen_oled: 110, screen_original: 140, battery: 55, charging: 65 },
    { id: 'samsung-galaxy-a35', screen_generic: 80, screen_oled: 110, screen_original: 140, battery: 55, charging: 65 },
    { id: 'samsung-galaxy-a15', screen_generic: 60, screen_oled: undefined, screen_original: 100, battery: 50, charging: 60 }, // LCD

    // Samsung Tablets (Single Price)
    { id: 'samsung-galaxy-tab-s9-ultra', screen_generic: 400, screen_oled: 400, screen_original: 400, battery: 100, charging: 90 },
    { id: 'samsung-galaxy-tab-s9', screen_generic: 300, screen_oled: 300, screen_original: 300, battery: 90, charging: 80 },
    { id: 'samsung-galaxy-tab-s8-ultra', screen_generic: 380, screen_oled: 380, screen_original: 380, battery: 100, charging: 90 },
    { id: 'samsung-galaxy-tab-s8', screen_generic: 280, screen_oled: 280, screen_original: 280, battery: 90, charging: 80 },
    { id: 'samsung-galaxy-tab-a8', screen_generic: 120, screen_oled: 120, screen_original: 120, battery: 70, charging: 70 },
    { id: 'samsung-galaxy-tab-a7', screen_generic: 100, screen_oled: 100, screen_original: 100, battery: 60, charging: 60 },

    // Google Pixel Series
    { id: 'google-pixel-9-pro-xl', screen_generic: 250, screen_oled: 350, screen_original: 420, battery: 90, charging: 100 },
    { id: 'google-pixel-9-pro', screen_generic: 240, screen_oled: 340, screen_original: 400, battery: 90, charging: 100 },
    { id: 'google-pixel-9', screen_generic: 200, screen_oled: 280, screen_original: 350, battery: 85, charging: 95 },
    { id: 'google-pixel-8-pro', screen_generic: 220, screen_oled: 300, screen_original: 380, battery: 85, charging: 95 },
    { id: 'google-pixel-8', screen_generic: 180, screen_oled: 250, screen_original: 320, battery: 80, charging: 90 },
    { id: 'google-pixel-7-pro', screen_generic: 200, screen_oled: 280, screen_original: 350, battery: 80, charging: 90 },
    { id: 'google-pixel-7', screen_generic: 150, screen_oled: 220, screen_original: 280, battery: 75, charging: 85 },
    { id: 'google-pixel-6-pro', screen_generic: 180, screen_oled: 250, screen_original: 300, battery: 75, charging: 85 },
    { id: 'google-pixel-6', screen_generic: 140, screen_oled: 200, screen_original: 250, battery: 70, charging: 80 },
    { id: 'google-pixel-7a', screen_generic: 120, screen_oled: 160, screen_original: 200, battery: 70, charging: 80 },
    { id: 'google-pixel-6a', screen_generic: 100, screen_oled: 140, screen_original: 180, battery: 65, charging: 75 },

    // OnePlus Series
    { id: 'oneplus-12', screen_generic: 220, screen_oled: 300, screen_original: 380, battery: 80, charging: 90 },
    { id: 'oneplus-11', screen_generic: 200, screen_oled: 280, screen_original: 350, battery: 80, charging: 90 },
    { id: 'oneplus-10-pro', screen_generic: 180, screen_oled: 250, screen_original: 320, battery: 75, charging: 85 },
    { id: 'oneplus-9-pro', screen_generic: 160, screen_oled: 220, screen_original: 280, battery: 75, charging: 85 },
    { id: 'oneplus-nord-4', screen_generic: 120, screen_oled: 160, screen_original: 200, battery: 65, charging: 75 },
    { id: 'oneplus-nord-3', screen_generic: 110, screen_oled: 150, screen_original: 180, battery: 65, charging: 75 },

    // Xiaomi Series
    { id: 'xiaomi-14-ultra', screen_generic: 250, screen_oled: 350, screen_original: 450, battery: 90, charging: 100 },
    { id: 'xiaomi-14', screen_generic: 200, screen_oled: 280, screen_original: 350, battery: 85, charging: 95 },
    { id: 'xiaomi-13-pro', screen_generic: 180, screen_oled: 250, screen_original: 320, battery: 80, charging: 90 },
    { id: 'xiaomi-13t-pro', screen_generic: 150, screen_oled: 200, screen_original: 250, battery: 80, charging: 90 },
    { id: 'xiaomi-redmi-note-13-pro-plus', screen_generic: 120, screen_oled: 160, screen_original: 200, battery: 70, charging: 80 },
    { id: 'xiaomi-redmi-note-12-pro', screen_generic: 100, screen_oled: 140, screen_original: 180, battery: 65, charging: 75 },
    { id: 'xiaomi-poco-f6-pro', screen_generic: 150, screen_oled: 200, screen_original: 250, battery: 75, charging: 85 },

    // Huawei Series
    { id: 'huawei-p40-pro', screen_generic: 180, screen_oled: 250, screen_original: 320, battery: 70, charging: 80 },
    { id: 'huawei-p30-pro', screen_generic: 150, screen_oled: 200, screen_original: 250, battery: 65, charging: 75 },
    { id: 'huawei-p30', screen_generic: 120, screen_oled: 160, screen_original: 200, battery: 60, charging: 70 },
    { id: 'huawei-p30-lite', screen_generic: 80, screen_oled: undefined, screen_original: 120, battery: 50, charging: 60 },

    // Oppo Series
    { id: 'oppo-find-x6-pro', screen_generic: 200, screen_oled: 280, screen_original: 350, battery: 80, charging: 90 },
    { id: 'oppo-find-x5-pro', screen_generic: 180, screen_oled: 250, screen_original: 320, battery: 75, charging: 85 },
    { id: 'oppo-find-x5', screen_generic: 150, screen_oled: 200, screen_original: 250, battery: 70, charging: 80 },
    { id: 'oppo-reno-10-pro-plus', screen_generic: 140, screen_oled: 180, screen_original: 220, battery: 70, charging: 80 },
    { id: 'oppo-reno-10', screen_generic: 100, screen_oled: 140, screen_original: 180, battery: 65, charging: 75 },
    { id: 'oppo-a98-5g', screen_generic: 90, screen_oled: 120, screen_original: 150, battery: 60, charging: 70 },
    { id: 'oppo-a78', screen_generic: 80, screen_oled: undefined, screen_original: 120, battery: 55, charging: 65 },

    // PlayStation Series
    { id: 'sony-playstation-5-disc', hdmi: 100, cleaning: 60, disc: 120, storage: 100, joystick: 25 },
    { id: 'sony-playstation-5-digital', hdmi: 100, cleaning: 60, storage: 100, joystick: 25 },
    { id: 'sony-playstation-4-pro', hdmi: 80, cleaning: 50, disc: 80, storage: 80, joystick: 25 },
    { id: 'sony-playstation-4-slim', hdmi: 80, cleaning: 50, disc: 80, storage: 80, joystick: 25 },
    { id: 'sony-playstation-3-slim', hdmi: 70, cleaning: 40, disc: 60, storage: 60, joystick: 25 },

    // Xbox Series
    { id: 'microsoft-xbox-series-x', hdmi: 100, cleaning: 60, disc: 100, storage: 100, joystick: 25 },
    { id: 'microsoft-xbox-series-s', hdmi: 100, cleaning: 60, storage: 100, joystick: 25 },
    { id: 'microsoft-xbox-one', hdmi: 80, cleaning: 50, disc: 80, storage: 80, joystick: 25 },
    { id: 'microsoft-xbox-360', hdmi: 60, cleaning: 40, disc: 60, storage: 60, joystick: 25 },

    // Nintendo Series
    { id: 'nintendo-switch-oled', screen_generic: 120, screen_oled: 180, screen_original: 180, charging: 100, battery: 60, joystick: 25, card_reader: 80 },
    { id: 'nintendo-switch-v2', screen_generic: 60, screen_oled: 110, screen_original: 110, charging: 100, battery: 60, joystick: 25, card_reader: 80 },
    { id: 'nintendo-switch-lite', screen_generic: 60, screen_oled: 100, screen_original: 100, charging: 100, battery: 60, joystick: 25, card_reader: 80 },
    { id: 'nintendo-3ds-xl', screen_generic: 50, screen_oled: 70, screen_original: 70, charging: 60, battery: 40, card_reader: 60 },

    // MacBook Series
    { id: 'apple-macbook-pro-16-m2', screen_generic: 600, screen_original: 800, battery: 150, keyboard: 300, trackpad: 150, charging: 120 },
    { id: 'apple-macbook-pro-14-m2', screen_generic: 500, screen_original: 700, battery: 130, keyboard: 280, trackpad: 140, charging: 120 },
    { id: 'apple-macbook-pro-16-m2-pro-max', screen_generic: 600, screen_original: 800, battery: 150, keyboard: 300, trackpad: 150, charging: 120 },
    { id: 'apple-macbook-pro-14-m2-pro-max', screen_generic: 500, screen_original: 700, battery: 130, keyboard: 280, trackpad: 140, charging: 120 },
    { id: 'apple-macbook-pro-13-m2', screen_generic: 400, screen_original: 550, battery: 120, keyboard: 250, trackpad: 120, charging: 100 },
    { id: 'apple-macbook-air-m2', screen_generic: 400, screen_original: 550, battery: 120, keyboard: 250, trackpad: 120, charging: 100 },
    { id: 'apple-macbook-air-m1', screen_generic: 300, screen_original: 450, battery: 110, keyboard: 200, trackpad: 100, charging: 80 },
    { id: 'apple-macbook-air-13-2018-2020', screen_generic: 250, screen_original: 350, battery: 100, keyboard: 180, trackpad: 90, charging: 80 },
    { id: 'apple-macbook-air-13-2010-2017', screen_generic: 150, screen_original: 200, battery: 80, keyboard: 120, trackpad: 70, charging: 60 },

    // Samsung Laptops
    { id: 'samsung-galaxy-book3-pro', screen_generic: 300, screen_original: 450, battery: 120, keyboard: 150, trackpad: 100, charging: 100 },
    { id: 'samsung-galaxy-book3', screen_generic: 200, screen_original: 300, battery: 100, keyboard: 120, trackpad: 80, charging: 90 },

    // Dell Laptops
    { id: 'dell-xps-13', screen_generic: 250, screen_original: 400, battery: 110, keyboard: 140, trackpad: 90, charging: 100 },
    { id: 'dell-inspiron-15', screen_generic: 100, screen_original: 150, battery: 80, keyboard: 90, trackpad: 60, charging: 80 },

    // HP Laptops
    { id: 'hp-spectre-x360', screen_generic: 280, screen_original: 420, battery: 110, keyboard: 140, trackpad: 90, charging: 100 },
    { id: 'hp-envy-13', screen_generic: 150, screen_original: 250, battery: 90, keyboard: 110, trackpad: 70, charging: 90 },

    // Lenovo Laptops
    { id: 'lenovo-thinkpad-x1-carbon', screen_generic: 250, screen_original: 400, battery: 120, keyboard: 150, trackpad: 100, charging: 100 },
    { id: 'lenovo-ideapad-5', screen_generic: 100, screen_original: 160, battery: 80, keyboard: 90, trackpad: 60, charging: 80 },

    // Microsoft Surface (Tablet/Laptop)
    { id: 'microsoft-surface-pro-9', screen_generic: 250, screen_original: 350, battery: 120, charging: 100, keyboard: 150 }, // Keyboard is Type Cover port or internal if laptop
    { id: 'microsoft-surface-go-3', screen_generic: 150, screen_original: 220, battery: 90, charging: 80, keyboard: 100 },

    // Apple Watch Series
    { id: 'apple-watch-ultra-2', screen_generic: 200, screen_original: 350, battery: 100 },
    { id: 'apple-watch-ultra', screen_generic: 200, screen_original: 350, battery: 100 },
    { id: 'apple-watch-series-9', screen_generic: 120, screen_original: 200, battery: 80 },
    { id: 'apple-watch-series-8', screen_generic: 120, screen_original: 200, battery: 80 },
    { id: 'apple-watch-series-7', screen_generic: 110, screen_original: 180, battery: 80 },
    { id: 'apple-watch-se-2', screen_generic: 90, screen_original: 150, battery: 60 },
    { id: 'apple-watch-se', screen_generic: 80, screen_original: 130, battery: 60 },

    // Samsung Galaxy Watch Series
    { id: 'samsung-galaxy-watch-6-classic', screen_generic: 100, screen_original: 160, battery: 60 },
    { id: 'samsung-galaxy-watch-6', screen_generic: 90, screen_original: 140, battery: 60 },
    { id: 'samsung-galaxy-watch-5-pro', screen_generic: 100, screen_original: 150, battery: 60 },
    { id: 'samsung-galaxy-watch-5', screen_generic: 80, screen_original: 120, battery: 50 },
    { id: 'samsung-galaxy-watch-4-classic', screen_generic: 80, screen_original: 120, battery: 50 },
];


