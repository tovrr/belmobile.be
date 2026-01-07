import { PdfData } from './PdfTemplates';
import { FleetDevice, B2BCompany } from '@/types/models';

/**
 * Maps B2B Fleet Data to the Standard AEGIS PdfData format.
 * Generates an "Inventory Report" or "Valuation Certificate".
 */
export const mapFleetToPdfData = (
    devices: FleetDevice[],
    company: B2BCompany,
    reportTitle: string = 'INVENTORY REPORT'
): PdfData => {

    const currentDate = new Date().toLocaleDateString('fr-BE');
    const totalEstimatedValue = devices.reduce((sum, d) => sum + (d.estimatedPrice || 0), 0);

    // Group items for the price breakdown
    const priceBreakdown = devices.map(device => ({
        label: `${device.brand} ${device.model} (${device.storage || 'N/A'})`,
        description: `IMEI: ${device.imei || '-'} | Condition: ${device.currentCondition || 'Unknown'}`,
        price: device.estimatedPrice || 0
    }));

    // Or summary by Model if list is huge?
    // For now, list all items (Top 50 limit might be needed for single page optimization but AEGIS handles multi-page tables generally)

    return {
        documentTitle: reportTitle,
        orderId: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`, // Generate a temporary ref
        date: currentDate,
        time: new Date().toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' }),
        status: 'GENERATED',
        method: 'DASHBOARD_EXPORT',
        type: 'INVENTORY',
        customer: {
            name: company.name,
            email: company.contactEmail,
            address: `${company.billingAddress.street} ${company.billingAddress.number}, ${company.billingAddress.zip} ${company.billingAddress.city}`
        },
        isCompany: true,
        companyName: company.name,
        vatNumber: company.vatNumber,

        shopOrDevice: {
            title: 'Inventory Scope',
            name: `${devices.length} Assets Managed`,
            details: [
                { label: 'Total Volume', value: devices.length.toString() },
                { label: 'Active Devices', value: devices.filter(d => d.status === 'active').length.toString() },
                { label: 'In Repair', value: devices.filter(d => d.status === 'in_repair').length.toString() }
            ]
        },

        priceBreakdown: priceBreakdown,

        totalPrice: totalEstimatedValue,
        subtotal: totalEstimatedValue,
        vatAmount: 0, // Valuation usually doesn't apply VAT until invoice? Or is it 0%? keeping 0 for now.

        totalLabel: 'TOTAL EST. VALUE',

        nextSteps: [
            "Review asset list accuracy.",
            "Contact Belmobile B2B Support for any discrepancies.",
            "This document serves as indexation."
        ],

        labels: {
            orderId: 'REF',
            date: 'DATE',
            time: 'TIME',
            status: 'STATUS',
            method: 'SOURCE',
            clientDetails: 'Entity Details',
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
            companyName: 'Company',
            vatNumber: 'VAT',
            financials: 'Asset Valuation',
            description: 'Item Description',
            price: 'Est. Value',
            subtotal: 'Subtotal',
            vat: 'VAT (0%)',
            paymentIban: 'INFO',
            signatureClient: 'Approved By',
            readAndApproved: 'Read and Approved',
            shopStamp: 'Certified By'
        },

        footerHelpText: 'Belmobile B2B Fleet Management',
        legalDisclaimer: 'This valuation is an estimate based on current market rates and reported condition. Actual buyback value may vary upon physical inspection.'
    };
};
