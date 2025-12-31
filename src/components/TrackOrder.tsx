'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../hooks/useLanguage';
import { MagnifyingGlassIcon, CheckCircleIcon, ClockIcon, WrenchScrewdriverIcon, TruckIcon, CurrencyEuroIcon, ClipboardDocumentCheckIcon, ArchiveBoxIcon, InformationCircleIcon, ArrowDownTrayIcon, ShoppingBagIcon, CreditCardIcon, CheckIcon, MapPinIcon, BuildingStorefrontIcon, CubeIcon, StarIcon } from '@heroicons/react/24/outline';
import { db } from '../firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import Input from './ui/Input';
import Button from './ui/Button';
import VerticalTimeline from './VerticalTimeline';
import Celebration from './Celebration';

import { Quote, Reservation } from '../types';
import { useData } from '../hooks/useData';

// Helper to format simplified slugs like "apple-iphone-15" -> "Apple iPhone 15"
const formatDeviceName = (slug: string) => {
    if (!slug) return '';
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

type TrackableItem = (Quote | Reservation) & { id: string, type: 'repair' | 'buyback' | 'reservation' };

const ReviewPrompt = ({ shopId, t, shops }: { shopId?: string; t: any; shops: any[] }) => {
    // Determine the review URL based on the shopId or fallback to the primary/first shop
    const shop = shops.find(s => s.id === shopId) || shops.find(s => s.isPrimary);
    const reviewUrl = shop?.googleReviewUrl;

    if (!reviewUrl) return null;

    return (
        <div className="bg-linear-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-3xl p-8 text-center mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/40 rounded-full mb-4 text-yellow-600 dark:text-yellow-400">
                <StarIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('rate_us_title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
                {t('rate_us_desc')}
            </p>
            <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold rounded-xl transition-transform hover:scale-105"
            >
                {t('write_review')}
                <StarIcon className="w-5 h-5 fill-current" />
            </a>
        </div>
    );
};

const TrackOrder: React.FC = () => {
    const { t } = useLanguage();
    const { updateQuoteFields, shops } = useData();
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<TrackableItem | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const celebratedRef = useRef(false);

    const searchParams = useSearchParams();
    const isSuccess = searchParams.get('success') === 'true';

    // handleCheckStatus defined with useCallback for stability
    const handleCheckStatus = useCallback(async (e?: React.FormEvent, idToCheck?: string, emailToCheck?: string) => {
        if (e) e.preventDefault();

        const targetId = idToCheck || orderId;
        const targetEmail = emailToCheck || email;

        if (!targetId || !targetEmail) return;

        setLoading(true);
        setError(null);
        setStatus(null);

        try {
            // Normalize inputs
            const normalizedId = targetId.trim();
            const normalizedEmail = targetEmail.trim().toLowerCase();

            let foundDoc: any = null;
            let docType: 'repair' | 'buyback' | 'reservation' = 'repair';

            // 1. Try 'quotes' collection (by orderId field)
            const qQuotes = query(
                collection(db, 'quotes'),
                where('orderId', '==', normalizedId)
            );
            const querySnapshotQuotes = await getDocs(qQuotes);

            foundDoc = querySnapshotQuotes.docs.find(doc => {
                const data = doc.data();
                const dataEmail = (data.customerEmail || data.email || '').toLowerCase().trim();
                return dataEmail === normalizedEmail;
            });

            if (foundDoc) {
                docType = foundDoc.data().type || 'repair';
            } else {
                // 2. Try 'reservations' collection (by orderId field)
                const qReservations = query(
                    collection(db, 'reservations'),
                    where('orderId', '==', normalizedId)
                );
                const querySnapshotReservations = await getDocs(qReservations);

                foundDoc = querySnapshotReservations.docs.find(doc => {
                    const data = doc.data();
                    const dataEmail = (data.customerEmail || data.email || '').toLowerCase().trim();
                    return dataEmail === normalizedEmail;
                });

                if (foundDoc) {
                    docType = 'reservation';
                } else {
                    // 3. Last resort: Try by Document ID directly
                    const directDoc = await getDoc(doc(db, 'quotes', normalizedId));
                    if (directDoc.exists()) {
                        const d = directDoc.data();
                        const dEmail = (d.customerEmail || d.email || '').toLowerCase().trim();
                        if (dEmail === normalizedEmail) {
                            foundDoc = directDoc;
                            docType = d.type || 'repair';
                        }
                    }
                }
            }

            if (foundDoc) {
                const data = foundDoc.data();
                setStatus({
                    ...data,
                    id: foundDoc.id,
                    type: docType
                } as TrackableItem);

                // Success celebration
                if (isSuccess && !celebratedRef.current) {
                    celebratedRef.current = true;
                    setTimeout(() => setShowCelebration(true), 500);
                }
            } else {
                setError(t('order_not_found'));
                setShowCelebration(false);
            }
        } catch (err) {
            console.error("Error fetching order:", err);
            setError(t('error_fetching_order'));
            setShowCelebration(false);
        } finally {
            setLoading(false);
        }
    }, [orderId, email, isSuccess, t]);

    // Initial useEffect to populate fields from URL and trigger search
    useEffect(() => {
        const id = searchParams.get('id');
        const mail = searchParams.get('email');
        if (id && mail) {
            setOrderId(id);
            setEmail(mail);
            handleCheckStatus(undefined, id, mail);
        }
    }, [searchParams, handleCheckStatus]);

    const getRepairSteps = () => {
        return [
            { id: 'pending', label: t('order_status_pending'), icon: ClockIcon },
            { id: 'waiting_parts', label: t('order_status_waiting_parts'), icon: WrenchScrewdriverIcon },
            { id: 'in_repair', label: t('order_status_in_repair'), icon: WrenchScrewdriverIcon },
            { id: 'repaired', label: t('order_status_repaired'), icon: CheckCircleIcon },
            { id: 'ready', label: t('order_status_ready'), icon: CheckCircleIcon },
            { id: 'shipped', label: t('order_status_shipped'), icon: TruckIcon },
            { id: 'completed', label: t('order_status_completed'), icon: TruckIcon }
        ];
    };

    const getBuybackSteps = () => {
        return [
            { id: 'pending', label: t('order_status_pending'), icon: ClockIcon },
            { id: 'received', label: t('order_status_received'), icon: ArchiveBoxIcon },
            { id: 'inspected', label: t('order_status_inspected'), icon: ClipboardDocumentCheckIcon },
            { id: 'payment_sent', label: t('order_status_paid'), icon: CurrencyEuroIcon },
            { id: 'completed', label: t('order_status_completed'), icon: CheckCircleIcon }
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

    let steps: { id: string; label: string; icon: React.ElementType }[] = [];
    if (status) {
        if (status.type === 'buyback') steps = getBuybackSteps();
        else if (status.type === 'reservation') steps = getReservationSteps();
        else steps = getRepairSteps();
    }

    const currentStepIndex = status ? getStepIndex(steps, status.status) : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-24 pb-20 px-4">
            {showCelebration && <Celebration />}

            <div className="max-w-7xl mx-auto">
                <div className={`text-center mb-10 animate-fade-in-down ${!status ? 'max-w-2xl mx-auto' : ''}`}>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                        {t('Track Your Order')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('track_order_description_extended') || t('Enter your order details below to check the status of your repair, buyback, or product reservation.')}
                    </p>
                </div>

                <div className={`${!status ? 'max-w-2xl mx-auto' : 'grid lg:grid-cols-12'} gap-8 items-start`}>
                    <div className={`${!status ? 'w-full' : 'lg:col-span-8'} space-y-8`}>
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

                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                    {t('We have received your order and sent a confirmation email to')} <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
                                </p>

                                {(() => {
                                    const shopId = status.shopId || (shops.find(s => s.isPrimary)?.id);
                                    const shop = shops.find(s => s.id === shopId);
                                    if (shop?.googleReviewUrl) {
                                        return (
                                            <a
                                                href={shop.googleReviewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-bold hover:underline mb-8 bg-yellow-50 dark:bg-yellow-900/10 px-4 py-2 rounded-full transition-colors"
                                            >
                                                <StarIcon className="w-5 h-5 fill-current" />
                                                {t('booking_success_review_prompt')}
                                            </a>
                                        );
                                    }
                                    return <div className="mb-8" />;
                                })()}

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

                        {status && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-none dark:border dark:border-slate-800 overflow-hidden animate-fade-in">
                                <div className="p-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {t('Order Details')}
                                        </h2>
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
                                            {status.type === 'reservation' && (
                                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
                                                    <span className="text-gray-500">{t('Product')}</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{(status as Reservation).productName}</span>
                                                </div>
                                            )}
                                            {(status as any).isCompany && (
                                                <div className="py-3 px-4 bg-bel-blue/5 dark:bg-bel-blue/10 rounded-xl border border-bel-blue/10 mb-4 animate-fade-in">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-bel-blue" />
                                                        <span className="text-[10px] font-black text-bel-blue uppercase tracking-widest">{t('B2B Order')}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-500 font-medium">{t('company_name')}</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{(status as any).companyName}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm mt-1">
                                                        <span className="text-gray-500 font-medium">{t('vat_number')}</span>
                                                        <span className="font-mono text-gray-900 dark:text-white">{(status as any).vatNumber}</span>
                                                    </div>
                                                </div>
                                            )}

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

                                            {(status as Quote).issues && ((status as Quote).issues?.length ?? 0) > 0 && (
                                                <div className="py-2 border-b border-gray-100 dark:border-slate-800">
                                                    <span className="text-gray-500 block mb-2">{t('Issues Identified')}</span>
                                                    <div className="flex flex-col gap-2">
                                                        {(status as Quote).issues?.map((issue: string, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm font-medium">
                                                                <WrenchScrewdriverIcon className="w-4 h-4" />
                                                                {t(issue)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="py-2 border-b border-gray-100 dark:border-slate-800">
                                                <span className="text-gray-500 block mb-1">{t('Delivery Method')}</span>
                                                <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white capitalize">
                                                    {status.deliveryMethod === 'courier' && <TruckIcon className="w-5 h-5 text-bel-blue" />}
                                                    {status.deliveryMethod === 'shipping' && <CubeIcon className="w-5 h-5 text-bel-blue" />}
                                                    {(status.deliveryMethod === 'dropoff' || !status.deliveryMethod) && <BuildingStorefrontIcon className="w-5 h-5 text-bel-blue" />}
                                                    {t(status.deliveryMethod || 'pickup')}
                                                </div>
                                            </div>

                                            {status.deliveryMethod !== 'shipping' && status.shopId && (
                                                <div className="py-2 border-b border-gray-100 dark:border-slate-800">
                                                    <span className="text-gray-500 block mb-1">{t('Selected Shop')}</span>
                                                    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                            <BuildingStorefrontIcon className="w-4 h-4 text-gray-500" />
                                                            {shops.find(s => s.id === status.shopId)?.name || status.shopId}
                                                        </div>
                                                        {shops.find(s => s.id === status.shopId)?.address && (
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-start gap-2 ml-6">
                                                                <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0" />
                                                                {shops.find(s => s.id === status.shopId)?.address}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
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
                                                <span className="text-gray-500">{t('Status')}</span>
                                                <span className={`font-medium ${(status as Quote).isPaid ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                                                    {(status as Quote).isPaid ? (
                                                        <span className="flex items-center gap-1">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            {t('Paid')}
                                                        </span>
                                                    ) : (
                                                        t('Unpaid')
                                                    )}
                                                </span>
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

                                            {(status as Quote).paymentReceiptUrl && (
                                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
                                                    <a
                                                        href={(status as Quote).paymentReceiptUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold rounded-xl hover:bg-green-100 transition"
                                                    >
                                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                                        {t('Download Payment Receipt')}
                                                    </a>
                                                </div>
                                            )}

                                            {status.type !== 'buyback' && !(status as Quote).isPaid && (status as Quote).paymentLink && (
                                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
                                                    <a
                                                        href={(status as Quote).paymentLink}
                                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-bel-blue text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none"
                                                    >
                                                        <CreditCardIcon className="w-5 h-5" />
                                                        {t('Pay Now Securely')}
                                                    </a>
                                                    <p className="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-widest">{t('Secure payment via Mollie')}</p>
                                                </div>
                                            )}

                                            {/* B2B Invoice Download */}
                                            {(status as any).isCompany && (status as any).invoiceUrl && (
                                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
                                                    <a
                                                        href={(status as any).invoiceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition border border-indigo-200 dark:border-indigo-800"
                                                    >
                                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                                        {t('Download Invoice')}
                                                    </a>
                                                    <p className="text-[10px] text-center text-gray-400 mt-2 uppercase tracking-widest">
                                                        {t('B2B Invoice')} • {(status as any).vatNumber}
                                                    </p>
                                                </div>
                                            )}

                                            {status.type === 'buyback' && (status as Quote).price !== (status as Quote).initialPrice && !(status as Quote).isOfferAccepted && (
                                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
                                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
                                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                            {t('The offer price has been adjusted after inspection. Please review and accept the new offer to proceed with the payout.')}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            setLoading(true);
                                                            try {
                                                                await updateQuoteFields(status.id, { isOfferAccepted: true });
                                                                setStatus(prev => prev ? { ...prev, isOfferAccepted: true } as any : null);
                                                                setShowCelebration(true);
                                                            } catch (err) {
                                                                console.error('Failed to accept offer', err);
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        disabled={loading}
                                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 dark:shadow-none"
                                                    >
                                                        <CheckIcon className="w-5 h-5" />
                                                        {t('Accept Updated Offer')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Google Review Prompt - Only show if completed/repaired/paid/ready */}
                                {['completed', 'repaired', 'shipped', 'payment_sent', 'ready'].includes(status.status) && (
                                    <ReviewPrompt shopId={status.shopId?.toString()} t={t} shops={shops} />
                                )}
                            </div>
                        )}
                    </div>

                    {status && (
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-none dark:border dark:border-slate-800 p-8 sticky top-32">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
                                    {t('Order Timeline')}
                                </h3>
                                <VerticalTimeline steps={steps} currentStepIndex={currentStepIndex} t={t} />

                                <div className="mt-12 pt-6 border-t border-gray-100 dark:border-slate-800">
                                    <div
                                        onClick={async () => {
                                            setLoading(true);
                                            try {
                                                const { generatePDFFromPdfData, savePDFBlob } = await import('../utils/pdfGenerator');
                                                const { mapQuoteToPdfData } = await import('../utils/orderMappers');
                                                const { getFixedT } = await import('../utils/i18n-server');

                                                if (!status) return;

                                                // FIXED: Use customer's original language for PDF
                                                const fixedT = getFixedT((status as Quote).language || 'fr');
                                                const pdfData = mapQuoteToPdfData(status as any, fixedT);

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
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-8 animate-shake p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex flex-col items-center text-center max-w-2xl mx-auto">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-800 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl font-bold">!</span>
                        </div>
                        <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-1">{t('Order Not Found')}</h3>
                        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
