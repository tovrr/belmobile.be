import React from 'react';
import { Quote, ActivityLogEntry } from '../../../types';
import { useData } from '../../../hooks/useData';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../hooks/useLanguage';
import {
    PencilIcon, CheckIcon, XMarkIcon, PlusIcon,
    WrenchScrewdriverIcon, ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { QuoteHeader, CustomerInfoCard, DeviceBasicsCard, ActivityLogViewer, SectionWrapper, MagicLinkCard } from './SharedQuoteComponents';

interface Props {
    quote: Quote;
    onClose: () => void;
}

const RepairQuoteDetails: React.FC<Props> = ({ quote, onClose }) => {
    const { updateQuoteStatus, updateQuoteIssues, updateQuoteFields, repairPrices, deleteQuote } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();

    // -- STATE --
    const [currentStatus, setCurrentStatus] = React.useState(quote.status);
    const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
    const [notifyCustomer, setNotifyCustomer] = React.useState(true);

    const [internalNotes, setInternalNotes] = React.useState(quote.internalNotes || '');
    const [isSavingNotes, setIsSavingNotes] = React.useState(false);

    // Issues Editing
    const [isEditingIssues, setIsEditingIssues] = React.useState(false);
    const [issues, setIssues] = React.useState<string[]>(quote.issues || (quote.issue ? [quote.issue] : []));
    const [newIssue, setNewIssue] = React.useState('');

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

    const handleStatusChange = async (newStatus: Quote['status']) => {
        setCurrentStatus(newStatus);
        setIsUpdatingStatus(true);
        try {
            await updateQuoteStatus(quote.id, newStatus, notifyCustomer);
            await logActivity('status_change', quote.status, newStatus);

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

    const handleSaveIssues = async () => {
        try {
            await updateQuoteIssues(quote.id, issues);
            await logActivity('issues_update', quote.issues, issues);
            setIsEditingIssues(false);
        } catch (error) {
            console.error(error);
            alert("Failed to update issues");
        }
    };

    const handleGeneratePDF = async () => {
        try {
            const { mapQuoteToPdfData } = await import('../../../utils/orderMappers');
            const { generatePDFFromPdfData, savePDFBlob } = await import('../../../utils/pdfGenerator');
            const { getFixedT } = await import('../../../utils/i18n-server');

            // Force PDF to use customer's language, fallback to 'fr'
            const fixedT = getFixedT(quote.language || 'fr');

            const pdfData = mapQuoteToPdfData(quote, fixedT);
            const { blob } = await generatePDFFromPdfData(pdfData, quote.type);
            savePDFBlob(blob, `${quote.type}-quote-${quote.orderId || quote.id}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Failed to generate PDF");
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

    // -- RENDER HELPERS --
    // 7-step status pipeline from TrackOrder.tsx
    // Dynamically filter steps based on delivery method
    const isShipping = quote.deliveryMethod === 'send' || quote.deliveryMethod === 'courier';

    const steps = ['processing', 'waiting_parts', 'in_repair', 'repaired',
        isShipping ? 'shipped' : 'ready',
        'completed'
    ];

    // Normalize status to find index (case where current status might be the "other" one)
    const currentStepIndex = steps.indexOf(currentStatus === 'new' ? 'processing' : currentStatus);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700 flex flex-col">
                <QuoteHeader
                    quote={quote}
                    onClose={onClose}
                    onDownloadPdf={handleGeneratePDF}
                    onDelete={handleDelete}
                />

                {/* Visual Status Stepper REMOVED as per user request */}

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6 lg:col-span-1">
                        <CustomerInfoCard quote={quote} />
                        <MagicLinkCard quote={quote} />

                        <SectionWrapper title="Workflow Actions">
                            <div className="flex items-center gap-2 mb-4 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                                <div className="relative">
                                    <WrenchScrewdriverIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                                    Gözün Kulağın: Active
                                </span>
                            </div>
                            <div className="space-y-2">
                                {/* Removed 'On Hold' button */}

                                <button
                                    onClick={() => handleStatusChange('processing')}
                                    className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl transition-all flex items-center gap-3 ${currentStatus === 'processing' || currentStatus === 'new'
                                        ? 'bg-bel-blue text-white shadow-lg shadow-blue-500/30 ring-2 ring-bel-blue ring-offset-2 dark:ring-offset-slate-800'
                                        : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${currentStatus === 'processing' || currentStatus === 'new' ? 'bg-white' : 'bg-gray-300'}`} />
                                    ⏳ Processing
                                </button>

                                <button
                                    onClick={() => handleStatusChange('waiting_parts')}
                                    className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl transition-all flex items-center gap-3 ${currentStatus === 'waiting_parts'
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-slate-800'
                                        : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${currentStatus === 'waiting_parts' ? 'bg-white' : 'bg-gray-300'}`} />
                                    📦 Waiting for Parts
                                </button>

                                <button
                                    onClick={() => handleStatusChange('in_repair')}
                                    className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl transition-all flex items-center gap-3 ${currentStatus === 'in_repair'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-800'
                                        : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${currentStatus === 'in_repair' ? 'bg-white' : 'bg-gray-300'}`} />
                                    🔧 In Repair
                                </button>

                                <button
                                    onClick={() => handleStatusChange('repaired')}
                                    className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl transition-all flex items-center gap-3 ${currentStatus === 'repaired'
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/30 ring-2 ring-green-600 ring-offset-2 dark:ring-offset-slate-800'
                                        : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${currentStatus === 'repaired' ? 'bg-white' : 'bg-gray-300'}`} />
                                    ✅ Repaired
                                </button>

                                {!isShipping && (
                                    <button
                                        onClick={() => handleStatusChange('ready')}
                                        className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl transition-all flex items-center gap-3 ${currentStatus === 'ready'
                                            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-800'
                                            : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${currentStatus === 'ready' ? 'bg-white' : 'bg-gray-300'}`} />
                                        🎁 Ready for Pickup
                                    </button>
                                )}

                                {isShipping && (
                                    <button
                                        onClick={() => handleStatusChange('shipped')}
                                        className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl transition-all flex items-center gap-3 ${currentStatus === 'shipped'
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-600 ring-offset-2 dark:ring-offset-slate-800'
                                            : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${currentStatus === 'shipped' ? 'bg-white' : 'bg-gray-300'}`} />
                                        🚚 Shipped
                                    </button>
                                )}

                                <button
                                    onClick={() => handleStatusChange('completed')}
                                    className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl transition-all flex items-center gap-3 ${currentStatus === 'completed'
                                        ? 'bg-gray-800 text-white shadow-lg shadow-gray-800/30 ring-2 ring-gray-800 ring-offset-2 dark:ring-offset-slate-800'
                                        : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${currentStatus === 'completed' ? 'bg-white' : 'bg-gray-300'}`} />
                                    🏁 Completed
                                </button>
                            </div>

                            <hr className="my-4 border-gray-100 dark:border-slate-700" />

                            <label className="flex items-center text-xs text-gray-500">
                                <input type="checkbox" checked={notifyCustomer} onChange={e => setNotifyCustomer(e.target.checked)} className="mr-2" />
                                Notify Customer on Change
                            </label>
                        </SectionWrapper>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">
                        <SectionWrapper title="Device & Issues">
                            <div className="mb-6">
                                <DeviceBasicsCard quote={quote} />
                            </div>

                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Reported Issues</h4>
                                {!isEditingIssues ? (
                                    <button onClick={() => setIsEditingIssues(true)} className="text-xs text-bel-blue hover:underline flex items-center gap-1">
                                        <PencilIcon className="w-3 h-3" /> Edit
                                    </button>
                                ) : (
                                    <button onClick={handleSaveIssues} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                                        <CheckIcon className="w-3 h-3" /> Save
                                    </button>
                                )}
                            </div>

                            {!isEditingIssues ? (
                                <div className="space-y-2">
                                    {issues.map((issue, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800">
                                            <WrenchScrewdriverIcon className="w-5 h-5 text-red-500" />
                                            <span className="text-sm font-medium text-red-700 dark:text-red-300">{issue}</span>
                                        </div>
                                    ))}
                                    {issues.length === 0 && <p className="text-sm text-gray-400 italic">No issues reported.</p>}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {issues.map((issue, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm">
                                            <span className="text-gray-900 dark:text-white text-sm font-medium">{issue}</span>
                                            <button onClick={() => setIssues(issues.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-1">
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                value={newIssue}
                                                onChange={e => setNewIssue(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && (setIssues([...issues, newIssue]), setNewIssue(''))}
                                                placeholder="Add issue..."
                                                className="w-full pl-4 pr-4 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                            />
                                        </div>
                                        <button
                                            onClick={() => { if (newIssue) { setIssues([...issues, newIssue]); setNewIssue('') } }}
                                            className="bg-bel-blue hover:bg-blue-700 text-white p-2 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
                                        >
                                            <PlusIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </SectionWrapper>

                        {/* Internal Notes */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                            <label className="block text-xs font-bold text-yellow-800 dark:text-yellow-500 mb-2 uppercase tracking-wide">Admin Internal Notes</label>
                            <textarea
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                                onBlur={handleNotesBlur}
                                className="w-full bg-white dark:bg-slate-800 border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-3 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-600 outline-none text-sm text-gray-900 dark:text-white resize-none min-h-[80px] placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
                                placeholder="Technician notes, part numbers, etc..."
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

export default RepairQuoteDetails;
