import { createPdfDefinition, PdfData } from './PdfTemplates';
import { TFunction } from './i18n-server';

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
    device: { // Added device object
        brand: string;
        model: string;
        storage?: string;
        condition?: string | { screen: string; body: string }; // Updated condition type
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
    hasHydrogel?: boolean;
    // Template fields
    priceBreakdown?: any[];
    totalLabel?: string;
    totalPrice?: number;
    nextSteps?: string[];
    footerHelpText?: string;
}

export const generateReservationPDF = async (data: ReservationData, t: TFunction) => {
    // Dynamic import for pdfmake
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const pdfMake = pdfMakeModule.default;

    // Initialize fonts with robust fallbacks for Next.js/Node/Client
    const vfs = (pdfFontsModule.default as any)?.pdfMake?.vfs
        || (pdfFontsModule as any)?.pdfMake?.vfs
        || (pdfFontsModule as any)?.vfs
        || pdfFontsModule.default
        || pdfFontsModule;

    if ((pdfMake as any).vfs === undefined && vfs) {
        (pdfMake as any).vfs = vfs;
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

export const generateRepairBuybackPDF = async (data: RepairBuybackData, t: TFunction) => {
    // Dynamic import
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const { slugToDisplayName } = await import('./slugs'); // Dynamic import for utility
    const pdfMake = pdfMakeModule.default;

    // Initialize fonts with robust fallbacks
    const vfs = (pdfFontsModule.default as any)?.pdfMake?.vfs
        || (pdfFontsModule as any)?.pdfMake?.vfs
        || (pdfFontsModule as any)?.vfs
        || pdfFontsModule.default
        || pdfFontsModule;

    if ((pdfMake as any).vfs === undefined && vfs) {
        (pdfMake as any).vfs = vfs;
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
    const breakdownItems: PriceBreakdownItem[] = [];
    let remainingPrice = data.financials.price;

    if (data.type === 'repair') {
        if (data.hasHydrogel) {
            remainingPrice -= 15;
        }

        breakdownItems.push({ label: t('Repair Cost'), price: remainingPrice });

        if (data.hasHydrogel) {
            breakdownItems.push({ label: 'Premium Hydrogel Protection', price: 15 });
        }
    } else {
        breakdownItems.push({ label: t('Estimated Value'), price: data.financials.price });
    }

    data.priceBreakdown = breakdownItems;
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
        switch (data.deliveryMethod) {
            case 'send':
                data.nextSteps = [t('step_1_buyback_send'), t('step_2_buyback_send'), t('step_3_buyback_send')];
                break;
            case 'courier':
                data.nextSteps = [t('step_1_courier'), t('step_2_courier'), t('step_3_courier_buyback')];
                break;
            case 'dropoff':
            default:
                data.nextSteps = [t('step_1_buyback_dropoff'), t('step_2_buyback_dropoff'), t('step_3_buyback_dropoff')];
                break;
        }
    } else {
        // Repair
        switch (data.deliveryMethod) {
            case 'send':
                data.nextSteps = [t('step_1_repair'), t('step_2_repair'), t('step_3_repair')];
                break;
            case 'courier':
                data.nextSteps = [t('step_1_courier'), t('step_2_courier'), t('step_3_courier_repair')];
                break;
            case 'dropoff':
            default:
                data.nextSteps = [t('step_1_repair_dropoff'), t('step_2_repair_dropoff'), t('step_3_repair_dropoff')];
                break;
        }
    }

    // Logic removed (duplicate)
    data.footerHelpText = t('footer_help_text');
    (data as any).documentTitle = data.type === 'buyback' ? t('Buyback Offer') : (data.type === 'repair' ? t('Repair Quote') : t('Reservation Confirmation'));

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

// Helper to fetch image and convert to Base64
const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
        };
        img.onerror = (error) => {
            console.warn("Failed to load logo for PDF", error);
            resolve(''); // graceful fallback (no logo)
        };
    });
};

export const generatePDFFromPdfData = async (pdfData: any, filenamePrefix: string) => {
    // 1. Fetch Logo
    let logoBase64 = '';
    try {
        // Ensure this path matches your public folder structure
        logoBase64 = await getBase64ImageFromURL('/logo.png');
    } catch (e) {
        console.warn("Logo load error", e);
    }

    // 2. Inject into Data
    if (logoBase64) {
        pdfData.logo = logoBase64;
    }

    // Dynamic import
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const pdfMake = pdfMakeModule.default;

    // Initialize fonts with robust fallbacks
    const vfs = (pdfFontsModule.default as any)?.pdfMake?.vfs
        || (pdfFontsModule as any)?.pdfMake?.vfs
        || (pdfFontsModule as any)?.vfs
        || pdfFontsModule.default
        || pdfFontsModule;

    if ((pdfMake as any).vfs === undefined && vfs) {
        (pdfMake as any).vfs = vfs;
    }

    const docDefinition = createPdfDefinition(pdfData);
    const pdfGenerator = pdfMake.createPdf(docDefinition as any);

    return new Promise<{ blob: Blob, base64: string, safeFileName: string }>((resolve, reject) => {
        pdfGenerator.getBlob((blob: Blob) => {
            pdfGenerator.getBase64((base64: string) => {
                const safeFileName = `${filenamePrefix}_${pdfData.orderId || 'Order'}.pdf`;
                resolve({ blob, base64, safeFileName });
            });
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
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 2000); // 2 second delay to ensure download starts on mobile/slow devices
};
