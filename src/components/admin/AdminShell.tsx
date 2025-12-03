'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
    HomeIcon,
    ShoppingBagIcon,
    UsersIcon,
    WrenchScrewdriverIcon,
    BuildingStorefrontIcon,
    ChartBarIcon,
    ArrowLeftOnRectangleIcon,
    Cog6ToothIcon,
    CurrencyEuroIcon,
    CalendarIcon,
    DevicePhoneMobileIcon,
    GlobeAltIcon,
    NewspaperIcon
} from '@heroicons/react/24/outline';

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!loading && !user && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bel-blue"></div>
            </div>
        );
    }

    if (!user && pathname !== '/admin/login') {
        return null;
    }

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
        { name: 'Orders & Quotes', href: '/admin/orders', icon: ShoppingBagIcon },
        { name: 'Reservations', href: '/admin/reservations', icon: CalendarIcon },
        { name: 'Products', href: '/admin/products', icon: DevicePhoneMobileIcon },
        { name: 'Services', href: '/admin/services', icon: WrenchScrewdriverIcon },
        { name: 'Pricing', href: '/admin/pricing', icon: CurrencyEuroIcon },
        { name: 'Shops', href: '/admin/shops', icon: BuildingStorefrontIcon },
        { name: 'Franchise', href: '/admin/franchise', icon: GlobeAltIcon },
        { name: 'Blog & SEO', href: '/admin/blog', icon: NewspaperIcon },
        { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-30 px-4 py-3 flex items-center justify-between">
                <span className="text-xl font-black text-bel-blue">BELMOBILE</span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                    {isMobileMenuOpen ? (
                        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                    ) : (
                        <div className="space-y-1.5">
                            <div className="w-6 h-0.5 bg-current"></div>
                            <div className="w-6 h-0.5 bg-current"></div>
                            <div className="w-6 h-0.5 bg-current"></div>
                        </div>
                    )}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:fixed top-0 left-0 h-full z-40 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
                w-64
                flex flex-col
            `}>
                <div className="p-6 flex items-center justify-between h-16 lg:h-auto">
                    {isSidebarOpen ? (
                        <span className="text-2xl font-black text-bel-blue hidden lg:block">BELMOBILE</span>
                    ) : (
                        <span className="text-2xl font-black text-bel-blue hidden lg:block">B</span>
                    )}
                    <span className="text-2xl font-black text-bel-blue lg:hidden">MENU</span>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden lg:block p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
                    >
                        {isSidebarOpen ? (
                            <ArrowLeftOnRectangleIcon className="h-5 w-5 rotate-180" />
                        ) : (
                            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-xl transition-colors ${isActive
                                    ? 'bg-bel-blue text-white shadow-lg shadow-blue-200 dark:shadow-none'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <item.icon className="h-6 w-6 flex-shrink-0" />
                                <span className={`ml-3 font-medium ${!isSidebarOpen ? 'lg:hidden' : ''}`}>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                        onClick={() => logout()}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                        <ArrowLeftOnRectangleIcon className="h-6 w-6 flex-shrink-0" />
                        <span className={`ml-3 font-medium ${!isSidebarOpen ? 'lg:hidden' : ''}`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`
                flex-1 transition-all duration-300 
                ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} 
                p-4 lg:p-8
                pt-20 lg:pt-8
            `}>
                {children}
            </main>
        </div>
    );
}
