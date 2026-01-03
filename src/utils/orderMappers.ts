import { Quote, RepairIssue } from '../types';
import { PdfData } from './PdfTemplates';
import { slugToDisplayName } from './slugs';

// Helper type for the TFunction (i18n)
export type TFunction = (key: string, ...args: (string | number)[]) => string;

/**
 * Pure function to calculate order totals with handling for VAT and currency math.
 * Avoids floating point errors by working with integer cents where possible for valid output.
 */
export const calculateOrderTotals = (quote: Quote): { subtotal: number; vat: number; total: number } => {
    // Base price from the quote
    let price = quote.price || 0;

    // Add courier fee if applicable (standardized to 15 EUR based on codebase analysis)
    // Note: In some parts of the code this is 15, in others 0. We standardized on 15 for 'brussels', 0 for 'bridge'.
    // However, the `quote.price` typically usually INCLUDES the courier fee if it was calculated in the Wizard.
    // To be safe and "pure", we should trust `quote.price` as the primary source if it's the final saved price.
    // If we need to recalculate, we would need the courierTier. 
    // For this mapper, we assume `quote.price` is the Source of Truth for the total.

    // If for some reason we need to break it down:
    // const courierFee = quote.deliveryMethod === 'courier' && quote.price < 100 ? 15 : 0; // Example logic, but avoiding assumptions.

    // VAT Calculation (Assuming 21% Belgian VAT included)
    // Formula: Price / 1.21 = Ex VAT
    const total = price;
    const subtotal = Math.round((total / 1.21) * 100) / 100;
    const vat = Math.round((total - subtotal) * 100) / 100;

    return {
        subtotal,
        vat,
        total
    };
};

/**
 * Maps a Firestore Quote object to the PdfData interface required for PDF generation.
 * This ensures identical PDF output regardless of where it's generated (Wizard vs Dashboard).
 */
