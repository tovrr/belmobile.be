import React from 'react';
import { Quote, Shop, ActivityLogEntry } from '../../../types';
import { useData } from '../../../hooks/useData';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { slugToDisplayName } from '../../../utils/slugs';

// --- Types ---
interface WrapperProps {
    children: React.ReactNode;
    title: string;
}

// --- Generic Wrapper ---
export const SectionWrapper: React.FC<WrapperProps> = ({ children, title }) => (
    <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide opacity-80">{title}</h3>
        {children}
    </div>
);

// --- Header ---
interface QuoteHeaderProps {
    quote: Quote;
    onClose: () => void;
    onDownloadPdf?: () => void;
    onDelete?: () => void;
}

export const QuoteHeader: React.FC<QuoteHeaderProps> = ({ quote, onClose, onDownloadPdf, onDelete }) => (
    <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-start">
        <div>
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white capitalize">
                    {quote.type} Quote
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${quote.status === 'new' ? 'bg-blue-100 text-blue-700' :
                    quote.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                        quote.status === 'repaired' ? 'bg-green-100 text-green-700' :
                            'bg-yellow-100 text-yellow-700'
                    }`}>
                    {quote.status}
                </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <p>ID: <span className="font-mono font-bold text-gray-700 dark:text-gray-300 select-all">{quote.orderId || quote.id}</span></p>
                <span className="text-gray-300">•</span>
                <p>{new Date(quote.date).toLocaleDateString()} {new Date(quote.date).toLocaleTimeString()}</p>
            </div>
        </div>

        <div className="flex items-center gap-2">
            {onDownloadPdf && (
                <button
                    onClick={onDownloadPdf}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    PDF
                </button>
            )}

            {onDelete && (
                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete
                </button>
            )}

            <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 mx-1"></div>

            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
                <XMarkIcon className="h-6 w-6" />
            </button>
        </div>
    </div>
);

// --- Customer Details ---
export const CustomerInfoCard: React.FC<{ quote: Quote }> = ({ quote }) => {
    const { shops } = useData();

    // Robust Shop Name Logic
    const shopName = React.useMemo(() => {
        if (!quote.shopId) return 'Unknown Shop';
        const exactMatch = shops.find((s: Shop) => s.id === quote.shopId);
        if (exactMatch) return exactMatch.name;

        // Fallback: try matching by slugified name if shopId is actually a slug
        const slugMatch = shops.find((s: Shop) => (s as any).slug === quote.shopId || String(s.id).toLowerCase() === String(quote.shopId).toLowerCase());
        if (slugMatch) return slugMatch.name;

        return 'Unknown Shop';
    }, [shops, quote.shopId]);

    return (
        <SectionWrapper title="Customer Details">
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="grid grid-cols-[80px_1fr] gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">Name:</span>
                    <span>{quote.customerName}</span>

                    <span className="font-bold text-gray-900 dark:text-white">Email:</span>
                    <a href={`mailto:${quote.customerEmail}`} className="text-bel-blue dark:text-blue-400 hover:underline">{quote.customerEmail}</a>

                    <span className="font-bold text-gray-900 dark:text-white">Phone:</span>
                    <a href={`tel:${quote.customerPhone}`} className="text-bel-blue dark:text-blue-400 hover:underline">{quote.customerPhone}</a>

                    <span className="font-bold text-gray-900 dark:text-white">Shop:</span>
                    <span>{shopName}</span>

                    <span className="font-bold text-gray-900 dark:text-white">Delivery:</span>
                    <span className="capitalize">{quote.deliveryMethod === 'send' ? 'Mail-In' : 'Store Visit'}</span>
                </div>

                {quote.deliveryMethod === 'send' && (
                    <div className="mt-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                        <p className="font-bold text-xs text-gray-500 uppercase mb-1">Shipping Address</p>
                        <p>{quote.customerAddress}</p>
                        <p>{quote.customerZip} {quote.customerCity}</p>
                    </div>
                )}
            </div>
        </SectionWrapper>
    );
};

// --- Device Summary (Top Level) ---
export const DeviceBasicsCard: React.FC<{ quote: Quote }> = ({ quote }) => (
    <SectionWrapper title="Device Basics">
        <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
            <span className="font-bold text-gray-900 dark:text-white">Type:</span>
            <span className="capitalize">{quote.deviceType}</span>

            <span className="font-bold text-gray-900 dark:text-white">Brand:</span>
            <span>{quote.brand}</span>

            <span className="font-bold text-gray-900 dark:text-white">Model:</span>
            <span className="font-medium text-bel-blue">{slugToDisplayName(quote.model || '')}</span>

            {quote.storage && (
                <>
                    <span className="font-bold text-gray-900 dark:text-white">Storage:</span>
                    <span>{quote.storage}</span>
                </>
            )}
        </div>
    </SectionWrapper>
);

// --- Activity Log ---
export const ActivityLogViewer: React.FC<{ log: ActivityLogEntry[] }> = ({ log }) => {
    if (!log || log.length === 0) return null;

    return (
        <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bel-blue"></span> Activity Log
            </h3>
            <div className="space-y-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {[...log].reverse().map((entry, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                        <div className="text-gray-400 w-24 shrink-0 px-1">
                            {new Date(entry.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex-1 text-gray-600 dark:text-gray-300">
                            <span className="font-bold text-gray-900 dark:text-white mr-1">{entry.adminName}:</span>
                            <span className="font-medium bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide mr-1.5">{entry.action.replace(/_/g, ' ')}</span>
                            <span>
                                {entry.note ? `"${entry.note}"` : ''}
                                {entry.action === 'price_change' && `from €${entry.oldValue} to €${entry.newValue}`}
                                {entry.action === 'status_change' && `from ${entry.oldValue} to ${entry.newValue}`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
