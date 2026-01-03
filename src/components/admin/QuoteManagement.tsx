'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import {
    MagnifyingGlassIcon, FunnelIcon,
    ListBulletIcon, Squares2X2Icon
} from '@heroicons/react/24/outline';
import { Quote } from '../../types';
import dynamic from 'next/dynamic';
import QuoteListTable from './quotes/QuoteListTable';
import QuoteKanbanBoard from './quotes/QuoteKanbanBoard';

const QuoteDetailsModal = dynamic(() => import('./QuoteDetailsModal'), {
    loading: () => <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></div>
});

const QuoteManagement: React.FC = () => {
    const { profile } = useAuth();
    const {
        quotes,
        shops,
        updateQuoteStatus,
        hasMoreQuotes,
        loadMoreQuotes
    } = useData();

    // View State
    const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

    // Sync selectedQuote with live data updates
    useEffect(() => {
        if (selectedQuote) {
            const freshQuote = quotes.find(q => q.id === selectedQuote.id);
            if (freshQuote && JSON.stringify(freshQuote) !== JSON.stringify(selectedQuote)) {
                setSelectedQuote(freshQuote);
            }
        }
    }, [quotes, selectedQuote]);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [shopFilter, setShopFilter] = useState<string | number>('all');

    // Filtering Logic
    const filteredQuotes = quotes.filter(q => {
        const matchesSearch = q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (q.orderId || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
        const matchesType = typeFilter === 'all' || q.type === typeFilter;
        const matchesShop = shopFilter === 'all' || q.shopId === shopFilter || String(q.shopId) === String(shopFilter);

        return matchesSearch && matchesStatus && matchesType && matchesShop;
    });

    const handleStatusChange = async (quoteId: string | number, newStatus: Quote['status']) => {
        try {
            await updateQuoteStatus(quoteId, newStatus, true); // true = notify customer
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative h-full">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Orders & Quotes</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage buyback and repair requests</p>
                </div>

                {/* View Toggle */}
                <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700 flex">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'list'
                            ? 'bg-bel-blue text-white shadow-lg shadow-blue-500/30'
                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <ListBulletIcon className="w-4 h-4" />
                        List
                    </button>
                    <button
                        onClick={() => setViewMode('pipeline')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'pipeline'
                            ? 'bg-bel-blue text-white shadow-lg shadow-blue-500/30'
                            : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Squares2X2Icon className="w-4 h-4" />
                        Pipeline
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50 backdrop-blur-sm">
                <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or order ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none transition-all font-medium"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none appearance-none cursor-pointer text-xs font-bold whitespace-nowrap"
                    >
                        <option value="all">All Status</option>
                        <optgroup label="Initial">
                            <option value="draft">Draft</option>
                            <option value="new">New (Walk-in)</option>
                            <option value="pending_drop">Pending Drop (Mail-in)</option>
                        </optgroup>
                        <optgroup label="Processing">
                            <option value="received">Received</option>
                            <option value="in_diagnostic">In Diagnostic</option>
                            <option value="verified">Verified</option>
                            <option value="waiting_parts">Waiting Parts</option>
                            <option value="in_repair">In Repair</option>
                        </optgroup>
                        <optgroup label="Financial">
                            <option value="invoiced">Invoiced</option>
                            <option value="payment_queued">Payment Queued</option>
                            <option value="paid">Paid</option>
                        </optgroup>
                        <optgroup label="Completion">
                            <option value="ready">Ready</option>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                        </optgroup>
                        <optgroup label="Issues/Other">
                            <option value="issue">Issue</option>
                            <option value="cancelled">Cancelled</option>
                        </optgroup>
                    </select>

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
                        className="px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none appearance-none cursor-pointer text-xs font-bold max-w-[150px]"
                    >
                        <option value="all">All Shops</option>
                        {shops.map(s => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'list' && (
                <>
                    <QuoteListTable
                        quotes={filteredQuotes}
                        shops={shops}
                        onQuoteClick={setSelectedQuote}
                    />

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
                </>
            )}

            {viewMode === 'pipeline' && (
                <div className="h-full">
                    <QuoteKanbanBoard
                        quotes={filteredQuotes}
                        shops={shops}
                        onQuoteClick={setSelectedQuote}
                        onStatusChange={handleStatusChange}
                    />
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
