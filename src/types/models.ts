
// -- Core Entities --

export interface Shop {
    id: number | string;
    name: string;
    slugs: { [lang: string]: string };
    address: string;
    city?: string;
    zip?: string;
    phone: string;
    email: string;
    openingHours: string[];
    coords: { lat: number; lng: number };
    slug?: string; // Original URL slug (legacy or primary)
    status: 'open' | 'closed' | 'coming_soon' | 'temporarily_closed' | 'coming soon' | 'temporarily closed';
    isHub?: boolean;
    isPrimary?: boolean;
    badge?: string;
    googleMapUrl?: string;
    googlePlaceId?: string;
    googleReviewUrl?: string;
    description?: string;
    photos?: string[];
    services?: string[];
    rating?: number;
    reviewCount?: number;
}

export interface Product {
    id: number | string;
    name: string;
    name_fr?: string;
    name_nl?: string;
    description: string;
    description_fr?: string;
    description_nl?: string;
    price: number;
    imageUrl: string;
    altText?: string;
    altText_fr?: string;
    altText_nl?: string;
    category?: string;
    brand?: string;
    condition?: 'perfect' | 'very_good' | 'good';
    capacity?: string; // Single capacity for this specific SKU
    color?: string; // Single color for this specific SKU
    slug: string;
    availability: { [shopId: string]: number };
}

export interface Service {
    id: number | string;
    name: string;
    type: 'repair' | 'buyback';
    description: string;
    price?: number;
}

export interface BlogPost {
    id: number | string;
    slug: string; // Default slug (usually FR or primary)
    slugs?: { [lang: string]: string }; // Localized slugs
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    imageUrl: string;
    category: string;
}

export interface Review {
    id: number | string;
    customerName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    platform: 'Google' | 'Website';
}

// -- Orders & Quotes --

export type OrderStatus =
    | 'draft'               // User is filling wizard
    | 'new'                 // (Legacy) Initial state
    | 'pending_drop'        // Wizard complete, waiting for drop-off/shipping
    | 'received'            // Device scanned at Shop or Courier Hub
    | 'in_diagnostic'       // Technician verifying device
    | 'waiting_parts'       // Repair paused for parts
    | 'verified'            // Quote confirmed / Repair diagnosed
    | 'payment_queued'      // (Buyback) Payment approved, pending transfer
    | 'invoiced'            // (Repair) Invoice sent to customer
    | 'paid'                // (Repair) Customer paid / (Buyback) Money sent
    | 'in_repair'           // (Repair) Active work
    | 'ready'               // Ready for pickup / shipping
    | 'shipped'             // Handed to courier
    | 'completed'           // Customer has device / Money received
    | 'cancelled'           // Order killed
    | 'issue'               // Problem (blocked)
    // Legacy support (to be migrated)
    | 'processing' | 'holding' | 'repaired' | 'responded' | 'inspected' | 'payment_sent' | 'closed';

export interface Reservation {
    id: number | string;
    productId: number | string;
    productName: string;
    productPrice: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shopId: number | string;
    status: 'pending' | 'approved' | 'ready' | 'completed' | 'cancelled';
    date: string;
    deliveryMethod?: 'pickup' | 'shipping';
    shippingAddress?: string;
    shippingCity?: string;
    shippingZip?: string;
    estimatedPrice?: number;
    createdAt?: { seconds: number; nanoseconds: number } | Date | string;
    isPaid?: boolean;
    language?: string;
    paymentLink?: string;
    paymentReceiptUrl?: string;
    orderId?: string;
    isCompany?: boolean;
    companyName?: string;
    vatNumber?: string;
}

export interface ActivityLogEntry {
    timestamp: string; // ISO String
    adminId: string;
    adminName?: string; // Optional for display
    action: string; // "status_change", "price_change", "note_added"
    field?: string;
    oldValue?: any;
    newValue?: any;
    note?: string;
}

export interface Quote {
    id: number | string;
    type: 'buyback' | 'repair';
    deviceType: string;
    brand: string;
    model: string;
    condition: string | { screen: string; body: string };
    storage?: string; // Explicit storage for buyback
    issue?: string; // Legacy
    issues?: string[]; // New array format
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    customerCity?: string;
    customerZip?: string;
    customerStreet?: string;
    customerHouseNumber?: string;
    customerFirstName?: string;
    customerLastName?: string;
    phoneNumber?: string;
    deliveryMethod?: 'dropoff' | 'send' | 'courier';
    iban?: string;
    idUrl?: string;
    shopId: number | string;
    status: OrderStatus;
    date: string;
    createdAt?: { seconds: number; nanoseconds: number }; // Firestore Timestamp
    orderId?: string; // Readable ID (ORD-...)
    photoUrl?: string;
    price?: number;
    initialPrice?: number; // Stored price at creation to detect changes
    isOfferAccepted?: boolean; // For buybacks when price is adjusted
    isPaid?: boolean;
    paymentLink?: string;
    paymentReceiptUrl?: string;
    language?: string; // stored language for email notifications
    trackingNumber?: string;
    shippingLabelUrl?: string;
    internalNotes?: string;
    activityLog?: ActivityLogEntry[];
    hasHydrogel?: boolean;
    courierTier?: 'bridge' | 'brussels';
    trackingToken?: string;
    originPartnerId?: string;
    // Specs for buyback refinement
    turnsOn?: boolean | null;
    worksCorrectly?: boolean | null;
    isUnlocked?: boolean | null;
    batteryHealth?: 'normal' | 'service' | null;
    faceIdWorking?: boolean | null;
    isCompany?: boolean;
    companyName?: string;
    vatNumber?: string;
    notificationPreferences?: ('email' | 'whatsapp' | 'sms')[];
    isWalkIn?: boolean;
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    attachmentUrl?: string;
    status: 'new' | 'read' | 'replied';
    date: string;
    createdAt: string;
}

