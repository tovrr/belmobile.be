'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData } from '../../types';

interface DashboardChartProps {
    data: ChartData[];
    title: string;
    dataKey: string;
    fillColor: string;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ data, title, dataKey, fillColor }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f1f5f9' }}
                    />
                    <Legend />
                    <Bar dataKey={dataKey} fill={fillColor} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DashboardChart;
