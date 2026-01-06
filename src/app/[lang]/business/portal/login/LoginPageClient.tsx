'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { ShieldCheckIcon, LockClosedIcon, ComputerDesktopIcon } from '@/components/ui/BrandIcons';
import { motion } from 'framer-motion';

export default function B2BLoginPage() {
    const { t, language } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userDoc = await getDoc(doc(db, 'b2b_users', user.uid));

            if (!userDoc.exists()) {
                throw new Error("Access Denied: Not a registered Business User.");
            }

            const userData = userDoc.data();
            if (!userData.isActive) {
                throw new Error("Access Denied: Account Deactivated.");
            }

            window.location.href = `/${language}/business/portal/dashboard`;

        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message || "Failed to login");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-slate-300 font-sans p-6 overflow-hidden relative">
            {/* Cyber Background elements */}
            <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-size-[60px_60px] opacity-[0.03] pointer-events-none"></div>
            <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[150px] rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg relative z-10"
            >
                {/* Protocol Badge */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest">Secure Infrastructure Connection</span>
                    </div>
                </div>

                <div className="bg-[#131725] rounded-[2.5rem] border border-white/5 p-10 md:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    {/* Glowing highlight */}
                    <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-indigo-500 to-transparent"></div>

                    <div className="text-center mb-12">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-[0_0_30px_rgba(79,70,229,0.3)]">B</div>
                        <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
                            BELMOBILE<span className="text-indigo-500">.PRO</span>
                        </h1>
                        <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.3em]">Operational Terminal v4.0</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
                        >
                            Error: {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest ml-1">Asset.Auth.Email</label>
                            <div className="relative group/field">
                                <ComputerDesktopIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within/field:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/2 border border-white/5 focus:border-indigo-500/50 outline-none transition-all font-bold text-slate-200 placeholder:text-slate-700"
                                    placeholder="terminal@enterprise.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest ml-1">Secure.Kernel.Key</label>
                            <div className="relative group/field">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within/field:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/2 border border-white/5 focus:border-indigo-500/50 outline-none transition-all font-bold text-slate-200 placeholder:text-slate-700"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-white text-midnight font-black rounded-2xl shadow-2xl hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 group/btn mt-4 active:scale-95"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-midnight border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Initiate Protocol</span>
                                    <ShieldCheckIcon className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <Link href="/" className="text-[10px] font-mono font-black text-slate-600 hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]">
                            « Disconnect Terminal »
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Cyber Decoration */}
            <div className="mt-12 text-[10px] font-mono text-slate-700 font-bold uppercase tracking-[0.4em] flex gap-8">
                <span>Brussels_HQ</span>
                <span className="opacity-30">|</span>
                <span>Node_Active</span>
                <span className="opacity-30">|</span>
                <span>ISO_27001</span>
            </div>
        </div>
    );
}
