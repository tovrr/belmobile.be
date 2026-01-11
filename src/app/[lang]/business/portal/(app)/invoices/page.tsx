'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, orderBy } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    DocumentTextIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    CurrencyEuroIcon
} from '@/components/ui/BrandIcons';
import { motion } from 'framer-motion';
import { generatePDFFromPdfData, savePDFBlob } from '@/utils/pdfGenerator';

export default function InvoicesPage() {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [company, setCompany] = useState<any>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const fetchInvoices = async (cid: string) => {
        try {
            const invoicesRef = collection(db, 'b2b_invoices');
            const q = query(
                invoicesRef,
                where('companyId', '==', cid),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);

            const fetchedInvoices = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setInvoices(fetchedInvoices);
        } catch (err) {
            console.error("Error fetching invoices:", err);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            try {
                const userDoc = await getDoc(doc(db, 'b2b_users', user.uid));
                if (!userDoc.exists()) return;

                const cid = userDoc.data().companyId;
                setCompanyId(cid);

                // Fetch Company Details for PDF
                const companyDoc = await getDoc(doc(db, 'b2b_companies', cid));
                if (companyDoc.exists()) {
                    setCompany(companyDoc.data());
                }

                await fetchInvoices(cid);

            } catch (err) {
                console.error("Auth check failed:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleDownloadInvoice = async (invoice: any) => {
        if (downloadingId) return;
        setDownloadingId(invoice.id);

        try {
            const dateStr = invoice.date?.toDate ? new Date(invoice.date.toDate()).toLocaleDateString() : (invoice.date || new Date().toLocaleDateString());

            // Map to PDF Schema
            const pdfData = {
                documentTitle: 'INVOICE',
                orderId: invoice.invoiceNumber || `INV-${invoice.id.slice(0, 6).toUpperCase()}`,
                date: dateStr,
                status: invoice.paid ? 'PAID' : 'DUE',
                method: 'Electronic Transfer',
                type: 'invoice',

                customer: {
                    name: company?.contactName || 'Valued Partner',
                    email: company?.email || '',
                    phone: company?.phone || '',
                    address: company?.address || ''
                },

                isCompany: true,
                companyName: company?.name || 'Company Name',
                vatNumber: company?.vat || 'BE0000.000.000',

                shopOrDevice: {
                    title: 'Service Detail',
                    name: 'Monthly Fleet Services',
                    details: [
                        { label: 'Billing Period', value: dateStr }, // Simplified
                        { label: 'Contract Ref', value: companyId || 'N/A' }
                    ]
                },

                priceBreakdown: invoice.items && invoice.items.length > 0
                    ? invoice.items.map((item: any) => ({
                        label: item.description || item.label || 'Service Item',
                        price: Number(item.price || item.amount || 0)
                    }))
                    : [{ label: 'Consolidated Fleet Services', price: Number(invoice.amount) }],

                totalPrice: Number(invoice.amount) * 1.21, // Assumption: Amount is Net
                subtotal: Number(invoice.amount),
                vatAmount: Number(invoice.amount) * 0.21,

                nextSteps: ['Please retain this document for your records.'],

                labels: {
                    orderId: 'Invoice No',
                    date: 'Date',
                    status: 'Payment Status',
                    method: 'Payment Method',
                    clientDetails: 'Bill To',
                    name: 'Contact',
                    email: 'Email',
                    phone: 'Phone',
                    companyName: 'Company',
                    vatNumber: 'VAT Number',
                    financials: 'Charge Summary',
                    description: 'Description',
                    price: 'Amount (EUR)',
                    subtotal: 'Subtotal (Excl. VAT)',
                    vat: 'VAT (21%)',
                    total: 'Total Due'
                }
            };

            const { blob, safeFileName } = await generatePDFFromPdfData(pdfData, 'INVOICE');
            savePDFBlob(blob, safeFileName);

        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("Failed to generate invoice. Please contact support.");
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Decrypting Billing Vault...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-4 border-emerald-600 pl-8 py-2">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                        Billing <span className="text-emerald-500">Center</span>
                    </h1>
                    <p className="text-xs text-slate-500 flex items-center gap-2 font-mono uppercase tracking-widest">
                        VAT Invoices & Financial Transaction Records.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => companyId && fetchInvoices(companyId)}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all active:scale-95 group"
                    >
                        <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 text-emerald-400" />
                    </button>
                </div>
            </div>

            {/* Invoices Grid/Table */}
            <div className="bg-[#131725] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/2 border-b border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Doc_Reference</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Billing Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Amount (Net)</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">VAT (21%)</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/2">
                            {invoices.length > 0 ? invoices.map((inv, idx) => (
                                <motion.tr
                                    key={inv.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-white/5 transition-all group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-white font-black tracking-tighter uppercase">{inv.invoiceNumber || `INV-${inv.id.slice(0, 8).toUpperCase()}`}</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{inv.date?.toDate ? new Date(inv.date.toDate()).toLocaleDateString() : (inv.date || 'Pending')}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${inv.paid ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
                                            <span className={`font-black uppercase tracking-widest text-[10px] ${inv.paid ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {inv.paid ? 'PAID / SETTLED' : 'PENDING_VOID'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-mono text-white font-black text-sm">€{Number(inv.amount).toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-mono text-slate-400 font-bold text-xs">€{(Number(inv.amount) * 0.21).toFixed(2)}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => handleDownloadInvoice(inv)}
                                            disabled={downloadingId === inv.id}
                                            className={`p-3 rounded-xl transition-all border group/btn flex items-center justify-center w-10 h-10 ml-auto
                                            ${downloadingId === inv.id
                                                    ? 'bg-indigo-600/20 border-indigo-600/30 text-indigo-400 cursor-wait'
                                                    : 'bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border-indigo-600/20'}`}
                                        >
                                            {downloadingId === inv.id ? (
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <ArrowDownTrayIcon className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                                            )}
                                        </button>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-20">
                                            <CurrencyEuroIcon className="w-16 h-16" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-black uppercase tracking-[0.3em]">No Financial Records Found</p>
                                                <p className="text-[10px] font-mono uppercase">Billing cycle is currently dormant.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
