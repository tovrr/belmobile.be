'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { CheckCircleIcon, PrinterIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface KioskSuccessProps {
    data: any;
    onReset: () => void;
    type: 'buyback' | 'repair';
}

export const KioskSuccess: React.FC<KioskSuccessProps> = ({ data, onReset, type }) => {
    const { t } = useLanguage();
    const [printing, setPrinting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    onReset();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onReset]);

    const handlePrint = async () => {
        setPrinting(true);
        try {
            window.print();
        } catch (e) {
            console.error(e);
        } finally {
            setPrinting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in print:hidden">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30">
                    <CheckCircleIcon className="w-12 h-12 text-white" />
                </div>

                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                    {t('Success!')}
                </h2>
                <p className="text-xl text-gray-500 mb-8">
                    {type === 'buyback' ? t('Offer Confirmed') : t('Repair Booked')}
                </p>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border-2 border-gray-100 dark:border-slate-700 w-full max-w-md mb-8">
                    <p className="text-sm uppercase font-bold text-gray-400 mb-2">{t('Order Reference')}</p>
                    <div className="text-5xl font-mono font-black text-bel-blue tracking-wider">
                        {data.readableId}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                    <button
                        onClick={handlePrint}
                        disabled={printing}
                        className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl hover:scale-105 transition-transform"
                    >
                        <PrinterIcon className="w-6 h-6" />
                        {printing ? t('Printing...') : t('Print Label')}
                    </button>

                    <button
                        onClick={onReset}
                        className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-bold py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                    >
                        <ArrowPathIcon className="w-6 h-6" />
                        {t('New Customer')} ({timeLeft}s)
                    </button>
                </div>
            </div>

            <div className="hidden print:block fixed inset-0 bg-white z-9999 p-8 text-left">
                <h1 className="text-4xl font-bold mb-4">BELMOBILE</h1>
                <h2 className="text-2xl font-bold mb-8">{type === 'buyback' ? 'BUYBACK' : 'REPAIR'}</h2>

                <div className="border-b-2 border-black pb-4 mb-4">
                    <p className="font-bold text-xl">REF: {data.readableId}</p>
                    <p className="text-sm">{new Date().toLocaleString()}</p>
                </div>

                <div className="text-center mt-12">
                    <p>Please attach to device</p>
                </div>
            </div>
        </>
    );
};
