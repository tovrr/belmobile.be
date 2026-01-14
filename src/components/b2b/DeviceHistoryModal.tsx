'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { Quote } from '@/types/models';
import { WrenchScrewdriverIcon, CalendarIcon, BanknotesIcon, XMarkIcon, ClockIcon } from '@/components/ui/BrandIcons';

interface DeviceHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    imei: string;
    modelName: string;
}

export default function DeviceHistoryModal({ isOpen, onClose, imei, modelName }: DeviceHistoryModalProps) {
    const [history, setHistory] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !imei) return;

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const quotesRef = collection(db, 'quotes');
                const q = query(
                    quotesRef,
                    where('imei', '==', imei),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Quote[];
                setHistory(results);
            } catch (err) {
                console.error("Error fetching device history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [isOpen, imei]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-[#131725] border border-white/10 rounded-[2.5rem] w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Lifecycle Stream</h3>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{modelName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-[1.5rem] mb-8">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 opacity-50">Hardware_Identifier (IMEI)</p>
                        <p className="text-sm font-mono text-white tracking-widest">{imei}</p>
                    </div>

                    {loading ? (
                        <div className="py-24 text-center">
                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Decrypting Lifecycle History...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-600 mx-auto mb-6 opacity-20">
                                <WrenchScrewdriverIcon className="w-10 h-10" />
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest opacity-50">No service records detected.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((record) => (
                                <div key={record.id} className="p-6 bg-white/2 border border-white/5 rounded-4xl hover:border-white/10 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-500/5 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-400/10 group-hover:scale-110 transition-transform">
                                                {record.type === 'repair' ? <WrenchScrewdriverIcon className="w-5 h-5" /> : <BanknotesIcon className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                                                    {record.type === 'repair' ? 'Device Restoration' : 'Liquidated / Buyback'}
                                                </h4>
                                                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Job_ID: {record.orderId || record.id}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border ${record.status === 'completed' || record.status === 'paid'
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }`}>
                                            {record.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-3">
                                            <CalendarIcon className="w-4 h-4 text-slate-500" />
                                            <span className="text-[11px] font-bold text-slate-400">{record.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3 justify-end">
                                            <BanknotesIcon className="w-4 h-4 text-emerald-500" />
                                            <span className="text-sm font-black text-white">€{record.price}</span>
                                        </div>
                                    </div>

                                    {record.issues && record.issues.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {record.issues.map(issue => (
                                                <span key={issue} className="text-[9px] font-black uppercase bg-white/5 text-slate-500 px-3 py-1 rounded-lg border border-white/5">
                                                    {issue}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-white/2 border-t border-white/5 text-center">
                    <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] italic">
                        Authorized Blockchain Device Tracking Enabled
                    </p>
                </div>
            </div>
        </div>
    );
}
