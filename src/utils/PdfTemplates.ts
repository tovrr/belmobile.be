import { TDocumentDefinitions, StyleDictionary, Content } from 'pdfmake/interfaces';

// Design System
const COLORS = {
    Primary: '#4338ca',    // Deep Indigo
    Accent: '#FFDE00',     // Yellow
    TextDark: '#111827',   // Gray-900 
    TextGray: '#6b7280',   // Gray-500
    Border: '#e5e7eb',     // Gray-200
    Background: '#f9fafb', // Gray-50
    White: '#ffffff'
};

const STYLES: StyleDictionary = {
    headerTitle: {
        fontSize: 24,
        bold: true,
        color: COLORS.TextDark
    },
    headerSubtitle: {
        fontSize: 8,
        color: COLORS.TextGray,
        margin: [0, 2, 0, 0] // Top margin for slogan
    },
    documentTitle: {
        fontSize: 14,
        bold: true,
        color: COLORS.Primary,
        alignment: 'right'
    },
    sectionHeader: {
        fontSize: 10,
        bold: true,
        color: COLORS.TextDark,
        margin: [0, 10, 0, 5]
    },
    label: {
        fontSize: 8,
        color: COLORS.TextGray
    },
    value: {
        fontSize: 9,
        color: COLORS.TextDark,
        bold: false
    },
    valueBold: {
        fontSize: 10,
        color: COLORS.TextDark,
        bold: true
    },
    tableHeader: {
        fontSize: 8,
        bold: true,
        color: COLORS.TextGray,
        fillColor: COLORS.Background
    },
    tableCell: {
        fontSize: 9,
        color: COLORS.TextDark
    },
    totalLabel: {
        fontSize: 14,
        bold: true,
        color: COLORS.Primary
    },
    totalValue: {
        fontSize: 14,
        bold: true,
        color: COLORS.Primary,
        alignment: 'right'
    }
};

// Types
export interface PdfData {
    orderId: string;
    date: string;
    method: string; // e.g., "Courier", "Store"
    type: 'reservation' | 'buyback' | 'repair';
    customer: {
        name: string;
        email?: string;
        phone: string;
        address?: string;
    };
    shopOrDevice: {
        title: string; // "Shop Details" or "Device Details"
        name: string;  // Shop Name or Device Name
        details: { label: string; value: string }[];
    };
    priceBreakdown: { label: string; price: number }[];
    totalLabel: string;
    totalPrice: number;
    nextSteps: string[];
    specs?: Record<string, string | boolean>;
    iban?: string;
    footerHelpText: string;
    trackingInfo?: string;
    trackingUrl?: string;
    labels: {
        orderId: string;
        date: string;
        method: string;
        clientDetails: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        shop?: string; // "Magasin"
        model?: string; // "Modèle"
        featuresSpecs: string;
        description: string;
        price: string;
        paymentIban: string;
        followOrder: string;
        nextSteps: string;
        scanToTrack: string;
        page: string; // "Page" (if needed, or x / y)
        of: string; // "/" or "of"
    };
}

