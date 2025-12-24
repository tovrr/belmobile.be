import { jsPDF } from 'jspdf';

interface ReservationData {
    productName: string;
    productPrice: number;
    shopName: string;
    customerName: string;
    customerPhone: string;
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
    specs?: {
        [key: string]: string | boolean;
    };
    perks?: string[];
}

export const generateReservationPDF = (data: ReservationData, t: (key: string) => string) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(67, 56, 202);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('BELMOBILE', 20, 15);
    doc.setTextColor(255, 222, 0); // Yellow
    doc.text('.BE', 66, 15);

    // Precise Justification for Slogan
    const brandWidth = doc.getTextWidth('BELMOBILE');
    const sloganText = 'BUYBACK & REPAIR';
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');

    const sloganWidth = doc.getTextWidth(sloganText);
    const charSpace = (brandWidth - sloganWidth) / (sloganText.length - 1);
    doc.text(sloganText, 20, 21, { charSpace });

    doc.setFontSize(10);
    doc.text(t('pdf_reservation_confirmation'), 190, 18, { align: 'right' });

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('pdf_device')}:`, 20, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(data.productName, 70, 50);

    doc.setFont('helvetica', 'bold');
    doc.text(`${t('pdf_price')}:`, 20, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`€${data.productPrice}`, 70, 60);

    doc.setFont('helvetica', 'bold');
    doc.text(`${t('pdf_shop')}:`, 20, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(data.shopName, 70, 70);

    doc.setFont('helvetica', 'bold');
    doc.text(`${t('pdf_customer')}:`, 20, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.customerName} (${data.customerPhone})`, 70, 90);

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    const safeFileName = `Reservation_${data.productName.replace(/\s+/g, '_')}.pdf`;

    return { doc, pdfBase64, safeFileName };
};

export const generateRepairBuybackPDF = (data: RepairBuybackData, t: (key: string, ...args: (string | number)[]) => string) => {
    const doc = new jsPDF();

    // Header background
    doc.setFillColor(67, 56, 202); // Indaco
    doc.rect(0, 0, 210, 40, 'F');

    // Logo Text: BELMOBILE.BE
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('BELMOBILE', 20, 22);
    doc.setTextColor(255, 222, 0); // Yellow
    doc.text('.BE', 71, 22);

    // Slogan: BUYBACK & REPAIR (stretching effect)
    const brandWidth = doc.getTextWidth('BELMOBILE');
    const sloganText = 'BUYBACK & REPAIR';
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    const sloganWidth = doc.getTextWidth(sloganText);
    const charSpace = (brandWidth - sloganWidth) / (sloganText.length - 1);
    doc.text(sloganText, 20, 28, { charSpace });

    // Document Title
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(t('pdf_summary'), 190, 24, { align: 'right' });

    // Body content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Info Section
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('pdf_order_id')}:`, 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(data.orderId, 60, 55);

    doc.setFont('helvetica', 'bold');
    doc.text(`${t('pdf_date')}:`, 20, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(data.date, 60, 62);

    // Customer Detail
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('pdf_customer_details')}:`, 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customer.name, 20, 82);
    doc.text(data.customer.email, 20, 87);
    doc.text(data.customer.phone, 20, 92);
    if (data.customer.address) doc.text(data.customer.address, 20, 97);

    // Device details
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('pdf_device_details')}:`, 110, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t('Device')}: ${data.device.name}`, 110, 82);
    if (data.device.storage) doc.text(`${t('Storage')}: ${data.device.storage}`, 110, 87);
    if (data.device.issue) doc.text(`${t('Issue')}: ${data.device.issue}`, 110, 92);
    if (data.device.condition) doc.text(`${t('Condition')}: ${data.device.condition}`, 110, 97);

    // Conditional Specs Section (Buyback only)
    let nextY = 110;
    if (data.type === 'buyback' && data.specs) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('Functionality & Specs')}:`, 20, 110);
        doc.setFont('helvetica', 'normal');

        const specKeys = Object.keys(data.specs);
        specKeys.forEach((key, index) => {
            const val = data.specs![key];
            const translatedVal = (val === true || val === 'true') ? t('Yes') : (val === false || val === 'false') ? t('No') : String(val);
            doc.text(`• ${t(key)}: ${translatedVal}`, 25, 118 + (index * 6));
        });
        nextY = 118 + (specKeys.length * 6) + 10;
    }

    // Money part
    doc.setFillColor(245, 247, 250);
    doc.rect(20, nextY, 170, 25, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(data.type === 'buyback' ? t('pdf_estimated_value') : t('pdf_total_cost'), 30, nextY + 16);
    doc.setFontSize(16);
    doc.setTextColor(67, 56, 202);
    doc.text(`€${data.value || data.cost}`, 180, nextY + 16, { align: 'right' });

    // Perks Section
    if (data.perks && data.perks.length > 0) {
        nextY += 35;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${t('pdf_exclusive_perks')}:`, 20, nextY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        data.perks.forEach((perk, index) => {
            doc.text(`• ${perk}`, 25, nextY + 7 + (index * 5));
        });
        nextY += (data.perks.length * 5) + 2;
    }

    // Footer
    nextY = Math.max(nextY + 15, 275); // Ensure it doesn't overlap or go too low
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(t('pdf_include_summary'), 20, nextY + 35, { maxWidth: 170 });
    doc.text('Belmobile.be - Rue Ulens 88, 1080 Bruxelles - TVA BE0502737241', 105, 285, { align: 'center' });

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    const safeFileName = `${data.type === 'buyback' ? 'Buyback' : 'Repair'}_${data.orderId}.pdf`;

    return { doc, pdfBase64, safeFileName };
};
