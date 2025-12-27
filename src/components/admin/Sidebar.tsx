'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChartPieIcon, CubeIcon, WrenchScrewdriverIcon, BuildingStorefrontIcon, PhoneIcon, DocumentTextIcon,
    Cog6ToothIcon, UserGroupIcon, NewspaperIcon, XMarkIcon, EnvelopeIcon
} from '@heroicons/react/24/outline';

const adminNavLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: ChartPieIcon },
    { name: 'Products', path: '/admin/products', icon: CubeIcon },
    { name: 'Services', path: '/admin/services', icon: WrenchScrewdriverIcon },
    { name: 'Shops', path: '/admin/shops', icon: BuildingStorefrontIcon },
    { name: 'Reservations', path: '/admin/reservations', icon: PhoneIcon },
    { name: 'Quotes', path: '/admin/quotes', icon: DocumentTextIcon },
    { name: 'Messages', path: '/admin/messages', icon: EnvelopeIcon },
    { name: 'Franchise', path: '/admin/franchise', icon: UserGroupIcon },
    { name: 'Content & SEO', path: '/admin/content', icon: NewspaperIcon },
    { name: 'Repair Pricing', path: '/admin/repair-pricing', icon: WrenchScrewdriverIcon },
    { name: 'Integrations', path: '/admin/integrations', icon: CubeIcon },
    { name: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50 w-72 bg-gray-100 p-4 h-screen
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Detached Floating Sidebar */}
                <div className="flex flex-col flex-1 bg-slate-900 rounded-3xl shadow-2xl overflow-hidden h-full relative">

                    {/* Close Button (Mobile Only) */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white md:hidden z-50"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>

                    {/* Header */}
                    <div className="h-24 flex items-center justify-center border-b border-white/10 shrink-0">
                        <span className="text-2xl font-black text-white tracking-tight">
                            BEL<span className="text-electric-indigo">ADMIN</span>
                        </span>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {adminNavLinks.map((link) => {
                            const isActive = link.path === '/admin/dashboard'
                                ? pathname === link.path
                                : pathname.startsWith(link.path);

                            return (
                                <Link
                                    key={link.name}
                                    href={link.path}
                                    onClick={() => {
                                        // Close sidebar on mobile when link is clicked
                                        if (window.innerWidth < 768) {
                                            onClose();
                                        }
                                    }}
                                    className={`group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                                        ? 'bg-electric-indigo text-white shadow-lg shadow-indigo-500/30 translate-x-1'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                        }`}
                                >
                                    <link.icon className="h-5 w-5 mr-3 transition-colors" />
                                    <span className="font-medium text-sm tracking-wide">{link.name}</span>

                                    {/* Active Indicator */}
                                    <span className={isActive ? "ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" : "hidden"} />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile Snippet */}
                    <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-electric-indigo to-purple-500 p-0.5">
                                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-white">AD</div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-bold text-white">Admin User</p>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
