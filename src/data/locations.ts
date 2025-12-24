export interface Location {
    id: string;
    name: string;
    address: string;
    city: string;
    zip: string;
    phone: string;
    email: string;
    coords: {
        lat: number;
        lng: number;
    };
    openingHours: string[];
    googleMapUrl: string;
    isHub?: boolean; // True for "Brussels" city page
    photos?: string[];
    slugs: {
        fr: string;
        nl: string;
        en: string;
    };
}

export const LOCATIONS: Location[] = [
    {
        id: 'schaerbeek',
        name: 'Belmobile Liedts',
        address: 'Rue Gallait 4',
        city: 'Schaerbeek',
        zip: '1030',
        phone: '0484/83.75.60',
        email: 'schaerbeek@belmobile.be',
        coords: { lat: 50.86486, lng: 4.36704 },
        openingHours: ['Tue-Sat: 10:30 - 19:00', 'Fri: 10:30-12:30 & 14:30-19:00', 'Mon, Sun: Closed'],
        googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Belmobile+Liedts+Rue+Gallait+4+1030+Schaerbeek',
        photos: [
            '/images/franchise_hero.png',
            '/images/hero_phone_bg.png'
        ],
        slugs: {
            fr: 'schaerbeek',
            nl: 'schaarbeek',
            en: 'schaerbeek'
        }
    },
    {
        id: 'molenbeek',
        name: 'Belmobile Tour & Taxis',
        address: 'Rue Ulens 88',
        city: 'Molenbeek-Saint-Jean',
        zip: '1080',
        phone: '02/306.76.56',
        email: 'molenbeek@belmobile.be',
        coords: { lat: 50.86285, lng: 4.34240 },
        openingHours: ['Mon-Sat: 10:30 - 19:00', 'Fri: 10:30-12:30 & 14:30-19:00', 'Sun: Closed'],
        googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Belmobile+Tour+Taxis+Rue+Ulens+88+1080+Molenbeek',
        photos: [
            '/images/franchise_hero.png',
            '/images/hero_phone_bg.png'
        ],
        slugs: {
            fr: 'molenbeek',
            nl: 'molenbeek',
            en: 'molenbeek'
        }
    },
    {
        id: 'anderlecht',
        name: 'Belmobile Bara',
        address: 'Rue Lambert Crickx 12',
        city: 'Anderlecht',
        zip: '1070',
        phone: '02/275.98.67',
        email: 'anderlecht@belmobile.be',
        coords: { lat: 50.84079, lng: 4.33729 },
        openingHours: ['Mon-Sat: 10:30 - 19:00', 'Fri: 10:30-12:30 & 14:30-19:00', 'Sun: Closed'],
        googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=Belmobile+Bara+Rue+Lambert+Crickx+12+1070+Anderlecht',
        photos: [
            'https://images.unsplash.com/photo-1581092921461-eab62e97a782?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1592899671815-51527a557a7d?q=80&w=800&auto=format&fit=crop'
        ],
        slugs: {
            fr: 'anderlecht',
            nl: 'anderlecht',
            en: 'anderlecht'
        }
    },
    {
        id: 'bruxelles',
        name: 'Belmobile Bruxelles',
        address: 'Brussels Region',
        city: 'Bruxelles',
        zip: '1000',
        phone: '',
        email: 'info@belmobile.be',
        coords: { lat: 50.8503, lng: 4.3517 },
        openingHours: [],
        googleMapUrl: '',
        isHub: true,
        slugs: {
            fr: 'bruxelles',
            nl: 'brussel',
            en: 'brussels'
        }
    }
];
