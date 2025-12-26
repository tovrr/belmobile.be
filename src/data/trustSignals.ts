export interface TrustSignal {
    id: string;
    icon: string; // HeroIcon name
    titleKey: string;
    descriptionKey: string;
    condition?: (context: SignalContext) => boolean;
}

export interface SignalContext {
    type: 'buyback' | 'repair';
    brand?: string;
    model?: string;
    price?: number;
}

export const TRUST_SIGNALS: TrustSignal[] = [
    // --- APPLE SPECIFIC ---
    {
        id: 'apple_certified',
        icon: 'CheckBadgeIcon',
        titleKey: 'trust_apple_certified_title',
        descriptionKey: 'trust_apple_certified_desc',
        condition: (ctx) => ctx.brand?.toLowerCase() === 'apple' && ctx.type === 'repair'
    },
    {
        id: 'apple_parts',
        icon: 'WrenchScrewdriverIcon',
        titleKey: 'trust_apple_parts_title',
        descriptionKey: 'trust_apple_parts_desc',
        condition: (ctx) => ctx.brand?.toLowerCase() === 'apple' && ctx.type === 'repair'
    },
    // --- SAMSUNG SPECIFIC ---
    {
        id: 'samsung_waterproof',
        icon: 'ShieldCheckIcon',
        titleKey: 'trust_samsung_waterproof_title',
        descriptionKey: 'trust_samsung_waterproof_desc',
        condition: (ctx) => ctx.brand?.toLowerCase() === 'samsung' && ctx.type === 'repair'
    },
    // --- BUYBACK SPECIFIC ---
    {
        id: 'buyback_gdpr',
        icon: 'ShieldCheckIcon',
        titleKey: 'trust_gdpr_title',
        descriptionKey: 'trust_gdpr_desc',
        condition: (ctx) => ctx.type === 'buyback'
    },
    {
        id: 'buyback_payment',
        icon: 'BanknotesIcon',
        titleKey: 'trust_payment_title',
        descriptionKey: 'trust_payment_desc',
        condition: (ctx) => ctx.type === 'buyback'
    },
    // --- GENERAL REPAIR ---
    {
        id: 'repair_warranty',
        icon: 'CheckBadgeIcon',
        titleKey: 'trust_warranty_title',
        descriptionKey: 'trust_warranty_desc',
        condition: (ctx) => ctx.type === 'repair' && ctx.brand?.toLowerCase() !== 'apple'
    }
];
