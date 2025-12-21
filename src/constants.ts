
import { Shop, Product, NavLink, AdminStat, Review, FAQCategory, RepairPricing, BlogPost } from './types';
import {
    CubeIcon,
    PhoneIcon,
    DocumentTextIcon,
    BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

export * from './data/device-types';
export * from './data/repair-issues';

export const SHOPS: Shop[] = [
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
        status: 'temporarily_closed',
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
        availability: { 'schaerbeek': 5, 'anderlecht': 2, 'molenbeek': 0 }
    }
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



export const SEO_CONTENT: Record<string, { title: string; text: string; image: string }> = {
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
    buyback_console_home: {
        title: "Trade-in Your Home Console",
        text: "Ready for the next gen? Sell your PS4, PS5, or Xbox. We offer competitive prices for consoles and controllers.",
        image: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?q=80&w=800&auto=format&fit=crop"
    },
    buyback_console_portable: {
        title: "Trade-in Your Handheld",
        text: "Sell your Nintendo Switch, Steam Deck, or other handhelds. We offer competitive prices.",
        image: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?q=80&w=800&auto=format&fit=crop"
    },
    repair_console: {
        title: "Console Repair Service",
        text: "Overheating PS5? HDMI port broken? Our gaming experts can fix your console quickly so you can get back to gaming.",
        image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop"
    },
    repair_console_home: {
        title: "Console Repair Service",
        text: "Overheating PS5? HDMI port broken? Our gaming experts can fix your console quickly so you can get back to gaming.",
        image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop"
    },
    repair_console_portable: {
        title: "Handheld Repair Service",
        text: "Broken Screen? Drift? Our gaming experts can fix your Switch or Steam Deck quickly.",
        image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop"
    }
};

export const MOCK_BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        slug: 'reparation-ecran-iphone-15-pro-bruxelles-original',
        slugs: {
            fr: 'reparation-ecran-iphone-15-pro-bruxelles-original',
            en: 'iphone-15-pro-screen-repair-brussels-original',
            nl: 'iphone-15-pro-scherm-reparatie-brussel-origineel'
        },
        title: 'Réparation écran iPhone 15 Pro à Bruxelles : Pourquoi choisir l\'original ?',
        excerpt: 'Votre iPhone 15 Pro a l\'écran brisé ? Découvrez pourquoi l\'utilisation de pièces originales est cruciale pour maintenir la garantie et la qualité d\'image.',
        content: `L'iPhone 15 Pro est un bijou de technologie avec son écran Super Retina XDR. Lorsqu'un accident arrive, la tentation de choisir une réparation bon marché avec des pièces génériques est forte. Cependant, voici pourquoi Belmobile recommande toujours l'original :
        
1. **Qualité d'image** : Les écrans génériques ont souvent des couleurs moins vives et une luminosité réduite.
2. **Technologie ProMotion** : Seuls les écrans certifiés supportent le taux de rafraîchissement adaptatif de 120Hz.
3. **True Tone & Capteurs** : Une réparation non conforme peut désactiver définitivement le True Tone ou le Face ID.
4. **Valeur de Revente** : Un iPhone avec un écran non original perd 30% de sa valeur sur le marché de l'occasion.

Chez Belmobile (Anderlecht & Schaerbeek), nous proposons des écrans originaux avec une garantie de 12 mois.`,
        date: '2024-11-15',
        author: 'Belmobile Expert',
        category: 'Repair Guide',
        imageUrl: '/images/blog/iphone-screen-repair.png'
    },
    {
        id: 2,
        slug: 'vendre-ancien-smartphone-prix-belgique',
        slugs: {
            fr: 'vendre-ancien-smartphone-prix-belgique',
            en: 'sell-old-smartphone-best-price-belgium',
            nl: 'oude-smartphone-verkopen-beste-prijs-belgie'
        },
        title: 'Comment vendre votre ancien smartphone au meilleur prix en Belgique ?',
        excerpt: 'Ne laissez pas votre ancien téléphone dormir dans un tiroir. Apprenez comment maximiser sa valeur de rachat chez Belmobile.',
        content: `Le marché de l'occasion en Belgique est en pleine expansion. Pour obtenir le meilleur prix de rachat pour votre smartphone, suivez ces étapes :

1. **Nettoyage complet** : Un appareil propre inspire confiance et facilite l'inspection.
2. **Boîte et accessoires** : Si vous avez encore la boîte originale et le chargeur, la valeur peut augmenter de 10 à 20€.
3. **Désactivation des comptes** : Pensez à supprimer votre compte iCloud ou Google avant de venir en magasin.
4. **Transparence sur l'état** : Un petit éclat ? Signalez-le ! Chez Belmobile, nous rachetons même les appareils avec des défauts mineurs.

Passez dans l'un de nos magasins à Bruxelles pour une estimation immédiate et un paiement en cash ou par virement instantané.`,
        date: '2024-12-01',
        author: 'Team Rachat',
        category: 'Buyback',
        imageUrl: '/images/blog/sell-smartphone-money.png'
    },
    {
        id: 3,
        slug: 'batterie-iphone-quand-remplacer',
        slugs: {
            fr: 'batterie-iphone-quand-remplacer',
            en: 'iphone-battery-replacement-signs',
            nl: 'iphone-batterij-vervangen-tekens'
        },
        title: 'Batterie iPhone : Quand est-il temps de la remplacer ?',
        excerpt: 'Votre iPhone s\'éteint inopinément ? Vérifiez l\'état de votre batterie et sachez quand passer en magasin pour un remplacement rapide.',
        content: `La batterie est un composant d'usure. Après 500 cycles de charge, la capacité commence à chuter. Voici les signes qui ne trompent pas :

- **Capacité maximum < 80%** : Rendez-vous dans Réglages > Batterie > État de la batterie.
- **Ralentissements du système** : iOS bride les performances pour éviter les extinctions brutales.
- **Surchauffe** : Une batterie en fin de vie chauffe anormalement lors de la charge.

Chez Belmobile, nous remplaçons votre batterie en 30 minutes. Pas besoin de laisser votre téléphone pendant des jours !`,
        date: '2024-12-10',
        author: 'Labo Belmobile',
        category: 'Maintenance',
        imageUrl: '/images/blog/iphone-battery-replacement.png'
    },
    {
        id: 4,
        slug: 'data-privacy-protection-info-repairs',
        slugs: {
            en: 'data-privacy-protection-info-repairs',
            fr: 'confidentialite-donnees-protection-reparation',
            nl: 'gegevensprivacy-bescherming-reparaties'
        },
        title: 'Data Privacy: How We Protect Your Info During Repairs',
        excerpt: 'Your privacy matters. Learn about our strict data protection protocols and why you can trust Belmobile with your device.',
        content: `At Belmobile, we understand that your smartphone contains your entire life - photos, messages, banking apps, and more. That's why we take data privacy seriously.

**Our Protocols:**
1. **No Access Policy**: Our technicians only access the functions necessary for the repair (e.g., testing the camera or touch screen). We never browse your photos or personal data.
2. **Device Passcodes**: We ask for your passcode only if strictly necessary for testing. You can also disable it or use Guest Mode (Android) if you prefer.
3. **Data Security**: We recommend backing up your data before any repair, although 99% of repairs preserve your data intact.
4. **Transparency**: We perform repairs in open labs or while you wait, so you can see exactly what's happening.

Trust is the foundation of our business. Your data stays yours.`,
        date: '2024-03-20',
        author: 'Belmobile Security',
        category: 'Security',
        imageUrl: '/images/blog/data-privacy-security.png'
    },
    {
        id: 5,
        slug: 'face-id-repair-iphone-xs-11-12-13-pro-max-brussels',
        slugs: {
            en: 'face-id-repair-iphone-xs-11-12-13-pro-max-brussels',
            fr: 'reparation-face-id-iphone-xs-11-12-13-pro-max-bruxelles',
            nl: 'face-id-reparatie-iphone-xs-11-12-13-pro-max-brussel'
        },
        title: 'Face ID Repair & Issues for iPhone XS-11-12-13 Pro Max in Brussels',
        excerpt: 'Is your Face ID failing? Learn how to fix it or who to contact for repair.',
        content: `Face ID is a revolutionary technology that uses a dot projector to map your face in 3D. Face ID is designed to be secure, fast, and easy to use.

## How to fix Face ID not working?
Face ID might not work properly due to bad configuration, software glitches, or hardware damage. Here are some fixes:
- Check if your device is compatible with Face ID.
- Verify Face ID is enabled in settings.
- Ensure nothing is blocking the TrueDepth camera.
- Reset Face ID and set it up again.

If none of these work, your TrueDepth camera might be damaged. Contact a professional repair service like Belmobile.be.`,
        date: '2024-12-18',
        author: 'Belmobile Expert',
        category: 'Repair Tips',
        imageUrl: '/images/blog/face-id-repair.png'
    }
];

export const MOCK_REPAIR_PRICES: RepairPricing[] = [];
