'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import {
    ArrowLeftOnRectangleIcon,
    CurrencyEuroIcon,
    WrenchScrewdriverIcon,
    BriefcaseIcon,
    NewspaperIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';

import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!loading) {
                if (!user) {
                    router.push('/admin/login');
                } else {
                    // Check if user is in admins collection
                    try {
                        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                        if (!adminDoc.exists()) {
                            console.error("User is not an admin");
                            await logout();
                            router.push('/admin/login');
                        }
                    } catch (error) {
                        console.error("Error checking admin status:", error);
                        router.push('/admin/login');
                    }
                }
            }
        };
        checkAdminStatus();
    }, [user, loading, router, logout]);

    const handleLogout = async () => {
        await logout();
        router.push('/admin/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 text-slate-800 font-sans">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Bar */}
                <header className="h-16 md:h-20 flex justify-between items-center px-4 md:px-8 bg-transparent z-10">
                    <div className="flex items-center">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="mr-4 p-2 rounded-lg bg-white border border-gray-200 text-gray-600 md:hidden hover:bg-gray-50 shadow-sm"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>

                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                            <p className="text-xs md:text-sm text-slate-500 hidden sm:block">Welcome back, here's what's happening today.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-3 py-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5 md:mr-2" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 pb-4 md:px-8 md:pb-8">
                    {/* Content Container */}
                    <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-200 min-h-full p-4 md:p-8 relative">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
