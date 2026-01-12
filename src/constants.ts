
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
        coords: { lat: 50.86486, lng: 4.36704 },
        status: 'open',
        isPrimary: true,
        badge: 'Recommended',
        city: 'Schaerbeek',
        googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Belmobile+Liedts&query_place_id=ChIJk6VQXpHDw0cRNEdLpSrOUkY',
        googlePlaceId: 'ChIJk6VQXpHDw0cRNEdLpSrOUkY',
        googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJk6VQXpHDw0cRNEdLpSrOUkY'
    },
    {
        id: 'anderlecht',
        name: 'Belmobile Bara',
        address: 'Rue Lambert Crickx 12, 1070 Anderlecht',
        phone: '02/275.98.67',
        email: 'anderlecht@belmobile.be',
        openingHours: ['Mon-Sat: 10:30 - 19:00', 'Fri: 10:30-12:30 & 14:30-19:00', 'Sun: Closed'],
        slugs: { fr: 'anderlecht', nl: 'anderlecht', en: 'anderlecht' },
        coords: { lat: 50.84079, lng: 4.33729 },
        status: 'open',
        city: 'Anderlecht',
        googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Belmobile+Bara&query_place_id=ChIJY6KmKtLDw0cRy7JDeNAZ2wQ',
        googlePlaceId: 'ChIJY6KmKtLDw0cRy7JDeNAZ2wQ',
        googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJY6KmKtLDw0cRy7JDeNAZ2wQ'
    },
    {
        id: 'molenbeek',
        name: 'Belmobile Tour & Taxis',
        address: 'Rue Ulens 88, 1080 Molenbeek',
        phone: '02/306.76.56',
        email: 'molenbeek@belmobile.be',
        openingHours: ['B2B Only', 'By Appointment'],
        slugs: { fr: 'molenbeek', nl: 'molenbeek', en: 'molenbeek', tr: 'molenbeek' },
        coords: { lat: 50.86285, lng: 4.34240 },
        status: 'open',
        badge: 'B2B/Corporate HQ',
        city: 'Molenbeek-Saint-Jean',
        googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Belmobile+Tour+Taxis+Rue+Ulens+88+1080+Molenbeek'
    }
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "iPhone 13",
        price: 599,
        description: "A15 Bionic chip, advanced dual-camera system.",
        imageUrl: "/images/hero_phone_bg.webp",
        category: "smartphone",
        brand: "Apple",
        condition: 'perfect',
        capacity: '128GB',
        color: 'Blue',
        slug: 'apple-iphone-13-128gb-blue-perfect',
        availability: { 'schaerbeek': 5, 'anderlecht': 2, 'molenbeek': 0 }
    }
];

export const POPULAR_BUYBACKS = [
    {
        id: 'iphone-15-pro-max',
        name: 'iPhone 15 Pro Max',
        maxPrice: 950,
        image: '/images/hero_phone_bg.webp',
        brand: 'Apple'
    },
    {
        id: 'iphone-14-pro',
        name: 'iPhone 14 Pro',
        maxPrice: 680,
        image: '/images/hero_phone_bg.webp',
        brand: 'Apple'
    },
    {
        id: 'samsung-s24-ultra',
        name: 'Galaxy S24 Ultra',
        maxPrice: 820,
        image: '/images/bento/repair_bg.webp',
        brand: 'Samsung'
    },
    {
        id: 'macbook-air-m2',
        name: 'MacBook Air M2',
        maxPrice: 750,
        image: '/images/bento/business_bg.webp',
        brand: 'Apple'
    }
];


