import { Quote, RepairIssue } from '../types';
import { PdfData } from './PdfTemplates';

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
    const customer = {
        name: quote.customerName || `${quote.customerFirstName || ''} ${quote.customerLastName || ''}`.trim(),
        email: quote.customerEmail,
        phone: quote.customerPhone,
        address: quote.customerAddress ? `${quote.customerAddress}, ${quote.customerZip || ''} ${quote.customerCity || ''}` : undefined
    };

    // 4. Shop or Device Details
    const isBuyback = quote.type === 'buyback';
    const title = isBuyback ? t('DÉTAILS APPAREIL') : t('DÉTAILS RÉPARATION');
    const name = isBuyback ? `${quote.brand} ${quote.model}` : t('Réparation');

    const details: { label: string; value: string }[] = [];
    details.push({ label: t('Modèle'), value: `${quote.brand} ${quote.model}` });

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
    // We try to use the raw price logic if available, otherwise fallback to total
    const baseLabel = isBuyback ? t('Offre de Reprise') : t('Service de Réparation');

    // Logic to attempt to separate courier cost if obvious, primarily for display clarity
    // But ultimately trusting quote.price as total to matches persistence.
    // If delivery is courier and price seems to include it (e.g. calculated in wizard), we ideally show it.
    // Since we don't store the breakdown in Quote, we present the Total as the primary line item 
    // unless we have specific logic to reverse-engineer it. 
    // For safety/strictness, we list the full service value.
    priceBreakdown.push({ label: baseLabel, price: quote.price || 0 });


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

    return {
        orderId: quote.orderId || String(quote.id).toUpperCase(), // Fallback to doc ID if readable ID missing
        date: formattedDate,
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
        nextSteps,
        iban: quote.iban,
        footerHelpText: helpText,
        trackingInfo: t('pdf_tracking_info'),
        trackingUrl: quote.orderId && quote.customerEmail
            ? `https://belmobile.be/track-order?id=${quote.orderId}&email=${encodeURIComponent(quote.customerEmail)}`
            : undefined,
        labels: {
            orderId: t('Order ID'),
            date: t('Date'),
            method: t('Method'),
            clientDetails: t('Customer Details'),
            name: t('Name'),
            email: t('Email'),
            phone: t('Phone'),
            address: t('Address'),
            featuresSpecs: t('Device Details'),
            shop: t('Shop'),
            model: t('Model'),
            // repairDetails: t('Description'), // Not in interface
            // buybackDetails: t('Description'), // Not in interface
            // financials: t('Financials'), // Not in interface
            paymentIban: t('Payment IBAN'),
            scanToTrack: t('Scan to Track'),
            description: t('Description'),
            price: t('Price'),
            // vatIncluded: t('VAT Included'), // Not in interface
            // total: t('Total'), // Not in interface
            // subtotal: t('Subtotal'), // Not in interface
            followOrder: t('Follow Order'),
            nextSteps: t('Next Steps'),
            page: t('Page'),
            of: t('of')
        }
    };
};
