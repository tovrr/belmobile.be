import { TDocumentDefinitions, StyleDictionary, Content, Margins, Column } from 'pdfmake/interfaces';

/**
 * 🏛️ AEGIS PDF ENGINE V2 - MODULAR ARCHITECTURE
 * Blueprint: docs/PDF_MASTER_PROMPT.md
 * Purpose: Professional, institutional, 1-page optimized documents.
 */

// --- 1. DESIGN SYSTEM ---
const COLORS = {
    Primary: '#4338ca',    // AEGIS Indigo
    Secondary: '#1e1b4b',  // Dark Navy
    Accent: '#dc2626',     // Belmobile Red
    TextDark: '#000000',   // Pure Black
    TextGray: '#4b5563',   // Slate Gray
    TextLight: '#9ca3af',  // Light Gray
    Border: '#d1d5db',     // Gray-300
    Divider: '#4338ca',    // Indigo line
    White: '#ffffff'
};

const STYLES: StyleDictionary = {
    headerTitle: { fontSize: 22, bold: true, color: COLORS.Secondary },
    headerSubtitle: { fontSize: 9, bold: true, color: COLORS.TextGray, characterSpacing: 2 },
    documentTitle: { fontSize: 13, bold: true, color: COLORS.Secondary, alignment: 'right' },
    sectionHeader: { fontSize: 10, bold: true, color: COLORS.Primary, margin: [0, 8, 0, 4], characterSpacing: 0.5 },
    label: { fontSize: 8, color: COLORS.TextGray, margin: [0, 0, 0, 2] },
    value: { fontSize: 10, color: COLORS.TextDark },
    valueBold: { fontSize: 11, bold: true, color: COLORS.TextDark },
    tableHeader: { fontSize: 9, bold: true, color: COLORS.Secondary, margin: [0, 4, 0, 4] },
    tableCell: { fontSize: 10, color: COLORS.TextDark, margin: [0, 4, 0, 4] },
    totalLabel: { fontSize: 12, bold: true, color: COLORS.Secondary },
    totalValue: { fontSize: 16, bold: true, color: COLORS.Primary, alignment: 'right' },
    stepIndex: { fontSize: 9, bold: true, color: COLORS.Primary },
    stepText: { fontSize: 9, color: COLORS.TextDark }
};

const LOGO_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M60 10 H 40 C 25 10 20 25 20 40 V 70 C 20 85 30 90 45 90 H 65 C 80 90 85 80 85 65 V 55" stroke="${COLORS.Secondary}" stroke-width="10" stroke-linecap="round" fill="none" />
  <circle cx="52" cy="78" r="4" fill="${COLORS.Secondary}" />
  <path d="M75 15 V 45 M 60 30 H 90" stroke="${COLORS.Accent}" stroke-width="10" stroke-linecap="round" fill="none" />
