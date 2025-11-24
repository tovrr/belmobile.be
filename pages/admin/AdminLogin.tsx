
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Clean inputs (remove accidental spaces from copy-paste)
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        // Strict authentication for specific admin
        // Email: omerozkan@live.be
        // Password: @Mleb3891
        if (cleanEmail === 'omerozkan@live.be' && cleanPassword === '@Mleb3891') {
            localStorage.setItem('admin_authenticated', 'true');
            navigate('/admin/dashboard', { replace: true });
        } else {
            setError('Access Denied: Invalid email or password.');
            // We do not clear the password field immediately to allow the user to fix a typo
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-electric-indigo p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <LockClosedIcon className="h-8 w-8 text-white" />
                    </div>
                    
                    {/* Official Logo */}
                    <div className="inline-flex flex-col items-start select-none mb-2">
                        <div className="text-3xl font-black tracking-tighter text-white leading-none">
                            BELMOBILE<span className="text-cyber-citron">.BE</span>
                        </div>
                        <div className="text-[0.65rem] font-bold tracking-[0.34em] text-indigo-200 mt-1.5 uppercase whitespace-nowrap ml-0.5">
                            BUYBACK & REPAIR
                        </div>
                    </div>

                    <p className="text-indigo-100 mt-2 text-sm">Restricted Access Portal</p>
                </div>
                
                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center animate-pulse">
                            <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-slate-900"
                            placeholder="admin@belmobile.be"
                        />
                    </div>
                    <div>
                         <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                         <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-slate-900 pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-electric-indigo text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition duration-300 shadow-lg shadow-indigo-500/30 active:scale-95">
                        Secure Login
                    </button>
                    
                    <p className="text-center text-xs text-slate-400 mt-4">
                        Authorized Personnel Only
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
