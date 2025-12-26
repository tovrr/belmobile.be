import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { createPdfDefinition, PdfData } from './PdfTemplates';

// Initialize fonts
if (typeof window !== 'undefined' && (pdfMake as any).vfs === undefined) {
    (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs;
}

// --- Interfaces ---
// (Keeping original interfaces for compatibility with callers)
interface ReservationData {
    orderId?: string;
    date?: string;
    productName: string;
    productPrice: number;
    shopName: string;
    customerName: string;
    customerPhone: string;
    deliveryMethod?: 'pickup' | 'shipping';
    shippingAddress?: string;
    nextSteps?: string[];
}

interface PriceBreakdownItem {
    label: string;
    price: number;
}

interface RepairBuybackData {
    type: 'buyback' | 'repair';
    orderId: string;
    date: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        address?: string;
    };
    device: {
        name: string;
        storage?: string;
        issue?: string;
        condition?: string;
    };
    value?: number;
    cost?: number;
    priceBreakdown?: PriceBreakdownItem[];
    specs?: {
        [key: string]: string | boolean;
    };
    perks?: string[];
    nextSteps?: string[];
    deliveryMethod?: 'dropoff' | 'send' | 'courier';
    iban?: string;
    trackingUrl?: string; // New field for QR code
}

// --- Generator Functions ---

const generatePdfBlob = async (def: any): Promise<Blob> => {
    return new Promise((resolve) => {
        const pdfGenerator = pdfMake.createPdf(def);
        pdfGenerator.getBlob((blob) => {
            resolve(blob);
        });
    });
};

const generatePdfBase64 = async (def: any): Promise<string> => {
    return new Promise((resolve) => {
        const pdfGenerator = pdfMake.createPdf(def);
        pdfGenerator.getBase64((data) => {
            resolve(data);
        });
    });
};

export const savePDFBlob = (blob: Blob, filename: string) => {
    if (typeof window === 'undefined') return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
};

export const generateReservationPDF = async (data: ReservationData, t: (key: string) => string) => {
    // 1. Transform Data
    const methodRaw = data.deliveryMethod || 'pickup';
    const methodMap: Record<string, string> = {
        'pickup': t('Dépôt en magasin'),
        'shipping': t('Envoi postal')
    };
    const methodLabel = methodMap[methodRaw] || methodRaw;

    // Capitalize Footer Help
    const helpText = t('pdf_footer_help');
    const capitalizedHelp = helpText
        .replace(/^besoin/i, 'Besoin')
        .replace(/appelez-nous/i, 'Appelez-nous');

    const pdfData: PdfData = {
        orderId: data.orderId || '-',
        date: data.date || '-',
        method: methodLabel,
        type: 'reservation',
        customer: {
            name: data.customerName,
            phone: data.customerPhone,
            address: data.deliveryMethod === 'shipping' ? data.shippingAddress : undefined
        },
        shopOrDevice: {
            title: t('pdf_shop_details'),
            name: data.shopName,
            details: [
                { label: t('Device'), value: data.productName },
                { label: t('Price'), value: `€${data.productPrice}` }
            ]
        },
        priceBreakdown: [
            { label: data.productName, price: data.productPrice }
        ],
        totalLabel: t('pdf_total_cost'),
        totalPrice: data.productPrice,
        nextSteps: data.nextSteps || [],
        footerHelpText: capitalizedHelp,
        labels: {
            orderId: t('Order ID'),
            date: t('Date'),
            method: t('Method'),
            clientDetails: t('Customer Details'),
            name: t('Name'),
            email: t('Email'),
            phone: t('Phone'),
            address: t('Address'),
            shop: t('Shop'),
            featuresSpecs: t('Features & Specs'),
            description: t('Description'),
            price: t('Price'),
            paymentIban: t('Payment IBAN'),
            followOrder: t('Track Your Order'),
            nextSteps: t('Next Steps'),
            scanToTrack: t('Scan to Track'),
            page: t('Page'),
            of: t('of')
        }
    };

    // 2. Generate
    const docDefinition = createPdfDefinition(pdfData);
    const blob = await generatePdfBlob(docDefinition);
    const pdfBase64 = await generatePdfBase64(docDefinition);
    const safeFileName = `Reservation_${data.productName.replace(/\s+/g, '_')}.pdf`;

    return { doc: null, pdfBase64, safeFileName, blob };
};


