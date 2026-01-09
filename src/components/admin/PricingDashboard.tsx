
'use client';

import React, { useState } from 'react';
import {
    WrenchScrewdriverIcon,
    ArrowPathRoundedSquareIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import RepairPricingManagement from './RepairPricingManagement';
import BuybackAnchorManager from './BuybackAnchorManager';

export default function PricingDashboard() {
    const [activeTab, setActiveTab] = useState<'repair' | 'buyback'>('repair');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        Pricing Command Center
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-black uppercase tracking-widest">v3.0 Secure</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage all service fees and device buyback anchors from one place.
                    </p>
                </div>

                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-inner">
                    <button
                        onClick={() => setActiveTab('repair')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'repair'
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xl scale-[1.05]'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <WrenchScrewdriverIcon className="w-4 h-4" />
                        Repairs
                    </button>
                    <button
                        onClick={() => setActiveTab('buyback')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'buyback'
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xl scale-[1.05]'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <ArrowPathRoundedSquareIcon className="w-4 h-4" />
                        Buyback
                    </button>
                </div>
            </div>

            <div className="relative">
                {activeTab === 'repair' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <RepairPricingManagement />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <BuybackAnchorManager />
                    </div>
                )}
            </div>
        </div>
    );
}
