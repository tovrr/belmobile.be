'use client';

import React from 'react';
import StatCard from './StatCard';
import DashboardChart from './DashboardChart';
import { ADMIN_STATS, RESERVATIONS_CHART_DATA, QUOTES_CHART_DATA } from '../../constants';

const Dashboard: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your business performance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ADMIN_STATS.map(stat => (
                    <StatCard key={stat.label} stat={stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardChart
                    data={RESERVATIONS_CHART_DATA}
                    title="Monthly Reservations"
                    dataKey="value"
                    fillColor="#4338ca" // bel-blue
                />
                <DashboardChart
                    data={QUOTES_CHART_DATA}
                    title="Monthly Quotes"
                    dataKey="value"
                    fillColor="#64748b" // slate-500
                />
            </div>
        </div>
    );
};

export default Dashboard;
