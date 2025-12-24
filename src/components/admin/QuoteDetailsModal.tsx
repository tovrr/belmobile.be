'use client';

import React from 'react';
import { Quote } from '../../types';
import { useData } from '../../hooks/useData';
import { XMarkIcon, TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

interface QuoteDetailsModalProps {
    quote: Quote;
    onClose: () => void;
}

const QuoteDetailsModal: React.FC<QuoteDetailsModalProps> = ({ quote, onClose }) => {
    const { updateQuoteStatus, updateQuoteIssues, deleteQuote, shops } = useData();
    const shopName = shops.find(s => s.id === quote.shopId)?.name || 'Unknown Shop';



    const [currentStatus, setCurrentStatus] = React.useState(quote.status);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [notifyCustomer, setNotifyCustomer] = React.useState(true);

    // Issue Editing State
    const [isEditingIssues, setIsEditingIssues] = React.useState(false);
    const [issues, setIssues] = React.useState<string[]>(quote.issues || (quote.issue ? [quote.issue] : []));
    const [newIssue, setNewIssue] = React.useState('');

    // Delete State
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

    // Sync state if prop changes externally (though selectedQuote in parent is likely static)
    React.useEffect(() => {
        setCurrentStatus(quote.status);
    }, [quote.status]);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as Quote['status']; // Cast to allow new statuses
        setCurrentStatus(newStatus);
        setIsUpdating(true);
        try {
            await updateQuoteStatus(quote.id, newStatus, notifyCustomer);

            // AUTOMATION: Schedule Review Email if Closed/Picked Up
            if (newStatus === 'closed' || newStatus === 'repaired') { // Assuming 'repaired' for now, but logic strictly asks for end-of-cycle
                // NOTE: We only want to trigger this when the customer actually HAS the device.
                // So best practice is 'closed' (transaction done) or 'picked_up' (if you add that status).

                if (newStatus === 'closed') {
                    await fetch('/api/mail/schedule-review', {
                        method: 'POST',
                        body: JSON.stringify({
                            email: quote.customerEmail,
                            name: quote.customerName,
                            orderId: quote.id,
                            shopId: quote.shopId,
                            language: quote.language || 'fr' // Assuming language field exists or default
                        })
                    });
                    console.log('Review email scheduled via Automation');
                }
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status");
            setCurrentStatus(quote.status);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteQuote(quote.id);
            onClose(); // Close modal after delete
        } catch (error) {
            console.error("Failed to delete quote:", error);
            alert("Failed to delete quote");
        }
    };

    const handleAddIssue = () => {
        if (newIssue.trim()) {
            setIssues([...issues, newIssue.trim()]);
            setNewIssue('');
        }
    };

    const handleRemoveIssue = (index: number) => {
        const newIssues = [...issues];
        newIssues.splice(index, 1);
        setIssues(newIssues);
    };

    const handleSaveIssues = async () => {
        try {
            await updateQuoteIssues(quote.id, issues);
            setIsEditingIssues(false);
        } catch (error) {
            console.error("Failed to update issues:", error);
            alert("Failed to update issues");
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
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-gray-900 dark:text-white">Issue Description</h3>
                                {!isEditingIssues ? (
                                    <button
                                        onClick={() => setIsEditingIssues(true)}
                                        className="text-xs font-bold text-bel-blue hover:underline flex items-center gap-1"
                                    >
                                        <PencilIcon className="w-3 h-3" /> Edit
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSaveIssues}
                                        className="text-xs font-bold text-green-600 hover:underline flex items-center gap-1"
                                    >
                                        Save
                                    </button>
                                )}
                            </div>

                            {!isEditingIssues ? (
                                <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-300">
                                    {issues.length > 0 ? issues.join(', ') : 'No issues listed'}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {issues.map((issue, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg border border-gray-200 dark:border-slate-700">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{issue}</span>
                                            <button onClick={() => handleRemoveIssue(idx)} className="text-red-500 hover:text-red-700">
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2 mt-2">
                                        <input
                                            type="text"
                                            value={newIssue}
                                            onChange={(e) => setNewIssue(e.target.value)}
                                            placeholder="Add new issue..."
                                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 text-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddIssue()}
                                        />
                                        <button onClick={handleAddIssue} className="bg-gray-100 dark:bg-slate-700 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">
                                            <PlusIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-4">
                        <label htmlFor="status" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Update Status
                            {isUpdating && <span className="ml-2 text-xs text-bel-blue animate-pulse">Updating...</span>}
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={currentStatus}
                            onChange={handleStatusChange}
                            disabled={isUpdating}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition disabled:opacity-50"
                        >
                            {quote.type === 'repair' ? (
                                <>
                                    <option value="new">New</option>
                                    <option value="processing">Processing</option>
                                    <option value="waiting_parts">Waiting for Parts</option>
                                    <option value="in_repair">In Repair</option>
                                    <option value="repaired">Repaired</option>
                                    <option value="ready">Ready for Pickup</option>
                                    <option value="responded">Responded</option>
                                    <option value="closed">Closed</option>
                                </>
                            ) : (
                                <>
                                    <option value="new">New</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Device Shipped (by customer)</option>
                                    <option value="responded">Responded</option>
                                    <option value="closed">Closed (Paid)</option>
                                </>
                            )}
                        </select>
                        <div className="mt-2 flex items-center">
                            <input
                                type="checkbox"
                                id="notifyCustomer"
                                checked={notifyCustomer}
                                onChange={(e) => setNotifyCustomer(e.target.checked)}
                                className="w-4 h-4 text-bel-blue border-gray-300 rounded focus:ring-bel-blue"
                            />
                            <label htmlFor="notifyCustomer" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                Notify customer via email about this status change
                            </label>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex justify-end rounded-b-3xl">
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-red-50 text-red-600 font-bold py-3 px-6 rounded-xl hover:bg-red-100 transition mr-auto flex items-center gap-2"
                        >
                            <TrashIcon className="h-5 w-5" /> Delete
                        </button>
                    ) : (
                        <div className="mr-auto flex items-center gap-3">
                            <span className="text-sm font-bold text-red-600">Are you sure?</span>
                            <button
                                onClick={handleDelete}
                                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                    <button onClick={onClose} className="bg-bel-blue text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetailsModal;
