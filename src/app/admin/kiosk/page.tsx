'use client';

import React, { useState, useEffect } from 'react';
import BuybackRepair from '@/components/wizard/BuybackRepair';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, WrenchScrewdriverIcon, CurrencyEuroIcon, PowerIcon } from '@heroicons/react/24/outline';

export default function KioskPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'select' | 'buy' | 'repair'>('select');
    const [resetTimer, setResetTimer] = useState(0);

    // Auth Check
    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login');
        }
    }, [user, loading, router]);

    // Idle Timer (Auto-reset after 5 minutes of inactivity if in wizard)
    useEffect(() => {
        if (mode === 'select') return;

        const reset = () => setResetTimer(300); // 5 mins
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const handleActivity = () => reset();

        // Initial set
        reset();

        events.forEach(e => window.addEventListener(e, handleActivity));

        const interval = setInterval(() => {
            setResetTimer(prev => {
                if (prev <= 1) {
                    setMode('select'); // Time's up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            events.forEach(e => window.removeEventListener(e, handleActivity));
            clearInterval(interval);
        };
    }, [mode]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

    if (mode === 'select') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                {/* Header */}
                <header className="p-8 flex justify-between items-center bg-zinc-900 border-b border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="bg-bel-blue w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl">B</div>
                        <h1 className="text-3xl font-bold tracking-tight">Kiosk Mode</h1>
                    </div>
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition"
                    >
                        <PowerIcon className="w-6 h-6" />
                        <span>Exit Kiosk</span>
                    </button>
                </header>

                {/* Main Selection */}
                <main className="flex-1 flex items-center justify-center gap-8 p-8 animate-fade-in">

                    {/* SELL Button */}
                    <button
                        onClick={() => setMode('buy')}
                        className="group relative w-full max-w-md aspect-square bg-zinc-900 rounded-3xl border-2 border-zinc-800 hover:border-bel-blue hover:bg-zinc-800 transition-all duration-300 flex flex-col items-center justify-center gap-6"
                    >
                        <div className="w-32 h-32 rounded-full bg-zinc-800 group-hover:bg-bel-blue/20 flex items-center justify-center transition-colors">
                            <CurrencyEuroIcon className="w-16 h-16 text-zinc-400 group-hover:text-bel-blue transition-colors" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-4xl font-black mb-2 uppercase tracking-tight group-hover:text-bel-blue transition-colors">Sell Device</h2>
                            <p className="text-zinc-500 text-lg">Detailed quote in 2 mins</p>
                        </div>
                    </button>

                    {/* REPAIR Button */}
                    <button
                        onClick={() => setMode('repair')}
                        className="group relative w-full max-w-md aspect-square bg-zinc-900 rounded-3xl border-2 border-zinc-800 hover:border-green-500 hover:bg-zinc-800 transition-all duration-300 flex flex-col items-center justify-center gap-6"
                    >
                        <div className="w-32 h-32 rounded-full bg-zinc-800 group-hover:bg-green-500/20 flex items-center justify-center transition-colors">
                            <WrenchScrewdriverIcon className="w-16 h-16 text-zinc-400 group-hover:text-green-500 transition-colors" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-4xl font-black mb-2 uppercase tracking-tight group-hover:text-green-500 transition-colors">Repair</h2>
                            <p className="text-zinc-500 text-lg">Book a repair instantly</p>
                        </div>
                    </button>

                </main>

                <footer className="p-8 text-center text-zinc-600 text-sm">
                    Protected System • Store Use Only
                </footer>
            </div>
        );
    }

    const handlePrint = async (data: any) => {
        const { printKioskLabel } = await import('@/utils/printKioskLabel');
        printKioskLabel({
            type: data.type === 'buyback' ? 'BUYBACK' : 'REPAIR',
            model: `${data.brand} ${data.model}`,
            price: data.price ? `€${data.price}` : '€-',
            orderId: `K-${Math.floor(Math.random() * 10000)}`, // Temp ID until real sync
            date: new Date().toLocaleDateString('fr-BE')
        });

        // Auto-reset after print
        setTimeout(() => setMode('select'), 5000);
    };

    // Wizard Mode
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
            <div className="bg-zinc-900 text-white p-4 flex items-center justify-between border-b border-zinc-800 z-50">
                <button
                    onClick={() => setMode('select')}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back to Home</span>
                </button>
                <div className="font-mono text-zinc-500 text-xs uppercase tracking-widest">
                    Auto-reset in {Math.floor(resetTimer / 60)}:{(resetTimer % 60).toString().padStart(2, '0')}
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <BuybackRepair
                    type={mode === 'buy' ? 'buyback' : 'repair'}
                    isKiosk={true}
                    // Force start at step 1
                    initialCategory=""
                    initialWizardProps={{
                        shopId: profile?.shopId || 'kiosk-default',
                        partnerId: profile?.uid
                    }}
                    onSuccess={handlePrint}
                />
            </div>
        </div>
    );
}
