'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../hooks/useData';
import {
    HomeIcon,
    ShoppingBagIcon,
    WrenchScrewdriverIcon,
    BuildingStorefrontIcon,
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
    const { quotes, reservations, contactMessages } = useData();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


    useEffect(() => {
        if (!loading && !user && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [user, loading, router, pathname]);

    const newQuotesCount = quotes.filter(q => q.status === 'new').length;
    const newReservationsCount = reservations.filter(r => r.status === 'pending').length;

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
        { name: 'Reservations', href: '/admin/reservations', icon: CalendarIcon, badge: newReservationsCount },
        { name: 'Orders & Quotes', href: '/admin/orders', icon: ShoppingBagIcon, badge: newQuotesCount },
        { name: 'Messages', href: '/admin/messages', icon: NewspaperIcon, badge: contactMessages.filter(m => m.status === 'new').length },
        { name: 'Products', href: '/admin/products', icon: DevicePhoneMobileIcon },
        { name: 'Services', href: '/admin/services', icon: WrenchScrewdriverIcon },
        { name: 'Pricing', href: '/admin/pricing', icon: CurrencyEuroIcon },
        { name: 'Shops', href: '/admin/shops', icon: BuildingStorefrontIcon },
        { name: 'Franchise', href: '/admin/franchise', icon: GlobeAltIcon },
        { name: 'Blog Posts', href: '/admin/blog', icon: NewspaperIcon },
        { name: 'Global SEO', href: '/admin/seo', icon: GlobeAltIcon },
        { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 flex transition-colors duration-500">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 z-30 px-4 py-3 flex items-center justify-between">
                <span className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-bel-blue to-purple-600">BELMOBILE</span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-slate-800/50"
                >
                    {isMobileMenuOpen ? (
                        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                    ) : (
                        <div className="space-y-1.5">
                            <div className="w-6 h-0.5 bg-current rounded-full"></div>
                            <div className="w-6 h-0.5 bg-current rounded-full"></div>
                            <div className="w-6 h-0.5 bg-current rounded-full"></div>
                        </div>
                    )}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:fixed top-0 left-0 h-full z-40 
                bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50
                transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
                w-64
                flex flex-col
            `}>
                <div className="p-6 flex items-center justify-between h-16 lg:h-auto">
                    {isSidebarOpen ? (
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-bel-blue to-purple-600 hidden lg:block">BELMOBILE</span>
                    ) : (
                        <span className="text-2xl font-black text-bel-blue hidden lg:block">B</span>
                    )}
                    <span className="text-2xl font-black text-bel-blue lg:hidden">MENU</span>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden lg:block p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-slate-800/50 text-gray-500 transition-colors"
                    >
                        {isSidebarOpen ? (
                            <ArrowLeftOnRectangleIcon className="h-5 w-5 rotate-180" />
                        ) : (
                            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
                    {navigation.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive
                                    ? 'bg-linear-to-r from-bel-blue to-purple-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-slate-800/80 hover:scale-[1.02]'
                                    }`}
                            >
                                <item.icon className="h-6 w-6 shrink-0" />
                                <span className={`ml-3 font-medium flex-1 ${!isSidebarOpen ? 'lg:hidden' : ''}`}>{item.name}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className={`
                                        flex items-center justify-center min-w-5 h-5 px-1
                                        text-[10px] font-black rounded-full 
                                        ${isActive ? 'bg-white text-bel-blue' : 'bg-bel-blue text-white'}
                                        ${!isSidebarOpen ? 'lg:absolute lg:top-2 lg:right-2' : ''}
                                        transition-all duration-300
                                    `}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-slate-800/50">
                    <button
                        onClick={() => logout()}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all hover:scale-[1.02]"
                    >
                        <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0" />
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