</svg>`;

// --- 2. INTERFACES ---
export interface PdfData {
    documentTitle: string;
    orderId: string;
    date: string;
    time?: string;
    status: string;
    method: string;
    type: string;
    customer: { name: string; email?: string; phone?: string; address?: string; };
    isCompany?: boolean;
    companyName?: string;
    vatNumber?: string;
    shopOrDevice: { title: string; name: string; details: { label: string; value: string }[]; };
    priceBreakdown: {
        label: string;
        description?: string;
        price: number;
    }[];
    totalPrice: number;
    subtotal?: number;
    vatAmount?: number;
    nextSteps: string[];
    logistics?: { label: string; value: string };
    iban?: string;
    footerHelpText?: string;
    trackingUrl?: string;
    totalLabel: string;
    legalDisclaimer?: string;
    trackingInfo?: string;
    labels: Record<string, any>;
    signatureBlock?: Record<string, any>;
}

// --- 3. ATOMIC RENDER BLOCKS ---

/** INDIGO LINE: Instititional Divider */
const renderIndigoDivider = (): Content => ({
    table: {
        widths: ['*'],
        body: [[{ text: '', border: [false, false, false, true] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Divider, COLORS.Divider, COLORS.Divider, COLORS.Divider] as [string, string, string, string] }]]
    },
    layout: { hLineWidth: (i: number) => (i === 1 ? 1.5 : 0) },
    margin: [0, 0, 0, 12] as Margins
});

/** TOP BANNER: Brand & Identity (Optimized for 1-Page) */
const renderTopBanner = (data: PdfData): Content => ({
    columns: [
        { width: 40, svg: LOGO_SVG, alignment: 'left' },
        {
            width: '*',
            stack: [
                { text: 'BELMOBILE.BE', fontSize: 18, bold: true, color: COLORS.Secondary, margin: [8, 4, 0, 0] as Margins },
                { text: 'BUYBACK & REPAIR', fontSize: 8, bold: true, color: COLORS.TextGray, characterSpacing: 1.5, margin: [8, 0, 0, 0] as Margins }
            ]
        },
        {
            width: 'auto',
            stack: [
                { text: data.documentTitle.toUpperCase(), style: 'documentTitle' },
                {
                    text: [
                        { text: `${data.labels.orderId}: `, style: 'label', fontSize: 8 },
                        { text: data.orderId, style: 'valueBold', fontSize: 11 }
                    ],
                    alignment: 'right', margin: [0, 2, 0, 0] as Margins
                }
            ],
            margin: [0, 0, 10, 0] as Margins
        },
        ...(data.trackingUrl ? [{ width: 45, qr: data.trackingUrl, fit: 45, alignment: 'right' as any }] : [])
    ],
    margin: [0, 0, 0, 15] as Margins
});

/** ADMIN GRID: Reference data (Optimized for 1-Page) */
const renderAdminGrid = (data: PdfData): Content => ({
    table: {
        widths: ['*', '*', '*', '*'],
        body: [
            [
                { stack: [{ text: data.labels.date, style: 'label' }, { text: data.date, style: 'valueBold' }], border: [false, false, true, false] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border] as [string, string, string, string] },
                { stack: [{ text: (data.labels.time || 'Heure'), style: 'label' }, { text: data.time || '--:--', style: 'valueBold' }], border: [false, false, true, false] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border] as [string, string, string, string] },
                { stack: [{ text: data.labels.status, style: 'label' }, { text: data.status.toUpperCase(), style: 'valueBold', color: '#dc2626' }], border: [false, false, true, false] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border] as [string, string, string, string] },
                { stack: [{ text: data.labels.method, style: 'label' }, { text: data.method, style: 'valueBold', color: COLORS.Secondary }], border: [false, false, false, false] as [boolean, boolean, boolean, boolean] }
            ]
        ]
    },
    layout: {
        hLineWidth: () => 0,
        vLineWidth: (i) => (i > 0 && i < 4 ? 1 : 0),
        paddingLeft: (i) => (i === 0 ? 0 : 15),
        paddingRight: (i) => (i === 3 ? 0 : 15)
    },
    margin: [0, 4, 0, 12] as Margins
});

/** IDENTIFICATION: Client Details (Optimized for 1-Page) */
const renderIdentification = (data: PdfData): Content => ({
    columns: [
        {
            width: '*',
            stack: [
                { text: data.labels.clientDetails.toUpperCase(), style: 'sectionHeader', margin: [0, 0, 0, 2] as Margins },
                {
                    stack: [
                        {
                            text: [
                                { text: `${data.labels.name}: `, style: 'label' },
                                { text: data.customer.name || '', style: 'valueBold' }
                            ]
                        },
                        {
                            text: [
                                { text: `${data.labels.email}: `, style: 'label' },
                                { text: data.customer.email || '', style: 'value' }
                            ]
                        },
                        {
                            text: [
                                { text: `${data.labels.phone}: `, style: 'label' },
                                { text: data.customer.phone || '', style: 'value' }
                            ]
                        }
                    ]
                }
            ]
        },
        ...(data.isCompany ? [{
            width: '*',
            stack: [
                { text: 'BUSINESS INFO', style: 'sectionHeader', margin: [0, 0, 0, 2] as Margins },
                {
                    text: [
                        { text: `${data.labels.companyName}: `, style: 'label' },
                        { text: data.companyName || '', style: 'valueBold' }
                    ]
                },
                {
                    text: [
                        { text: `${data.labels.vatNumber}: `, style: 'label' },
                        { text: data.vatNumber || '', style: 'value' }
                    ]
                }
            ]
        }] : [])
    ],
    margin: [0, 0, 0, 10] as Margins
});

/** MISSION DETAILS: Device & Problem (Optimized for 1-Page) */
const renderMissionDetails = (data: PdfData): Content => ({
    stack: [
        { text: data.shopOrDevice.title.toUpperCase(), style: 'sectionHeader', margin: [0, 10, 0, 4] as Margins },
        {
            table: {
                widths: ['*'],
                body: [[{
                    stack: [
                        { text: (data.shopOrDevice.name || '').trim(), fontSize: 13, bold: true, color: COLORS.Secondary, margin: [0, 0, 0, 6] as Margins },
                        {
                            columns: (data.shopOrDevice.details || []).map(detail => ({
                                width: 'auto',
                                stack: [
                                    { text: `${detail.label}: `, style: 'label' },
                                    { text: detail.value || '-', style: 'valueBold' }
                                ],
                                margin: [0, 0, 25, 0] as Margins
                            })) as any
                        }
                    ]
                }]]
            },
            layout: {
                fillColor: '#f8fafc',
                hLineWidth: () => 0,
                vLineWidth: () => 0,
                paddingLeft: () => 12,
                paddingRight: () => 12,
                paddingTop: () => 10,
                paddingBottom: () => 10
            }
        }
    ],
    margin: [0, 0, 0, 12] as Margins
});

/** FINANCIALS: Table + Total row (Rigidly Consolidated) */
const renderFinancials = (data: PdfData): Content => ({
    stack: [
        { text: (data.labels.financials || 'Détails Financiers').toUpperCase(), style: 'sectionHeader' },
        {
            table: {
                widths: ['*', 90],
                body: [
                    [
                        { text: (data.labels.description || 'Description').toUpperCase(), style: 'tableHeader', border: [false, false, false, true] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Divider, COLORS.Divider, COLORS.Divider, COLORS.Divider] as [string, string, string, string] },
                        { text: (data.labels.price || 'Prix').toUpperCase(), style: 'tableHeader', alignment: 'right' as any, border: [false, false, false, true] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Divider, COLORS.Divider, COLORS.Divider, COLORS.Divider] as [string, string, string, string] }
                    ],
                    ...data.priceBreakdown.map(item => [
                        { text: item.label || item.description, style: 'tableCell', border: [false, false, false, true] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border] as [string, string, string, string] },
                        { text: `€${(item.price || 0).toFixed(2)}`, style: 'tableCell', alignment: 'right' as any, border: [false, false, false, true] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border] as [string, string, string, string] }
                    ]),
                    ...(data.isCompany ? [
                        [
                            { text: data.labels.subtotal, style: 'label', alignment: 'right' as any, margin: [0, 6, 0, 0] as Margins, border: [false, false, false, false] as [boolean, boolean, boolean, boolean] },
                            { text: `€${(data.subtotal || 0).toFixed(2)}`, style: 'value', alignment: 'right' as any, margin: [0, 6, 0, 0] as Margins, border: [false, false, false, false] as [boolean, boolean, boolean, boolean] }
                        ],
                        [
                            { text: data.labels.vat, style: 'label', alignment: 'right' as any, border: [false, false, false, false] as [boolean, boolean, boolean, boolean] },
                            { text: `€${(data.vatAmount || 0).toFixed(2)}`, style: 'value', alignment: 'right' as any, border: [false, false, false, false] as [boolean, boolean, boolean, boolean] }
                        ]
                    ] : []),
                    [
                        { text: (data.totalLabel || 'Total').toUpperCase(), style: 'totalLabel', alignment: 'right' as any, margin: [0, 12, 0, 0] as Margins, border: [false, true, false, false] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Divider, COLORS.Divider, COLORS.Divider, COLORS.Divider] as [string, string, string, string] },
                        { text: `€${(data.totalPrice || 0).toFixed(2)}`, style: 'totalValue', alignment: 'right' as any, margin: [0, 12, 0, 0] as Margins, border: [false, true, false, false] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Divider, COLORS.Divider, COLORS.Divider, COLORS.Divider] as [string, string, string, string] }
                    ]
                ]
            } as any,
            layout: { paddingTop: () => 4, paddingBottom: () => 4 }
        }
    ],
    margin: [0, 0, 0, 20] as Margins
});

/** EXECUTION: Next Steps & Signature */
const renderExecution = (data: PdfData): Content => ({
    stack: [
        ...(data.iban ? [
            { margin: [0, 0, 0, 6] as Margins, stack: [{ text: (data.labels.paymentIban || 'IBAN').toUpperCase(), style: 'label', bold: true }, { text: data.iban, style: 'valueBold', fontSize: 11, characterSpacing: 0.5 }] }
        ] : []),
        ...(data.nextSteps.length > 0 ? [
            { text: (data.labels.nextSteps || 'Prochaines Étapes').toUpperCase(), style: 'sectionHeader', margin: [0, 2, 0, 1] as Margins },
            { stack: data.nextSteps.map((step, idx) => ({ columns: [{ text: `${idx + 1}.`, width: 10, style: 'stepIndex' }, { text: step, width: '*', style: 'stepText' }], margin: [0, 0.5, 0, 0.5] as Margins })) }
        ] : []),
        {
            margin: [0, 6, 0, 0] as Margins,
            table: {
                widths: ['45%', '10%', '45%'],
                body: [[
                    {
                        stack: [
                            { text: (data.labels.signatureClient || 'Signature Client').toUpperCase(), style: 'label', bold: true, alignment: 'center' as any, margin: [0, 2, 0, 15] as Margins },
                            { text: data.labels.readAndApproved || 'Lu et approuvé', style: 'TextLight', fontSize: 6, italics: true, alignment: 'center' as any }
                        ],
                        border: [true, true, true, true] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border] as [string, string, string, string]
                    },
                    { text: '', border: [false, false, false, false] as [boolean, boolean, boolean, boolean] },
                    {
                        stack: [
                            { text: (data.labels.shopStamp || 'Cachet Magasin').toUpperCase(), style: 'label', bold: true, alignment: 'center' as any, margin: [0, 2, 0, 15] as Margins },
                            { text: 'Belmobile Official', style: 'TextLight', fontSize: 6, alignment: 'center' as any }
                        ],
                        border: [true, true, true, true] as [boolean, boolean, boolean, boolean], borderColor: [COLORS.Border, COLORS.Border, COLORS.Border, COLORS.Border] as [string, string, string, string]
                    }
                ]]
            },
            layout: { paddingLeft: () => 8, paddingRight: () => 8 }
        }
    ]
});

// --- 4. MASTER ENGINE ---

export const createPdfDefinition = (data: PdfData): TDocumentDefinitions => {
    return {
        pageSize: 'A4',
        pageMargins: [40, 30, 40, 40] as Margins,
        content: [
            renderTopBanner(data),
            renderIndigoDivider(),
            renderAdminGrid(data),
            renderIdentification(data),
            renderMissionDetails(data),
            renderFinancials(data),
            renderExecution(data),
            ...(data.legalDisclaimer ? [{ text: data.legalDisclaimer, fontSize: 7, color: COLORS.TextLight, margin: [0, 6, 0, 0] as Margins, alignment: 'justify' as any, italics: true, lineHeight: 1.1 }] : [])
        ],
        footer: (currentPage: number, pageCount: number) => ({
            stack: [
                { canvas: [{ type: 'line', x1: 40, y1: 0, x2: 555, y2: 0, lineWidth: 0.5, lineColor: COLORS.Border }], margin: [0, 0, 0, 8] as Margins },
                {
                    columns: [
                        { text: 'Belmobile Support: +32 2 275 98 67 | www.belmobile.be', fontSize: 8, color: COLORS.TextGray, margin: [40, 0, 0, 0] as Margins },
                        { text: `${currentPage} / ${pageCount}`, fontSize: 8, color: COLORS.TextGray, alignment: 'right', margin: [0, 0, 40, 0] as Margins }
                    ]
                }
            ]
        }),
        styles: STYLES,
        defaultStyle: { font: 'Roboto' }
    };
};
