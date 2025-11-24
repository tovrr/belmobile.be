import React from 'react';
import { useData } from '../../hooks/useData';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ReservationManagement: React.FC = () => {
    const { reservations, shops, updateReservationStatus } = useData();
    const getShopName = (shopId: number) => shops.find(s => s.id === shopId)?.name || 'Unknown Shop';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Reservation Management</h2>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Product</th>
                            <th scope="col" className="px-6 py-3">Shop</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map(res => (
                            <tr key={res.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{res.customerName}</div>
                                    <div className="text-xs text-gray-500">{res.customerEmail}</div>
                                </td>
                                <td className="px-6 py-4">{res.productName}</td>
                                <td className="px-6 py-4">{getShopName(res.shopId)}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                        res.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {res.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{res.date}</td>
                                <td className="px-6 py-4 flex space-x-2">
                                    {res.status === 'pending' && (
                                        <>
                                            <button onClick={() => updateReservationStatus(res.id, 'approved')} className="text-green-600 hover:text-green-800" title="Approve"><CheckCircleIcon className="h-5 w-5" /></button>
                                            <button onClick={() => updateReservationStatus(res.id, 'cancelled')} className="text-red-600 hover:text-red-800" title="Cancel"><XCircleIcon className="h-5 w-5" /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReservationManagement;