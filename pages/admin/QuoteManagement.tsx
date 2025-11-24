import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Quote } from '../../types';
import QuoteDetailsModal from '../../components/admin/QuoteDetailsModal';

const QuoteManagement: React.FC = () => {
    const { quotes, shops } = useData();
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

    const getShopName = (shopId: number) => shops.find(s => s.id === shopId)?.name || 'Unknown Shop';

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quote Management</h2>
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Device</th>
                                <th scope="col" className="px-6 py-3">Shop</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map(quote => (
                                <tr key={quote.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{quote.customerName}</div>
                                        <div className="text-xs text-gray-500">{quote.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                             quote.type === 'repair' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                                         }`}>
                                            {quote.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{quote.brand} {quote.model}</td>
                                    <td className="px-6 py-4">{getShopName(quote.shopId)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                            quote.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                            quote.status === 'responded' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelectedQuote(quote)} className="text-gray-600 hover:text-gray-800" title="View Details"><EyeIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedQuote && (
                <QuoteDetailsModal 
                    quote={selectedQuote} 
                    onClose={() => setSelectedQuote(null)} 
                />
            )}
        </>
    );
};

export default QuoteManagement;