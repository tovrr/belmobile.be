import React from 'react';
import { Quote, Shop } from '../../../types';
import { EyeIcon } from '@heroicons/react/24/outline';
import { slugToDisplayName } from '../../../utils/slugs';
import { formatDistance, format } from 'date-fns';
import { fr } from 'date-fns/locale'; // Default to FR locale for now, or pass locale

interface Props {
    quotes: Quote[];
    shops: Shop[];
    onQuoteClick: (quote: Quote) => void;
}

const QuoteListTable: React.FC<Props> = ({ quotes, shops, onQuoteClick }) => {

    const getShopName = (shopId: string | number) => {
        const idStr = String(shopId).toLowerCase();
        const shop = shops.find(s => String(s.id).toLowerCase() === idStr || s.slugs?.fr === shopId);
        return shop?.name || shopId;
    };

    const getStatusColor = (status: Quote['status']) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'processing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'in_repair': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'repaired': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'ready': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
            case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'holding': return 'bg-red-50 text-red-600 border border-red-200';
            case 'waiting_parts': return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
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
                            <th scope="col" className="px-6 py-4">Date</th>
                            <th scope="col" className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {quotes.map(quote => {
                            const createdDate = quote.createdAt?.seconds
                                ? new Date(quote.createdAt.seconds * 1000)
                                : new Date(quote.date);
                            const isOld = (Date.now() - createdDate.getTime()) > 1000 * 60 * 60 * 24 * 2; // 2 days

                            return (
                                <tr key={quote.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-mono text-[10px] text-gray-400">
                                                #{quote.orderId || String(quote.id).slice(-6).toUpperCase()}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400 text-xs font-semibold">
                                                {getShopName(quote.shopId)}
                                            </span>
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
                                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                                        {slugToDisplayName(quote.model || 'Unknown Device')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getStatusColor(quote.status)}`}>
                                            {quote.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`text-xs ${isOld && quote.status === 'new' ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                                {formatDistance(createdDate, new Date(), { addSuffix: true })}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {format(createdDate, 'dd/MM/yyyy')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => onQuoteClick(quote)} className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 rounded-xl transition-colors" title="View Details">
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
    );
};

export default QuoteListTable;
