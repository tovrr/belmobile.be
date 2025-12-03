'use client';

import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { MagnifyingGlassIcon, CheckCircleIcon, ClockIcon, WrenchScrewdriverIcon, TruckIcon, CurrencyEuroIcon, ClipboardDocumentCheckIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const TrackOrder: React.FC = () => {
    const { t } = useLanguage();
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<any>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCheckStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStatus(null);

        try {
            const docRef = doc(db, 'quotes', orderId.trim());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Simple email verification (case-insensitive)
                if (data.customerEmail.toLowerCase() === email.toLowerCase()) {
                    setStatus({
                        id: docSnap.id,
                        ...data
                    });
                } else {
                    setError(t('Order not found. Please check your details.'));
                }
            } else {
                setError(t('Order not found. Please check your details.'));
            }
        } catch (err) {
            console.error("Error fetching order:", err);
            setError(t('Order not found. Please check your details.'));
        } finally {
            setLoading(false);
        }
    };

    const getRepairSteps = (currentStatus: string) => {
        const steps = [
            { id: 'pending', label: t('Processing'), icon: ClockIcon },
            { id: 'in_repair', label: t('In Repair'), icon: WrenchScrewdriverIcon },
            { id: 'ready', label: t('Ready for Pickup'), icon: CheckCircleIcon },
            { id: 'completed', label: t('Completed'), icon: TruckIcon }
        ];
        return steps;
    };

    const getBuybackSteps = (currentStatus: string) => {
        const steps = [
            { id: 'pending', label: t('Processing'), icon: ClockIcon },
            { id: 'received', label: t('Received'), icon: ArchiveBoxIcon },
            { id: 'inspected', label: t('Inspected'), icon: ClipboardDocumentCheckIcon },
            { id: 'payment_sent', label: t('Payment Sent'), icon: CurrencyEuroIcon },
            { id: 'completed', label: t('Completed'), icon: CheckCircleIcon }
        ];
        return steps;
    };

    const getStepIndex = (steps: any[], currentStatus: string) => {
        // Map status to index
        if (currentStatus === 'new') return 0;
        if (currentStatus === 'processing') return 1;
        if (currentStatus === 'responded') return steps.length > 2 ? steps.length - 2 : 1;
        if (currentStatus === 'closed') return steps.length - 1;

        const index = steps.findIndex(s => s.id === currentStatus);
        return index === -1 ? 0 : index;
    };

    const steps = status
        ? (status.type === 'buyback' ? getBuybackSteps(status.status) : getRepairSteps(status.status))
        : [];

    const currentStepIndex = status ? getStepIndex(steps, status.status) : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-32 pb-20 px-4">
            <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                        {t('Track Your Order')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('Enter your order details below to check the status of your repair or buyback.')}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-800">
                    <form onSubmit={handleCheckStatus} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {t('Order ID')}
                            </label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    placeholder="e.g. 7A2B9C"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-bel-blue outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {t('Email')}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-bel-blue outline-none transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-bel-blue text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50"
                        >
                            {loading ? 'Checking...' : t('Check Status')}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-center font-medium animate-fade-in">
                            {error}
                        </div>
                    )}

                    {status && (
                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Order Status')}</h3>
                                    <p className="text-sm text-gray-500">#{status.id}</p>
                                    <p className="text-sm font-medium text-bel-blue mt-1 capitalize">{status.brand} {status.model}</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-bel-blue rounded-full text-sm font-bold capitalize">
                                    {t(status.status)}
                                </span>
                            </div>

                            <div className="space-y-6">
                                {steps.map((s, i) => (
                                    <div key={s.id} className={`flex items-center gap-4 ${i <= currentStepIndex ? 'opacity-100' : 'opacity-40'}`}>
                                        <div className={`p-2 rounded-full ${i <= currentStepIndex ? 'bg-bel-blue text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                                            <s.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white">{s.label}</p>
                                        </div>
                                        {i <= currentStepIndex && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;
