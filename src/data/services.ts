export interface Service {
    id: string;
    type: 'repair' | 'buyback'; // Added type property
    name: {
        fr: string;
        nl: string;
        en: string;
    };
    slugs: {
        fr: string;
        nl: string;
        en: string;
    };
    description: {
        fr: string;
        nl: string;
        en: string;
    };
}

export const SERVICES: Service[] = [
    {
        id: 'repair',
        type: 'repair',
        name: {
            fr: 'Réparation',
            nl: 'Reparatie',
            en: 'Repair'
        },
        slugs: {
            fr: 'reparation',
            nl: 'reparatie',
            en: 'repair'
        },
        description: {
            fr: 'Réparation rapide de smartphones, tablettes et consoles.',
            nl: 'Snelle reparatie van smartphones, tablets en consoles.',
            en: 'Fast repair of smartphones, tablets, and consoles.'
        }
    },
    {
        id: 'buyback',
        type: 'buyback',
        name: {
            fr: 'Rachat',
            nl: 'Inkoop',
            en: 'Buyback'
        },
        slugs: {
            fr: 'rachat',
            nl: 'inkoop',
            en: 'buyback'
        },
        description: {
            fr: 'Vendez votre appareil au meilleur prix.',
            nl: 'Verkoop uw apparaat voor de beste prijs.',
            en: 'Sell your device for the best price.'
        }
    },
    {
        id: 'products',
        type: 'buyback', // Products are sold, but for this context let's categorize or maybe we need a 'sales' type? For now 'buyback' or maybe just 'repair' as it's a service? Actually products is a separate flow. Let's stick to 'buyback' as it's sales related or maybe 'repair' if we consider it a service. Wait, the type definition says 'repair' | 'buyback'. Let's check types.ts again.
        // types.ts says: type: 'repair' | 'buyback';
        // 'products' is likely not used in the same way in BuybackRepair component.
        // Let's assume 'buyback' for now or maybe I should update types.ts to include 'sales'?
        // Given the strict type, I'll use 'buyback' for now as it's the closest "transaction" type, or 'repair' if it's a service.
        // Actually, looking at the usage, 'products' might not be passed to BuybackRepair as a type.
        // Let's check how it's used.
        // In page.tsx: const type = service.id === 'repair' ? 'repair' : 'buyback';
        // So it derives type from ID.
        // But the interface requires it.
        // I will add it as 'buyback' for now to satisfy the type, but it might not be used.
        name: {
            fr: 'Produits',
            nl: 'Producten',
            en: 'Products'
        },
        slugs: {
            fr: 'produits',
            nl: 'producten',
            en: 'products'
        },
        description: {
            fr: 'Smartphones reconditionnés et accessoires.',
            nl: 'Refurbished smartphones en accessoires.',
            en: 'Refurbished smartphones and accessories.'
        }
    }
];
