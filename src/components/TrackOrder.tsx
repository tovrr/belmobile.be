'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../hooks/useLanguage';
import { MagnifyingGlassIcon, CheckCircleIcon, ClockIcon, WrenchScrewdriverIcon, TruckIcon, CurrencyEuroIcon, ClipboardDocumentCheckIcon, ArchiveBoxIcon, InformationCircleIcon, ArrowDownTrayIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { db } from '../firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import Input from './ui/Input';
import Button from './ui/Button';
import VerticalTimeline from './VerticalTimeline';
import Celebration from './Celebration';

import { Quote, Reservation } from '../types';

// Helper to format simplified slugs like "apple-iphone-15" -> "Apple iPhone 15"
const formatDeviceName = (slug: string) => {
    if (!slug) return '';
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

type TrackableItem = (Quote | Reservation) & { id: string, type: 'repair' | 'buyback' | 'reservation' };

const TrackOrder: React.FC = () => {
    const { t } = useLanguage();
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<TrackableItem | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();
    const isSuccess = searchParams.get('success') === 'true';

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
            // 1. Try fetching from QUOTES by Document ID
            let docSnap = await getDoc(doc(db, 'quotes', idToCheck.trim()));
            let data: any = null;
            let docId = idToCheck.trim();
            let type: 'repair' | 'buyback' | 'reservation' = 'repair'; // Default, will update

            if (docSnap.exists()) {
                data = docSnap.data();
                type = data.type || 'repair';
            } else {
                // 2. Try fetching from RESERVATIONS by Document ID
                docSnap = await getDoc(doc(db, 'reservations', idToCheck.trim()));
                if (docSnap.exists()) {
                    data = docSnap.data();
                    type = 'reservation';
                    docId = docSnap.id;
                } else {
                    // 3. Try Querying using 'orderId' field (common in quotes)
                    const qQuotes = query(
                        collection(db, 'quotes'),
                        where('orderId', '==', idToCheck.trim())
                    );
                    const querySnapshotQuotes = await getDocs(qQuotes);

                    if (!querySnapshotQuotes.empty) {
                        docSnap = querySnapshotQuotes.docs[0];
                        data = docSnap.data();
                        docId = docSnap.id;
                        type = data.type || 'repair';
                    } else {
                        // 4. Try Querying using 'id' field in RESERVATIONS (if stored as string field)
                        // OR we might want to assume reservations use auto-ids. 
                        // Check if we have an orderId field in reservations? Not in interfaces, but let's be safe.
                        // For now assume reservation ID is the doc ID.
                        console.log(`[TrackOrder] No document found for orderId: ${idToCheck.trim()}`);
                    }
                }
            }

            if (data) {
                console.log(`[TrackOrder] Checking email: ${emailToCheck} vs ${data.customerEmail || data.email}`);
                // Email Verification
                const dataEmail = (data.customerEmail || data.email || '').toLowerCase().trim();
                const inputEmail = emailToCheck.toLowerCase().trim();

                if (dataEmail === inputEmail) {
                    setStatus({
                        ...data,
                        id: docId,
                        type: type
                    } as TrackableItem);
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
        return [
            { id: 'pending', label: t('Processing'), icon: ClockIcon },
            { id: 'waiting_parts', label: t('Waiting for Parts'), icon: WrenchScrewdriverIcon },
            { id: 'in_repair', label: t('In Repair'), icon: WrenchScrewdriverIcon },
            { id: 'repaired', label: t('Repaired'), icon: CheckCircleIcon },
            { id: 'ready', label: t('Ready for Pickup'), icon: CheckCircleIcon },
            { id: 'shipped', label: t('Shipped'), icon: TruckIcon },
            { id: 'completed', label: t('Completed'), icon: TruckIcon }
        ];
    };

    const getBuybackSteps = () => {
        return [
            { id: 'pending', label: t('Processing'), icon: ClockIcon },
            { id: 'received', label: t('Received'), icon: ArchiveBoxIcon },
            { id: 'inspected', label: t('Inspected'), icon: ClipboardDocumentCheckIcon },
            { id: 'payment_sent', label: t('Payment Sent'), icon: CurrencyEuroIcon },
            { id: 'completed', label: t('Completed'), icon: CheckCircleIcon }
        ];
    };

    const getReservationSteps = () => {
        return [
            { id: 'pending', label: t('Processing'), icon: ClockIcon },
            { id: 'approved', label: t('Confirmed'), icon: CheckCircleIcon },
            { id: 'ready', label: t('Ready for Pickup'), icon: ShoppingBagIcon },
            { id: 'completed', label: t('Completed'), icon: CheckCircleIcon },
            { id: 'cancelled', label: t('Cancelled'), icon: ArchiveBoxIcon }
        ];
    };

    const getStepIndex = (steps: { id: string; label: string; icon: React.ElementType }[], currentStatus: string) => {
        // Map status to index
        if (currentStatus === 'new') return 0;
        if (currentStatus === 'processing') return 1;

        // Repair/Buyback specific
        if (currentStatus === 'waiting_parts') return 1;
        if (currentStatus === 'in_repair') return 2;
        if (currentStatus === 'repaired') return 3;
        if (currentStatus === 'ready') return 4;
        if (currentStatus === 'shipped') return 5;

        // Final states
        if (currentStatus === 'completed' || currentStatus === 'closed') return steps.length - 1;

        const index = steps.findIndex(s => s.id === currentStatus);
        return index === -1 ? 0 : index;
    };

    let steps: { id: string; label: string; icon: React.ElementType }[] = [];
    if (status) {
        if (status.type === 'buyback') steps = getBuybackSteps();
        else if (status.type === 'reservation') steps = getReservationSteps();
        else steps = getRepairSteps();
    }

    const currentStepIndex = status ? getStepIndex(steps, status.status) : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-24 pb-20 px-4">
            {isSuccess && <Celebration />}

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 animate-fade-in-down">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                        {t('Track Your Order')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('Enter your order details below to check the status of your repair or buyback.')}
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: Main Content & Forms (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Success Message (Conditional) */}
                        {isSuccess && status && (
                            <div className="animate-fade-in-up bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 border-green-100 dark:border-green-900/30 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-green-400 to-emerald-600" />
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6 relative">
                                    <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping-slow"></div>
                                    <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t('Order Confirmed')}
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                    {t('We have received your order and sent a confirmation email to')} <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
                                </p>

                                {/* Improved Info Box */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6 text-left max-w-2xl mx-auto">
                                    <div className="flex gap-4">
                                        <InformationCircleIcon className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">{t('important_info_title')}</h3>
                                            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                                <li>1. {t('important_info_1')}</li>
                                                <li>2. {t('important_info_2')}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Order Lookup Form */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-none dark:border dark:border-slate-800 p-8">
                            <form onSubmit={(e) => handleCheckStatus(e)} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <Input
                                        label={t('Order ID')}
                                        placeholder="ORD-2024-XXXXXX"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex-1 w-full">
                                    <Input
                                        label={t('Email Address')}
                                        type="email"
                                        placeholder="john@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={(e) => handleCheckStatus(e)}
                                    isLoading={loading}
                                    className="h-[52px] w-full md:w-auto px-8 mt-4 md:mt-0"
                                >
                                    {t('Track Order')}
                                </Button>
                            </form>
                        </div>

                        {/* 3. Detailed Order View */}
                        {status && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-none dark:border dark:border-slate-800 overflow-hidden animate-fade-in">
                                <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {t('Order Details')}
                                        </h2>
                                        {/* Handle createdAt which could be timestamp or string */}
                                        <p className="text-sm text-gray-500">
                                            {t('Placed on')} {
                                                (status as any).createdAt?.seconds
                                                    ? new Date((status as any).createdAt.seconds * 1000).toLocaleDateString()
                                                    : (status as any).date
                                                        ? new Date((status as any).date).toLocaleDateString()
                                                        : new Date().toLocaleDateString()
                                            }
                                        </p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${status.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        status.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {t(status.status.charAt(0).toUpperCase() + status.status.slice(1).replace('_', ' '))}
                                    </div>
                                </div>

                                <div className="p-8 grid md:grid-cols-2 gap-12">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            {status.type === 'reservation' ? (
                                                <ShoppingBagIcon className="w-5 h-5 text-bel-blue" />
                                            ) : (
                                                <WrenchScrewdriverIcon className="w-5 h-5 text-bel-blue" />
                                            )}
                                            {status.type === 'reservation' ? t('Product Info') : t('Device Info')}
                                        </h3>
                                        <div className="space-y-4 text-sm">
                                            {/* RESERVATION SPECIFIC FIELDS */}
                                            {status.type === 'reservation' && (
                                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                                                    <span className="text-gray-500">{t('Product')}</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{(status as Reservation).productName}</span>
                                                </div>
                                            )}

                                            {/* REPAIR/BUYBACK SPECIFIC FIELDS */}
                                            {status.type !== 'reservation' && (
                                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                                                    <span className="text-gray-500">{t('Device')}</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {formatDeviceName((status as Quote).brand)} {formatDeviceName((status as Quote).model)}
                                                    </span>
                                                </div>
                                            )}

                                            {(status as any).storage && (
                                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                                                    <span className="text-gray-500">{t('Storage')}</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{(status as any).storage}</span>
                                                </div>
                                            )}
                                            {status.type === 'buyback' && (status as Quote).condition && (
                                                <>
                                                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                                                        <span className="text-gray-500">{t('Screen')}</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{t(typeof (status as Quote).condition === 'object' ? ((status as Quote).condition as any).screen : (status as Quote).condition)}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                                                        <span className="text-gray-500">{t('Body')}</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">{t(typeof (status as Quote).condition === 'object' ? ((status as Quote).condition as any).body : '-')}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            <CurrencyEuroIcon className="w-5 h-5 text-bel-blue" />
                                            {t('Payment Info')}
                                        </h3>
                                        <div className="space-y-4 text-sm">
                                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                                                <span className="text-gray-500">{t('Amount')}</span>
                                                <span className="font-bold text-lg text-bel-blue">€{(status as any).price || (status as any).estimatedPrice || 0}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                                                <span className="text-gray-500">{t('Method')}</span>
                                                <span className="font-medium text-gray-900 dark:text-white capitalize">
                                                    {(status as any).iban ? t('Bank Transfer') : t('Cash (In Store)')}
                                                </span>
                                            </div>
                                            {(status as any).iban && (
                                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                                                    <span className="text-gray-500">IBAN</span>
                                                    <span className="font-medium text-gray-900 dark:text-white font-mono">{(status as any).iban}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="animate-shake p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-800 text-red-500 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl font-bold">!</span>
                                </div>
                                <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-1">{t('Order Not Found')}</h3>
                                <p className="text-red-700 dark:text-red-300 text-sm">{t('order_not_found_desc')}</p>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: Timeline & Summary (4 cols) - Hidden on mobile if no status, visible if status */}
                    <div className={`lg:col-span-4 space-y-6 ${!status ? 'hidden lg:block lg:opacity-50 lg:pointer-events-none' : ''}`}>
                        {status && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-none dark:border dark:border-slate-800 p-8 sticky top-32">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
                                    {t('Order Timeline')}
                                </h3>
                                <VerticalTimeline steps={steps} currentStepIndex={currentStepIndex} t={t} />

                                {/* DESKTOP ONLY: Actions used to be here, now simple download button for desktop, no sticky mobile */}
                                <div className="mt-12 pt-6 border-t border-gray-100 dark:border-slate-800">
                                    <div
                                        onClick={async () => {
                                            setLoading(true);
                                            try {
                                                const { generatePDFFromPdfData, savePDFBlob } = await import('../utils/pdfGenerator');
                                                const { mapQuoteToPdfData } = await import('../utils/orderMappers');

                                                if (!status) return;
                                                const pdfData = mapQuoteToPdfData(status as any, t);

                                                const { blob, safeFileName } = await generatePDFFromPdfData(pdfData, status.type === 'buyback' ? 'Buyback' : 'Repair');
                                                if (blob) savePDFBlob(blob, safeFileName);
                                            } catch (err) {
                                                console.error('PDF Generation failed', err);
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                        {t('Download PDF')}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;
