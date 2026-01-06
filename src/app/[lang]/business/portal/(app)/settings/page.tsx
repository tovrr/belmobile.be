'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    BriefcaseIcon,
    UserIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    GlobeAltIcon,
    BuildingOfficeIcon,
    EnvelopeIcon,
    CreditCardIcon
} from '@/components/ui/BrandIcons';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [company, setCompany] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            try {
                const userDoc = await getDoc(doc(db, 'b2b_users', user.uid));
                if (!userDoc.exists()) return;

                const userData = userDoc.data();
                setUserProfile(userData);

                const companyDoc = await getDoc(doc(db, 'b2b_companies', userData.companyId));
                if (companyDoc.exists()) {
                    setCompany({ id: companyDoc.id, ...companyDoc.data() });
                }

            } catch (err) {
                console.error("Settings Load Error:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Decentralizing Profile Node...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-4 border-indigo-600 pl-8 py-2">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                        Node <span className="text-indigo-500">Configuration</span>
                    </h1>
                    <p className="text-xs text-slate-500 flex items-center gap-2 font-mono uppercase tracking-widest">
                        Manage your enterprise identity & access protocols.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Company Profile */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <BuildingOfficeIcon className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Enterprise.Identity</h3>
                    </div>

                    <div className="bg-[#131725] border border-white/5 rounded-3xl p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest">Legal.Name</label>
                                <p className="text-white font-black text-lg uppercase tracking-tight">{company?.name}</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest">TAX_ID / VAT</label>
                                <p className="text-indigo-400 font-mono font-black text-lg">{company?.vatNumber}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest">Headquarters_Address</label>
                            <div className="bg-white/2 border border-white/5 p-4 rounded-2xl">
                                <p className="text-slate-300 text-sm font-bold uppercase italic">
                                    {company?.billingAddress?.street} {company?.billingAddress?.number}
                                    {company?.billingAddress?.box ? `, Box ${company?.billingAddress?.box}` : ''}<br />
                                    {company?.billingAddress?.zip} {company?.billingAddress?.city}<br />
                                    {company?.billingAddress?.country}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                                <ShieldCheckIcon className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Verified Corporate Node</span>
                            </div>
                            <span className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-widest">Tier: {company?.contractTier}</span>
                        </div>
                    </div>
                </div>

                {/* 2. User & Security */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <UserIcon className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Authorized.Personnel</h3>
                    </div>

                    <div className="bg-[#131725] border border-white/5 rounded-3xl p-8 space-y-8 h-full">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-indigo-700 rounded-4xl flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-indigo-600/30">
                                {userProfile?.fullName?.charAt(0)}
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-white text-2xl font-black uppercase tracking-tight leading-none">{userProfile?.fullName}</h4>
                                <p className="text-indigo-400 font-mono text-[10px] font-black uppercase tracking-[0.2em]">Role: {userProfile?.role}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/2 border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/5 text-slate-400 rounded-xl group-hover:text-white transition-colors">
                                        <EnvelopeIcon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">Auth_Email</p>
                                        <p className="text-white text-sm font-bold tracking-tight">{userProfile?.email}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">Primary</span>
                            </div>

                            <div className="bg-white/2 border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-not-allowed">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/5 text-slate-400 rounded-xl group-hover:text-white transition-colors">
                                        <LockClosedIcon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">Encryption_Keys</p>
                                        <p className="text-white text-sm font-bold tracking-tight">Access Restricted</p>
                                    </div>
                                </div>
                                <button className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border border-white/10 px-3 py-1 rounded-lg">Rotate</button>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-500 font-mono italic text-center">To update legal corporate data, please contact your Belmobile account manager.</p>
                    </div>
                </div>
            </div>

            {/* Bottom Protocol Status */}
            <div className="border border-white/5 bg-white/2 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#131725] bg-slate-800 flex items-center justify-center text-[10px] font-black text-white z-${40 - i * 10}`}>
                                {i}
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Active Access Nodes</p>
                        <p className="text-[9px] font-mono text-slate-500 uppercase font-black">Admin + 2 Managers Authorized</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest">Operational.Security_Grade:</span>
                    <div className="flex gap-1.5 font-mono">
                        {['S', 'E', 'C', 'U', 'R', 'E'].map((char, i) => (
                            <span key={i} className="w-6 h-8 bg-black border border-indigo-500/30 text-indigo-500 flex items-center justify-center text-xs font-black rounded shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                {char}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
