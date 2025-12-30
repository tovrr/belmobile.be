'use client';

import React from 'react';
import { Reservation, Shop } from '../../types';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import {
    XMarkIcon, TrashIcon, CheckIcon,
    ArrowDownTrayIcon, CloudArrowUpIcon,
    CreditCardIcon, DocumentIcon, BanknotesIcon, LinkIcon, EyeIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';

const ReservationDetailsModal = ({ reservation, onClose }: { reservation: Reservation; onClose: () => void }) => {
    const { updateReservationStatus, updateReservationFields, deleteReservation, shops } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();
    const shopName = shops.find((s: Shop) => s.id === reservation.shopId)?.name || 'Unknown Shop';

    const [currentStatus, setCurrentStatus] = React.useState(reservation.status);
    const [isUpdating, setIsUpdating] = React.useState(false);

    // -- PAYMENT STATE --
    const [isPaid, setIsPaid] = React.useState(reservation.isPaid || false);
    const [paymentLink, setPaymentLink] = React.useState(reservation.paymentLink || '');
    const [isUploadingReceipt, setIsUploadingReceipt] = React.useState(false);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as Reservation['status'];
        setCurrentStatus(newStatus);
        setIsUpdating(true);
        try {
            await updateReservationStatus(reservation.id, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status");
            setCurrentStatus(reservation.status);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this reservation?")) return;
        try {
            await deleteReservation(reservation.id);
            onClose();
        } catch (error) {
            console.error("Failed to delete reservation:", error);
            alert("Failed to delete reservation");
        }
    };

    const handleTogglePayment = async () => {
        try {
            const nextPaid = !isPaid;
            await updateReservationFields(reservation.id, { isPaid: nextPaid });
            setIsPaid(nextPaid);

            // Trigger "Payment Received" email if marking as Paid
            if (nextPaid) {
                if (window.confirm("Payment marked as PAID. Send confirmation email to customer?")) {
                    const { getPaymentReceivedEmail } = await import('../../utils/emailTemplates');
                    const lang = (reservation.language === 'en' || reservation.language === 'nl' || reservation.language === 'fr')
                        ? reservation.language
                        : 'fr';
                    const { subject, html } = getPaymentReceivedEmail(reservation, lang);
                    await user?.email && updateReservationFields(reservation.id, { isPaid: true }); // Redundant but safe

                    // We need raw send email ability here. 
                    // Since useData exposes sendEmail, we can use it.
                    const { sendEmail } = await import('../../services/emailService');
                    await sendEmail(reservation.customerEmail, subject, html);
                    alert("Email sent to customer!");
                }
            }

        } catch (error) {
            console.error("Failed to toggle payment:", error);
            alert("Failed to update status");
        }
    };

    const handleSavePaymentLink = async () => {
        try {
            await updateReservationFields(reservation.id, { paymentLink });
            alert("Payment link saved");
        } catch (error) {
            console.error("Failed to save payment link:", error);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingReceipt(true);
        try {
            const storageRef = ref(storage, `receipts/res_${reservation.id}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await updateReservationFields(reservation.id, { paymentReceiptUrl: downloadURL });
            alert("Receipt uploaded successfully!");
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed");
        } finally {
            setIsUploadingReceipt(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const { generateReservationPDF, savePDFBlob } = await import('../../utils/pdfGenerator');
            const { blob, safeFileName } = await generateReservationPDF({
                orderId: reservation.id.toString(),
                date: reservation.date,
                productName: reservation.productName,
                productPrice: reservation.productPrice,
                shopName,
                customerName: reservation.customerName,
                customerPhone: reservation.customerPhone,
                deliveryMethod: reservation.deliveryMethod as 'pickup' | 'shipping',
                shippingAddress: `${reservation.shippingAddress || ''} ${reservation.shippingZip || ''} ${reservation.shippingCity || ''}`
            }, t);
            savePDFBlob(blob, safeFileName);
        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate PDF");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        Reservation Details
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {reservation.id}</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Customer Details</h3>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <p><strong className="text-gray-900 dark:text-white">Name:</strong> {reservation.customerName}</p>
                                <p><strong className="text-gray-900 dark:text-white">Email:</strong> {reservation.customerEmail}</p>
                                <p><strong className="text-gray-900 dark:text-white">Phone:</strong> {reservation.customerPhone}</p>
                                <p><strong className="text-gray-900 dark:text-white">Shop:</strong> {shopName}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Product Details</h3>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <p><strong className="text-gray-900 dark:text-white">Product:</strong> {reservation.productName}</p>
                                <p><strong className="text-gray-900 dark:text-white">Price:</strong> <span className="text-lg font-black text-bel-blue">€{reservation.productPrice}</span></p>
                                <p><strong className="text-gray-900 dark:text-white">Method:</strong> <span className="capitalize">{reservation.deliveryMethod || 'Pickup'}</span></p>
                                {reservation.deliveryMethod === 'shipping' && (
                                    <p><strong className="text-gray-900 dark:text-white">Address:</strong> {reservation.shippingAddress}, {reservation.shippingZip} {reservation.shippingCity}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Status & Payment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Current Status</label>
                                    <select
                                        value={currentStatus}
                                        onChange={handleStatusChange}
                                        disabled={isUpdating}
                                        className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-xl font-bold text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-bel-blue"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="ready">Ready for Pickup</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            <BanknotesIcon className="w-4 h-4" />
                                            Payment & Receipt
                                        </h4>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isPaid}
                                                onChange={handleTogglePayment}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            <span className={`ml-2 text-xs font-bold ${isPaid ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                                {isPaid ? 'PAID' : 'UNPAID'}
                                            </span>
                                        </label>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Payment Link Input */}
                                        <div className="relative">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Payment Link</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={paymentLink}
                                                    onChange={(e) => setPaymentLink(e.target.value)}
                                                    placeholder="Paste Mollie/Stripe link..."
                                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg py-2 pl-8 pr-10 text-xs text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-bel-blue"
                                                />
                                                <LinkIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                                                <button
                                                    onClick={handleSavePaymentLink}
                                                    className="absolute right-1 top-1 text-bel-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded-md transition-colors"
                                                    title="Save Link"
                                                >
                                                    <CheckIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Receipt Upload */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-50 dark:border-slate-800">
                                            <label className="flex-1 group cursor-pointer">
                                                <div className={`flex items-center justify-center gap-2 border border-dashed rounded-xl py-3 px-4 text-xs font-bold transition-all ${reservation.paymentReceiptUrl
                                                    ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300'
                                                    : 'bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-400'
                                                    }`}>
                                                    {isUploadingReceipt ? (
                                                        <ArrowDownTrayIcon className="w-4 h-4 animate-bounce" />
                                                    ) : reservation.paymentReceiptUrl ? (
                                                        <DocumentTextIcon className="w-4 h-4" />
                                                    ) : (
                                                        <CloudArrowUpIcon className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                                    )}
                                                    <span>{reservation.paymentReceiptUrl ? 'Update Receipt' : 'Upload Receipt'}</span>
                                                </div>
                                                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,image/*" disabled={isUploadingReceipt} />
                                            </label>

                                            {reservation.paymentReceiptUrl && (
                                                <a
                                                    href={reservation.paymentReceiptUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-white border border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors shadow-sm"
                                                    title="View Receipt"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleDownloadPDF}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-slate-700 text-white font-bold p-3 rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition-all shadow-lg"
                                >
                                    <CreditCardIcon className="h-5 w-5" />
                                    Generate Invoice PDF
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 text-red-600 font-bold p-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/30"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                    Delete Reservation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservationDetailsModal;
