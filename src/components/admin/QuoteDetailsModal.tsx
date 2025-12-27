'use client';

import React from 'react';
import { Quote, ActivityLogEntry, Shop, RepairPricing, BuybackPriceRecord } from '../../types';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { type RepairBuybackData } from '../../utils/pdfGenerator';
import {
    XMarkIcon, TrashIcon, PencilIcon, PlusIcon, CheckIcon,
    ArrowPathIcon, ArrowDownTrayIcon, CloudArrowUpIcon,
    CreditCardIcon, DocumentIcon
} from '@heroicons/react/24/outline';
import { calculateBuybackPrice } from '../../utils/pricingCalculator';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';

const QuoteDetailsModal: React.FC<{ quote: Quote; onClose: () => void }> = ({ quote, onClose }) => {
    const { updateQuoteStatus, updateQuoteIssues, deleteQuote, updateQuoteFields, shops, buybackPrices, repairPrices } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();
    const shopName = shops.find((s: Shop) => s.id === quote.shopId)?.name || 'Unknown Shop';

    const [currentStatus, setCurrentStatus] = React.useState(quote.status);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [notifyCustomer, setNotifyCustomer] = React.useState(true);

    // -- PAYMENT STATE --
    const [isPaid, setIsPaid] = React.useState(quote.isPaid || false);
    const [paymentLink, setPaymentLink] = React.useState(quote.paymentLink || '');
    const [isUploadingReceipt, setIsUploadingReceipt] = React.useState(false);

    // -- BUYBACK EDIT STATE --
    const [isEditingSpecs, setIsEditingSpecs] = React.useState(false);
    const [editedStorage, setEditedStorage] = React.useState(quote.storage || '');
    const [editedScreenCondition, setEditedScreenCondition] = React.useState(
        typeof quote.condition === 'object' ? quote.condition.screen : (quote.condition || 'perfect')
    );
    const [editedBodyCondition, setEditedBodyCondition] = React.useState(
        typeof quote.condition === 'object' ? quote.condition.body : (quote.condition || 'perfect')
    );
    const [editedSpecs, setEditedSpecs] = React.useState({
        turnsOn: quote.turnsOn !== undefined ? quote.turnsOn : true,
        worksCorrectly: quote.worksCorrectly !== undefined ? quote.worksCorrectly : true,
        isUnlocked: quote.isUnlocked !== undefined ? quote.isUnlocked : true,
        faceIdWorking: quote.faceIdWorking !== undefined ? quote.faceIdWorking : true,
        batteryHealth: quote.batteryHealth || 'normal'
    });

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

    const logActivity = async (action: string, oldValue: unknown, newValue: unknown, note?: string) => {
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

    const handleTogglePayment = async () => {
        try {
            const nextPaid = !isPaid;
            await updateQuoteFields(quote.id, { isPaid: nextPaid });
            setIsPaid(nextPaid);
            await logActivity('payment_status_change', isPaid, nextPaid);
        } catch (error) {
            console.error("Failed to toggle payment:", error);
        }
    };

    const handleSavePaymentLink = async () => {
        try {
            await updateQuoteFields(quote.id, { paymentLink });
            await logActivity('payment_link_update', quote.paymentLink, paymentLink);
            alert("Payment link saved");
        } catch (error) {
            console.error("Failed to save payment link:", error);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingReceipt(true);
        try {
            const storageRef = ref(storage, `receipts/${quote.id}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await updateQuoteFields(quote.id, { paymentReceiptUrl: downloadURL });
            await logActivity('receipt_upload', null, downloadURL);
            alert("Receipt uploaded successfully!");
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed");
        } finally {
            setIsUploadingReceipt(false);
        }
    };

    const handleRecalculatePrice = () => {
        const pricingState = {
            type: 'buyback' as const,
            deviceType: quote.deviceType || 'smartphone',
            selectedBrand: quote.brand,
            selectedModel: quote.model,
            storage: editedStorage,
            turnsOn: editedSpecs.turnsOn,
            worksCorrectly: editedSpecs.worksCorrectly,
            isUnlocked: editedSpecs.isUnlocked,
            faceIdWorking: editedSpecs.faceIdWorking,
            batteryHealth: editedSpecs.batteryHealth,
            screenState: editedScreenCondition.toLowerCase(),
            bodyState: editedBodyCondition.toLowerCase(),
            repairIssues: []
        };

        // Filtering logic: Assume deviceId is brand-model (slugified)
        const deviceIdSlug = `${quote.brand}-${quote.model}`.toLowerCase().replace(/\s+/g, '-');
        const relevantBuybackPrices = buybackPrices.filter((p: any) =>
            (p.brand === quote.brand && p.model === quote.model) ||
            (p.deviceId === deviceIdSlug)
        ) as BuybackPriceRecord[];
        const mappedRepairPrices: Record<string, number> = {};
        repairPrices.forEach((rp: RepairPricing) => {
            // pricingCalculator expects flattened keys
            mappedRepairPrices['screen_generic'] = (rp.screen_generic as number) || 0;
            mappedRepairPrices['screen_oled'] = (rp.screen_oled as number) || 0;
            mappedRepairPrices['screen_original'] = (rp.screen_original as number) || 0;
            mappedRepairPrices['battery'] = (rp.battery as number) || 0;
            mappedRepairPrices['back_glass'] = (rp.back_glass as number) || 0;
        });

        const newPrice = calculateBuybackPrice(pricingState, {
            buybackPrices: relevantBuybackPrices,
            repairPrices: mappedRepairPrices
        });

        setEditedPrice(newPrice);
    };

    const handleSaveSpecs = async () => {
        try {
            const updates: Partial<Quote> = {
                storage: editedStorage,
                condition: {
                    screen: editedScreenCondition,
                    body: editedBodyCondition
                },
                turnsOn: editedSpecs.turnsOn,
                worksCorrectly: editedSpecs.worksCorrectly,
                isUnlocked: editedSpecs.isUnlocked,
                faceIdWorking: editedSpecs.faceIdWorking,
                batteryHealth: editedSpecs.batteryHealth,
                price: editedPrice // Take the current edited price (from recalculate or manual)
            };
            await updateQuoteFields(quote.id, updates);
            await logActivity('specs_update', 'Multiple fields', updates as unknown);
            setIsEditingSpecs(false);
        } catch (error) {
            console.error("Failed to save specs:", error);
            alert("Failed to save specs");
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
                    storage: quote.storage,
                    condition: typeof quote.condition === 'string' ? quote.condition : (quote.condition as { screen: string; body: string })
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
                pdfData.device.condition = quote.condition as { screen: string; body: string };
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
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl relative">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-gray-900 dark:text-white">Device Details</h3>
                                {quote.type === 'buyback' && !isEditingSpecs && (
                                    <button
                                        onClick={() => setIsEditingSpecs(true)}
                                        className="text-xs font-bold text-bel-blue hover:underline flex items-center gap-1"
                                    >
                                        <PencilIcon className="w-3 h-3" /> Edit Specs
                                    </button>
                                )}
                            </div>
                            {!isEditingSpecs ? (
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <p><strong className="text-gray-900 dark:text-white">Type:</strong> {quote.deviceType}</p>
                                    <p><strong className="text-gray-900 dark:text-white">Brand:</strong> {quote.brand}</p>
                                    <p><strong className="text-gray-900 dark:text-white">Model:</strong> {quote.model}</p>
                                    {quote.storage && (
                                        <p><strong className="text-gray-900 dark:text-white">Storage:</strong> {quote.storage}</p>
                                    )}
                                    {quote.type === 'buyback' && (
                                        <>
                                            <p>
                                                <strong className="text-gray-900 dark:text-white">Condition:</strong>{' '}
                                                {typeof quote.condition === 'object' && quote.condition !== null
                                                    ? `${quote.condition.screen} / ${quote.condition.body}`
                                                    : quote.condition}
                                            </p>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                                                <p><span className={quote.turnsOn ? 'text-green-600' : 'text-red-600'}>●</span> Turns On: {quote.turnsOn ? 'Yes' : 'No'}</p>
                                                <p><span className={quote.worksCorrectly ? 'text-green-600' : 'text-red-600'}>●</span> Works: {quote.worksCorrectly ? 'Yes' : 'No'}</p>
                                                <p><span className={quote.isUnlocked ? 'text-green-600' : 'text-red-600'}>●</span> Unlocked: {quote.isUnlocked ? 'Yes' : 'No'}</p>
                                                <p><span className={quote.faceIdWorking ? 'text-green-600' : 'text-red-600'}>●</span> FaceID: {quote.faceIdWorking ? 'Yes' : 'No'}</p>
                                                <p>● Battery: <span className="capitalize">{quote.batteryHealth || 'Unknown'}</span></p>
                                            </div>
                                        </>
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
                            ) : (
                                <div className="space-y-4 text-xs">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-gray-500 mb-1">Storage</label>
                                            <select
                                                value={editedStorage}
                                                onChange={(e) => setEditedStorage(e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700"
                                            >
                                                <option value="64GB">64GB</option>
                                                <option value="128GB">128GB</option>
                                                <option value="256GB">256GB</option>
                                                <option value="512GB">512GB</option>
                                                <option value="1TB">1TB</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 mb-1">Battery</label>
                                            <select
                                                value={editedSpecs.batteryHealth}
                                                onChange={(e) => setEditedSpecs({ ...editedSpecs, batteryHealth: e.target.value })}
                                                className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700"
                                            >
                                                <option value="normal">Normal (&gt;80%)</option>
                                                <option value="service">Service (&lt;80%)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-gray-500 mb-1">Screen Cond.</label>
                                            <select
                                                value={editedScreenCondition}
                                                onChange={(e) => setEditedScreenCondition(e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700"
                                            >
                                                <option value="Perfect">Perfect</option>
                                                <option value="Scratched">Scratched</option>
                                                <option value="Broken">Broken</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 mb-1">Body Cond.</label>
                                            <select
                                                value={editedBodyCondition}
                                                onChange={(e) => setEditedBodyCondition(e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700"
                                            >
                                                <option value="Perfect">Perfect</option>
                                                <option value="Scratched">Scratched</option>
                                                <option value="Dents">Dents</option>
                                                <option value="Bent">Bent</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2 py-2 border-y dark:border-slate-700">
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={editedSpecs.turnsOn} onChange={(e) => setEditedSpecs({ ...editedSpecs, turnsOn: e.target.checked })} />
                                            Turns On?
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={editedSpecs.worksCorrectly} onChange={(e) => setEditedSpecs({ ...editedSpecs, worksCorrectly: e.target.checked })} />
                                            Works Correctly?
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={editedSpecs.isUnlocked} onChange={(e) => setEditedSpecs({ ...editedSpecs, isUnlocked: e.target.checked })} />
                                            Is Unlocked?
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" checked={editedSpecs.faceIdWorking} onChange={(e) => setEditedSpecs({ ...editedSpecs, faceIdWorking: e.target.checked })} />
                                            FaceID Working?
                                        </label>
                                    </div>
                                    <div className="flex justify-between items-center bg-bel-blue/5 p-3 rounded-xl">
                                        <div>
                                            <p className="text-[10px] text-bel-blue uppercase font-bold">New Price Result</p>
                                            <p className="text-lg font-black text-bel-blue">€{editedPrice}</p>
                                        </div>
                                        <button
                                            onClick={handleRecalculatePrice}
                                            className="flex items-center gap-1 bg-white dark:bg-slate-800 text-bel-blue border border-bel-blue px-3 py-1.5 rounded-lg font-bold hover:bg-bel-blue hover:text-white transition-all text-[11px]"
                                        >
                                            <ArrowPathIcon className="w-3 h-3" /> Recalculate
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveSpecs}
                                            className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700"
                                        >
                                            Apply & Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditingSpecs(false)}
                                            className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Delivery & Payment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
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

                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider">Payment Controls</h4>
                                        <label className="relative inline-flex items-center cursor-pointer scale-90">
                                            <input
                                                type="checkbox"
                                                checked={isPaid}
                                                onChange={() => handleTogglePayment()}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            <span className="ml-2 text-xs font-bold text-gray-700 dark:text-gray-300">{isPaid ? 'Paid' : 'Unpaid'}</span>
                                        </label>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={paymentLink}
                                                onChange={(e) => setPaymentLink(e.target.value)}
                                                placeholder="Mollie Payment Link..."
                                                className="w-full pl-9 pr-12 py-2 text-xs rounded-lg border border-blue-200 dark:border-blue-900/30 dark:bg-slate-800 outline-none focus:ring-1 focus:ring-bel-blue"
                                            />
                                            <CreditCardIcon className="w-4 h-4 absolute left-3 top-2.5 text-blue-400" />
                                            <button
                                                onClick={handleSavePaymentLink}
                                                className="absolute right-2 top-1.5 p-1 text-bel-blue hover:text-blue-700"
                                                title="Save Link"
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <div className="flex items-center gap-2">
                                                <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer py-2 px-3 rounded-lg border border-dashed text-xs font-bold transition-all ${quote.paymentReceiptUrl ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900/30 text-blue-600 hover:bg-blue-50'}`}>
                                                    <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploadingReceipt} />
                                                    {isUploadingReceipt ? (
                                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CloudArrowUpIcon className="w-4 h-4" />
                                                    )}
                                                    {quote.paymentReceiptUrl ? 'Receipt Uploaded' : 'Upload Receipt'}
                                                </label>
                                                {quote.paymentReceiptUrl && (
                                                    <a
                                                        href={quote.paymentReceiptUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-white dark:bg-slate-800 border border-green-100 rounded-lg text-green-600 hover:bg-green-50"
                                                        title="View Receipt"
                                                    >
                                                        <DocumentIcon className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                {quote.iban && (
                                    <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl mb-4">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Payout Method (IBAN)</h4>
                                        <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">{quote.iban}</p>
                                    </div>
                                )}
                                {quote.idUrl && (
                                    <div className="mt-2 text-center">
                                        <a
                                            href={quote.idUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-bel-blue hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-xl border border-blue-100 dark:border-blue-900/20"
                                        >
                                            <DocumentIcon className="w-5 h-5" /> View ID Document
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
