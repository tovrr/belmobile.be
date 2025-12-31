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
        fontSize: 18,
        bold: true,
        color: COLORS.TextDark
    },
    headerSubtitle: {
        fontSize: 7,
        color: COLORS.TextGray,
        margin: [0, 1, 0, 0],
        characterSpacing: 0.8
    },
    documentTitle: {
        fontSize: 10,
        bold: true,
        color: COLORS.TextDark,
        alignment: 'right'
    },
    sectionHeader: {
        fontSize: 8,
        bold: true,
        color: COLORS.Primary,
        margin: [0, 4, 0, 2]
    },
    label: {
        fontSize: 7,
        color: COLORS.TextGray,
        lineHeight: 1.1
    },
    value: {
        fontSize: 8,
        color: COLORS.TextDark,
        bold: false,
        lineHeight: 1.1
    },
    valueBold: {
        fontSize: 9,
        color: COLORS.TextDark,
        bold: true
    },
    tableHeader: {
        fontSize: 7,
        bold: true,
        color: COLORS.TextDark
    },
    tableCell: {
        fontSize: 8,
        color: COLORS.TextDark
    },
    totalLabel: {
        fontSize: 11,
        bold: true,
        color: COLORS.TextDark
    },
    totalValue: {
        fontSize: 13,
        bold: true,
        color: COLORS.Primary,
        alignment: 'right'
    },
    stepIndex: {
        fontSize: 9,
        bold: true,
        color: COLORS.Primary
    },
    stepText: {
        fontSize: 8,
        color: COLORS.TextDark,
        margin: [4, 0, 0, 0]
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
    isCompany?: boolean;
    companyName?: string;
    vatNumber?: string;
    subtotal?: number;
    vatAmount?: number;
    labels: {
        orderId: string;
        date: string;
        method: string;
        clientDetails: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        companyName?: string;
        vatNumber?: string;
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
        subtotal: string;
        vat: string;
    };
    signatureBlock?: {
        customerLabel: string;
        shopLabel: string;
    };
    legalDisclaimer?: string;
}

