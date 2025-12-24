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
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
    const { reservations, quotes, products, shops, loading } = useData();

    // -- Financial Calculations --
    const financials = useMemo(() => {
        // 1. Potential Revenue from Quotes (Buyback + Repair)
        const quoteRevenue = quotes.reduce((sum: number, q: Quote) => {
            return sum + (Number(q.price) || 0);
        }, 0);

        // 2. Potential Revenue from Reservations (Sales)
        // Note: We need 'estimatedPrice' on Reservation or lookup product price. 
        // For now, we use the new 'estimatedPrice' field if available.
        const reservationRevenue = reservations.reduce((sum: number, r: Reservation) => {
            return sum + (Number(r.estimatedPrice) || 0);
        }, 0);

        const totalPotentialRevenue = quoteRevenue + reservationRevenue;

        // 3. Conversion Rate (Quotes converted to 'repaired', 'shipped', 'closed')
        const closedQuotes = quotes.filter((q: Quote) =>
            ['repaired', 'shipped', 'closed', 'responded'].includes(q.status)
        ).length;
        const conversionRate = quotes.length > 0
            ? Math.round((closedQuotes / quotes.length) * 100)
            : 0;

        return { totalPotentialRevenue, conversionRate };
    }, [quotes, reservations]);


    const stats = [
        {
            label: 'Potential Revenue',
            value: `€${financials.totalPotentialRevenue.toLocaleString()}`,
            icon: CurrencyEuroIcon,
            trend: '+12%', // Mock trend for now, or calc from prev month
            color: 'text-green-600'
        },
        {
            label: 'Conversion Rate',
            value: `${financials.conversionRate}%`,
            icon: ArrowTrendingUpIcon,
            color: 'text-blue-600'
        },
        { label: 'Products in Stock', value: products.length.toString(), icon: CubeIcon },
        { label: 'Managed Shops', value: shops.length.toString(), icon: BuildingStorefrontIcon },
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
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time financial & operational overview</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
    );
};

export default Dashboard;
