import { createPdfDefinition, PdfData } from './PdfTemplates';
import { TFunction } from './i18n-server';
import { mapReservationToPdfData } from './orderMappers';

// --- Interfaces (Maintained for backward Compatibility in types) ---
export interface ReservationData {
    orderId?: string;
    date?: string;
    productName: string;
    productPrice: number;
    shopName: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryMethod?: 'pickup' | 'shipping';
    shippingAddress?: string;
    nextSteps?: string[];
}

/**
 * Modernized PDF Generator for Reservations.
 * Now uses the shared PdfTemplates for consistent visual identity.
 */
export const generateReservationPDF = async (data: ReservationData, t: TFunction) => {
    const pdfData = mapReservationToPdfData(data, t);
    return generatePDFFromPdfData(pdfData, 'Reservation');
};

// --- LOGO HANDLING (Robust Server/Client) ---

const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            resolve(''); // Should use server-side logic
            return;
        }
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
            resolve('');
        };
    });
};

const getLogoBase64 = async (): Promise<string> => {
    if (typeof window === 'undefined') {
        try {
            const fs = await import('fs');
            const path = await import('path');
            const logoPath = path.join(process.cwd(), 'public', 'belmobile-logo.png');
            if (fs.existsSync(logoPath)) {
                const buffer = fs.readFileSync(logoPath);
                return `data:image/png;base64,${buffer.toString('base64')}`;
            }
        } catch (e) {
            console.warn("[PDF] Server-side logo load failed, using text fallback");
        }
    } else {
        return getBase64ImageFromURL('/belmobile-logo.png');
    }
    return '';
};

// --- CORE GENERATION ---

/**
 * The primary way to generate PDFs in the application.
 * Accepts structured PdfData and produces consistent, high-quality output.
 */
export const generatePDFFromPdfData = async (pdfData: any, filenamePrefix: string) => {
    // 1. Setup Data
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
        pdfData.logo = logoBase64;
    }

    // 2. Load PDFMake Dynamically
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const pdfMake = pdfMakeModule.default;

    const vfs = (pdfFontsModule.default as any)?.pdfMake?.vfs
        || (pdfFontsModule as any)?.pdfMake?.vfs
        || (pdfFontsModule as any)?.vfs
        || pdfFontsModule.default
        || pdfFontsModule;

    if ((pdfMake as any).vfs === undefined && vfs) {
        (pdfMake as any).vfs = vfs;
    }

    // 3. Generate Document
    const docDefinition = createPdfDefinition(pdfData);
    const pdfGenerator = pdfMake.createPdf(docDefinition as any);

    return new Promise<{ blob: Blob, base64: string, safeFileName: string, doc: any }>((resolve, reject) => {
        pdfGenerator.getBlob((blob: Blob) => {
            pdfGenerator.getBase64((base64: string) => {
                const safeFileName = `${filenamePrefix}_${String(pdfData.orderId || 'Order').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                resolve({
                    blob,
                    base64,
                    safeFileName,
                    doc: docDefinition
                });
            });
        });
    });
};

// --- UTILS ---

export const savePDFBlob = (blob: Blob, filename: string) => {
    if (typeof window === 'undefined') return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 2000);
};