export const createPdfDefinition = (data: PdfData): TDocumentDefinitions => {
    return {
        pageSize: 'A4',
        pageMargins: [25, 15, 25, 15], // Standardized margins

        content: [
            // ... (Existing content structure) ...
            // 1. Header (Logo Left, QR + Title Right)
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
                        stack: [
                            // QR Code Priority
                            ...(data.trackingUrl ? [{
                                qr: data.trackingUrl,
                                fit: 50,
                                alignment: 'right',
                                margin: [0, 0, 0, 4]
                            }] : []),
                            {
                                text: data.documentTitle.toUpperCase(),
                                style: 'documentTitle'
                            }
                        ]
                    }
                ],
                margin: [0, 0, 0, 10]
            } as any,

            // Divider
            {
                canvas: [{ type: 'line', x1: 0, y1: 0, x2: 545, y2: 0, lineWidth: 1, lineColor: COLORS.Primary }],
                margin: [0, 0, 0, 10]
            } as any,

            // 2. Info Box (3 Columns - Clean)
            {
                table: {
                    widths: ['34%', '33%', '33%'], // Balanced widths
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
                        }
                    ]]
                },
                layout: {
                    defaultBorder: false,
                    paddingLeft: (i: number) => i === 0 ? 0 : 10,
                    paddingRight: (i: number) => 10,
                    paddingTop: () => 0,
                    paddingBottom: () => 0
                },
                margin: [0, 0, 0, 15]
            } as any,

            // 3. Main Grid (Table Implementation for Strict Alignment)
            {
                unbreakable: true,
                table: {
                    widths: ['48%', '4%', '48%'], // Left, Gutter, Right
                    body: [
                        [
                            // Left Column: Customer
                            {
                                stack: [
                                    {
                                        stack: [
                                            { text: data.labels.clientDetails.toUpperCase(), style: 'sectionHeader', margin: [0, 0, 0, 2] },
                                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 0, 0, 6] }
                                        ]
                                    },
                                    { text: data.labels.name, style: 'label' },
                                    { text: data.customer.name, style: 'value', margin: [0, 0, 0, 4] },

                                    { text: data.labels.email, style: 'label' },
                                    { text: data.customer.email || '-', style: 'value', margin: [0, 0, 0, 4] },

                                    { text: data.labels.phone, style: 'label' },
                                    { text: data.customer.phone, style: 'value', margin: [0, 0, 0, 4] },

                                    ...(data.isCompany ? [
                                        { text: data.labels.companyName, style: 'label' },
                                        { text: data.companyName || '-', style: 'valueBold', margin: [0, 0, 0, 4] },
                                        { text: data.labels.vatNumber, style: 'label' },
                                        { text: data.vatNumber || '-', style: 'value', fontFeatures: ['tnum'], margin: [0, 0, 0, 4] }
                                    ] : []),

                                    ...(data.customer.address ? [
                                        { text: data.labels.address, style: 'label' },
                                        { text: data.customer.address, style: 'value', margin: [0, 0, 0, 4] }
                                    ] : [])
                                ],
                                border: [false, false, false, false]
                            },
                            // Gutter (Empty)
                            { text: '', border: [false, false, false, false] },
                            // Right Column: Shop/Device
                            {
                                stack: [
                                    {
                                        stack: [
                                            { text: data.shopOrDevice.title.toUpperCase(), style: 'sectionHeader', margin: [0, 0, 0, 2] },
                                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 0, 0, 6] }
                                        ]
                                    },
                                    { text: data.type === 'reservation' ? (data.labels.shop || 'Magasin') : (data.labels.model || 'Modèle'), style: 'label' },
                                    { text: data.shopOrDevice.name, style: 'valueBold', margin: [0, 0, 0, 4] },

                                    ...data.shopOrDevice.details.map(detail => ({
                                        stack: [
                                            { text: detail.label, style: 'label' },
                                            { text: detail.value, style: 'value', margin: [0, 0, 0, 4] }
                                        ]
                                    }))
                                ],
                                border: [false, false, false, false]
                            }
                        ]
                    ]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 15]
            } as any,

            // 4. Specs (Buyback)
            ...(data.specs ? [
                {
                    unbreakable: true,
                    stack: [
                        {
                            stack: [
                                { text: data.labels.featuresSpecs.toUpperCase(), style: 'sectionHeader', margin: [0, 3, 0, 1] },
                                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 545, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 0, 0, 3] }
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
                            margin: [0, 2, 0, 4]
                        }
                    ],
                }
            ] : []),

            // 5. Financials Table - Clean Borders - Keep Header with Table
            {
                unbreakable: true,
                stack: [
                    {
                        stack: [
                            { text: data.labels.financials.toUpperCase(), style: 'sectionHeader', margin: [0, 6, 0, 2] },
                            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 0, 0, 6] }
                        ]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['*', 'auto'],
                            body: [
                                // Header
                                [
                                    { text: data.labels.description, style: 'tableHeader', margin: [0, 3, 0, 3], border: [false, false, false, true] },
                                    { text: data.labels.price, style: 'tableHeader', alignment: 'right', margin: [0, 3, 0, 3], border: [false, false, false, true] }
                                ],
                                // Rows
                                ...data.priceBreakdown.map(item => [
                                    { text: item.label, style: 'tableCell', margin: [0, 3, 0, 3], border: [false, false, false, true], borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border] },
                                    { text: `€${item.price.toFixed(2)}`, style: 'tableCell', alignment: 'right', margin: [0, 3, 0, 3], border: [false, false, false, true], borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border] }
                                ])
                            ]
                        },
                        layout: {
                            defaultBorder: false,
                        },
                        margin: [0, 0, 0, 4]
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
                                        { text: data.totalLabel, style: 'totalLabel', alignment: 'left', margin: [0, 4, 0, 4] },
                                        { text: `€${data.totalPrice.toFixed(2)}`, style: 'totalValue', alignment: 'right', margin: [0, 4, 0, 4] }
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
                        margin: [0, 0, 0, 4]
                    },
                    // Optional VAT Breakdown for B2B
                    ...(data.isCompany && data.subtotal !== undefined && data.vatAmount !== undefined ? [
                        {
                            columns: [
                                { width: '*', text: '' },
                                {
                                    width: 'auto',
                                    stack: [
                                        {
                                            columns: [
                                                { text: data.labels.subtotal, style: 'label', width: 100 },
                                                { text: `€${data.subtotal.toFixed(2)}`, style: 'value', width: 100, alignment: 'right' }
                                            ]
                                        },
                                        {
                                            columns: [
                                                { text: data.labels.vat, style: 'label', width: 100 },
                                                { text: `€${data.vatAmount.toFixed(2)}`, style: 'value', width: 100, alignment: 'right' }
                                            ],
                                            margin: [0, 2, 0, 0]
                                        }
                                    ],
                                    margin: [0, 5, 0, 0]
                                }
                            ]
                        }
                    ] : [])
                ],
            } as any,

            // 7. IBAN & Next Steps (Combined/Unbreakable if needed, but Steps can flow)
            {
                unbreakable: true, // Keep steps together to avoid orphans
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
                                { text: data.labels.nextSteps.toUpperCase(), style: 'sectionHeader', margin: [0, 4, 0, 1] },
                                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 545, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 0, 0, 4] }
                            ]
                        },
                        {
                            stack: data.nextSteps.map((step, index) => ({
                                columns: [
                                    { width: 20, text: `${index + 1}.`, style: 'stepIndex' },
                                    { width: '*', text: step, style: 'stepText' }
                                ],
                                margin: [0, 0, 0, 4]
                            })),
                            margin: [0, 4, 0, 8]
                        }
                    ] : [])
                ],
            } as any,

            // 8. Signature Block & Legal Disclaimer (Walk-in Receipt Mode)
            ...(data.signatureBlock ? [
                {
                    unbreakable: true,
                    stack: [
                        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 545, y2: 0, lineWidth: 1, lineColor: COLORS.Border, dash: { length: 5 } }], margin: [0, 20, 0, 15] },
                        {
                            table: {
                                widths: ['45%', '10%', '45%'],
                                body: [[
                                    {
                                        stack: [
                                            { text: data.signatureBlock.customerLabel, style: 'sectionHeader', alignment: 'center', margin: [0, 0, 0, 40] },
                                            { text: '(Sign Here)', style: 'label', alignment: 'center', color: '#9ca3af' }
                                        ],
                                        border: [true, true, true, true],
                                        borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border]
                                    },
                                    { text: '', border: [false, false, false, false] },
                                    {
                                        stack: [
                                            { text: data.signatureBlock.shopLabel, style: 'sectionHeader', alignment: 'center', margin: [0, 0, 0, 40] },
                                            { text: '(Stamp & Sign)', style: 'label', alignment: 'center', color: '#9ca3af' }
                                        ],
                                        border: [true, true, true, true],
                                        borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border]
                                    }
                                ]]
                            },
                            layout: {
                                defaultBorder: false,
                                paddingLeft: () => 5,
                                paddingRight: () => 5,
                                paddingTop: () => 10,
                                paddingBottom: () => 10
                            }
                        }
                    ],
                    margin: [0, 10, 0, 10]
                }
            ] : []),

            ...(data.legalDisclaimer ? [
                {
                    text: data.legalDisclaimer,
                    style: 'label',
                    italics: true,
                    color: '#6b7280',
                    margin: [0, 10, 0, 0],
                    alignment: 'justify',
                    fontSize: 6
                }
            ] : [])
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
