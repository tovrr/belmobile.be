
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChartPieIcon, CubeIcon, WrenchScrewdriverIcon, BuildingStorefrontIcon, PhoneIcon, DocumentTextIcon, UserGroupIcon, NewspaperIcon } from '@heroicons/react/24/outline';

const adminNavLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: ChartPieIcon },
    { name: 'Products', path: '/admin/products', icon: CubeIcon },
    { name: 'Services', path: '/admin/services', icon: WrenchScrewdriverIcon },
    { name: 'Shops', path: '/admin/shops', icon: BuildingStorefrontIcon },
    { name: 'Reservations', path: '/admin/reservations', icon: PhoneIcon },
    { name: 'Quotes', path: '/admin/quotes', icon: DocumentTextIcon },
    { name: 'Franchise', path: '/admin/franchise', icon: UserGroupIcon },
    { name: 'Content & SEO', path: '/admin/content', icon: NewspaperIcon },
];

const Sidebar: React.FC = () => {
    return (
        <div className="hidden md:flex flex-col w-72 h-screen p-4 bg-gray-100">
            {/* Detached Floating Sidebar */}
            <div className="flex flex-col flex-1 bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
                
                {/* Header - Official Logo */}
                <div className="h-24 flex items-center justify-center border-b border-white/10">
                    <div className="inline-flex flex-col items-start select-none scale-90">
                        <div className="text-2xl font-black tracking-tighter text-white leading-none">
                            BELMOBILE<span className="text-cyber-citron">.BE</span>
                        </div>
                        <div className="text-[0.5rem] font-bold tracking-[0.34em] text-slate-500 mt-1 uppercase whitespace-nowrap ml-0.5">
                            BUYBACK & REPAIR
                        </div>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {adminNavLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            end={link.path === '/admin/dashboard'}
                            className={({ isActive }) =>
                                `group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-electric-indigo text-white shadow-lg shadow-indigo-500/30 translate-x-1' 
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                }`
                            }
                        >
                            <link.icon className={`h-5 w-5 mr-3 transition-colors ${
                                // Active state handling implicitly covered by parent styling, 
                                // but we can add specific icon animations if needed
                                ''
                            }`} />
                            <span className="font-medium text-sm tracking-wide">{link.name}</span>
                            
                            {/* Active Indicator */}
                            <NavLink 
                                to={link.path}
                                className={({ isActive }) => isActive ? "ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" : "hidden"} 
                            />
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile Snippet */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-electric-indigo to-purple-500 p-0.5">
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
    );
};

export default Sidebar;