export const mapQuoteToPdfData = (quote: Quote, t: TFunction): PdfData => {
    // 1. Method Translation
    let methodLabel: string = quote.deliveryMethod || 'dropoff';
    if (quote.deliveryMethod === 'courier') methodLabel = t('Coursier');
    else if (quote.deliveryMethod === 'dropoff') methodLabel = t('Dépôt en magasin');
    else if (quote.deliveryMethod === 'send') methodLabel = t('Envoi postal');
    else methodLabel = t(quote.deliveryMethod || '');

    // 2. Formatting Date
    let formattedDate = quote.date;
    if (quote.createdAt && quote.createdAt.seconds) {
        formattedDate = new Date(quote.createdAt.seconds * 1000).toLocaleDateString();
    }

    // 3. Customer Details
    // FIX: Fallback to 'email' if 'customerEmail' is missing (Legacy/Client Data structure)
    const email = quote.customerEmail || (quote as any).email;
    const customer = {
        name: quote.customerName || `${quote.customerFirstName || ''} ${quote.customerLastName || ''}`.trim(),
        email: email,
        phone: quote.customerPhone,
        address: quote.customerAddress ? `${quote.customerAddress}, ${quote.customerZip || ''} ${quote.customerCity || ''}` : undefined
    };

    // 4. Shop or Device Details
    const isBuyback = quote.type === 'buyback';
    const title = isBuyback ? t('pdf_label_device_details') : t('pdf_label_repair_details');

    // FIX: Use Device Name as the main header for BOTH Repair and Buyback to avoid "Réparation" appearing as the model name.
    const brandDisplay = slugToDisplayName(quote.brand || '');
    const modelDisplay = slugToDisplayName(quote.model || '');
    const name = `${brandDisplay} ${modelDisplay}`.trim(); // Previously: isBuyback ? ... : t('Réparation');

    const details: { label: string; value: string }[] = [];
    // FIX: Do NOT push 'Modèle' into details if it is already the main 'name'.
    // details.push({ label: t('Modèle'), value: `${quote.brand} ${quote.model}` }); 
    // Instead, we might want to add 'Storage' if available?
    if (quote.storage) {
        details.push({ label: t('Stockage'), value: quote.storage });
    }

    // Handle Condition (String or Object)
    if (quote.condition) {
        if (typeof quote.condition === 'string') {
            details.push({ label: t('État'), value: t(quote.condition) });
        } else {
            if (quote.condition.screen) details.push({ label: t('État Écran'), value: t(quote.condition.screen) });
            if (quote.condition.body) details.push({ label: t('État Corps'), value: t(quote.condition.body) });
        }
    }

    if (quote.issues && quote.issues.length > 0) {
        details.push({ label: t('Problèmes'), value: quote.issues.map(i => t(i)).join(', ') });
    }

    // 5. Price Breakdown
    const priceBreakdown: { label: string; price: number }[] = [];

    // Base Item
    const isRepair = quote.type === 'repair';
    const baseLabel = isBuyback ? t('Offre de Reprise') : t('Service de Réparation');

    // Logic to separate extras for display clarity
    let basePrice = quote.price || 0;

    // Reverse-engineer extras if price includes them
    // Based on pricingLogic.ts: hydrogel is +25, courier is +15
    if (isRepair) {
        if (quote.hasHydrogel) {
            basePrice -= 15;
        }
        if (quote.deliveryMethod === 'courier' && quote.courierTier === 'brussels') {
            basePrice -= 15;
        }
    }

    priceBreakdown.push({ label: baseLabel, price: Math.max(0, basePrice) });

    if (isRepair) {
        if (quote.hasHydrogel) {
            priceBreakdown.push({ label: t('Protection Hydrogel'), price: 15 });
        }
        if (quote.deliveryMethod === 'courier' && quote.courierTier === 'brussels') {
            priceBreakdown.push({ label: t('Frais de Coursier'), price: 15 });
        }
    }


    // 6. Next Steps
    const nextSteps: string[] = [];
    if (isBuyback) {
        nextSteps.push(t('success_step_backup'));
        if (quote.deliveryMethod === 'send') nextSteps.push(t('success_step_post'));
        else if (quote.deliveryMethod === 'courier') nextSteps.push(t('repair_step_courier'));
        else nextSteps.push(t('success_step_shop'));
    } else {
        nextSteps.push(t('repair_step_backup'));
        if (quote.deliveryMethod === 'send') nextSteps.push(t('repair_step_post'));
        else if (quote.deliveryMethod === 'courier') nextSteps.push(t('repair_step_courier'));
        else nextSteps.push(t('repair_step_shop'));
    }

    // 7. Footer & Extras
    const helpText = t('pdf_footer_help')
        .replace(/^besoin/i, 'Besoin')
        .replace(/appelez-nous/i, 'Appelez-nous');

    // 8. Financial Math
    const { subtotal, vat } = calculateOrderTotals(quote);

    return {
        orderId: quote.orderId || String(quote.id).toUpperCase(), // Fallback to doc ID if readable ID missing
        date: formattedDate,
        time: quote.createdAt?.seconds ? new Date(quote.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        status: t(`order_status_${quote.status || 'new'}`),
        method: methodLabel,
        type: quote.type,
        customer,
        shopOrDevice: {
            title,
            name,
            details
        },
        priceBreakdown,
        totalLabel: isBuyback ? t('Montant Total') : t('Coût Total'),
        totalPrice: quote.price || 0,
        subtotal: quote.isCompany ? subtotal : undefined,
        vatAmount: quote.isCompany ? vat : undefined,
        nextSteps,
        iban: quote.iban,
        documentTitle: quote.type === 'buyback' ? t('Buyback Offer') : (quote.type === 'repair' ? t('Repair Quote') : t('Reservation Confirmation')),
        footerHelpText: helpText,
        trackingInfo: t('pdf_tracking_info'),
        trackingUrl: quote.orderId && email
            ? `https://belmobile.be/${quote.language || 'fr'}/track-order?id=${quote.orderId}&email=${encodeURIComponent(email)}`
            : undefined,
        isCompany: quote.isCompany,
        companyName: quote.companyName,
        vatNumber: quote.vatNumber,
        labels: {
            orderId: t('pdf_label_order_id'),
            date: t('pdf_label_date'),
            time: t('pdf_label_time'),
            status: t('pdf_label_status'),
            method: t('pdf_label_method'),
            clientDetails: t('pdf_label_client_details'),
            name: t('pdf_label_name'),
            email: t('pdf_label_email'),
            phone: t('pdf_label_phone'),
            address: t('pdf_label_address'),
            companyName: t('company_name'),
            vatNumber: t('vat_number'),
            featuresSpecs: t('pdf_label_device_details'),
            shop: t('Shop'),
            model: t('Model'),
            financials: t('pdf_label_financials'),
            paymentIban: t('pdf_label_payment_iban'),
            scanToTrack: t('pdf_label_scan_to_track'),
            description: t('pdf_label_description'),
            price: t('pdf_label_price'),
            followOrder: t('pdf_label_follow_order'),
            nextSteps: t('pdf_label_next_steps'),
            page: t('pdf_label_page'),
            of: t('pdf_label_of'),
            subtotal: t('Subtotal'),
            vat: t('VAT (21%)')
        }
    };
};

/**
 * Maps a Reservation object (Refurbished Sale) to PdfData.
 */
export const mapReservationToPdfData = (res: any, t: TFunction): PdfData => {
    const customer = {
        name: res.customerName,
        email: res.customerEmail,
        phone: res.customerPhone,
        address: res.shippingAddress
    };

    const details: { label: string; value: string }[] = [];
    details.push({ label: t('Price'), value: `€${res.productPrice || 0}` });

    if (res.deliveryMethod === 'shipping') {
        details.push({ label: t('Method'), value: t('Home Delivery') });
        if (res.shippingAddress) {
            details.push({ label: t('Address'), value: res.shippingAddress });
        }
    } else {
        details.push({ label: t('Method'), value: t('In-Store Pickup') });
        details.push({ label: t('Shop'), value: res.shopName || t('Belmobile Store') });
    }

    const nextSteps: string[] = res.nextSteps || [
        t('res_step_1'),
        t('res_step_2'),
        t('res_step_3')
    ];

    return {
        orderId: res.orderId || String(res.id || '').toUpperCase(),
        date: res.date || new Date().toLocaleDateString(),
        time: res.createdAt ? (res.createdAt instanceof Date ? res.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : typeof res.createdAt === 'object' && res.createdAt.seconds ? new Date(res.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined) : undefined,
        status: t(`order_status_${res.status || 'pending'}`),
        method: res.deliveryMethod === 'shipping' ? t('Home Delivery') : t('In-Store Pickup'),
        type: 'reservation',
        customer,
        shopOrDevice: {
            title: t('pdf_label_reservation_details'),
            name: res.productName,
            details
        },
        priceBreakdown: [{ label: res.productName, price: res.productPrice || 0 }],
        totalLabel: t('Total'),
        totalPrice: res.productPrice || 0,
        nextSteps,
        documentTitle: t('Reservation Confirmation'),
        footerHelpText: t('pdf_footer_help'),
        trackingInfo: t('pdf_tracking_info'),
        trackingUrl: res.orderId && res.customerEmail
            ? `https://belmobile.be/${res.language || 'fr'}/track-order?id=${res.orderId}&email=${encodeURIComponent(res.customerEmail)}`
            : undefined,
        labels: {
            orderId: t('pdf_label_order_id'),
            date: t('pdf_label_date'),
            time: t('pdf_label_time'),
            status: t('pdf_label_status'),
            method: t('pdf_label_method'),
            clientDetails: t('pdf_label_client_details'),
            name: t('pdf_label_name'),
            email: t('pdf_label_email'),
            phone: t('pdf_label_phone'),
            address: t('pdf_label_address'),
            featuresSpecs: t('pdf_label_product_details'),
            shop: t('Shop'),
            model: t('Model'),
            financials: t('pdf_label_financials'),
            paymentIban: t('pdf_label_payment_iban'),
            scanToTrack: t('pdf_label_scan_to_track'),
            description: t('pdf_label_description'),
            price: t('pdf_label_price'),
            followOrder: t('pdf_label_follow_order'),
            nextSteps: t('pdf_label_next_steps'),
            page: t('pdf_label_page'),
            of: t('pdf_label_of'),
            subtotal: t('Subtotal'),
            vat: t('VAT (21%)')
        }
    };
};

