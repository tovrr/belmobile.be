'use client';

import React from 'react';
import { Quote } from '../../types';
import { useData } from '../../hooks/useData';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface QuoteDetailsModalProps {
    quote: Quote;
    onClose: () => void;
}

const QuoteDetailsModal: React.FC<QuoteDetailsModalProps> = ({ quote, onClose }) => {
    const { updateQuoteStatus, shops } = useData();
    const shopName = shops.find(s => s.id === quote.shopId)?.name || 'Unknown Shop';

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as 'new' | 'processing' | 'responded' | 'closed';
        try {
            await updateQuoteStatus(quote.id, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white capitalize">
                        {quote.type} Quote Details
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Request ID: {quote.id}</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Customer Details</h3>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <p><strong className="text-gray-900 dark:text-white">Name:</strong> {quote.customerName}</p>
                                <p><strong className="text-gray-900 dark:text-white">Email:</strong> {quote.customerEmail}</p>
                                <p><strong className="text-gray-900 dark:text-white">Phone:</strong> {quote.customerPhone}</p>
                                <p><strong className="text-gray-900 dark:text-white">Shop:</strong> {shopName}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Device Details</h3>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <p><strong className="text-gray-900 dark:text-white">Type:</strong> {quote.deviceType}</p>
                                <p><strong className="text-gray-900 dark:text-white">Brand:</strong> {quote.brand}</p>
                                <p><strong className="text-gray-900 dark:text-white">Model:</strong> {quote.model}</p>
                                {quote.type === 'buyback' && (
                                    <p>
                                        <strong className="text-gray-900 dark:text-white">Condition:</strong>{' '}
                                        {typeof quote.condition === 'object' && quote.condition !== null
                                            ? `${quote.condition.screen} / ${quote.condition.body}`
                                            : quote.condition}
                                    </p>
                                )}
                                <p className="text-lg font-bold text-bel-blue mt-2">
                                    Estimated Price: €{quote.price}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Delivery & Payment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    <strong className="text-gray-900 dark:text-white">Method:</strong> <span className="capitalize">{quote.deliveryMethod === 'send' ? 'Send by Post' : 'Visit Store'}</span>
                                </p>
                                {quote.deliveryMethod === 'send' && (
                                    <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl text-sm">
                                        <p className="font-bold text-gray-900 dark:text-white mb-1">Shipping Address:</p>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {quote.customerAddress}<br />
                                            {quote.customerZip} {quote.customerCity}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div>
                                {quote.iban && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <strong className="text-gray-900 dark:text-white">IBAN:</strong> {quote.iban}
                                    </p>
                                )}
                                {quote.idUrl && (
                                    <div className="mt-2">
                                        <a
                                            href={quote.idUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm font-bold text-bel-blue hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl"
                                        >
                                            View ID Document
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {quote.type === 'repair' && (
                        <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Issue Description</h3>
                            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-300">
                                {quote.issues ? quote.issues.join(', ') : quote.issue}
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <label htmlFor="status" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Update Status</label>
                        <select
                            id="status"
                            name="status"
                            value={quote.status}
                            onChange={handleStatusChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                        >
                            <option value="new">New</option>
                            <option value="processing">Processing</option>
                            <option value="responded">Responded</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex justify-end rounded-b-3xl">
                    <button onClick={onClose} className="bg-bel-blue text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetailsModal;