export const createPdfDefinition = (data: PdfData): TDocumentDefinitions => {
    return {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 60], // [left, top, right, bottom]

        content: [
            // 1. Header
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            {
                                text: [
                                    { text: 'BELMOBILE', style: 'headerTitle' },
                                    { text: '.BE', style: 'headerTitle', color: COLORS.Accent }
                                ]
                            },
                            { text: 'BUYBACK & REPAIR', style: 'headerSubtitle' }
                        ]
                    },
                    {
                        width: 'auto',
                        text: data.type === 'buyback' ? 'BUYBACK OFFER' : (data.type === 'repair' ? 'REPAIR ORDER' : 'RESERVATION'),
                        style: 'documentTitle',
                        margin: [0, 10, 0, 0]
                    }
                ]
            } as any,

            // Divider Line
            {
                canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: COLORS.Primary }],
                margin: [0, 10, 0, 20]
            } as any,

            // 2. Info Bar (Order ID, Date, Method)
            {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: data.labels.orderId, style: 'label' },
                            { text: data.orderId, style: 'valueBold', margin: [0, 2, 0, 0] }
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            { text: data.labels.date, style: 'label' },
                            { text: data.date, style: 'valueBold', margin: [0, 2, 0, 0] }
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            { text: data.labels.method, style: 'label' },
                            { text: data.method, style: 'valueBold', margin: [0, 2, 0, 0] }
                        ]
                    },
                    // QR Code Column
                    ...(data.trackingUrl ? [{
                        width: 'auto',
                        stack: [
                            { qr: data.trackingUrl, fit: 45, alignment: 'right', margin: [0, -5, 0, 0] },
                            { text: data.labels.scanToTrack, style: 'label', alignment: 'right', fontSize: 6, margin: [0, 2, 0, 0] }
                        ]
                    }] as any[] : [])
                ],
                margin: [0, 0, 0, 20]
            } as any,

            // 3. Main Grid (Customer | Shop/Device)
            {
                columns: [
                    // Left: Customer
                    {
                        width: '*',
                        stack: [
                            { text: data.labels.clientDetails, style: 'sectionHeader' },
                            { text: data.labels.name, style: 'label', margin: [0, 5, 0, 0] },
                            { text: data.customer.name, style: 'value' },
                            { text: data.labels.email, style: 'label', margin: [0, 5, 0, 0] },
                            { text: data.customer.email || '-', style: 'value' },
                            { text: data.labels.phone, style: 'label', margin: [0, 5, 0, 0] },
                            { text: data.customer.phone, style: 'value' },
                            data.customer.address ? { text: data.labels.address, style: 'label', margin: [0, 5, 0, 0] } : {},
                            data.customer.address ? { text: data.customer.address, style: 'value' } : {}
                        ]
                    },
                    // Right: Shop or Device
                    {
                        width: '*',
                        stack: [
                            { text: data.shopOrDevice.title.toUpperCase(), style: 'sectionHeader' },
                            // Name (Shop or Device)
                            { text: data.type === 'reservation' ? (data.labels.shop || 'Magasin') : (data.labels.model || 'Modèle'), style: 'label', margin: [0, 5, 0, 0] },
                            { text: data.shopOrDevice.name, style: 'value' },
                            // Dynamic Details List
                            ...data.shopOrDevice.details.map(detail => ({
                                stack: [
                                    { text: detail.label, style: 'label', margin: [0, 5, 0, 0] },
                                    { text: detail.value, style: 'value' }
                                ]
                            }))
                        ]
                    }
                ],
                columnGap: 20,
                margin: [0, 0, 0, 20]
            } as any,

            // 4. Specs (Buyback)
            ...(data.specs ? [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 10, 0, 10] } as Content,
                { text: data.labels.featuresSpecs, style: 'sectionHeader' } as Content,
                {
                    columns: [
                        {
                            width: '*',
                            ul: Object.entries(data.specs)
                                .filter((_, i) => i % 2 === 0)
                                .map(([key, val]) => ({ text: [{ text: `${key}: `, style: 'label' }, { text: String(val), style: 'value' }] }))
                        },
                        {
                            width: '*',
                            ul: Object.entries(data.specs)
                                .filter((_, i) => i % 2 !== 0)
                                .map(([key, val]) => ({ text: [{ text: `${key}: `, style: 'label' }, { text: String(val), style: 'value' }] }))
                        }
                    ],
                    margin: [0, 0, 0, 20]
                } as any
            ] : []),

            // 5. Price Breakdown Table
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto'],
                    body: [
                        // Header
                        // Header
                        [
                            { text: data.labels.description, style: 'tableHeader', margin: [5, 5, 5, 5] },
                            { text: data.labels.price, style: 'tableHeader', alignment: 'right', margin: [5, 5, 5, 5] }
                        ],
                        // Rows
                        ...data.priceBreakdown.map(item => [
                            { text: item.label, style: 'tableCell', margin: [5, 5, 5, 5], border: [false, false, false, true], borderColor: ['#000', '#000', '#000', COLORS.Border] },
                            { text: `€${item.price}`, style: 'tableCell', alignment: 'right', margin: [5, 5, 5, 5], border: [false, false, false, true], borderColor: ['#000', '#000', '#000', COLORS.Border] }
                        ])
                    ]
                },
                layout: {
                    hLineWidth: (i: number) => i === 0 || i === 1 ? 0 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: COLORS.Border,
                    paddingLeft: () => 0,
                    paddingRight: () => 0
                },
                margin: [0, 20, 0, 20]
            } as any,

            // 6. Total Box (The "Perfect" Solution)
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            margin: [10, 10, 10, 10],
                            columns: [
                                { text: data.totalLabel, style: 'totalLabel', alignment: 'left' },
                                { text: `€${data.totalPrice}`, style: 'totalValue', alignment: 'right' }
                            ],
                            fillColor: '#ffffff'
                        }
                    ]]
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: COLORS.Border,
                    vLineColor: COLORS.Border
                },
                margin: [0, 0, 0, 20]
            } as any,

            // 7. IBAN (Buyback)
            ...(data.iban ? [
                {
                    table: {
                        widths: ['*'],
                        body: [[{
                            text: [
                                { text: data.labels.paymentIban + ': ', style: 'label' },
                                { text: data.iban, style: 'valueBold' }
                            ],
                            margin: [10, 10, 10, 10]
                        }]]
                    },
                    layout: {
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: COLORS.Border,
                        vLineColor: COLORS.Border,
                        defaultBorder: true
                    },
                    margin: [0, 0, 0, 20]
                } as any
            ] : []),

            // 8. Tracking Info
            ...(data.trackingInfo ? [
                {
                    stack: [
                        { text: data.labels.followOrder, style: 'sectionHeader' },
                        { text: data.trackingInfo, style: 'value' }
                    ],
                    margin: [0, 0, 0, 20]
                } as Content
            ] : []),

            // 9. Next Steps
            ...(data.nextSteps.length > 0 ? [
                { text: data.labels.nextSteps, style: 'sectionHeader' } as Content,
                {
                    ol: data.nextSteps.map(step => ({ text: step, style: 'value', margin: [0, 0, 0, 5] })),
                    margin: [0, 0, 0, 20]
                } as Content
            ] : [])
        ],

        // Footer
        footer: (currentPage: number, pageCount: number) => {
            return {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: data.footerHelpText, style: 'label', alignment: 'center', margin: [0, 0, 0, 2] },
                            { text: 'Belmobile.be - Rue Gallait 4, 1030 Schaerbeek - BE0502.737.241', style: 'label', alignment: 'center' },
                            { text: `${currentPage} / ${pageCount}`, style: 'label', alignment: 'right', margin: [0, 5, 20, 0] }
                        ]
                    }
                ],
                margin: [0, 10, 0, 0]
            } as any;
        },

        styles: STYLES,
        defaultStyle: {
            font: 'Roboto' // PDFMake default
        }
    };
};
