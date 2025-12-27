'use client';

import React from 'react';
import { Quote, ActivityLogEntry } from '../../types';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { useLanguage } from '../../hooks/useLanguage';
import { type RepairBuybackData } from '../../utils/pdfGenerator';
import { XMarkIcon, TrashIcon, PencilIcon, PlusIcon, CheckIcon, ArrowPathIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'; // Add new icons

interface QuoteDetailsModalProps {
    quote: Quote;
    onClose: () => void;
}

const QuoteDetailsModal: React.FC<QuoteDetailsModalProps> = ({ quote, onClose }) => {
    const { updateQuoteStatus, updateQuoteIssues, deleteQuote, updateQuoteFields, shops } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();
    const shopName = shops.find(s => s.id === quote.shopId)?.name || 'Unknown Shop';

    const [currentStatus, setCurrentStatus] = React.useState(quote.status);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [notifyCustomer, setNotifyCustomer] = React.useState(true);

    // -- ADMIN EDIT STATE --
    const [isEditingPrice, setIsEditingPrice] = React.useState(false);
    const [editedPrice, setEditedPrice] = React.useState(quote.price || 0);

    const [internalNotes, setInternalNotes] = React.useState(quote.internalNotes || '');
    const [isSavingNotes, setIsSavingNotes] = React.useState(false);

    // PDF Generation State
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

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

    const logActivity = async (action: string, oldValue: any, newValue: any, note?: string) => {
        try {
            const newEntry: ActivityLogEntry = {
                timestamp: new Date().toISOString(),
                adminId: user?.uid || 'unknown',
                adminName: user?.displayName || 'Admin',
                action,
                oldValue,
                newValue,
                note
            };

            const updatedLog = [...(quote.activityLog || []), newEntry];
            await updateQuoteFields(quote.id, { activityLog: updatedLog });
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as Quote['status']; // Cast to allow new statuses
        setCurrentStatus(newStatus);
        setIsUpdating(true);
        try {
            const oldStatus = quote.status;
            await updateQuoteStatus(quote.id, newStatus, notifyCustomer);
            await logActivity('status_change', oldStatus, newStatus);

            // AUTOMATION: Schedule Review Email if Closed/Picked Up
            if (newStatus === 'closed' || newStatus === 'repaired') {
                if (newStatus === 'closed') {
                    await fetch('/api/mail/schedule-review', {
                        method: 'POST',
                        body: JSON.stringify({
                            email: quote.customerEmail,
                            name: quote.customerName,
                            orderId: quote.id,
                            shopId: quote.shopId,
                            language: quote.language || 'fr'
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
            const oldIssues = quote.issues || [];
            await updateQuoteIssues(quote.id, issues);

            // Log Activity
            await logActivity('issues_update', oldIssues, issues);

            setIsEditingIssues(false);
        } catch (error) {
            console.error("Failed to update issues:", error);
            alert("Failed to update issues");
        }
    };

    // -- NEW ADMIN ACTIONS --

    const handleSavePrice = async () => {
        if (editedPrice < 0) return alert("Price cannot be negative");

        try {
            const oldPrice = quote.price;
            await updateQuoteFields(quote.id, { price: editedPrice });
            await logActivity('price_change', oldPrice, editedPrice);
            setIsEditingPrice(false);
        } catch (error) {
            console.error("Failed to update price:", error);
            alert("Failed to update price");
        }
    };

    const handleSaveNotes = async () => {
        setIsSavingNotes(true);
        try {
            // Only save if changed
            if (internalNotes !== quote.internalNotes) {
                await updateQuoteFields(quote.id, { internalNotes });
            }
        } catch (error) {
            console.error("Failed to save notes:", error);
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const pdfData: RepairBuybackData = {
                type: quote.type as 'buyback' | 'repair',
                orderId: quote.id.toString(),
                date: quote.date || new Date().toLocaleDateString(),
                customer: {
                    name: quote.customerName,
                    email: quote.customerEmail,
                    phone: quote.customerPhone,
                    address: quote.customerAddress || '',
                    city: quote.customerCity || '',
                    zip: quote.customerZip || ''
                },
                device: {
                    brand: quote.brand,
                    model: quote.model,
                    issue: quote.issue,
                    condition: typeof quote.condition === 'string' ? undefined : (quote.condition as any)
                },
                issues: quote.issues, // Root level property
                financials: {
                    price: quote.price || 0,
                    currency: 'EUR',
                    vatIncluded: true
                },
                deliveryMethod: quote.deliveryMethod,
                iban: quote.iban
            };

            // Handle condition if string vs object
            if (typeof quote.condition === 'string') {
                // pdfGenerator expects object for buyback detailed list? 
                // type definition: condition?: { screen: string; body: string; };
                // If it's a string, we might map it or leave it. 
                // For now, if string, we don't pass 'condition' object as PDF expects {screen, body}.
            } else if (quote.condition) {
                pdfData.device.condition = quote.condition as any;
            }

            const { generateRepairBuybackPDF, savePDFBlob } = await import('../../utils/pdfGenerator');
            const { blob } = await generateRepairBuybackPDF(pdfData, t);
            savePDFBlob(blob, `Order_${quote.id}.pdf`);

        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate PDF");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Auto-save notes on blur
    const handleNotesBlur = () => {
        if (internalNotes !== quote.internalNotes) {
            handleSaveNotes();
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
                                <div className="mt-4 flex items-center gap-2">
                                    <strong className="text-gray-900 dark:text-white">Price:</strong>
                                    {!isEditingPrice ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black text-bel-blue">€{quote.price}</span>
                                            <button
                                                onClick={() => {
                                                    setEditedPrice(quote.price || 0);
                                                    setIsEditingPrice(true);
                                                }}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400 hover:text-bel-blue transition-colors"
                                                title="Edit Price"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editedPrice}
                                                onChange={(e) => setEditedPrice(Number(e.target.value))}
                                                className="w-24 px-2 py-1 border border-bel-blue rounded text-lg font-bold text-gray-900 dark:text-white dark:bg-slate-800 outline-none"
                                            />
                                            <button
                                                onClick={handleSavePrice}
                                                className="p-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                                            >
                                                <CheckIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setIsEditingPrice(false)}
                                                className="p-1 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
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
                    {/* INTERNAL NOTES SECTION */}
                    <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Internal Admin Notes (Private)
                            {isSavingNotes && <span className="ml-2 text-xs text-gray-400 animate-pulse">Saving...</span>}
                        </label>
                        <textarea
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            onBlur={handleNotesBlur}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-yellow-50/50 dark:bg-yellow-900/10 focus:ring-2 focus:ring-yellow-400 outline-none transition text-sm text-gray-700 dark:text-gray-200 min-h-[100px]"
                            placeholder="Add internal notes about this order here..."
                        />
                    </div>

                    {/* ACTIVITY TIMELINE */}
                    {quote.activityLog && quote.activityLog.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Activity Log</h3>
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {[...quote.activityLog].reverse().map((log, idx) => (
                                    <div key={idx} className="flex gap-3 text-sm">
                                        <div className="shrink-0 mt-1">
                                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 dark:text-white">
                                                <span className="font-semibold">{log.adminName || 'Admin'}</span>
                                                {' '}
                                                {log.action === 'price_change' && (
                                                    <span>changed price from <del className="text-gray-500">€{log.oldValue}</del> to <span className="font-bold text-bel-blue">€{log.newValue}</span></span>
                                                )}
                                                {log.action === 'issues_update' && (
                                                    <span>updated issues list</span>
                                                )}
                                                {log.action === 'status_change' && (
                                                    <span>changed status to <span className="font-bold capitalize">{log.newValue}</span></span>
                                                )}
                                                {(!['price_change', 'issues_update', 'status_change'].includes(log.action)) && (
                                                    <span>{log.action}</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                    <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition flex items-center gap-2 mr-3">
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        {isGeneratingPDF ? '...' : 'PDF'}
                    </button>
                    <button onClick={onClose} className="bg-bel-blue text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none">
                        Close
                    </button>
                </div>
            </div>
        </div >
    );
};

export default QuoteDetailsModal;
