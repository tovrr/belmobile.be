'use client';

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Quote } from '../../types';
import dynamic from 'next/dynamic';

const QuoteDetailsModal = dynamic(() => import('./QuoteDetailsModal'), {
    loading: () => <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></div>
});

const QuoteManagement: React.FC = () => {
    const { profile } = useAuth();
    const {
        quotes,
        shops,
        hasMoreQuotes,
        loadMoreQuotes
    } = useData();
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [shopFilter, setShopFilter] = useState<string | number>('all');

    const getShopName = (shopId: number | string) => shops.find(s => s.id === shopId)?.name || 'Unknown Shop';

    const filteredQuotes = quotes.filter(q => {
        const matchesSearch = q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
        const matchesType = typeFilter === 'all' || q.type === typeFilter;
        const matchesShop = shopFilter === 'all' || q.shopId === shopFilter;
        return matchesSearch && matchesStatus && matchesType && matchesShop;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Orders & Quotes</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage buyback and repair requests</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50 backdrop-blur-sm">
                <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none transition-all font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-6 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none appearance-none cursor-pointer text-xs font-bold"
                        >
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="responded">Responded</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none appearance-none cursor-pointer text-xs font-bold"
                    >
                        <option value="all">All Types</option>
                        <option value="repair">Repair</option>
                        <option value="buyback">Buyback</option>
                    </select>
                    <select
                        value={shopFilter}
                        onChange={(e) => setShopFilter(e.target.value)}
                        className="px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none appearance-none cursor-pointer text-xs font-bold"
                    >
                        <option value="all">All Shops</option>
                        {shops.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID / Shop</th>
                                <th scope="col" className="px-6 py-4">Customer</th>
                                <th scope="col" className="px-6 py-4">Type</th>
                                <th scope="col" className="px-6 py-4">Device</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredQuotes.map(quote => (
                                <tr key={quote.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-mono text-[10px] text-gray-400">#{quote.id?.toString().slice(-6).toUpperCase()}</span>
                                            <span className="text-gray-600 dark:text-gray-400 text-xs font-semibold">{getShopName(quote.shopId)}</span>
                                            {profile?.role === 'super_admin' && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-bel-blue/10 text-bel-blue uppercase tracking-tighter w-fit">
                                                    📍 {quote.shopId}
                                                </span>
                                            )}
                                        </div>
                                    </td>
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

            {hasMoreQuotes && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={loadMoreQuotes}
                        className="px-6 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        Load More Quotes
                    </button>
                </div>
            )}

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
