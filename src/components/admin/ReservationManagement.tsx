'use client';

import React from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { CheckCircleIcon, XCircleIcon, TrashIcon, EyeIcon, BanknotesIcon, DocumentTextIcon, LinkIcon } from '@heroicons/react/24/outline';
import { Reservation } from '../../types';
import ReservationDetailsModal from './ReservationDetailsModal';

const ReservationManagement: React.FC = () => {
    const { profile } = useAuth();
    const {
        reservations,
        shops,
        updateReservationStatus,
        deleteReservation,
        hasMoreReservations,
        loadMoreReservations
    } = useData();
    const [selectedReservation, setSelectedReservation] = React.useState<Reservation | null>(null);

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

            {/* Desktop View */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product / Loc</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                            {reservations.map(res => (
                                <tr key={res.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-700/20 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-gray-900 dark:text-white leading-tight">{res.customerName}</div>
                                        <div className="text-[11px] text-gray-400 mt-1">{res.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-700 dark:text-gray-200 line-clamp-1">{res.productName}</div>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase leading-none">
                                                {res.deliveryMethod || 'pickup'}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]">
                                                {res.deliveryMethod === 'shipping' ? `${res.shippingZip} ${res.shippingCity}` : getShopName(res.shopId)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${res.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                res.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-rose-50 text-rose-600'
                                                }`}>
                                                {res.status}
                                            </span>
                                            {res.isPaid && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500 text-white uppercase">
                                                    PAID
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">{res.date}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => setSelectedReservation(res)} className="p-2.5 bg-gray-50 dark:bg-slate-900 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all" title="View">
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            {res.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(res, 'approved')} className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl transition-all" title="Approve">
                                                        <CheckCircleIcon className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(res, 'cancelled')} className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl transition-all" title="Cancel">
                                                        <XCircleIcon className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleDelete(res.id)} className="p-2.5 bg-gray-50 dark:bg-slate-900 text-gray-400 hover:text-rose-600 rounded-xl transition-all" title="Delete">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {reservations.map(res => (
                    <div key={res.id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="space-y-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${res.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                    res.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                        'bg-rose-50 text-rose-600'
                                    }`}>
                                    {res.status}
                                </span>
                                <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{res.customerName}</h4>
                                <p className="text-xs text-gray-400">{res.date}</p>
                            </div>
                            {res.isPaid && (
                                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm shadow-emerald-500/20">
                                    PAID
                                </span>
                            )}
                        </div>

                        <div className="mb-5 p-4 bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-50 dark:border-slate-700/50">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Product & Method</p>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">{res.productName}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                    {res.deliveryMethod || 'pickup'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                                    {res.deliveryMethod === 'shipping' ? `${res.shippingZip} ${res.shippingCity}` : getShopName(res.shopId)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setSelectedReservation(res)}
                                className="flex-1 py-3 bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-400 rounded-2xl flex items-center justify-center transition-colors"
                            >
                                <EyeIcon className="w-5 h-5" />
                            </button>
                            {res.status === 'pending' ? (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus(res, 'approved')}
                                        className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20"
                                    >
                                        <CheckCircleIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(res, 'cancelled')}
                                        className="flex-1 py-3 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-2xl flex items-center justify-center"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="col-span-2">
                                    <button
                                        onClick={() => handleDelete(res.id)}
                                        className="w-full py-3 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-2xl flex items-center justify-center font-bold text-xs uppercase tracking-widest gap-2"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {hasMoreReservations && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={loadMoreReservations}
                        className="px-6 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        Load More Reservations
                    </button>
                </div>
            )}

            {selectedReservation && (
                <ReservationDetailsModal
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                />
            )}
        </div>
    );
};

export default ReservationManagement;