export interface FranchiseApplication {
    id: number | string;
    name: string;
    email: string;
    phone: string;
    locationPreference: string;
    investmentCapacity: string;
    background: string;
    status: 'new' | 'reviewing' | 'approved' | 'rejected';
    date: string;
    documentUrl?: string; // Optional link to an uploaded CV or business plan
}

// -- Pricing Models --

export interface RepairIssue {
    id: string;
    label: string;
    description?: string;
    base: number;
    devices: string[];
    brands?: string[];
    iconType: 'heroicon' | 'url';
    icon: string;
}

// Legacy repair pricing - likely to be phased out but kept for compatibility
export interface RepairPricing {
    id: string; // model slug
    screen_generic?: number;
    screen_oled?: number;
    screen_original?: number;
    [key: string]: number | string | boolean | undefined; // Allow dynamic issue keys
}

// --- NEW ARCHITECTURE TYPES ---

export interface RepairDimension {
    key: string; // e.g., 'quality', 'position'
    label: string; // e.g., 'Quality', 'Position'
    options: string[]; // e.g., ['Generic', 'OLED', 'Original'], ['Top', 'Bottom']
}

export interface RepairIssueDefinition {
    id: string; // e.g., 'screen'
    label: string; // e.g., 'Screen Replacement'
    icon: string; // HeroIcon name
    description?: string;
    basePrice?: number; // Default base price
    defaultDimensions?: RepairDimension[]; // Default variations (can be overridden by device)
    brands?: string[]; // Optional: Restrict to specific brands (e.g. ['Apple'])
    devices?: string[]; // Optional: Restrict to specific device types (e.g. ['smartphone', 'tablet'])
}

export interface DeviceCategoryDefinition {
    id: string; // e.g., 'smartphone', 'console_portable'
    label: string;
    supportedIssues: string[]; // IDs of issues supported by this category
    issueOverrides?: {
        [issueId: string]: {
            dimensions?: RepairDimension[]; // Override dimensions for this category
        }
    };
}

export interface GlobalRepairSettings {
    issues: Record<string, RepairIssueDefinition>; // Map of all possible issues
    categories: Record<string, DeviceCategoryDefinition>; // Map of device categories
}

// The stored pricing record in Firestore 'repair_pricing_v2'
export interface RepairPriceRecord {
    id?: string;
    deviceId: string;
    issueId: string;
    variants?: Record<string, string>; // e.g. { color: 'black', quality: 'original' }
    price: number;
    currency: string;
    partCost?: number; // Part cost (Expert Mode)
    laborMinutes?: number; // Labor time (Expert Mode)
    isActive: boolean;
    isManual?: boolean; // Manual edit flag for priority boost
    migrationSource?: string; // Original legacy doc ID
    updatedAt: string;
}

// -- Buyback Types --
export type BuybackCondition = 'new' | 'like-new' | 'good' | 'fair' | 'damaged';

export interface BuybackPriceRecord {
    id?: string;
    deviceId: string; // "apple-iphone-13"
    storage: string; // "128gb", "256gb"
    condition: BuybackCondition;
    price: number; // The offer price we give to the customer
    brand?: string;
    model?: string;
    marketValue?: number; // The "Like New" Resale Value used for calculation
    currency: string;
    updatedAt: string;
}

// -- Product (Sales) Types --
export type ProductCondition = 'new' | 'like-new' | 'good' | 'fair';

export interface ProductPriceRecord {
    id?: string;
    deviceId: string;
    storage: string;
    condition: ProductCondition;
    price: number; // Selling price
    currency: string;
    updatedAt: string;
}

// -- Webhooks & External APIs --

export interface DraftLead {
    id?: string;
    email: string;
    wizardState: any; // We'll store a serializable version of WizardState
    status: 'draft' | 'converted' | 'recovered' | 'expired';
    magicLinkToken?: string;
    language: string;
    name?: string;
    phone?: string;
    type?: 'buyback' | 'repair';
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
    recoveredAt?: any; // Firestore Timestamp
    expiresAt: any; // Firestore Timestamp
}

export interface SendCloudParcel {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    email: string;
    telephone: string;
    request_label: boolean;
    to_service_point?: number | null;
}

export interface BrevoEmailPayload {
    sender: { name: string; email: string };
    to: { email: string }[];
    subject: string;
    htmlContent: string;
    attachment?: { name: string; content: string }[];
}
