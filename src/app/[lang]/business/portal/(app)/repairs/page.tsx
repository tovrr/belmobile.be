'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, orderBy } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    WrenchScrewdriverIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@/components/ui/BrandIcons';
import { motion } from 'framer-motion';

export default function RepairsHistoryPage() {
    const [loading, setLoading] = useState(true);
    const [repairs, setRepairs] = useState<any[]>([]);
    const [companyId, setCompanyId] = useState<string | null>(null);

    const fetchRepairs = async (cid: string) => {
        try {
            const repairsRef = collection(db, 'b2b_repair_requests');
            const q = query(
                repairsRef,
                where('companyId', '==', cid),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            const fetchedRepairs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setRepairs(fetchedRepairs);
        } catch (err) {
            console.error("Error fetching repairs:", err);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            try {
                const userDoc = await getDoc(doc(db, 'b2b_users', user.uid));
                if (!userDoc.exists()) return;

                const cid = userDoc.data().companyId;
                setCompanyId(cid);
                await fetchRepairs(cid);

            } catch (err) {
                console.error("Auth check failed:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ready':
            case 'completed':
                return {
                    bg: 'bg-emerald-500/10',
                    text: 'text-emerald-500',
                    icon: CheckCircleIcon,
                    label: 'RESTORED_ACTIVE'
                };
            case 'in_repair':
            case 'diagnosing':
                return {
                    bg: 'bg-amber-500/10',
                    text: 'text-amber-500',
                    icon: WrenchScrewdriverIcon,
                    label: 'PROCESS_ACTIVE'
                };
            case 'requested':
                return {
                    bg: 'bg-indigo-500/10',
                    text: 'text-indigo-500',
                    icon: ClockIcon,
                    label: 'QUEUE_INITIALIZED'
                };
            case 'cancelled':
                return {
                    bg: 'bg-red-500/10',
                    text: 'text-red-500',
                    icon: ExclamationTriangleIcon,
                    label: 'PROTOCOL_ABORTED'
                };
            default:
                return {
                    bg: 'bg-slate-500/10',
                    text: 'text-slate-500',
                    icon: ClockIcon,
                    label: status.toUpperCase()
                };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Accessing Log Streams...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-4 border-amber-600 pl-8 py-2">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                        Repair <span className="text-amber-500">Repository</span>
                    </h1>
                    <p className="text-xs text-slate-500 flex items-center gap-2 font-mono uppercase tracking-widest">
                        Asset Maintenance Ledger • Node: Brussels_HQ
                    </p>
                </div>
                <button
                    onClick={() => companyId && fetchRepairs(companyId)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all flex items-center gap-3 active:scale-95 group"
                >
                    <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 text-amber-400" />
                    Sync Logs
                </button>
            </div>

            {/* Repairs Table */}
            <div className="bg-[#131725] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/2 border-b border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ticket_UID</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Asset Configuration</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Fault.Node</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operation.Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/2">
                            {repairs.length > 0 ? repairs.map((repair, idx) => {
                                const status = getStatusStyle(repair.status);
                                return (
                                    <motion.tr
                                        key={repair.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-white/5 transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-indigo-400 font-black tracking-tighter uppercase">
                                                ID_{repair.id.slice(0, 10)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
                                                    <WrenchScrewdriverIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-sm uppercase tracking-tight">{repair.deviceModel}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{repair.deviceBrand}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest bg-white/2 px-3 py-1.5 rounded-lg border border-white/5">
                                                {repair.issue || 'General Maintenance'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl ${status.bg} ${status.text} border border-current/10`}>
                                                <status.icon className="w-3.5 h-3.5" />
                                                <span className="font-black uppercase tracking-widest text-[9px]">{status.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-mono text-slate-400 font-bold text-[11px]">
                                                    {repair.createdAt?.toDate ? new Date(repair.createdAt.toDate()).toLocaleDateString() : 'REALTIME'}
                                                </span>
                                                <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Sync_Confirmed</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6 opacity-20">
                                            <WrenchScrewdriverIcon className="w-16 h-16" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-black uppercase tracking-[0.3em]">No Repairs in Repository</p>
                                                <p className="text-[10px] font-mono uppercase">Node is clean. No active tickets.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
