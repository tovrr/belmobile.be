import React, { useState } from 'react';
import { XMarkIcon, PlusIcon, BoltIcon, PrinterIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Quote } from '../../types';
import { generatePDFFromPdfData, savePDFBlob } from '../../utils/pdfGenerator';
import { PdfData } from '../../utils/PdfTemplates';

import { useRouter } from 'next/navigation';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const WalkInOrderModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [successData, setSuccessData] = useState<Partial<Quote> | null>(null);

    // Form State
    const [type, setType] = useState<'repair' | 'buyback'>('repair');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [notifyChannels, setNotifyChannels] = useState<('email' | 'whatsapp' | 'sms')[]>(['whatsapp']);

    const [brand, setBrand] = useState('Apple');
    const [model, setModel] = useState('');
    const [issue, setIssue] = useState('');
    const [price, setPrice] = useState('');
    const [internalNotes, setInternalNotes] = useState('');

    if (!isOpen) return null;

    const handlePrintReceipt = async () => {
        if (!successData) return;
        setIsLoading(true);
        try {
            // Construct PDF Data for Walk-in Receipt
            const pdfData: PdfData = {
                orderId: successData.orderId || 'N/A',
                date: new Date().toLocaleDateString('fr-BE'),
                method: 'In-Store Drop-off',
                status: 'received',
                type: successData.type || 'repair',
                documentTitle: `${successData.type === 'repair' ? 'REPAIR' : 'BUYBACK'} RECEIPT`,
                customer: {
                    name: successData.customerName || '',
                    email: successData.customerEmail,
                    phone: successData.customerPhone || '',
                    address: '' // Not needed for walk-in usually
                },
                shopOrDevice: {
                    title: 'Device Details',
                    name: `${successData.brand} ${successData.model}`,
                    details: [
                        { label: 'Issue / Condition', value: successData.issue || '-' },
                        { label: 'Type', value: successData.deviceType || 'Smartphone' }
                    ]
                },
                priceBreakdown: [
                    { label: successData.type === 'repair' ? 'Repair Estimate' : 'Buyback Offer', price: successData.price || 0 }
                ],
                totalLabel: 'Total',
                totalPrice: successData.price || 0,
                nextSteps: [
                    'Technician inspection (15-30 min)',
                    'Repair / Data Check',
                    'Payment & Pick-up'
                ],
                footerHelpText: 'Belmobile.be - Questions? support@belmobile.be',
                labels: {
                    orderId: 'Order ID',
                    date: 'Date',
                    method: 'Method',
                    clientDetails: 'Customer',
                    name: 'Name',
                    email: 'Email',
                    phone: 'Phone',
                    address: 'Address',
                    featuresSpecs: 'Specs',
                    shop: 'Shop',
                    model: 'Model',
                    financials: 'Financials',
                    description: 'Description',
                    price: 'Price',
                    paymentIban: 'IBAN',
                    followOrder: 'Track Order',
                    nextSteps: 'Next Steps',
                    scanToTrack: 'Scan to Track',
                    page: 'Page',
                    of: '/',
                    subtotal: 'Subtotal',
                    vat: 'VAT'
                },
                // THE KEY FEATURE: Signature Block
                signatureBlock: {
                    customerLabel: 'Customer Signature',
                    shopLabel: 'Belmobile Shop'
                },
                legalDisclaimer: 'By signing, I confirm that the device is mine and I agree to the Belmobile service terms. Belmobile is not responsible for data loss; please backup your device.'
            };

            const { blob, safeFileName } = await generatePDFFromPdfData(pdfData, 'Receipt');
            savePDFBlob(blob, safeFileName);

        } catch (error) {
            console.error("PDF Generation failed", error);
            alert("Failed to generate PDF. Check console.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSuccessData(null);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setModel('');
        setIssue('');
        setPrice('');
        setInternalNotes('');
        onSuccess(); // Refresh dashboard list if needed
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !model || !price) {
            alert("Please fill in Name, Model, and Price.");
            return;
        }

        setIsLoading(true);
        try {
            const dateStr = new Date().getFullYear();
            const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
            const generatedOrderId = `ORD-${dateStr}-${randomSuffix}`;
            const currentShopId = '1';
            const finalEmail = customerEmail.trim() || `walkin.shop${currentShopId}@belmobile.be`;
            const finalNotifyChannels = customerEmail.trim() ? notifyChannels : notifyChannels.filter(c => c !== 'email');

            const newOrder: Partial<Quote> = {
                type: type,
                id: generatedOrderId,
                orderId: generatedOrderId,
                status: 'received',
                deviceType: 'smartphone',
                brand,
                model,
                condition: 'used',
                issue: issue || 'Walk-in Inspection',
                customerName,
                customerEmail: finalEmail,
                customerPhone: customerPhone || '',
                price: parseFloat(price),
                initialPrice: parseFloat(price),
                date: new Date().toISOString(),
                createdAt: serverTimestamp() as any,
                shopId: '1',
                deliveryMethod: 'dropoff',
                isCompany: false,
                notificationPreferences: finalNotifyChannels,
                isWalkIn: true,
                internalNotes: `Walk-in Order. ${internalNotes}`,
                activityLog: [{
                    adminId: user?.uid || 'admin',
                    action: 'created_walkin',
                    timestamp: new Date().toISOString(),
                    note: 'Created via Quick Walk-in Form'
                }]
            };

            await addDoc(collection(db, 'quotes'), newOrder);
            setSuccessData(newOrder); // Show Success Screen instead of Alert

        } catch (error) {
            console.error("Error creating walk-in order:", error);
            alert("Failed to create order. See console.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- SUCCESS VIEW ---
    if (successData) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Created!</h2>
                    <p className="text-gray-500 mb-6 font-mono text-lg">{successData.orderId}</p>

                    <div className="space-y-3">
                        <button
                            onClick={handlePrintReceipt}
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-bel-blue hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2"
                        >
                            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PrinterIcon className="w-5 h-5" />}
                            Print Receipt (PDF)
                        </button>

                        <button
                            onClick={handleReset}
                            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                            New Order
                        </button>
                    </div>

                    <button onClick={onClose} className="mt-6 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-bel-blue/10 rounded-lg">
                            <BoltIcon className="w-5 h-5 text-bel-blue" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Quick Walk-in</h3>
                            <p className="text-xs text-gray-500">Create order without wizard</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition">
                        <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="walkin-form" onSubmit={handleSubmit} className="space-y-5">

                        {/* Type Toggle */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-slate-700 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setType('repair')}
                                className={`py-2 text-sm font-bold rounded-lg transition-all ${type === 'repair' ? 'bg-white dark:bg-slate-600 shadow-sm text-bel-blue' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                🛠️ Repair
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('buyback')}
                                className={`py-2 text-sm font-bold rounded-lg transition-all ${type === 'buyback' ? 'bg-white dark:bg-slate-600 shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                ♻️ Buyback
                            </button>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Customer</label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    required
                                    type="text"
                                    placeholder="Name *"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    className="col-span-2 px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone"
                                    value={customerPhone}
                                    onChange={e => setCustomerPhone(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none"
                                />
                                <input
                                    type="email"
                                    placeholder="Email (Optional)"
                                    value={customerEmail}
                                    onChange={e => setCustomerEmail(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none"
                                />
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Communication Preferences</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifyChannels.includes('email')}
                                        onChange={e => {
                                            if (e.target.checked) setNotifyChannels(prev => [...prev, 'email']);
                                            else setNotifyChannels(prev => prev.filter(c => c !== 'email'));
                                        }}
                                        className="w-4 h-4 rounded text-bel-blue focus:ring-bel-blue"
                                    />
                                    <span>📧 Email</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifyChannels.includes('whatsapp')}
                                        onChange={e => {
                                            if (e.target.checked) setNotifyChannels(prev => [...prev, 'whatsapp']);
                                            else setNotifyChannels(prev => prev.filter(c => c !== 'whatsapp'));
                                        }}
                                        className="w-4 h-4 rounded text-green-500 focus:ring-green-500"
                                    />
                                    <span>📱 WhatsApp</span>
                                </label>
                            </div>
                        </div>

                        {/* Device Info */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Device & Issue</label>
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={brand}
                                    onChange={e => setBrand(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none"
                                >
                                    <option value="Apple">Apple</option>
                                    <option value="Samsung">Samsung</option>
                                    <option value="Huawei">Huawei</option>
                                    <option value="Google">Google</option>
                                    <option value="Xiaomi">Xiaomi</option>
                                    <option value="Oppo">Oppo</option>
                                    <option value="OnePlus">OnePlus</option>
                                    <option value="Other">Other</option>
                                </select>
                                <input
                                    required
                                    type="text"
                                    placeholder="Model (e.g. iPhone 13) *"
                                    value={model}
                                    onChange={e => setModel(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder={type === 'repair' ? "Issue (e.g. Broken Screen)" : "Condition (e.g. Like New)"}
                                    value={issue}
                                    onChange={e => setIssue(e.target.value)}
                                    className="col-span-2 px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none"
                                />
                            </div>
                        </div>

                        {/* Price & Notes */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Details</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <span className="absolute left-4 top-2 text-gray-500">€</span>
                                    <input
                                        required
                                        type="number"
                                        placeholder="Agreed Price *"
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none font-bold"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Internal Notes"
                                    value={internalNotes}
                                    onChange={e => setInternalNotes(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-3 -mx-6 -mb-6 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 text-sm font-bold text-white bg-bel-blue hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <PlusIcon className="w-4 h-4" />
                                )}
                                Create Order
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WalkInOrderModal;
