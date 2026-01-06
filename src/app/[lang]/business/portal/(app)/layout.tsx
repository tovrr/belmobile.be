'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
    HomeIcon,
    DevicePhoneMobileIcon,
    WrenchScrewdriverIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    SearchIcon,
    BellIcon,
    UserIcon
} from '@/components/ui/BrandIcons';

export default function B2BAppLayout({ children }: { children: React.ReactNode }) {
    const { language, t } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        { name: 'Overview', path: '/dashboard', icon: HomeIcon },
        { name: 'Fleet Manager', path: '/fleet', icon: DevicePhoneMobileIcon },
        { name: 'Repairs', path: '/repairs', icon: WrenchScrewdriverIcon },
        { name: 'Buyback', path: '/buyback', icon: ArrowPathIcon },
        { name: 'Invoices', path: '/invoices', icon: DocumentTextIcon },
        { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
    ];

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push(`/${language}/business/portal/login`);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-300 font-sans flex overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className={`fixed lg:relative z-50 h-screen transition-all duration-500 bg-[#0B0F19] border-r border-white/5 flex flex-col justify-between ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="flex flex-col flex-1">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-6 gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(79,70,229,0.4)]">B</div>
                        {isSidebarOpen && (
                            <span className="font-black text-white tracking-widest text-sm lg:text-base">
                                BELMOBILE<span className="text-indigo-500">.OS</span>
                            </span>
                        )}
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 px-4 space-y-2">
                        {navItems.map((item) => {
                            const fullPath = `/${language}/business/portal${item.path}`;
                            const isActive = pathname.startsWith(fullPath);

                            return (
                                <Link
                                    key={item.path}
                                    href={fullPath}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm group ${isActive
                                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-600/30'
                                        : 'text-slate-500 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : ''}`} />
                                    {isSidebarOpen && <span>{item.name}</span>}
                                    {isActive && isSidebarOpen && (
                                        <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 space-y-2">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-colors w-full font-bold text-xs uppercase tracking-widest hidden lg:flex"
                    >
                        <div className="w-5 h-5 flex items-center justify-center">
                            {isSidebarOpen ? '«' : '»'}
                        </div>
                        {isSidebarOpen && <span>Collapse</span>}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-500/80 hover:bg-red-500/10 hover:text-red-500 rounded-2xl w-full transition-all font-bold text-sm group"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F131F]/50 h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0B0F19]/80 backdrop-blur-xl sticky top-0 z-40">
                    <div className="flex items-center gap-6">
                        <div className="flex lg:hidden mr-4 cursor-pointer" onClick={() => setSidebarOpen(true)}>
                            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                            <div className="w-6 h-0.5 bg-white"></div>
                        </div>

                        <div className="hidden md:flex items-center gap-4 text-slate-500 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 w-80 lg:w-96 focus-within:border-indigo-500/50 transition-all">
                            <SearchIcon className="w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search fleet, devices, IDs..."
                                className="bg-transparent border-none outline-none text-xs w-full text-slate-300 placeholder:text-slate-600 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative cursor-pointer group">
                            <BellIcon className="w-5.5 h-5.5 text-slate-400 group-hover:text-white transition-colors" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#0B0F19] shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                        </div>

                        <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-10">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-white uppercase tracking-tight">Enterprise User</p>
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Fleet Manager</p>
                            </div>
                            <div className="w-10 h-10 bg-linear-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg cursor-pointer hover:border-indigo-500/50 transition-all group">
                                <UserIcon className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="absolute top-0 left-0 w-full h-[500px] bg-indigo-600/5 blur-[120px] pointer-events-none rounded-full"></div>
                    <div className="p-8 lg:p-12 relative z-10 max-w-(--breakpoint-xl) mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
