'use client';

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Quote } from '../../types';
import QuoteDetailsModal from './QuoteDetailsModal';

const QuoteManagement: React.FC = () => {
    const { quotes, shops } = useData();
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

    const getShopName = (shopId: number | string) => shops.find(s => s.id === shopId)?.name || 'Unknown Shop';

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Orders & Quotes</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage buyback and repair requests</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">Customer</th>
                                <th scope="col" className="px-6 py-4">Type</th>
                                <th scope="col" className="px-6 py-4">Device</th>
                                <th scope="col" className="px-6 py-4">Shop</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {quotes.map(quote => (
                                <tr key={quote.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{quote.customerName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{quote.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${quote.type === 'repair'
                                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {quote.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">{quote.brand} {quote.model}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{getShopName(quote.shopId)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${quote.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                quote.status === 'responded' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelectedQuote(quote)} className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 rounded-xl transition-colors" title="View Details">
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
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
        </div>
    );
};

export default QuoteManagement;
