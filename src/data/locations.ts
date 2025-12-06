export interface Location {
    id: string;
    name: string;
    address: string;
    city: string;
    zip: string;
    phone: string;
    email: string;
    coordinates: {
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
        name: 'Belmobile Schaerbeek',
        address: 'Chaussée de Haecht 123', // Placeholder, user to confirm
        city: 'Schaerbeek',
        zip: '1030',
        phone: '+32 2 123 45 67',
        email: 'schaerbeek@belmobile.be',
        coordinates: { lat: 50.8676, lng: 4.3737 },
        openingHours: ['Mon-Sat: 10:00 - 19:00', 'Sun: Closed'],
        googleMapUrl: 'https://goo.gl/maps/placeholder',
        photos: [
            'https://images.unsplash.com/photo-1581092921461-eab62e97a782?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1592899671815-51527a557a7d?q=80&w=800&auto=format&fit=crop'
        ],
        slugs: {
            fr: 'schaerbeek',
            nl: 'schaarbeek',
            en: 'schaerbeek'
        }
    },
    {
        id: 'molenbeek',
        name: 'Belmobile Molenbeek',
        address: 'Chaussée de Gand 456', // Placeholder
        city: 'Molenbeek-Saint-Jean',
        zip: '1080',
        phone: '+32 2 123 45 68',
        email: 'molenbeek@belmobile.be',
        coordinates: { lat: 50.8546, lng: 4.3237 },
        openingHours: ['Mon-Sat: 10:00 - 19:00', 'Sun: Closed'],
        googleMapUrl: 'https://goo.gl/maps/placeholder',
        photos: [
            'https://images.unsplash.com/photo-1581092921461-eab62e97a782?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1592899671815-51527a557a7d?q=80&w=800&auto=format&fit=crop'
        ],
        slugs: {
            fr: 'molenbeek',
            nl: 'molenbeek',
            en: 'molenbeek'
        }
    },
    {
        id: 'anderlecht',
        name: 'Belmobile Anderlecht',
        address: 'Chaussée de Mons 789', // Placeholder
        city: 'Anderlecht',
        zip: '1070',
        phone: '+32 2 123 45 69',
        email: 'anderlecht@belmobile.be',
        coordinates: { lat: 50.8390, lng: 4.3128 },
        openingHours: ['Mon-Sat: 10:00 - 19:00', 'Sun: Closed'],
        googleMapUrl: 'https://goo.gl/maps/placeholder',
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
        phone: '+32 2 000 00 00',
        email: 'info@belmobile.be',
        coordinates: { lat: 50.8503, lng: 4.3517 },
        openingHours: ['Mon-Sat: 10:00 - 19:00'],
        googleMapUrl: '',
        isHub: true,
        slugs: {
            fr: 'bruxelles',
            nl: 'brussel',
            en: 'brussels'
        }
    }
];
