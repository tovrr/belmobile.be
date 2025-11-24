
import React, { useState, useEffect } from 'react';
import { LockClosedIcon, KeyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface StagingGateProps {
    children: React.ReactNode;
}

const StagingGate: React.FC<StagingGateProps> = ({ children }) => {
    const [isLocked, setIsLocked] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentHost, setCurrentHost] = useState('');

    useEffect(() => {
        const checkAccess = () => {
            const hostname = window.location.hostname;
            setCurrentHost(hostname);
            
            // STRICT CHECK: Only lock if we are EXACTLY on the specific dev domain.
            // This prevents the lock screen from appearing on localhost, Vercel previews, or AI environments.
            const isStrictDev = hostname === 'dev.belmobile.be';
            
            // Check if already authenticated in this session
            const hasAccess = sessionStorage.getItem('dev_access_granted');

            if (isStrictDev && !hasAccess) {
                setIsLocked(true);
                // SEO Protection: Tell Google to go away immediately
                let meta = document.querySelector("meta[name='robots']");
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute('name', 'robots');
                    document.head.appendChild(meta);
                }
                meta.setAttribute('content', 'noindex, nofollow');
                document.title = "Restricted Access - Belmobile Dev";
            } else {
                setIsLocked(false);
            }
            setIsLoading(false);
        };

        checkAccess();
    }, []);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded PIN for simplicity.
        if (pin === '2024') {
            sessionStorage.setItem('dev_access_granted', 'true');
            setIsLocked(false);
            window.location.reload(); // Reload to clear any potential state issues
        } else {
            setError(true);
            setPin('');
            setTimeout(() => setError(false), 2000);
        }
    };

    if (isLoading) return null;

    if (isLocked) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-yellow-500"></div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 text-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-inner">
                            <LockClosedIcon className="h-10 w-10 text-indigo-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">Staging Environment</h1>
                        <div className="text-slate-400 mb-8 text-sm">
                            <p className="mb-2">
                                Host: <span className="text-yellow-400 font-mono bg-yellow-400/10 px-2 py-0.5 rounded">{currentHost}</span>
                            </p>
                            <p>Access is restricted to authorized developers.</p>
                            <p className="text-xs text-slate-600 mt-2">(Dev Hint: 2024)</p>
                        </div>

                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <KeyIcon className="h-5 w-5 text-slate-500" />
                                </div>
                                <input 
                                    type="password" 
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="Enter PIN Code"
                                    className={`w-full bg-slate-950 border ${error ? 'border-red-500 animate-shake' : 'border-slate-700 focus:border-indigo-500'} text-white rounded-xl py-4 pl-12 pr-4 outline-none transition-all text-center tracking-[0.5em] font-mono text-lg`}
                                    autoFocus
                                    maxLength={4}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-900/20"
                            >
                                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                                Unlock Access
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-800/50">
                            <p className="text-xs text-slate-600">
                                ID: BEL-DEV-{Math.floor(Math.random() * 10000)} • SECURE CONNECTION
                            </p>
                        </div>
                    </div>
                </div>
                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                        20%, 40%, 60%, 80% { transform: translateX(4px); }
                    }
                    .animate-shake {
                        animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                    }
                `}</style>
            </div>
        );
    }

    return <>{children}</>;
};

export default StagingGate;
    