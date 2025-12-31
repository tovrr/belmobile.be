import { z } from 'zod';

export const ShopStatusSchema = z.enum(['open', 'closed', 'coming_soon', 'temporarily_closed', 'coming soon', 'temporarily closed']);

export const ShopSchema = z.object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    address: z.string(),
    city: z.string().optional(),
    zip: z.string().optional(),
    phone: z.string().optional().default(''),
    email: z.string().email().or(z.string().length(0)).optional().default(''),
    coords: z.object({
        lat: z.number(),
        lng: z.number()
    }),
    openingHours: z.array(z.string()).optional().default([]),
    hours: z.union([z.string(), z.array(z.string())]).optional(), // DB compatibility
    status: ShopStatusSchema.optional().default('open'),
    isHub: z.boolean().optional().default(false),
    isPrimary: z.boolean().optional().default(false),
    slugs: z.record(z.string()).optional(),
    badge: z.string().optional(),
    googleMapUrl: z.string().optional(),
    googlePlaceId: z.string().optional(),
    googleReviewUrl: z.string().optional()
});

export const OrderSubmissionSchema = z.object({
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    customerPhone: z.string().min(8),
    customerAddress: z.string().nullable().optional(),
    customerCity: z.string().nullable().optional(),
    customerZip: z.string().nullable().optional(),
    brand: z.string(),
    model: z.string(),
    type: z.enum(['buyback', 'repair', 'reservation']), // Added reservation
    price: z.number(),
    condition: z.union([
        z.string(),
        z.object({
            screen: z.string(),
            body: z.string()
        })
    ]).nullable().optional(),
    issues: z.array(z.string()).nullable().optional(),
    deliveryMethod: z.string().nullable().optional(),
    iban: z.string().nullable().optional(),
    language: z.string().default('en'),
    storage: z.string().optional(),
    hasHydrogel: z.boolean().optional(),
    courierTier: z.enum(['bridge', 'brussels']).optional(),
    isCompany: z.boolean().optional(),
    companyName: z.string().optional(),
    vatNumber: z.string().optional(),
    // Firebase Internal
    idUrl: z.string().optional(),
    shippingLabelUrl: z.string().optional(),
    trackingNumber: z.string().optional(),
    orderId: z.string().optional(),
    status: z.string().optional(),
    date: z.string().optional()
}).refine(
    (data) => {
        // If isCompany is true, companyName and vatNumber must be provided
        if (data.isCompany) {
            return !!data.companyName && !!data.vatNumber;
        }
        return true;
    },
    {
        message: "Company name and VAT number are required for B2B orders",
        path: ["isCompany"]
    }
);

export type ValidatedShop = z.infer<typeof ShopSchema>;
export type ValidatedOrder = z.infer<typeof OrderSubmissionSchema>;
