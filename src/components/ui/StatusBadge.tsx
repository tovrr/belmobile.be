import React from 'react';
import { OrderStatus } from '../../types';
import { OrderStateMachine } from '../../utils/OrderStateMachine';

interface StatusBadgeProps {
    status: OrderStatus | string; // Allow string for flexibility/legacy
    className?: string;
}

const statusColors: Record<string, string> = {
    // Initial / Open
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    pending_drop: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',

    // Intake
    received: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    in_diagnostic: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',

    // Work in Progress
    verified: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    waiting_parts: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    in_repair: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200',

    // Financials
    payment_queued: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', // Buyback
    invoiced: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',

    // Fulfillment
    ready: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    shipped: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    completed: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800',

    // Terminal / Issues
    cancelled: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 line-through',
    issue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-bold animate-pulse',

    // Legacy Mappings
    processing: 'bg-blue-50 text-blue-600',
    holding: 'bg-yellow-50 text-yellow-600',
    repaired: 'bg-green-100 text-green-700',
    responded: 'bg-purple-50 text-purple-600',
    inspected: 'bg-indigo-50 text-indigo-600',
    payment_sent: 'bg-emerald-50 text-emerald-600',
    closed: 'bg-gray-100 text-gray-600'
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    // Normalize status key
    const statusKey = status.toLowerCase();

    // Get color classes or default to gray
    const colorClass = statusColors[statusKey] || 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400';

    // Get label (English by default for Admin)
    const label = OrderStateMachine.getLabel(status as OrderStatus, 'en');

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border border-transparent ${colorClass} ${className}`}>
            {label}
        </span>
    );
};

export default StatusBadge;
