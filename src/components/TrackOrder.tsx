'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../hooks/useLanguage';
import { MagnifyingGlassIcon, CheckCircleIcon, ClockIcon, WrenchScrewdriverIcon, TruckIcon, CurrencyEuroIcon, ClipboardDocumentCheckIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Input from './ui/Input';
import Button from './ui/Button';

import { Quote } from '../types';

const TrackOrder: React.FC = () => {
    const { t } = useLanguage();
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<(Quote & { id: string }) | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();

    useEffect(() => {
        const id = searchParams.get('id');
        const mail = searchParams.get('email');
        if (id && mail) {
            setOrderId(id);
            setEmail(mail);
            handleCheckStatus(undefined, id, mail);
        }
    }, [searchParams]);

    const handleCheckStatus = async (e?: React.FormEvent, idOverride?: string, emailOverride?: string) => {
        if (e) e.preventDefault();

        const idToCheck = idOverride || orderId;
        const emailToCheck = emailOverride || email;

        if (!idToCheck || !emailToCheck) return;

        setLoading(true);
        setError('');
        setStatus(null);

        try {
            const docRef = doc(db, 'quotes', idToCheck.trim());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Simple email verification (case-insensitive)
                if (data.customerEmail.toLowerCase() === emailToCheck.toLowerCase()) {
                    setStatus({
                        ...(data as Omit<Quote, 'id'>),
                        id: docSnap.id
                    } as Quote & { id: string });
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

    const getRepairSteps = () => {
        const steps = [
            { id: 'pending', label: t('Processing'), icon: ClockIcon },
            { id: 'waiting_parts', label: t('Waiting for Parts'), icon: WrenchScrewdriverIcon },
            { id: 'in_repair', label: t('In Repair'), icon: WrenchScrewdriverIcon },
            { id: 'repaired', label: t('Repaired'), icon: CheckCircleIcon },
            { id: 'ready', label: t('Ready for Pickup'), icon: CheckCircleIcon },
            { id: 'shipped', label: t('Shipped'), icon: TruckIcon },
            { id: 'completed', label: t('Completed'), icon: TruckIcon }
        ];
        return steps;
    };

    const getBuybackSteps = () => {
        const steps = [
            { id: 'pending', label: t('Processing'), icon: ClockIcon },
            { id: 'received', label: t('Received'), icon: ArchiveBoxIcon },
            { id: 'inspected', label: t('Inspected'), icon: ClipboardDocumentCheckIcon },
            { id: 'payment_sent', label: t('Payment Sent'), icon: CurrencyEuroIcon },
            { id: 'completed', label: t('Completed'), icon: CheckCircleIcon }
        ];
        return steps;
    };

    const getStepIndex = (steps: { id: string; label: string; icon: React.ElementType }[], currentStatus: string) => {
        // Map status to index
        if (currentStatus === 'new') return 0;
        if (currentStatus === 'processing') return 1;
        if (currentStatus === 'waiting_parts') return 1;
        if (currentStatus === 'in_repair') return 2;
        if (currentStatus === 'repaired') return 3;
        if (currentStatus === 'ready') return 4;
        if (currentStatus === 'shipped') return 5;
        if (currentStatus === 'completed' || currentStatus === 'closed') return steps.length - 1;

        const index = steps.findIndex(s => s.id === currentStatus);
        return index === -1 ? 0 : index;
    };

    const steps = status
        ? (status.type === 'buyback' ? getBuybackSteps() : getRepairSteps())
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
                        <Input
                            label={t('Order ID')}
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="e.g. 7A2B9C"
                            required
                            leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                        />

                        <Input
                            label={t('Email')}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />

                        <Button
                            type="submit"
                            isLoading={loading}
                            variant="primary"
                            className="w-full"
                        >
                            {t('Check Status')}
                        </Button>
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
