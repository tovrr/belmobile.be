import React, { useState } from 'react';
import { XMarkIcon, PlusIcon, BoltIcon } from '@heroicons/react/24/outline';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Quote } from '../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const WalkInOrderModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [type, setType] = useState<'repair' | 'buyback'>('repair');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [notifyChannels, setNotifyChannels] = useState<('email' | 'whatsapp' | 'sms')[]>(['email', 'whatsapp']);

    const [brand, setBrand] = useState('Apple');
    const [model, setModel] = useState('');
    const [issue, setIssue] = useState('');
    const [price, setPrice] = useState('');
    const [internalNotes, setInternalNotes] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !model || !price) {
            alert("Please fill in Name, Model, and Price.");
            return;
        }

        setIsLoading(true);
        try {
            // Generate basic order ID locally or let cloud function handle it (we'll assume cloud function updates it or we use doc ID)
            // Ideally we track a counter, but for speed, let's just make sure it's created.

            const newOrder: Partial<Quote> = {
                type: type,
                status: 'new', // Start as New or Processing
                deviceType: 'smartphone', // Default
                brand,
                model,
                condition: 'used', // Default
                issue: issue || 'Walk-in Inspection',
                customerName,
                customerEmail: customerEmail || 'walkin@belmobile.be', // Placeholder if empty
                customerPhone: customerPhone || '',
                price: parseFloat(price),
                initialPrice: parseFloat(price),
                date: new Date().toISOString(),
                createdAt: serverTimestamp() as any,
                shopId: '1', // Default to main shop or get from context if available
                deliveryMethod: 'dropoff',
                isCompany: false,
                notificationPreferences: notifyChannels,
                internalNotes: `Walk-in Order. ${internalNotes}`,
                activityLog: [{
                    adminId: user?.uid || 'admin',
                    action: 'created_walkin',
                    timestamp: new Date().toISOString(),
                    note: 'Created via Quick Walk-in Form'
                }]
            };

            await addDoc(collection(db, 'quotes'), newOrder);

            // Reset and Close
            setCustomerName('');
            setCustomerPhone('');
            setCustomerEmail('');
            setModel('');
            setIssue('');
            setPrice('');
            setInternalNotes('');

            onSuccess();
            onClose();

        } catch (error) {
            console.error("Error creating walk-in order:", error);
            alert("Failed to create order. See console.");
        } finally {
            setIsLoading(false);
        }
    };

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
