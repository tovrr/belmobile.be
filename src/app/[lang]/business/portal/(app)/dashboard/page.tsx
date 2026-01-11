'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, limit, orderBy } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    ArrowPathIcon,
    CheckCircleIcon,
    WrenchScrewdriverIcon,
    DevicePhoneMobileIcon,
    ChartBarIcon,
    ClockIcon,
    ShieldCheckIcon
} from '@/components/ui/BrandIcons';
import { motion } from 'framer-motion';
import BulkFleetUploadModal from '@/components/b2b/BulkFleetUploadModal';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalFleet: 0,
        activeRepairs: 0,
        savings: 12450
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            try {
                const userDoc = await getDoc(doc(db, 'b2b_users', user.uid));
                if (!userDoc.exists()) return;
                const cId = userDoc.data().companyId;
                setCompanyId(cId);

                const fleetQuery = query(collection(db, 'b2b_inventory'), where('companyId', '==', cId));
                const fleetSnap = await getDocs(fleetQuery);

                const repairsQuery = query(
                    collection(db, 'b2b_repair_requests'),
                    where('companyId', '==', cId),
                    where('status', 'in', ['requested', 'in_repair', 'diagnosing'])
                );
                const repairsSnap = await getDocs(repairsQuery);

                const activityQuery = query(
                    collection(db, 'b2b_repair_requests'),
                    where('companyId', '==', cId),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
                const activitySnap = await getDocs(activityQuery);

                setStats({
                    totalFleet: fleetSnap.size,
                    activeRepairs: repairsSnap.size,
                    savings: fleetSnap.size * 170 * 0.3 // Calculated dynamic estimate
                });

                setRecentActivity(activitySnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));

            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // ... (Loading state remains same)

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-indigo-500/10 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.3em]">Downloading UI Layer...</p>
            </div>
        );
    }

    const cards = [
        {
            label: 'Total Fleet',
            value: stats.totalFleet,
            icon: DevicePhoneMobileIcon,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            trend: 'Live Asset Sync'
        },
        {
            label: 'Active Repairs',
            value: stats.activeRepairs,
            icon: WrenchScrewdriverIcon,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            trend: stats.activeRepairs > 0 ? 'Urgency: High' : 'Status: Optimal'
        },
        {
            label: 'Savings YTD',
            value: `€${stats.savings.toLocaleString()}`,
            icon: ChartBarIcon,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            trend: '+12% vs last year'
        }
    ];

    return (
        <div className="space-y-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-4 border-indigo-600 pl-8 py-2">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                        Operations <span className="text-indigo-500">Center</span>
                    </h1>
                    <p className="text-xs text-slate-500 flex items-center gap-2 font-mono uppercase tracking-widest">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        System Operational • Last sync: <ClockIcon className="w-3 h-3 inline ml-1" /> Just Now
                    </p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all flex items-center gap-3 active:scale-95 group"
                >
                    <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 text-indigo-400" />
                    Refresh Node
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-[#131725] border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500"
                    >
                        {/* Interactive Background Glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/5 blur-3xl group-hover:bg-indigo-600/10 transition-all"></div>

                        <div className={`p-3 rounded-2xl ${card.bg} ${card.color} w-fit mb-6 shadow-2xl`}>
                            <card.icon className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">{card.label}</p>
                            <h3 className="text-4xl font-black text-white tracking-tighter">{card.value}</h3>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 uppercase italic">
                            <span className={`w-1 h-1 rounded-full ${card.color === 'text-emerald-400' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                            {card.trend}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="w-1 h-4 bg-indigo-500"></span>
                            Live Repair Feed
                        </h3>
                        <button className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest border-b border-indigo-400/20 pb-0.5">Explore Archive</button>
                    </div>

                    <div className="bg-[#131725] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/2">
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-500">Identifier</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-500">Asset</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-500">Status</th>
                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-slate-500 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/2">
                                    {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
                                        <motion.tr
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + (idx * 0.1) }}
                                            className="hover:bg-white/5 transition-all cursor-default group"
                                        >
                                            <td className="px-6 py-5">
                                                <span className="font-mono text-indigo-400 font-black tracking-tighter">#{activity.id.slice(0, 8).toUpperCase()}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-200">{activity.deviceModel}</span>
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Asset.Reference</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${activity.status === 'ready' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                        activity.status === 'in_repair' ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'
                                                        }`}></div>
                                                    <span className={`font-black uppercase tracking-widest text-[10px] ${activity.status === 'ready' ? 'text-emerald-400' :
                                                        activity.status === 'in_repair' ? 'text-amber-400' : 'text-slate-400'
                                                        }`}>{activity.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right font-mono text-slate-500 font-bold group-hover:text-slate-300 transition-colors">
                                                {activity.createdAt?.toDate ? new Date(activity.createdAt.toDate()).toLocaleDateString() : 'Active'}
                                            </td>
                                        </motion.tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <DevicePhoneMobileIcon className="w-12 h-12 text-slate-500" />
                                                    <p className="text-sm font-bold uppercase tracking-widest">No active repair streams found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Security & Quick Actions */}
                <div className="space-y-8">
                    <div className="px-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="w-1 h-4 bg-indigo-500"></span>
                            Protocol.Status
                        </h3>
                    </div>

                    <div className="bg-[#131725] border border-white/5 rounded-3xl p-8 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform">
                            <ShieldCheckIcon className="w-32 h-32" />
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 shadow-lg">
                                <ShieldCheckIcon className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-white font-black uppercase text-xs tracking-tighter">Security Grade: A+</h4>
                                <p className="text-xs text-slate-500 font-medium">All sessions are encrypted via 256-bit AES. Your fleet data is isolated.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest border-b border-white/5 pb-2">Compliance Nodes</h5>
                            <div className="space-y-3">
                                {[
                                    { label: 'RGPD/GDPR', status: 'Injected' },
                                    { label: 'Data.Mirroring', status: 'Active' },
                                    { label: 'Audit.Logging', status: 'Streaming' }
                                ].map((node, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white/2 p-3 rounded-xl border border-white/5">
                                        <span className="text-[10px] font-mono text-slate-500 font-black tracking-widest">{node.label}</span>
                                        <span className="text-[10px] font-mono text-emerald-500 font-black lowercase">{node.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/20 active:translate-y-1">
                            Download Security Report
                        </button>
                    </div>

                    {/* Quick Access Card */}
                    <div
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-linear-to-br from-indigo-700 to-indigo-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-indigo-600/20 group cursor-pointer active:scale-95 transition-all"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                        <h4 className="text-white font-black text-xl tracking-tighter leading-tight relative z-10 mb-2 uppercase">Bulk Fleet Upload</h4>
                        <p className="text-indigo-100 text-xs font-medium opacity-80 relative z-10 mb-6">Process up to 500 devices via CSV initialization.</p>
                        <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest relative z-10 border border-white/20 bg-white/10 w-fit px-4 py-2 rounded-lg group-hover:bg-white group-hover:text-indigo-950 transition-all">
                            Initialize Stream
                            <ArrowPathIcon className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {companyId && (
                <BulkFleetUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onSuccess={() => {
                        window.location.reload(); // Simple refresh to show new data
                    }}
                    companyId={companyId}
                />
            )}
        </div>
    );
}
