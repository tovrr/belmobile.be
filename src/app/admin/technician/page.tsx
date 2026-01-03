'use client';

import React, { useState, useMemo } from 'react';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { Quote, OrderStatus } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import {
    WrenchScrewdriverIcon,
    CheckCircleIcon,
    TruckIcon,
    MagnifyingGlassIcon,
    QrCodeIcon,
    ArrowPathIcon,
    ChatBubbleLeftEllipsisIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import BrandLoader from '@/components/ui/BrandLoader';

export default function TechnicianPortal() {
    const { profile, loading: authLoading } = useAuth();
    const { quotes, loadingOrders, updateQuoteStatus, updateQuoteFields } = useOrders();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter quotes for the current shop and technician-relevant statuses
    const technicianQuotes = useMemo(() => {
        return quotes.filter(q => {
            // Role check: Technicians only see their shop
            if (profile?.role === 'technician' || profile?.role === 'shop_manager') {
                if (q.shopId !== profile.shopId) return false;
            }

            // Search filter
            if (searchQuery) {
                const s = searchQuery.toLowerCase();
                return (
                    q.customerName.toLowerCase().includes(s) ||
                    q.customerEmail.toLowerCase().includes(s) ||
                    (q.orderId && q.orderId.toLowerCase().includes(s)) ||
                    q.model.toLowerCase().includes(s)
                );
            }

            // Default: Show active repairs (including 'new' and 'ready' for collection/processing)
            return ['new', 'pending_drop', 'received', 'in_diagnostic', 'verified', 'in_repair', 'waiting_parts', 'repaired', 'ready', 'processing'].includes(q.status);
        });
    }, [quotes, profile, searchQuery]);

    if (authLoading || loadingOrders) {
        return (
            <div className="h-96 flex items-center justify-center">
                <BrandLoader />
            </div>
        );
    }

    if (!profile || (profile.role !== 'technician' && profile.role !== 'shop_manager' && profile.role !== 'super_admin')) {
        return (
            <div className="p-8 text-center mt-20">
                <h1 className="text-xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-500">Only technicians can access this portal.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-24">
            <header className="mb-8 px-4 lg:px-0 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Technician Portal</h1>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                        <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        {profile.shopId !== 'all' ? `📍 ${profile.shopId}` : '🌍 All Shops'}
                    </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-linear-to-tr from-bel-blue to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-500/20 transform rotate-3">
                    {profile.displayName?.substring(0, 2).toUpperCase()}
                </div>
            </header>

            {/* Quick Search / Scan */}
            <div className="px-4 lg:px-0 mb-8 flex gap-3">
                <div className="relative flex-1 group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-bel-blue transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Quote or Name..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xs focus:ring-4 focus:ring-bel-blue/10 outline-none transition-all text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="p-4 rounded-2xl bg-bel-blue text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform hover:bg-blue-600">
                    <QrCodeIcon className="h-6 w-6" />
                </button>
            </div>

            {/* List */}
            <div className="space-y-6 px-4 lg:px-0">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">
                        {searchQuery ? `Matching Results (${technicianQuotes.length})` : `Repairs to Process (${technicianQuotes.length})`}
                    </h2>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 text-gray-400 hover:text-bel-blue transition-colors"
                    >
                        <ArrowPathIcon className="h-4 w-4" />
                    </button>
                </div>

                {technicianQuotes.length === 0 && (
                    <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl p-16 text-center border border-dashed border-gray-200 dark:border-slate-700">
                        <WrenchScrewdriverIcon className="h-12 w-12 text-gray-300 mx-auto mb-4 opacity-20" />
                        <p className="text-gray-400 font-medium tracking-tight">Everything is clear!</p>
                    </div>
                )}

                {technicianQuotes.map((quote) => (
                    <RepairCard
                        key={quote.id}
                        quote={quote}
                        updateQuoteStatus={updateQuoteStatus}
                        updateQuoteFields={updateQuoteFields}
                    />
                ))}
            </div>
        </div>
    );
}

function RepairCard({ quote, updateQuoteStatus, updateQuoteFields }: {
    quote: Quote,
    updateQuoteStatus: any,
    updateQuoteFields: any
}) {
    const [note, setNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showNoteInput, setShowNoteInput] = useState(false);

    const handleStatusUpdate = async (newStatus: Quote['status']) => {
        setIsUpdating(true);
        try {
            await updateQuoteStatus(quote.id, newStatus, true);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveNote = async () => {
        if (!note.trim()) return;
        setIsUpdating(true);
        try {
            const currentNotes = quote.internalNotes ? `${quote.internalNotes}\n` : '';
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const fullNote = `${currentNotes}[Tech ${timestamp}]: ${note}`;
            await updateQuoteFields(quote.id, { internalNotes: fullNote });
            setNote('');
            setShowNoteInput(false);
        } finally {
            setIsUpdating(false);
        }
    };

    const statusConfig: Record<string, { color: string; label: string; action?: OrderStatus; actionLabel?: string }> = {
        // Intake
        new: { color: 'bg-blue-500', label: 'New', action: 'in_diagnostic', actionLabel: 'Start Diag' },
        pending_drop: { color: 'bg-orange-500', label: 'Pending Drop', action: 'received', actionLabel: 'Receive Unit' },
        received: { color: 'bg-purple-500', label: 'Received', action: 'in_diagnostic', actionLabel: 'Start Diag' },

        // Diagnosis
        in_diagnostic: { color: 'bg-indigo-500', label: 'In Diagnostic', action: 'verified', actionLabel: 'Confirm Quote' },
        verified: { color: 'bg-sky-500', label: 'Verified', action: 'in_repair', actionLabel: 'Start Repair' },

        // Repair
        waiting_parts: { color: 'bg-yellow-500', label: 'Waiting Parts', action: 'in_repair', actionLabel: 'Resume Repair' },
        in_repair: { color: 'bg-pink-500', label: 'In Repair', action: 'ready', actionLabel: 'Finish Repair' },

        // Completion
        ready: { color: 'bg-teal-500', label: 'Ready for Collection', action: 'completed', actionLabel: 'Complete' },
        repaired: { color: 'bg-green-500', label: 'Repaired (Legacy)', action: 'ready', actionLabel: 'Make Ready' },
        processing: { color: 'bg-gray-500', label: 'Processing (Legacy)', action: 'in_diagnostic', actionLabel: 'Migrate' },
    };

    const config = statusConfig[quote.status] || { color: 'bg-gray-500', label: quote.status };

    return (
        <div className={`
            relative overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-4xl border border-gray-100 dark:border-slate-700/50 shadow-xs hover:shadow-xl transition-all duration-500
            ${isUpdating ? 'opacity-50 pointer-events-none' : ''}
        `}>
            {/* Status Strip */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${config.color}`}></div>

            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-[10px] font-black text-gray-500 tracking-tighter">
                            {quote.orderId}
                        </span>
                        <StatusBadge status={quote.status} className="text-[10px] px-1.5 py-0.5" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                        {quote.brand} {quote.model}
                    </h3>
                    <p className="text-xs font-bold text-bel-blue/60 uppercase tracking-tighter">
                        {quote.customerName}
                    </p>
                </div>
            </div>

            {/* Issues tags */}
            {quote.issues && quote.issues.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-6">
                    {quote.issues.map((issue, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-md bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-[10px] font-medium text-gray-600 dark:text-gray-400">
                            {issue}
                        </span>
                    ))}
                </div>
            )}

            {/* Notes Section */}
            {quote.internalNotes && !showNoteInput && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20">
                    <div className="flex items-center gap-2 mb-2">
                        <ChatBubbleLeftEllipsisIcon className="h-3 w-3 text-amber-600" />
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-500 uppercase">Recent Note</span>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-200 whitespace-pre-wrap leading-relaxed line-clamp-3">
                        {quote.internalNotes}
                    </p>
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
                {config.action && (
                    <button
                        onClick={() => handleStatusUpdate(config.action!)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl ${config.color} text-white text-sm font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95`}
                    >
                        {quote.status === 'in_repair' ? <CheckCircleIcon className="h-5 w-5" /> : <ArrowPathIcon className="h-5 w-5" />}
                        {config.actionLabel}
                    </button>
                )}

                <button
                    onClick={() => setShowNoteInput(!showNoteInput)}
                    className="p-4 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-500 hover:text-bel-blue transition-colors"
                >
                    <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
                </button>
            </div>

            {/* Inline Note Input */}
            {showNoteInput && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex gap-2">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Type a technician note..."
                        className="flex-1 bg-gray-50 dark:bg-slate-900 px-4 py-3 rounded-xl outline-none text-sm border border-transparent focus:border-bel-blue transition-all"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
                    />
                    <button
                        onClick={handleSaveNote}
                        className="p-3 bg-bel-blue text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-90 transition-transform"
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
