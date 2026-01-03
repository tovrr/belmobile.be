'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    HomeIcon,
    DevicePhoneIcon,
    WrenchScrewdriverIcon,
    CurrencyEuroIcon,
    SettingsIcon,
    BellIcon,
    SearchIcon,
    UserIcon,
    ChartBarIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ClockIcon
} from '../ui/BrandIcons';
import { useLanguage } from '../../hooks/useLanguage';

const BelmobileOSPreview: React.FC = () => {
    const { t } = useLanguage();

    // Mock Data for the Dashboard
    const activeRepairs = [
        { id: 'R-2491', device: 'iPhone 14 Pro', user: 'Alex M.', status: 'diagnosing', time: '14m' },
        { id: 'R-2490', device: 'MacBook Air M2', user: 'Sarah L.', status: 'repairing', time: '42m' },
        { id: 'R-2488', device: 'iPad Pro 12.9', user: 'Team Design', status: 'ready', time: '2h' },
    ];

    const stats = [
        { label: 'Active Repairs', value: '12', trend: '+2', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { label: 'Total Fleet', value: '156', trend: 'stable', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Savings YTD', value: '€14,250', trend: '+18%', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    ];

    return (
        <div className="w-full h-full bg-[#0B0F19] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-hidden flex">
            {/* Sidebar Navigation */}
            <div className="w-20 lg:w-64 border-r border-white/5 bg-[#0B0F19] flex flex-col justify-between p-4 hidden md:flex">
                <div className="space-y-8">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-black text-xs">B</div>
                        <span className="font-bold text-white tracking-wide hidden lg:inline">BELMOBILE<span className="text-indigo-500">.OS</span></span>
                    </div>

                    {/* Nav Items */}
                    <nav className="space-y-2">
                        {[
                            { icon: HomeIcon, label: 'Overview', active: true },
                            { icon: DevicePhoneIcon, label: 'Fleet Manager', active: false },
                            { icon: WrenchScrewdriverIcon, label: 'Repairs', active: false },
                            { icon: CurrencyEuroIcon, label: 'Financials', active: false },
                            { icon: ChartBarIcon, label: 'Reports', active: false },
                        ].map((item, idx) => (
                            <div key={idx} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${item.active ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-white/5 hover:text-white'}`}>
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm font-medium hidden lg:inline">{item.label}</span>
                                {item.active && <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)] hidden lg:block"></div>}
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer text-slate-500 hover:text-white transition-colors flex items-center gap-3">
                    <SettingsIcon className="w-5 h-5" />
                    <span className="text-sm font-medium hidden lg:inline">Settings</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F131F]/50">
                {/* Top Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 lg:px-8 bg-[#0B0F19]/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4 text-slate-500 bg-white/5 px-4 py-2 rounded-lg border border-white/5 w-64">
                        <SearchIcon className="w-4 h-4" />
                        <span className="text-xs">Search fleet, devices, IDs...</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative cursor-pointer hover:text-white transition-colors">
                            <BellIcon className="w-5 h-5" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0B0F19]"></span>
                        </div>
                        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white">Sophie D.</p>
                                <p className="text-[10px] text-slate-500">Fleet Admin</p>
                            </div>
                            <UserIcon className="w-9 h-9 text-slate-600" />
                        </div>
                    </div>
                </header>

                {/* Dashboard Operations Center */}
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {/* Hero Welcome */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Operations Center</h1>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                System Operational • Last sync: 2 mins ago
                            </p>
                        </div>
                        <button className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/20">
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                            Refresh Data
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[#131725] border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors"
                            >
                                <div className={`absolute top-0 right-0 p-3 opacity-20 ${stat.color}`}>
                                    <ChartBarIcon className="w-12 h-12" />
                                </div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                                <div className="flex items-baseline gap-3">
                                    <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.bg} ${stat.color}`}>{stat.trend}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Active Repairs Table Preview */}
                    <div className="bg-[#131725] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#151928]">
                            <h3 className="text-sm font-bold text-white">Live Repair Feed</h3>
                            <button className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold">View All</button>
                        </div>
                        <div className="p-2">
                            <table className="w-full text-left text-xs">
                                <thead className="text-slate-500 border-b border-white/5">
                                    <tr>
                                        <th className="px-4 py-3 font-medium uppercase tracking-wider">ID</th>
                                        <th className="px-4 py-3 font-medium uppercase tracking-wider">Device</th>
                                        <th className="px-4 py-3 font-medium uppercase tracking-wider hidden sm:table-cell">User</th>
                                        <th className="px-4 py-3 font-medium uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 font-medium uppercase tracking-wider text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {activeRepairs.map((repair, idx) => (
                                        <motion.tr
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + (idx * 0.1) }}
                                            className="hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-4 py-3.5 font-mono text-indigo-400 font-bold">{repair.id}</td>
                                            <td className="px-4 py-3.5 font-bold text-slate-300">{repair.device}</td>
                                            <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{repair.user}</td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    {repair.status === 'diagnosing' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>}
                                                    {repair.status === 'repairing' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                                                    {repair.status === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                                                    <span className={`capitalize font-medium ${repair.status === 'ready' ? 'text-emerald-400' : repair.status === 'repairing' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                                        {repair.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-mono text-slate-500">{repair.time}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BelmobileOSPreview;
