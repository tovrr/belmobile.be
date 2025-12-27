import { TDocumentDefinitions, StyleDictionary, Content } from 'pdfmake/interfaces';

// Design System - INK SAVER MODE
const COLORS = {
    Primary: '#4338ca',    // Deep Indigo - Used sparingly for accents
    Accent: '#4338ca',     // Same as primary for consistency/single ink usage
    TextDark: '#000000',   // Pure Black for max contrast
    TextGray: '#4b5563',   // Dark Gray for labels
    Border: '#d1d5db',     // Gray-300 for thin borders
    White: '#ffffff'
};

const STYLES: StyleDictionary = {
    headerTitle: {
        fontSize: 22,
        bold: true,
        color: COLORS.TextDark
    },
    headerSubtitle: {
        fontSize: 9,
        color: COLORS.TextGray,
        margin: [0, 2, 0, 0],
        characterSpacing: 1
    },
    documentTitle: {
        fontSize: 12,
        bold: true,
        color: COLORS.TextDark,
        alignment: 'right'
    },
    sectionHeader: {
        fontSize: 10,
        bold: true,
        color: COLORS.Primary, // Pop of color just on text
        margin: [0, 8, 0, 4]
    },
    label: {
        fontSize: 9,
        color: COLORS.TextGray,
        lineHeight: 1.2
    },
    value: {
        fontSize: 10,
        color: COLORS.TextDark,
        bold: false,
        lineHeight: 1.2
    },
    valueBold: {
        fontSize: 11,
        color: COLORS.TextDark,
        bold: true
    },
    tableHeader: {
        fontSize: 9,
        bold: true,
        color: COLORS.TextDark,
        // No fill color
    },
    tableCell: {
        fontSize: 10,
        color: COLORS.TextDark
    },
    totalLabel: {
        fontSize: 14,
        bold: true,
        color: COLORS.TextDark
    },
    totalValue: {
        fontSize: 16,
        bold: true,
        color: COLORS.Primary,
        alignment: 'right'
    },
    stepIndex: {
        fontSize: 12,
        bold: true,
        color: COLORS.Primary
    },
    stepText: {
        fontSize: 10,
        color: COLORS.TextDark,
        margin: [5, 1, 0, 0]
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
    documentTitle: string;
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
        financials: string; // Ensure this is present
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
        pageMargins: [30, 20, 30, 30], // More compact margins

        content: [
            // 1. Header (Clean, Text Only)
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
                        text: data.documentTitle.toUpperCase(),
                        style: 'documentTitle',
                        margin: [0, 8, 0, 0]
                    }
                ]
            } as any,

            // Single Minimal Divider
            {
                canvas: [{ type: 'line', x1: 0, y1: 5, x2: 535, y2: 5, lineWidth: 1.5, lineColor: COLORS.Primary }],
                margin: [0, 5, 0, 10]
            } as any,

            // 2. Info Box (Bordered Card, No Fill)
            {
                table: {
                    widths: ['*', '*', '*', 'auto'],
                    body: [[
                        {
                            stack: [
                                { text: data.labels.orderId, style: 'label' },
                                { text: data.orderId, style: 'valueBold' }
                            ],
                            border: [false, false, false, false]
                        },
                        {
                            stack: [
                                { text: data.labels.date, style: 'label' },
                                { text: data.date, style: 'valueBold' }
                            ],
                            border: [true, false, false, false],
                            borderColor: [COLORS.Border, '#000', '#000', '#000']
                        },
                        {
                            stack: [
                                { text: data.labels.method, style: 'label' },
                                { text: data.method, style: 'valueBold' }
                            ],
                            border: [true, false, false, false],
                            borderColor: [COLORS.Border, '#000', '#000', '#000']
                        },
                        // QR Code inside the box if exists
                        (data.trackingUrl ? {
                            stack: [
                                { qr: data.trackingUrl, fit: 40, alignment: 'right' },
                            ],
                            border: [true, false, false, false],
                            borderColor: [COLORS.Border, '#000', '#000', '#000']
                        } : { text: '', border: [false, false, false, false] })
                    ]]
                },
                layout: {
                    defaultBorder: false,
                    paddingLeft: (i: number) => i === 0 ? 0 : 10,
                    paddingRight: (i: number) => 10,
                    paddingTop: () => 5,
                    paddingBottom: () => 5
                }
            } as any,

            // 3. Main Grid (Customer | Shop/Device) - Divider Lines
            {
                columns: [
                    // Left: Customer
                    {
                        width: '*',
                        stack: [
                            {
                                stack: [
                                    { text: data.labels.clientDetails.toUpperCase(), style: 'sectionHeader', margin: [0, 10, 0, 2] },
                                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 0, 0, 10] }
                                ]
                            },
                            { text: data.labels.name, style: 'label', margin: [0, 5, 0, 0] },
                            { text: data.customer.name, style: 'value' },

                            { text: data.labels.email, style: 'label', margin: [0, 5, 0, 0] },
                            { text: data.customer.email || '-', style: 'value' },

                            { text: data.labels.phone, style: 'label', margin: [0, 5, 0, 0] },
                            { text: data.customer.phone, style: 'value' },

                            ...(data.customer.address ? [
                                { text: data.labels.address, style: 'label', margin: [0, 5, 0, 0] },
                                { text: data.customer.address, style: 'value' }
                            ] : [])
                        ]
                    },
                    // Right: Shop or Device
                    {
                        width: '*',
                        stack: [
                            {
                                stack: [
                                    { text: data.shopOrDevice.title.toUpperCase(), style: 'sectionHeader', margin: [0, 10, 0, 2] },
                                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 0, 0, 10] }
                                ]
                            },
                            // Name (Shop or Device)
                            { text: data.type === 'reservation' ? (data.labels.shop || 'Magasin') : (data.labels.model || 'Modèle'), style: 'label', margin: [0, 5, 0, 0] },
                            { text: data.shopOrDevice.name, style: 'valueBold' }, // Bold logic for device name
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
                margin: [0, 5, 0, 5]
            } as any,

            // 4. Specs (Buyback) - Kept together
            ...(data.specs ? [
                {
                    stack: [
                        {
                            stack: [
                                { text: data.labels.featuresSpecs.toUpperCase(), style: 'sectionHeader', margin: [0, 10, 0, 2] },
                                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 0, 0, 10] }
                            ]
                        },
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
                            margin: [0, 5, 0, 10]
                        }
                    ],
                    // Removed unbreakable to allow flow
                }
            ] : []),

            // 5. Financials Table - Clean Borders - Keep Header with Table
            {
                stack: [
                    {
                        stack: [
                            { text: data.labels.financials.toUpperCase(), style: 'sectionHeader', margin: [0, 10, 0, 2] },
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 0, 0, 10] }
                        ]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', 'auto'],
                            body: [
                                // Header
                                [
                                    { text: data.labels.description, style: 'tableHeader', margin: [0, 5, 0, 5], border: [false, false, false, true] },
                                    { text: data.labels.price, style: 'tableHeader', alignment: 'right', margin: [0, 5, 0, 5], border: [false, false, false, true] }
                                ],
                                // Rows
                                ...data.priceBreakdown.map(item => [
                                    { text: item.label, style: 'tableCell', margin: [0, 8, 0, 8], border: [false, false, false, true], borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border] },
                                    { text: `€${item.price.toFixed(2)}`, style: 'tableCell', alignment: 'right', margin: [0, 8, 0, 8], border: [false, false, false, true], borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border] }
                                ])
                            ]
                        },
                        layout: {
                            defaultBorder: false,
                        },
                        margin: [0, 0, 0, 10]
                    },
                    // 6. Total Box (Inside same stack to keep with table)
                    {
                        columns: [
                            { width: '*', text: '' }, // Spacer
                            {
                                width: 'auto',
                                table: {
                                    widths: [100, 100],
                                    body: [[
                                        { text: data.totalLabel, style: 'totalLabel', alignment: 'left', margin: [0, 5, 0, 5] },
                                        { text: `€${data.totalPrice.toFixed(2)}`, style: 'totalValue', alignment: 'right', margin: [0, 5, 0, 5] }
                                    ]]
                                },
                                layout: {
                                    hLineWidth: (i: number) => i === 0 ? 1 : 1, // Top and bottom heavy border
                                    vLineWidth: () => 0,
                                    hLineColor: COLORS.TextDark,
                                    paddingLeft: () => 0,
                                    paddingRight: () => 0
                                }
                            }
                        ],
                        margin: [0, 0, 0, 10]
                    }
                ],
                // Removed unbreakable to allow flow
            } as any,

            // 7. IBAN & Next Steps (Combined/Unbreakable if needed, but Steps can flow)
            {
                stack: [
                    // IBAN
                    ...(data.iban ? [
                        {
                            text: [
                                { text: data.labels.paymentIban + ': ', style: 'label' },
                                { text: data.iban, style: 'valueBold', fontFeatures: ['tnum'] }
                            ],
                            padding: 10,
                            decoration: 'underline',
                            decorationStyle: 'dotted',
                            margin: [0, 0, 0, 10]
                        }
                    ] : []),

                    // Next Steps
                    ...(data.nextSteps.length > 0 ? [
                        {
                            stack: [
                                { text: data.labels.nextSteps.toUpperCase(), style: 'sectionHeader', margin: [0, 10, 0, 2] },
                                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 0, 0, 10] }
                            ]
                        },
                        {
                            stack: data.nextSteps.map((step, index) => ({
                                columns: [
                                    { width: 25, text: `${index + 1}.`, style: 'stepIndex' },
                                    { width: '*', text: step, style: 'stepText' }
                                ],
                                margin: [0, 0, 0, 8]
                            })),
                            margin: [0, 10, 0, 20]
                        }
                    ] : [])
                ],
                // Removed unbreakable to allow flow
            } as any
        ],

        // Minimal Footer
        footer: (currentPage: number, pageCount: number) => {
            return {
                columns: [
                    { text: data.footerHelpText, style: 'label', alignment: 'left', margin: [40, 10, 0, 0], fontSize: 7 },
                    { text: `${currentPage} / ${pageCount}`, style: 'label', alignment: 'right', margin: [0, 10, 40, 0], fontSize: 7 }
                ],
                // Top border for footer
                canvas: [{ type: 'line', x1: 30, y1: 0, x2: 565, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }]
            } as any;
        },

        styles: STYLES,
        defaultStyle: {
            font: 'Roboto'
        }
    };
};
