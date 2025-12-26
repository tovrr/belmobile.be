'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../hooks/useLanguage';
import { MagnifyingGlassIcon, CheckCircleIcon, ClockIcon, WrenchScrewdriverIcon, TruckIcon, CurrencyEuroIcon, ClipboardDocumentCheckIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { db } from '../firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
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
            // 1. Try fetching by Document ID (the link's "id" param)
            let docSnap = await getDoc(doc(db, 'quotes', idToCheck.trim()));
            let data: any = null;
            let docId = idToCheck.trim();

            if (docSnap.exists()) {
                data = docSnap.data();
            } else {
                // 2. If not found, try Querying by 'orderId' field (the "ORD-..." format)
                console.log(`[TrackOrder] Searching by field 'orderId' == ${idToCheck.trim()}`);
                const q = query(
                    collection(db, 'quotes'),
                    where('orderId', '==', idToCheck.trim())
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    docSnap = querySnapshot.docs[0]; // Take the first match
                    data = docSnap.data();
                    docId = docSnap.id;
                    console.log(`[TrackOrder] Found document via orderId: ${docId}`);
                } else {
                    console.log(`[TrackOrder] No document found for orderId: ${idToCheck.trim()}`);
                }
            }

            if (data) {
                console.log(`[TrackOrder] validating email: ${emailToCheck} vs ${data.customerEmail || data.email}`);
                // Simple email verification (case-insensitive)
                if (data.customerEmail && data.customerEmail.toLowerCase() === emailToCheck.toLowerCase().trim()) {
                    setStatus({
                        ...(data as Omit<Quote, 'id'>),
                        id: docId // Store the real Doc ID for status steps
                    } as Quote & { id: string });
                } else if (data.email && data.email.toLowerCase() === emailToCheck.toLowerCase().trim()) {
                    // Fallback to legacy 'email' field
                    setStatus({
                        ...(data as Omit<Quote, 'id'>),
                        id: docId
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

                {/* SUCCESS HERO: Premium Celebration Mode */}
                {searchParams.get('success') === 'true' && status && (
                    <div className="mb-12 text-center animate-fade-in-up">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 relative">
                            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping-slow"></div>
                            <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('Order Confirmed')}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-8">
                            {t('We have received your order and sent a confirmation email to')} <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
                        </p>

                        {/* PREMIUM ACTION CARDS */}
                        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                            {/* Primary Action: Shipping Label (if valid) */}
                            {status.shippingLabelUrl && (
                                <div
                                    onClick={() => window.open(status.shippingLabelUrl, '_blank')}
                                    className="cursor-pointer group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-bel-blue/20 hover:border-bel-blue transition-all hover:shadow-xl hover:shadow-bel-blue/10 flex items-start gap-4 text-left"
                                >
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:bg-bel-blue group-hover:text-white transition-colors text-bel-blue">
                                        <TruckIcon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-bel-blue transition-colors">
                                            {t('Download Shipping Label')}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {t('Print this label and attach it to your package.')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Secondary Action: PDF Summary */}
                            <div
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const { generatePDFFromPdfData, savePDFBlob } = await import('../utils/pdfGenerator');
                                        const { mapQuoteToPdfData } = await import('../utils/orderMappers');

                                        // MAPPER: Use the unified logic "Brain"
                                        if (!status) return;
                                        const pdfData = mapQuoteToPdfData(status, t);

                                        const { blob, safeFileName } = await generatePDFFromPdfData(pdfData, status.type === 'buyback' ? 'Buyback' : 'Repair');
                                        if (blob) savePDFBlob(blob, safeFileName);

                                    } catch (err) {
                                        console.error('PDF Generation failed', err);
                                        alert(t('Error generating PDF'));
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="cursor-pointer group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition-all hover:shadow-lg flex items-start gap-4 text-left"
                            >
                                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl group-hover:bg-gray-100 dark:group-hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-300">
                                    <ClipboardDocumentCheckIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {t('Download Summary PDF')}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {t('Keep a copy of your order details.')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="my-12 border-t border-gray-200 dark:border-slate-800 w-full max-w-2xl mx-auto"></div>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-slate-800 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 dark:border-slate-800">
                        <form onSubmit={(e) => handleCheckStatus(e)} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    label={t('Order ID')}
                                    placeholder="ORD-2024-XXXXXX"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    // icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <Input
                                    label={t('Email Address')}
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant="primary"
                                    onClick={(e) => handleCheckStatus(e)}
                                    isLoading={loading}
                                    className="h-[50px] w-full md:w-auto px-8"
                                >
                                    {t('Track Order')}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="p-8 bg-gray-50/50 dark:bg-slate-900/50 min-h-[400px]">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center h-full py-20">
                                <div className="w-12 h-12 border-4 border-bel-blue border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-gray-500">{t('Searching for your order...')}</p>
                            </div>
                        ) : error ? (
                            <div className="flex-1 flex flex-col items-center justify-center h-full py-20 text-center">
                                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-3xl">!</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('Order Not Found')}</h3>
                                <p className="text-gray-500 max-w-md">{error}</p>
                            </div>
                        ) : status ? (
                            <div className="animate-fade-in">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {t('Order')} #{status.orderId || status.id}
                                        </h2>
                                        <p className="text-gray-500">
                                            {t('Placed on')} {new Date(status.createdAt?.seconds ? status.createdAt.seconds * 1000 : Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${status.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        status.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {t(status.status.charAt(0).toUpperCase() + status.status.slice(1).replace('_', ' '))}
                                    </div>
                                </div>

                                {/* Status Steps */}
                                <div className="relative">
                                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                                    <div className="space-y-8 relative">
                                        {steps.map((step, index) => {
                                            const isCompleted = index <= currentStepIndex;
                                            const isCurrent = index === currentStepIndex;

                                            return (
                                                <div key={step.id} className={`flex items-start gap-6 relative ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 z-10 border-4 transition-all duration-500 ${isCompleted
                                                        ? 'bg-bel-blue border-white dark:border-slate-900 text-white shadow-lg'
                                                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 text-gray-300'
                                                        }`}>
                                                        <step.icon className="w-8 h-8" />
                                                    </div>
                                                    <div className="pt-3">
                                                        <h3 className={`text-lg font-bold mb-1 ${isCurrent ? 'text-bel-blue' : 'text-gray-900 dark:text-white'}`}>
                                                            {step.label}
                                                        </h3>
                                                        {isCurrent && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {t('Current Status')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Order Details Grid */}
                                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('Device Details')}</h3>
                                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex justify-between">
                                                <span>{t('Device')}</span>
                                                <span className="font-medium">{status.brand} {status.model}</span>
                                            </div>
                                            {status.type === 'buyback' && status.condition && (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span>{t('Screen Condition')}</span>
                                                        <span className="font-medium">{t(typeof status.condition === 'object' ? status.condition.screen : status.condition)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>{t('Body Condition')}</span>
                                                        <span className="font-medium">{t(typeof status.condition === 'object' ? status.condition.body : '-')}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('Payment Details')}</h3>
                                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex justify-between">
                                                <span>{t('Price')}</span>
                                                <span className="font-bold text-lg text-bel-blue">€{status.price}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>{t('Payment Method')}</span>
                                                <span className="font-medium capitalize">{status.iban ? 'Bank Transfer' : 'Cash (In Store)'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center h-full py-20 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    <MagnifyingGlassIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('Ready to Track')}</h3>
                                <p className="text-gray-500 max-w-sm">{t('Enter your details above to see real-time updates for your order.')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;
