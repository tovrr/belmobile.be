'use client';

import React from 'react';
import { useData } from '../../hooks/useData';
import { CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const ReservationManagement: React.FC = () => {
    const { reservations, shops, updateReservationStatus, deleteReservation } = useData();
    const getShopName = (shopId: number | string) => shops.find(s => s.id === shopId)?.name || 'Unknown Shop';

    const handleUpdateStatus = async (reservation: { id: string | number, deliveryMethod?: string }, status: 'approved' | 'cancelled') => {
        try {
            let paymentLink: string | undefined = undefined;

            // If approving a Shipping reservation, ask for Payment Link
            if (status === 'approved' && reservation.deliveryMethod === 'shipping') {
                const link = window.prompt("Enter Mollie Payment Link for this order:", "");
                if (link === null) return; // Cancelled prompt
                if (link.trim() !== "") {
                    paymentLink = link.trim();
                } else {
                    if (!window.confirm("Send without a specific payment link? (Generic link will be used)")) return;
                }
            }

            await updateReservationStatus(reservation.id, status, paymentLink);
        } catch (error) {
            console.error("Failed to update reservation status:", error);
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id: number | string) => {
        if (window.confirm('Are you sure you want to delete this reservation?')) {
            try {
                await deleteReservation(id);
            } catch (error) {
                console.error("Failed to delete reservation:", error);
                alert("Failed to delete reservation");
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Reservations</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage product reservations</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">Customer</th>
                                <th scope="col" className="px-6 py-4">Product</th>
                                <th scope="col" className="px-6 py-4">Type</th>
                                <th scope="col" className="px-6 py-4">Shop/Addr</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Date</th>
                                <th scope="col" className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {reservations.map(res => (
                                <tr key={res.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{res.customerName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{res.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">{res.productName}</td>
                                    <td className="px-6 py-4 text-xs font-bold uppercase text-gray-600 dark:text-gray-400">{res.deliveryMethod || 'pickup'}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                                        {res.deliveryMethod === 'shipping'
                                            ? `${res.shippingZip} ${res.shippingCity}`
                                            : getShopName(res.shopId)
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${res.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                            res.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{res.date}</td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        {res.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(res, 'approved')} className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-xl transition-colors" title="Approve">
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleUpdateStatus(res, 'cancelled')} className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors" title="Cancel">
                                                    <XCircleIcon className="h-5 w-5" />
                                                </button>
                                            </>

                                        )}
                                        <button onClick={() => handleDelete(res.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" title="Delete">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReservationManagement;
