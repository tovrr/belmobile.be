import { createPdfDefinition, PdfData } from './PdfTemplates';

// --- Interfaces ---
export interface ReservationData {
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

export interface PriceBreakdownItem {
    label: string;
    price: number;
}

export interface RepairBuybackData {
    type: 'buyback' | 'repair';
    orderId: string;
    date: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        zip: string;
    };
    device: {
        brand: string;
        model: string;
        storage?: string;
        imei?: string;
        // Fields for detailed list
        issue?: string;
        condition?: string;
    };
    financials: {
        price: number;
        currency: string;
        vatIncluded: boolean;
    };
    // Keep optional flattened fields if needed or remove them
    value?: number; // Compat
    cost?: number; // Compat

    condition?: {
        screen: string;
        body: string;
    };
    issues?: string[]; // localized issue names
    servicePoint?: string;
    trackingUrl?: string;
    shopOrDevice?: any; // New
    labels?: any; // New
    iban?: string;
    deliveryMethod?: string;
    // Template fields
    priceBreakdown?: any[];
    totalLabel?: string;
    totalPrice?: number;
    nextSteps?: string[];
    footerHelpText?: string;
}

export const generateReservationPDF = async (data: ReservationData, t: any) => {
    // Dynamic import for pdfmake
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const pdfMake = pdfMakeModule.default;

    // Initialize fonts if not already set
    if ((pdfMake as any).vfs === undefined) {
        (pdfMake as any).vfs = (pdfFontsModule.default as any).pdfMake?.vfs;
    }

    const docDefinition = {
        content: [
            { text: t('Reservation Confirmation'), style: 'header' },
            { text: `Order ID: ${data.orderId}`, style: 'subheader' },
            { text: `Date: ${data.date}`, margin: [0, 0, 0, 20] },
            {
                table: {
                    widths: ['*', '*'],
                    body: [
                        [{ text: t('Product'), bold: true }, data.productName],
                        [{ text: t('Price'), bold: true }, `${data.productPrice}€`],
                        [{ text: t('Shop'), bold: true }, data.shopName],
                        [{ text: t('Customer'), bold: true }, data.customerName],
                        [{ text: t('Phone'), bold: true }, data.customerPhone],
                    ]
                }
            }
        ],
        styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
            subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
        }
    };

    const pdfGenerator = pdfMake.createPdf(docDefinition as any);

    return new Promise<{ doc: any, pdfBase64: string, safeFileName: string, blob: Blob }>((resolve, reject) => {
        pdfGenerator.getBlob((blob: Blob) => {
            pdfGenerator.getBase64((base64: string) => {
                const safeFileName = `Reservation_${data.productName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                resolve({
                    doc: docDefinition,
                    pdfBase64: base64,
                    safeFileName,
                    blob
                });
            });
        });
    });
};

export const generateRepairBuybackPDF = async (data: RepairBuybackData, t: any) => {
    // Dynamic import
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const { slugToDisplayName } = await import('./slugs'); // Dynamic import for utility
    const pdfMake = pdfMakeModule.default;

    // Initialize fonts
    if ((pdfMake as any).vfs === undefined) {
        (pdfMake as any).vfs = (pdfFontsModule.default as any).pdfMake?.vfs;
    }

    // Populate labels using t()
    data.labels = {
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
        repairDetails: t('Description'),
        buybackDetails: t('Description'),
        financials: t('Financials'),
        paymentIban: t('Payment IBAN'),
        scanToTrack: t('Scan to Track'),
        description: t('Description'),
        price: t('Price'),
        vatIncluded: t('VAT Included'),
        total: t('Total'),
        subtotal: t('Subtotal'),
        followOrder: t('Follow Order'),
        nextSteps: t('Next Steps'),
        page: t('Page'),
        of: t('of')
    };

    // Populate required shopOrDevice object
    const modelName = data.device.model ? slugToDisplayName(data.device.model) : data.device.model;
    data.shopOrDevice = {
        title: t('Device Details'),
        name: `${data.device.brand} ${modelName}`,
        details: [
            { label: t('Storage'), value: data.device.storage || '-' },
            ...(data.type === 'buyback' && data.condition ? [
                { label: t('Condition'), value: `${t('Screen')}: ${t(data.condition.screen)}, ${t('Body')}: ${t(data.condition.body)}` }
            ] : []),
            ...(data.type === 'repair' && data.issues ? [
                { label: t('Issues'), value: (data.issues || []).map(i => t(i)).join(', ') }
            ] : [])
        ]
    };

    // Populate required fields for template
    data.priceBreakdown = [
        { label: data.type === 'buyback' ? t('Estimated Value') : t('Repair Cost'), price: data.financials.price }
    ];
    data.totalLabel = t('Total');
    data.totalPrice = data.financials.price;

    // Dynamic Next Steps & Method based on Delivery
    let methodKey = 'delivery_method_dropoff';
    if (data.deliveryMethod === 'send') methodKey = 'delivery_method_send';
    else if (data.deliveryMethod === 'courier') methodKey = 'delivery_method_courier';
    else if (data.deliveryMethod === 'dropoff') methodKey = 'delivery_method_dropoff';

    // Explicitly set the 'method' field referenced by PdfTemplates
    (data as any).method = t(methodKey);

    if (data.type === 'buyback') {
        if (data.deliveryMethod === 'send') {
            data.nextSteps = [t('step_1_buyback_send'), t('step_2_buyback_send'), t('step_3_buyback_send')]; // Need to ensure these keys exist or map to existing
        } else {
            // Drop-off / Walk-in
            data.nextSteps = [t('step_1_buyback_dropoff'), t('step_2_buyback_dropoff'), t('step_3_buyback_dropoff')];
        }
    } else {
        // Repair
        data.nextSteps = [t('step_1_repair'), t('step_2_repair'), t('step_3_repair')];
    }

    // Logic removed (duplicate)
    data.footerHelpText = t('footer_help_text');

    // Use shared template generator
    const docDefinition = createPdfDefinition(data as any);

    const pdfGenerator = pdfMake.createPdf(docDefinition as any);

    return new Promise<{ blob: Blob, base64: string }>((resolve, reject) => {
        pdfGenerator.getBlob((blob: Blob) => {
            pdfGenerator.getBase64((base64: string) => {
                resolve({ blob, base64 });
            });
        });
    });
};

export const generatePDFFromPdfData = async (pdfData: any, filenamePrefix: string) => {
    // Dynamic import
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const pdfMake = pdfMakeModule.default;

    // Initialize fonts
    if ((pdfMake as any).vfs === undefined) {
        (pdfMake as any).vfs = (pdfFontsModule.default as any).pdfMake?.vfs;
    }

    const docDefinition = createPdfDefinition(pdfData);
    const pdfGenerator = pdfMake.createPdf(docDefinition as any);

    return new Promise<{ blob: Blob, safeFileName: string }>((resolve, reject) => {
        pdfGenerator.getBlob((blob: Blob) => {
            const safeFileName = `${filenamePrefix}_${pdfData.orderId || 'Order'}.pdf`;
            resolve({ blob, safeFileName });
        });
    });
};

export const savePDFBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
