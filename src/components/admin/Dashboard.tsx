'use client';

import React from 'react';
import StatCard from './StatCard';
import DashboardChart from './DashboardChart';
import { useData } from '../../hooks/useData';
import { Quote } from '../../types';
import {
    PhoneIcon,
    DocumentTextIcon,
    CubeIcon,
    BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
    const { reservations, quotes, products, shops, loading } = useData();

    const stats = [
        { label: 'Total Reservations', value: reservations.length.toString(), icon: PhoneIcon },
        { label: 'New Quotes', value: quotes.filter((q: Quote) => q.status === 'new').length.toString(), icon: DocumentTextIcon },
        { label: 'Products in Stock', value: products.length.toString(), icon: CubeIcon },
        { label: 'Managed Shops', value: shops.length.toString(), icon: BuildingStorefrontIcon },
    ];

    const aggregateByMonth = (items: { date: string }[]) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const counts: Record<string, number> = {};

        items.forEach(item => {
            if (!item.date) return;
            const date = new Date(item.date);
            const monthName = months[date.getMonth()];
            counts[monthName] = (counts[monthName] || 0) + 1;
        });

        // Show last 6 months including current
        const currentMonthIdx = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const idx = (currentMonthIdx - i + 12) % 12;
            last6Months.push({ name: months[idx], value: counts[months[idx]] || 0 });
        }
        return last6Months;
    };

    const reservationChartData = aggregateByMonth(reservations);
    const quotesChartData = aggregateByMonth(quotes);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-bel-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 animate-pulse">Loading analytics data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your business performance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <StatCard key={stat.label} stat={stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardChart
                    data={reservationChartData}
                    title="Monthly Reservations"
                    dataKey="value"
                    fillColor="#4338ca" // bel-blue
                />
                <DashboardChart
                    data={quotesChartData}
                    title="Monthly Quotes"
                    dataKey="value"
                    fillColor="#64748b" // slate-500
                />
            </div>
        </div>
    );
};

export default Dashboard;