// Reordered: Repair > Buyback > Products > Stores.
export const NAV_LINKS: NavLink[] = [
    { name: 'Buyback', path: '/buyback' },
    { name: 'Repair', path: '/repair' },
    { name: 'Catalogue', path: '/products' },
    { name: 'Store Locator', path: '/stores' },
    { name: 'Business', path: '/business' },
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
            { q: 'faq_ge_q1', a: 'faq_ge_a1' },
            { q: 'faq_ge_q2', a: 'faq_ge_a2' },
            { q: 'faq_ge_q3', a: 'faq_ge_a3' },
            { q: 'faq_ge_q4', a: 'faq_ge_a4' },
        ]
    },
    {
        id: 'repair',
        title: 'Repairs',
        items: [
            { q: 'faq_re_q1', a: 'faq_re_a1' },
            { q: 'faq_re_q2', a: 'faq_re_a2' },
            { q: 'faq_re_q3', a: 'faq_re_a3' },
            { q: 'faq_re_q4', a: 'faq_re_a4' },
            { q: 'faq_re_q5', a: 'faq_re_a5' }
        ]
    },
    {
        id: 'buyback',
        title: 'Buyback & Sales',
        items: [
            { q: 'faq_bb_q1', a: 'faq_bb_a1' },
            { q: 'faq_bb_q2', a: 'faq_bb_a2' },
            { q: 'faq_bb_q3', a: 'faq_bb_a3' },
            { q: 'faq_bb_q4', a: 'faq_bb_a4' },
            { q: 'faq_bb_q5', a: 'faq_bb_a5' }
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
        image: "/images/hero_phone_bg.webp"
    },
    repair_step1: {
        title: "Expert Repair Services",
        text: "Broken screen? Battery draining fast? Our certified technicians use premium parts to restore your device to perfect condition. Most repairs are done in under 30 minutes.",
        image: "/images/bento/repair_bg.webp"
    },
    buyback_smartphone: {
        title: "Sell Your Smartphone",
        text: "Upgrade to the latest model by selling your old smartphone. We accept all major brands including Apple, Samsung, Xiaomi, and more. Best price guaranteed.",
        image: "/images/hero_phone_bg.webp"
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
        date: '2024-11-20',
        author: 'Belmobile Expert',
        category: 'Technical Guide',
        imageUrl: '/images/blog/iphone-screen-repair.webp'
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
        date: '2025-02-18',
        author: 'Team Rachat',
        category: 'Price Optimization',
        imageUrl: '/images/blog/sell-smartphone-money.webp'
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
        date: '2025-04-10',
        author: 'Labo Belmobile',
        category: 'Expert Maintenance',
        imageUrl: '/images/blog/iphone-battery-replacement.webp'
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
        date: '2025-06-15',
        author: 'Belmobile Security',
        category: 'Data Security',
        imageUrl: '/images/blog/data-privacy-security.webp'
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
        date: '2025-08-20',
        author: 'Belmobile Expert',
        category: 'Advanced Repair',
        imageUrl: '/images/blog/face-id-repair.webp'
    },
    {
        id: 6,
        slug: 'apple-genius-bar-vs-belmobile',
        slugs: {
            en: 'apple-genius-bar-vs-belmobile-comparison',
            fr: 'apple-genius-bar-vs-belmobile-comparaison',
            nl: 'apple-genius-bar-vs-belmobile-vergelijking'
        },
        title: 'Apple Genius Bar vs Belmobile: The Honest Comparison',
        excerpt: 'Should you go to the Apple Store or a trusted independent shop? We compare Price, Speed, and Data Privacy so you can decide.',
        content: `When your iPhone breaks, the default thought is often "I need to go to the Apple Store". But is that always the best choice? Let's look at the data.

| Feature | Apple Genius Bar | Belmobile (Independent) |
| :--- | :--- | :--- |
| **Appointment** | Often required days in advance | Walk-ins Welcome (Immediate) |
| **Repair Time** | 2-4 hours or days | 30-45 Minutes |
| **Data Policy** | Often factory resets device | **We preserve your data** |
| **Price** | Premium Pricing | **Competitive & Transaparent** |
| **Warranty** | 90 days | **1 Year Warranty** |

## The Verdict
If you are under AppleCare+, the Genius Bar is great. But for out-of-warranty repairs where you need speed and want to keep your photos, **Belmobile is the smarter choice**.`,
        date: '2025-10-05',
        author: 'Belmobile Team',
        category: 'Industry Insights',
        imageUrl: '/images/bento/business_bg.webp' // Utilizing existing asset
    },
    {
        id: 7,
        slug: 'screen-repair-vs-replacement',
        slugs: {
            en: 'screen-repair-vs-replacement-guide',
            fr: 'reparation-ecran-vs-remplacement-guide',
            nl: 'scherm-reparatie-vs-vervanging-gids'
        },
        title: 'Screen Repair vs Replacement: What You Need to Know',
        excerpt: 'Cracked glass or dead pixels? Understanding the difference between glass-only repair and full assembly replacement.',
        content: `Not all screen damage is the same. Understanding the anatomy of your screen can save you money.

## The 3 Layers of a Screen
1. **Glass**: The top layer you touch.
2. **Digitizer**: Detects your touch inputs.
3. **LCD/OLED Panel**: Displays the image.

**Scenario A: Just Cracked Glass**
If your image is perfect and touch works, you might only need a glass replacement (refurbishment). This keeps your original Apple panel!

**Scenario B: Black Lines or Bleeding**
If the image is distorted, the OLED panel is broken. You need a full assembly replacement. At Belmobile, we offer both "Original Pull" (genuine) and High-Quality aftermarket options to fit your budget.`,
        date: '2025-11-12',
        author: 'Belmobile Lab',
        category: 'Tech Education',
        imageUrl: '/images/bento/repair_bg.webp' // Utilizing existing asset
    },
    {
        id: 8,
        slug: 'can-water-damaged-phone-be-saved',
        slugs: {
            en: 'can-water-damaged-phone-be-saved-data-recovery',
            fr: 'peut-on-sauver-telephone-tombe-eau-donnees',
            nl: 'kan-waterschade-telefoon-gered-worden-data'
        },
        title: 'Dropped in Water? Can my phone be saved?',
        excerpt: 'Rice is a myth. Here is what actually happens inside a water-damaged phone and how our microsoldering experts recover your data.',
        content: `**STOP! Put the rice away.**
Putting a wet phone in rice does almost nothing to dry the internal components and the starch dust can actually harm the charging port.

## What actually happens?
Water + Electricity = Corrosion. This corrosion eats away at the microscopic connectors on your motherboard, causing short circuits.

## How we fix it (Microsoldering)
We don't just "dry" the phone. We:
1. Disassemble the entire device.
2. Clean the motherboard in an ultrasonic bath with isopropyl alcohol.
3. Use a microscope to identify and replace corroded chips (capacitors, filters, ICs).

**Success Rate**: We recover data from 90% of water-damaged devices that come to us within 48 hours. Don't wait!`,
        date: '2025-12-25',
        author: 'Microsoldering Specialist',
        category: 'Microsurgery',
        imageUrl: '/images/hero_phone_bg.webp' // Utilizing existing asset
    }
];

export const MOCK_REPAIR_PRICES: RepairPricing[] = [
    {
        id: 'sony-playstation-5-disc',
        currency: 'EUR',
        screen_generic: 0,
        screen_oled: 0,
        screen_original: 0,
        battery: 0,
        charging_port: 120, // HDMI
        camera_main: 0,
        camera_front: 0,
        back_glass: 0,
    },
    {
        id: 'sony-playstation-5', // Fallback for generic slug
        currency: 'EUR',
        screen_generic: 0,
        screen_oled: 0,
        screen_original: 0,
        battery: 0,
        charging_port: 120, // HDMI
        camera_main: 0,
        camera_front: 0,
        back_glass: 0,
    },
    {
        id: 'nintendo-new-3ds-xl',
        currency: 'EUR',
        screen_generic: 90, // From nintendo.ts
        screen_oled: 0,
        screen_original: 0,
        battery: 50,
        charging_port: 60,
        camera_main: 0,
        camera_front: 0,
        back_glass: 0,
    }
];
