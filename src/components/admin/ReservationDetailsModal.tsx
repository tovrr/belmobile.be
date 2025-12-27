'use client';

import React from 'react';
import { Reservation, Shop } from '../../types';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import {
    XMarkIcon, TrashIcon, CheckIcon,
    ArrowDownTrayIcon, CloudArrowUpIcon,
    CreditCardIcon, DocumentIcon
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
        } catch (error) {
            console.error("Failed to toggle payment:", error);
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
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider">Payment Controls</h4>
                                        <label className="relative inline-flex items-center cursor-pointer scale-90">
                                            <input
                                                type="checkbox"
                                                checked={isPaid}
                                                onChange={handleTogglePayment}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            <span className="ml-2 text-xs font-bold text-gray-700 dark:text-gray-300">{isPaid ? 'Paid' : 'Unpaid'}</span>
                                        </label>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={paymentLink}
                                                onChange={(e) => setPaymentLink(e.target.value)}
                                                placeholder="Mollie Payment Link"
                                                className="w-full bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/50 rounded-lg py-2 pl-3 pr-10 text-xs text-gray-600 dark:text-gray-300 placeholder:text-gray-400"
                                            />
                                            <button
                                                onClick={handleSavePaymentLink}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 p-1"
                                                title="Save Link"
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="flex-1">
                                                <div className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/50 rounded-lg py-2 text-xs font-bold text-blue-600 cursor-pointer hover:bg-blue-50 transition-colors">
                                                    {isUploadingReceipt ? <ArrowDownTrayIcon className="w-4 h-4 animate-bounce" /> : <CloudArrowUpIcon className="w-4 h-4" />}
                                                    {reservation.paymentReceiptUrl ? 'Update Receipt' : 'Upload Receipt'}
                                                </div>
                                                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,image/*" disabled={isUploadingReceipt} />
                                            </label>
                                            {reservation.paymentReceiptUrl && (
                                                <a
                                                    href={reservation.paymentReceiptUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    title="View Receipt"
                                                >
                                                    <DocumentIcon className="w-4 h-4" />
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
