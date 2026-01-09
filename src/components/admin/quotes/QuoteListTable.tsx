import React from 'react';
import { Quote, Shop } from '../../../types';
import { EyeIcon } from '@heroicons/react/24/outline';
import { slugToDisplayName } from '../../../utils/slugs';
import { formatDistance, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StatusBadge from '../../ui/StatusBadge';

interface Props {
    quotes: Quote[];
    shops: Shop[];
    onQuoteClick: (quote: Quote) => void;
}

const QuoteListTable: React.FC<Props> = ({ quotes, shops, onQuoteClick }) => {

    const getShopName = (shopId: string | number) => {
        if (!shopId || shopId === 'online') return 'Belmobile Online';
        const idStr = String(shopId).toLowerCase();
        const shop = shops.find(s => String(s.id).toLowerCase() === idStr || s.slugs?.fr === shopId);
        return shop?.name || shopId;
    };

    return (
        <div className="space-y-4">
            {/* Desktop View */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID / Shop</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Device / Type</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                            {quotes.map(quote => {
                                const createdDate = quote.createdAt?.seconds
                                    ? new Date(quote.createdAt.seconds * 1000)
                                    : new Date(quote.date);
                                const isOld = (Date.now() - createdDate.getTime()) > 1000 * 60 * 60 * 24 * 2;

                                return (
                                    <tr key={quote.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-700/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[10px] text-indigo-500 font-bold tracking-tighter uppercase">
                                                    #{quote.orderId || String(quote.id).slice(-6)}
                                                </span>
                                                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[120px]">
                                                    {getShopName(quote.shopId)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white leading-tight">{quote.customerName}</div>
                                            <div className="text-[11px] text-gray-400 mt-0.5">{quote.customerEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{slugToDisplayName(quote.model || 'Unknown')}</div>
                                            <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${quote.type === 'repair' ? 'text-orange-500' : 'text-emerald-500'}`}>
                                                {quote.type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={quote.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                {format(createdDate, 'dd MMM yyyy')}
                                            </div>
                                            <div className={`text-[10px] mt-0.5 ${isOld && quote.status === 'new' ? 'text-rose-500 font-black animate-pulse' : 'text-gray-400 font-medium'}`}>
                                                {formatDistance(createdDate, new Date(), { addSuffix: true })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onQuoteClick(quote)}
                                                className="p-2.5 bg-gray-50 dark:bg-slate-900 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all shadow-sm"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {quotes.map(quote => {
                    const createdDate = quote.createdAt?.seconds
                        ? new Date(quote.createdAt.seconds * 1000)
                        : new Date(quote.date);

                    return (
                        <div key={quote.id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[9px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded leading-none">
                                            #{quote.orderId || String(quote.id).slice(-4).toUpperCase()}
                                        </span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${quote.type === 'repair' ? 'text-orange-500' : 'text-emerald-500'}`}>
                                            {quote.type}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{quote.customerName}</h4>
                                </div>
                                <StatusBadge status={quote.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-50 dark:border-slate-700/50">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Device</p>
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-tight">
                                        {slugToDisplayName(quote.model || 'Unknown')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {format(createdDate, 'dd/MM/yy')}
                                    </p>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                        {getShopName(quote.shopId)}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => onQuoteClick(quote)}
                                className="w-full py-3.5 bg-bel-blue text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                            >
                                <EyeIcon className="w-4 h-4" />
                                View Order Details
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuoteListTable;