export const generateRepairBuybackPDF = async (data: RepairBuybackData, t: (key: string, ...args: (string | number)[]) => string) => {
    // 1. Transform Data
    const methodRaw = data.deliveryMethod || 'dropoff';
    let methodLabel: string = methodRaw;

    if (methodRaw === 'courier') methodLabel = t('Courier');
    else if (methodRaw === 'dropoff') methodLabel = t('Dépôt en magasin');
    else if (methodRaw === 'send') methodLabel = t('Envoi postal');
    else methodLabel = t(methodRaw);

    if (methodLabel === 'courier' || methodLabel === 'Courier') methodLabel = 'Coursier';

    // Capitalize Footer Help
    const helpText = t('pdf_footer_help');
    const capitalizedHelp = helpText
        .replace(/^besoin/i, 'Besoin')
        .replace(/appelez-nous/i, 'Appelez-nous');

    // Details List
    const deviceDetails: { label: string; value: string }[] = [];
    if (data.device.storage) deviceDetails.push({ label: t('Storage'), value: data.device.storage });
    if (data.device.condition) deviceDetails.push({ label: t('Condition'), value: data.device.condition });
    if (data.device.issue) deviceDetails.push({ label: t('Issue'), value: data.device.issue });

    // Price
    const mainCost = data.cost || data.value || 0;
    const breakdown = data.priceBreakdown && data.priceBreakdown.length > 0
        ? data.priceBreakdown
        : [{ label: data.type === 'buyback' ? t('Device Value') : t('Standard Repair'), price: mainCost }];

    const pdfData: PdfData = {
        orderId: data.orderId,
        date: data.date,
        method: methodLabel,
        type: data.type,
        customer: {
            name: data.customer.name,
            email: data.customer.email,
            phone: data.customer.phone,
            address: data.customer.address
        },
        shopOrDevice: {
            title: t('pdf_device_details'),
            name: data.device.name,
            details: deviceDetails
        },
        priceBreakdown: breakdown,
        totalLabel: data.type === 'buyback' ? t('pdf_estimated_value') : t('pdf_total_cost'),
        totalPrice: mainCost,
        nextSteps: [...(data.nextSteps || []), ...(data.perks || [])],
        specs: data.specs,
        iban: data.iban,
        footerHelpText: capitalizedHelp,
        trackingInfo: t('pdf_tracking_info'),
        trackingUrl: data.trackingUrl,
        labels: {
            orderId: t('Order ID'),
            date: t('Date'),
            method: t('Method'),
            clientDetails: t('Customer Details'),
            name: t('Name'),
            email: t('Email'),
            phone: t('Phone'),
            address: t('Address'),
            model: t('Model'),
            featuresSpecs: t('Features & Specs'),
            description: t('Description'),
            price: t('Price'),
            paymentIban: t('Payment IBAN'),
            followOrder: t('Track Your Order'),
            nextSteps: t('Next Steps'),
            scanToTrack: t('Scan to Track'),
            page: t('Page'),
            of: t('of')
        }
    };

    // 2. Generate
    const docDefinition = createPdfDefinition(pdfData);
    const blob = await generatePdfBlob(docDefinition);
    const pdfBase64 = await generatePdfBase64(docDefinition);
    const safeFileName = `${data.type === 'buyback' ? 'Buyback' : 'Repair'}_${data.orderId}.pdf`;

    return { doc: null, pdfBase64, safeFileName, blob };
};

/**
 * Generates a PDF directly from pre-processed PdfData (from mapQuoteToPdfData).
 * Skips the legacy transformation steps of generateRepairBuybackPDF.
 */
export const generatePDFFromPdfData = async (data: PdfData, filenamePrefix: string = 'Document') => {
    const docDefinition = createPdfDefinition(data);
    const blob = await generatePdfBlob(docDefinition);
    const pdfBase64 = await generatePdfBase64(docDefinition);
    const safeFileName = `${filenamePrefix}_${data.orderId || 'Download'}.pdf`;

    return { blob, pdfBase64, safeFileName };
};
