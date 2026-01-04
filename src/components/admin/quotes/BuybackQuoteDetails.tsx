import React from 'react';
import { Quote, ActivityLogEntry, BuybackPriceRecord, RepairPricing } from '../../../types';
import { useData } from '../../../hooks/useData';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../hooks/useLanguage';
import {
    PencilIcon, CheckIcon, XMarkIcon, ArrowPathIcon,
    CreditCardIcon, CloudArrowUpIcon, DocumentIcon, CalculatorIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { notificationService } from '../../../services/notificationService';
import { calculateBuybackPriceShared, PricingParams } from '../../../utils/pricingLogic';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase';
import { QuoteHeader, CustomerInfoCard, DeviceBasicsCard, ActivityLogViewer, SectionWrapper, MagicLinkCard } from './SharedQuoteComponents';

interface Props {
    quote: Quote;
    onClose: () => void;
}

const BuybackQuoteDetails: React.FC<Props> = ({ quote, onClose }) => {
    const { updateQuoteStatus, updateQuoteFields, buybackPrices, repairPrices, deleteQuote } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();

    // -- STATE --
    const [currentStatus, setCurrentStatus] = React.useState(quote.status);
    const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
    const [notifyCustomer, setNotifyCustomer] = React.useState(true);

    // Notes
    const [internalNotes, setInternalNotes] = React.useState(quote.internalNotes || '');
    const [isSavingNotes, setIsSavingNotes] = React.useState(false);

    // Payment
    const [isPaid, setIsPaid] = React.useState(quote.isPaid || false);
    const [paymentLink, setPaymentLink] = React.useState(quote.paymentLink || '');
    const [isUploadingReceipt, setIsUploadingReceipt] = React.useState(false);

    // Specs / Grading
    const [isEditingSpecs, setIsEditingSpecs] = React.useState(false);
    const [editedStorage, setEditedStorage] = React.useState(quote.storage || '');
    // Safe access to condition object
    const [editedScreenCondition, setEditedScreenCondition] = React.useState(
        typeof quote.condition === 'object' && quote.condition !== null ? quote.condition.screen : (quote.condition || 'perfect')
    );
    const [editedBodyCondition, setEditedBodyCondition] = React.useState(
        typeof quote.condition === 'object' && quote.condition !== null ? quote.condition.body : (quote.condition || 'perfect')
    );
    const [editedSpecs, setEditedSpecs] = React.useState({
        turnsOn: quote.turnsOn !== undefined ? quote.turnsOn : true,
        worksCorrectly: quote.worksCorrectly !== undefined ? quote.worksCorrectly : true,
        isUnlocked: quote.isUnlocked !== undefined ? quote.isUnlocked : true,
        faceIdWorking: quote.faceIdWorking !== undefined ? quote.faceIdWorking : true,
        batteryHealth: quote.batteryHealth || 'normal'
    });

    // Price
    const [isEditingPrice, setIsEditingPrice] = React.useState(false);
    const [editedPrice, setEditedPrice] = React.useState(quote.price || 0);

    // -- HANDLERS --

    const logActivity = async (action: string, oldValue: unknown, newValue: unknown, note?: string) => {
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
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as Quote['status'];
        setCurrentStatus(newStatus);
        setIsUpdatingStatus(true);
        try {
            await updateQuoteStatus(quote.id, newStatus, notifyCustomer);
            await logActivity('status_change', quote.status, newStatus);

            // Automation: Schedule Review if closed (simplified for brevity)
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
            }
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleNotesBlur = async () => {
        if (internalNotes !== quote.internalNotes) {
            setIsSavingNotes(true);
            await updateQuoteFields(quote.id, { internalNotes });
            setIsSavingNotes(false);
        }
    };

    const handleRecalculatePrice = () => {
        // Map string values to strictly typed valid values for the pricing logic
        const mapScreenState = (s: string): 'flawless' | 'scratches' | 'cracked' => {
            const lower = s.toLowerCase();
            if (lower.includes('broken') || lower.includes('cracked')) return 'cracked';
            if (lower.includes('scratched')) return 'scratches';
            return 'flawless';
        };

        const mapBodyState = (s: string): 'flawless' | 'scratches' | 'dents' | 'bent' => {
            const lower = s.toLowerCase();
            if (lower.includes('bent')) return 'bent';
            if (lower.includes('dents')) return 'dents';
            if (lower.includes('scratched')) return 'scratches';
            return 'flawless';
        };

        const pricingParams: PricingParams = {
            type: 'buyback',
            brand: quote.brand,
            model: quote.model,
            deviceType: quote.deviceType || 'smartphone',
            storage: editedStorage,
            turnsOn: editedSpecs.turnsOn ?? false,
            worksCorrectly: editedSpecs.worksCorrectly ?? false,
            isUnlocked: editedSpecs.isUnlocked ?? false,
            faceIdWorking: editedSpecs.faceIdWorking ?? false,
            batteryHealth: editedSpecs.batteryHealth as 'normal' | 'service',
            screenState: mapScreenState(editedScreenCondition),
            bodyState: mapBodyState(editedBodyCondition),
            repairIssues: [],
            controllerCount: null // Or handle console logic if needed
        };

        const deviceIdSlug = `${quote.brand}-${quote.model}`.toLowerCase().replace(/\s+/g, '-');
        const relevantBuybackPrices = buybackPrices.filter((p: BuybackPriceRecord) =>
            (p.brand === quote.brand && p.model === quote.model) ||
            (p.deviceId === deviceIdSlug)
        ) as any[]; // casting to any to match expected type if strictness issue

        // Construct simple map
        const mappedRepairPrices: Record<string, number> = {};
        repairPrices.forEach((rp: RepairPricing) => {
            mappedRepairPrices['screen_generic'] = (rp.screen_generic as number) || 0;
            mappedRepairPrices['screen_oled'] = (rp.screen_oled as number) || 0;
            mappedRepairPrices['screen_original'] = (rp.screen_original as number) || 0;
            mappedRepairPrices['battery'] = (rp.battery as number) || 0;
            mappedRepairPrices['back_glass'] = (rp.back_glass as number) || 0;
        });

        const newPrice = calculateBuybackPriceShared(pricingParams, {
            buybackPrices: relevantBuybackPrices,
            repairPrices: mappedRepairPrices
        });

        setEditedPrice(newPrice);
    };

    const handleSaveSpecsAndPrice = async () => {
        try {
            const updates: Partial<Quote> = {
                storage: editedStorage,
                condition: { screen: editedScreenCondition, body: editedBodyCondition },
                ...editedSpecs,
                price: editedPrice
            };
            await updateQuoteFields(quote.id, updates);
            await logActivity('specs_update', 'Multiple fields', updates as unknown);
            setIsEditingSpecs(false);
            setIsEditingPrice(false); // If price was editable
        } catch (error) {
            console.error(error);
            alert("Failed to save changes");
        }
    };

    const handleTogglePayment = async () => {
        const nextPaid = !isPaid;
        await updateQuoteFields(quote.id, { isPaid: nextPaid });
        setIsPaid(nextPaid);
        await logActivity('payment_status_change', isPaid, nextPaid);
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
        } finally {
            setIsUploadingReceipt(false);
        }
    };

    const handleGeneratePDF = async () => {
        try {
            const { mapQuoteToPdfData } = await import('../../../utils/orderMappers');
            const { generatePDFFromPdfData, savePDFBlob } = await import('../../../utils/pdfGenerator');
            const { getFixedT } = await import('../../../utils/i18n-server');

            // Force PDF to use customer's language
            const fixedT = getFixedT(quote.language || 'fr');

            const pdfData = mapQuoteToPdfData(quote, fixedT);
            const { blob } = await generatePDFFromPdfData(pdfData, quote.type);
            savePDFBlob(blob, `${quote.type}-quote-${quote.orderId || quote.id}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Failed to generate PDF");
        }
    };

    const handleTestWhatsApp = async () => {
        if (!confirm(`Send a test WhatsApp to ${quote.customerPhone}?`)) return;
        try {
            await notificationService.notifyStatusUpdate(quote, String(quote.id), ['whatsapp']);
            alert("WhatsApp test message triggered! Check the console or the customer's phone.");
        } catch (error) {
            console.error(error)
            alert("Failed to send WhatsApp test.");
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
            try {
                await deleteQuote(quote.id);
                onClose();
            } catch (error) {
                console.error("Failed to delete quote", error);
                alert("Failed to delete quote");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700 flex flex-col">
                <QuoteHeader
                    quote={quote}
                    onClose={onClose}
                    onDownloadPdf={handleGeneratePDF}
                    onDelete={handleDelete}
                />

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Metadata */}
                    <div className="space-y-6 lg:col-span-1">
                        <CustomerInfoCard quote={quote} />
                        <MagicLinkCard quote={quote} />

                        <SectionWrapper title="Payout (Payment)">
                            {quote.iban ? (
                                <div className="mb-4">
                                    <p className="font-mono text-xs bg-gray-100 dark:bg-slate-700 p-2 rounded break-all">{quote.iban}</p>
                                </div>
                            ) : <p className="text-xs text-gray-500 mb-4">No IBAN provided (Cash/Store).</p>}

                            <div className="flex items-center justify-between mb-3 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl">
                                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Status</span>
                                <label className="relative inline-flex items-center cursor-pointer scale-90">
                                    <input type="checkbox" checked={isPaid} onChange={handleTogglePayment} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    <span className="ml-2 text-xs font-bold text-gray-700 dark:text-gray-300">{isPaid ? 'Paid' : 'Unpaid'}</span>
                                </label>
                            </div>

                            <label className={`flex items-center justify-center gap-2 cursor-pointer py-2 px-3 rounded-lg border border-dashed text-xs font-bold transition-all w-full ${quote.paymentReceiptUrl ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50'}`}>
                                <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploadingReceipt} />
                                {isUploadingReceipt ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CloudArrowUpIcon className="w-4 h-4" />}
                                {quote.paymentReceiptUrl ? 'Receipt Uploaded (Click to Change)' : 'Upload Receipt Proof'}
                            </label>
                            {quote.paymentReceiptUrl && (
                                <a href={quote.paymentReceiptUrl} target="_blank" rel="noreferrer" className="block text-center mt-2 text-xs text-bel-blue hover:underline">View Receipt</a>
                            )}
                        </SectionWrapper>

                        {/* Status */}
                        <SectionWrapper title="Update Status">
                            <div className="flex items-center gap-2 mb-4 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                                <div className="relative">
                                    <ArrowPathIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                                    Gözün Kulağın: Active
                                </span>
                            </div>
                            <select
                                value={currentStatus}
                                onChange={handleStatusChange}
                                disabled={isUpdatingStatus}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                            >
                                <option value="new">New</option>
                                <option value="processing">Processing (Inspection)</option>
                                <option value="shipped">Device Shipped</option>
                                <option value="responded">Responded</option>
                                <option value="closed">Closed (Paid)</option>
                            </select>
                            <label className="flex items-center mt-2 text-xs text-gray-500">
                                <input type="checkbox" checked={notifyCustomer} onChange={e => setNotifyCustomer(e.target.checked)} className="mr-2" />
                                Notify Customer
                            </label>

                            <button
                                onClick={handleTestWhatsApp}
                                className="mt-4 w-full py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"
                            >
                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                Test WhatsApp Now
                            </button>
                        </SectionWrapper>
                    </div>

                    {/* RIGHT COLUMN: Inspection & Pricing */}
                    <div className="lg:col-span-2 space-y-6">
                        <SectionWrapper title="Inspection & Grading">
                            <div className="flex justify-between items-start mb-4">
                                <DeviceBasicsCard quote={quote} />
                                {!isEditingSpecs ? (
                                    <button onClick={() => setIsEditingSpecs(true)} className="flex items-center gap-1 text-xs font-bold text-bel-blue bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                                        <PencilIcon className="w-3 h-3" /> Edit / Regrade
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveSpecsAndPrice} className="flex items-center gap-1 text-xs font-bold text-white bg-green-600 px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
                                            <CheckIcon className="w-3 h-3" /> Save Changes
                                        </button>
                                        <button onClick={() => setIsEditingSpecs(false)} className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">
                                            <XMarkIcon className="w-3 h-3" /> Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* INSPECTION ACTION BAR (Only visible when editing) */}
                            {isEditingSpecs && (
                                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 p-4 rounded-xl mb-6">
                                    <h4 className="font-bold text-orange-800 dark:text-orange-300 text-xs uppercase mb-3 flex items-center gap-2">
                                        <CalculatorIcon className="w-4 h-4" /> Admin Re-Grading Station
                                    </h4>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                        <div>
                                            <label className="block text-gray-500 mb-1">Storage</label>
                                            <select value={editedStorage} onChange={(e) => setEditedStorage(e.target.value)} className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700">
                                                <option value="64GB">64GB</option><option value="128GB">128GB</option><option value="256GB">256GB</option><option value="512GB">512GB</option><option value="1TB">1TB</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 mb-1">Screen</label>
                                            <select value={editedScreenCondition} onChange={(e) => setEditedScreenCondition(e.target.value)} className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700">
                                                <option value="Perfect">Perfect</option><option value="Scratched">Scratched</option><option value="Broken">Broken</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 mb-1">Body</label>
                                            <select value={editedBodyCondition} onChange={(e) => setEditedBodyCondition(e.target.value)} className="w-full p-2 rounded border dark:bg-slate-800 dark:border-slate-700">
                                                <option value="Perfect">Perfect</option><option value="Scratched">Scratched</option><option value="Dents">Dents</option><option value="Bent">Bent</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="flex items-center gap-2"><input type="checkbox" checked={editedSpecs.turnsOn ?? false} onChange={e => setEditedSpecs({ ...editedSpecs, turnsOn: e.target.checked })} /> Turns On</label>
                                            <label className="flex items-center gap-2"><input type="checkbox" checked={editedSpecs.isUnlocked ?? false} onChange={e => setEditedSpecs({ ...editedSpecs, isUnlocked: e.target.checked })} /> Unlocked</label>
                                            <label className="flex items-center gap-2"><input type="checkbox" checked={editedSpecs.faceIdWorking ?? false} onChange={e => setEditedSpecs({ ...editedSpecs, faceIdWorking: e.target.checked })} /> FaceID</label>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button onClick={handleRecalculatePrice} className="bg-white dark:bg-slate-800 border border-orange-300 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-100 flex items-center gap-1">
                                            <ArrowPathIcon className="w-3 h-3" /> Recalculate Value
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PRICE DISPLAY */}
                            <div className="bg-gray-900 dark:bg-black p-6 rounded-2xl flex justify-between items-center text-white">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Final Offer Value</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-bel-blue">€{editedPrice}</span>
                                        {quote.price !== editedPrice && <span className="text-sm text-gray-500 line-through">was €{quote.price}</span>}
                                    </div>
                                </div>
                                {isEditingSpecs && (
                                    <div className="text-right">
                                        <span className="text-xs bg-bel-blue/20 text-bel-blue px-2 py-1 rounded">Preview Mode</span>
                                    </div>
                                )}
                            </div>
                        </SectionWrapper>

                        {/* Internal Notes */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                            <label className="block text-xs font-bold text-yellow-800 dark:text-yellow-500 mb-2 uppercase tracking-wide">Admin Internal Notes</label>
                            <textarea
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                                onBlur={handleNotesBlur}
                                className="w-full bg-white dark:bg-slate-800 border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-3 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-600 outline-none text-sm text-gray-900 dark:text-white resize-none min-h-[80px] placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                                placeholder="Write private notes here..."
                            />
                            {isSavingNotes && <span className="text-xs text-yellow-600 italic mt-1 block">Saving...</span>}
                        </div>

                        {/* Activity Log */}
                        <ActivityLogViewer log={quote.activityLog || []} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuybackQuoteDetails;
