'use client';

import React, { useMemo } from 'react';
import StatCard from './StatCard';
import DashboardChart from './DashboardChart';
import { useData } from '../../hooks/useData';
import { Quote, Reservation } from '../../types';
import {
    CubeIcon,
    BuildingStorefrontIcon,
    CurrencyEuroIcon,
    ArrowTrendingUpIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import WalkInOrderModal from './WalkInOrderModal';

const Dashboard: React.FC = () => {
    const { reservations, quotes, products, shops, loading } = useData();
    const [isWalkInModalOpen, setIsWalkInModalOpen] = React.useState(false);

    // -- Financial Calculations --
    const financials = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const closedStatuses = ['repaired', 'shipped', 'closed', 'responded', 'completed', 'collected'];
        const openRepairStatuses = ['received', 'in_repair', 'repaired', 'ready'];

        let todayRev = 0;
        let monthRev = 0;
        let openRepairValue = 0;

        const parseSafeDate = (d: any) => {
            if (!d) return new Date(0);
            if (d instanceof Date) return d;
            if (typeof d === 'string') return new Date(d);
            if (d.seconds) return new Date(d.seconds * 1000);
            return new Date(d);
        };

        // 1. Process Quotes
        quotes.forEach((q: Quote) => {
            const qPrice = Number(q.price) || 0;
            const qDate = parseSafeDate(q.date || q.createdAt);

            // Revenue (Closed orders)
            if (closedStatuses.includes(q.status)) {
                if (qDate >= startOfToday) todayRev += qPrice;
                if (qDate >= startOfMonth) monthRev += qPrice;
            }

            // Open repairs value
            if (q.type === 'repair' && openRepairStatuses.includes(q.status)) {
                openRepairValue += qPrice;
            }
        });

        // 2. Process Reservations (Sales)
        reservations.forEach((r: Reservation) => {
            const rPrice = Number(r.estimatedPrice || r.productPrice) || 0;
            const rDate = parseSafeDate(r.date || r.createdAt);

            if (closedStatuses.includes(r.status)) {
                if (rDate >= startOfToday) todayRev += rPrice;
                if (rDate >= startOfMonth) monthRev += rPrice;
            }
        });

        // Conversion Rate
        const closedQuotes = quotes.filter((q: Quote) => closedStatuses.includes(q.status)).length;
        const conversionRate = quotes.length > 0 ? Math.round((closedQuotes / quotes.length) * 100) : 0;

        return { todayRev, monthRev, openRepairValue, conversionRate };
    }, [quotes, reservations]);


    const stats = [
        {
            label: "Today's Revenue",
            value: `€${financials.todayRev.toLocaleString()}`,
            icon: CurrencyEuroIcon,
            color: 'text-green-600',
            trend: 'Live'
        },
        {
            label: 'This Month',
            value: `€${financials.monthRev.toLocaleString()}`,
            icon: ArrowTrendingUpIcon,
            color: 'text-blue-600'
        },
        {
            label: 'Open Repairs Value',
            value: `€${financials.openRepairValue.toLocaleString()}`,
            icon: CubeIcon,
            color: 'text-purple-600',
            desc: 'Working Capital'
        },
        {
            label: 'Conversion',
            value: `${financials.conversionRate}%`,
            icon: BuildingStorefrontIcon,
            color: 'text-orange-600'
        },
    ];

    const aggregateData = (items: (Quote | Reservation)[], valueKey: 'count' | 'price') => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data: Record<string, number> = {};

        items.forEach(item => {
            if (!item.date) return;
            const date = new Date(item.date);
            const monthName = months[date.getMonth()];

            let val = 0;
            if (valueKey === 'price') {
                if ('price' in item) {
                    val = Number(item.price) || 0;
                }
                // Check if it's a Reservation with estimatedPrice
                if ('estimatedPrice' in item) {
                    // Note: If both exist, we might double count if we aren't careful, 
                    // but types are mutually exclusive mostly. 
                    // Actually cleaner:
                    val = val || Number(item.estimatedPrice) || 0;
                }
            } else {
                val = 1;
            }

            data[monthName] = (data[monthName] || 0) + val;
        });

        // Show last 6 months including current
        const currentMonthIdx = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const idx = (currentMonthIdx - i + 12) % 12;
            const mName = months[idx];
            last6Months.push({ name: mName, value: data[mName] || 0 });
        }
        return last6Months;
    };

    const revenueChartData = aggregateData([...quotes, ...reservations], 'price');
    const volumeChartData = aggregateData([...quotes, ...reservations], 'count');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-bel-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 animate-pulse">Loading analytics data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Dashboard</h1>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Business Overview
                        </h1>

                        <button
                            onClick={() => setIsWalkInModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-bel-blue text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                        >
                            <PlusIcon className="w-4 h-4" />
                            New Walk-in
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(stat => (
                    <StatCard key={stat.label} stat={stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DashboardChart
                    data={revenueChartData}
                    title="Revenue Trend (Estimated)"
                    dataKey="value"
                    fillColor="#16a34a" // green-600
                />
                <DashboardChart
                    data={volumeChartData}
                    title="Total Volume (Quotes + Res)"
                    dataKey="value"
                    fillColor="#4338ca" // bel-blue
                />
            </div>

            <WalkInOrderModal
                isOpen={isWalkInModalOpen}
                onClose={() => setIsWalkInModalOpen(false)}
                onSuccess={() => {
                    // Refresh logic handled by real-time listener in OrderContext
                }}
            />
        </div>
    );
};

export default Dashboard;
