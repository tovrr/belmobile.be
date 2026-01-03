import React from 'react';
import { Quote, Shop } from '../../../types';
import { useLanguage } from '../../../hooks/useLanguage';
import { slugToDisplayName } from '../../../utils/slugs';
import {
    ClockIcon, WrenchScrewdriverIcon, CheckCircleIcon,
    CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import StatusBadge from '../../ui/StatusBadge';

interface Props {
    quotes: Quote[];
    shops: Shop[];
    onQuoteClick: (quote: Quote) => void;
    onStatusChange: (quoteId: string | number, newStatus: Quote['status']) => void;
}

const QuoteKanbanBoard: React.FC<Props> = ({ quotes, shops, onQuoteClick, onStatusChange }) => {
    const { t } = useLanguage();

    const getShopName = (shopId: string | number) => {
        const idStr = String(shopId).toLowerCase();
        const shop = shops.find(s => String(s.id).toLowerCase() === idStr || s.slugs?.fr === shopId);
        return shop?.name || shopId;
    };

    const columns = [
        {
            id: 'incoming',
            title: 'Incoming / Intake',
            statuses: ['new', 'pending_drop', 'received', 'draft'],
            color: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20',
            icon: ClockIcon
        },
        {
            id: 'diagnostic',
            title: 'Diagnostic & Quote',
            statuses: ['in_diagnostic', 'verified', 'issue', 'inspected'],
            color: 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20',
            icon: WrenchScrewdriverIcon
        },
        {
            id: 'work_financial',
            title: 'Work & Finance',
            statuses: ['waiting_parts', 'in_repair', 'repairing', 'payment_queued', 'invoiced', 'paid'],
            color: 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20',
            icon: CurrencyEuroIcon
        },
        {
            id: 'ready',
            title: 'Ready / Done',
            statuses: ['ready', 'shipped', 'completed', 'cancelled', 'closed', 'repaired'],
            color: 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20',
            icon: CheckCircleIcon
        }
    ];

    return (
        <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-200px)]">
            {columns.map(col => {
                const colQuotes = quotes.filter(q => col.statuses.includes(q.status));

                return (
                    <div key={col.id} className={`min-w-[320px] w-[320px] flex flex-col rounded-2xl border ${col.color}`}>
                        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-inherit rounded-t-2xl z-10 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <col.icon className="w-5 h-5 opacity-60" />
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wide">
                                    {col.title}
                                </h3>
                            </div>
                            <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300">
                                {colQuotes.length}
                            </span>
                        </div>

                        <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                            {colQuotes.map(quote => (
                                <div
                                    key={quote.id}
                                    onClick={() => onQuoteClick(quote)}
                                    className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all border border-transparent hover:border-bel-blue/30 group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${quote.type === 'repair' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {quote.type}
                                            </span>
                                            <StatusBadge status={quote.status} className="text-[10px] px-1.5 py-0.5" />
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-mono">
                                            #{quote.orderId || String(quote.id).slice(-6).toUpperCase()}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1 truncate">
                                        {slugToDisplayName(quote.model || 'Unknown Device')}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate mb-3">{quote.customerName}</p>

                                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50 dark:border-slate-700">
                                        <span className="flex items-center gap-1">
                                            📍 {getShopName(quote.shopId)}
                                        </span>
                                        {quote.price && (
                                            <span className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300">
                                                <CurrencyEuroIcon className="w-3 h-3" />
                                                {quote.price}
                                            </span>
                                        )}
                                    </div>

                                    {/* Quick Actions Overlay (Optional) */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Future: Add quick move arrows here */}
                                    </div>
                                </div>
                            ))}
                            {colQuotes.length === 0 && (
                                <div className="text-center py-8 opacity-50 text-sm italic">
                                    Empty
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default QuoteKanbanBoard;
