'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { Quote, Reservation } from '../../types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import {
    CalendarIcon,
    ArrowDownTrayIcon,
    ArrowTrendingUpIcon,
    CurrencyEuroIcon,
    ChatBubbleLeftRightIcon,
    Square3Stack3DIcon,
    DevicePhoneMobileIcon,
    BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

type TimeRange = '7d' | '30d' | '90d' | 'ytd';

const Reporting: React.FC = () => {
    const { profile } = useAuth();
    const { quotes, reservations, shops, loading } = useData();
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');

    // Access Control
    if (profile?.role !== 'super_admin') {
        return <div className="p-8 text-center font-bold text-red-500 bg-red-50 rounded-2xl">Access Denied: Super Admin Only</div>;
    }

    // -- DATA FILTERING & TRANSFORMATION --
    const filteredData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        if (timeRange === '7d') startDate.setDate(now.getDate() - 7);
        else if (timeRange === '30d') startDate.setDate(now.getDate() - 30);
        else if (timeRange === '90d') startDate.setDate(now.getDate() - 90);
        else if (timeRange === 'ytd') startDate = new Date(now.getFullYear(), 0, 1);

        const filterFn = (item: Quote | Reservation) => {
            const date = item.date ? new Date(item.date) : (item.createdAt ? new Date(item.createdAt instanceof Date ? item.createdAt : (item.createdAt as any).toDate?.() || item.createdAt) : null);
            return date && date >= startDate && date <= now;
        };

        const fQuotes = quotes.filter(filterFn);
        const fReservations = reservations.filter(filterFn);

        // KPI Calculations
        const quoteRevenue = fQuotes.reduce((sum, q) => sum + (Number(q.price) || 0), 0);
        const resRevenue = fReservations.reduce((sum, r) => sum + (Number(r.estimatedPrice) || 0), 0);
        const totalRevenue = quoteRevenue + resRevenue;

        const avgOrderValue = (fQuotes.length + fReservations.length) > 0
            ? Math.round(totalRevenue / (fQuotes.length + fReservations.length))
            : 0;

        const conversionCount = fQuotes.filter(q => ['repaired', 'shipped', 'closed'].includes(q.status)).length;
        const conversionRate = fQuotes.length > 0 ? Math.round((conversionCount / fQuotes.length) * 100) : 0;

        // -- Charts: Revenue by Shop --
        const shopPerf: Record<string, { name: string; revenue: number; volume: number }> = {};
        shops.forEach(s => shopPerf[s.id] = { name: String(s.name || s.id), revenue: 0, volume: 0 });

        fQuotes.forEach(q => {
            if (shopPerf[q.shopId]) {
                shopPerf[q.shopId].revenue += (Number(q.price) || 0);
                shopPerf[q.shopId].volume += 1;
            }
        });
        fReservations.forEach(r => {
            if (r.shopId && shopPerf[r.shopId]) {
                shopPerf[r.shopId].revenue += (Number(r.estimatedPrice) || 0);
                shopPerf[r.shopId].volume += 1;
            }
        });

        const shopChartData = Object.values(shopPerf).sort((a, b) => b.revenue - a.revenue);

        // -- Charts: Category Distribution --
        const categories: Record<string, number> = {
            'Smartphone': 0,
            'Tablet': 0,
            'Laptop': 0,
            'Console': 0,
            'Watch': 0,
            'Other': 0
        };

        fQuotes.forEach(q => {
            const cat = q.deviceType?.charAt(0).toUpperCase() + q.deviceType?.slice(1) || 'Other';
            if (categories[cat] !== undefined) categories[cat] += (Number(q.price) || 0);
            else categories['Other'] += (Number(q.price) || 0);
        });
        fReservations.forEach(r => {
            // Reservations don't explicitly store deviceType in root, but usually it's Smartphone
            categories['Smartphone'] += (Number(r.estimatedPrice) || 0);
        });

        const pieChartData = Object.entries(categories)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));

        // -- Charts: Daily Trend --
        const daily: Record<string, { date: string; revenue: number; volume: number }> = {};
        const daysToMap = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 60; // Limit trend chart complexity

        for (let i = 0; i < daysToMap; i++) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const key = d.toISOString().split('T')[0];
            daily[key] = { date: key.slice(5), revenue: 0, volume: 0 };
        }

        [...fQuotes, ...fReservations].forEach(item => {
            const d = item.date ? item.date : (item.createdAt ? new Date((item.createdAt as any).toDate?.() || item.createdAt).toISOString().split('T')[0] : null);
            if (d && daily[d]) {
                daily[d].revenue += (Number((item as any).price || (item as any).estimatedPrice) || 0);
                daily[d].volume += 1;
            }
        });

        const trendData = Object.values(daily).reverse();

        // -- Top Models --
        const modelCounts: Record<string, { name: string; brand: string; count: number; revenue: number }> = {};
        fQuotes.forEach(q => {
            const key = `${q.brand} ${q.model}`;
            if (!modelCounts[key]) modelCounts[key] = { name: q.model, brand: q.brand, count: 0, revenue: 0 };
            modelCounts[key].count += 1;
            modelCounts[key].revenue += (Number(q.price) || 0);
        });

        const topModels = Object.values(modelCounts).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        return {
            totalRevenue,
            avgOrderValue,
            conversionRate,
            quoteCount: fQuotes.length,
            resCount: fReservations.length,
            shopChartData,
            pieChartData,
            trendData,
            topModels
        };
    }, [quotes, reservations, shops, timeRange]);

    const handleExportCSV = () => {
        const headers = ["ID", "Date", "Type", "Brand", "Model", "Price", "Shop", "Status"];
        const rows = [
            ...quotes.map(q => [q.id, q.date, q.type, q.brand, q.model, q.price, q.shopId, q.status]),
            ...reservations.map(r => [r.id, r.date, 'sale', 'N/A', r.productName, r.estimatedPrice || 0, r.shopId, r.status])
        ];

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Belmobile_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-[600px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bel-blue"></div>
            </div>
        );
    }

    const COLORS = ['#4338ca', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <ArrowTrendingUpIcon className="h-8 w-8 text-bel-blue" />
                        Financial Insights
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Advanced business analytics and shop performance auditing.</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    {(['7d', '30d', '90d', 'ytd'] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeRange === range
                                ? 'bg-bel-blue text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                    <button
                        onClick={handleExportCSV}
                        className="p-2 text-gray-400 hover:text-bel-blue transition-colors"
                        title="Export CSV"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-600">
                            <CurrencyEuroIcon className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Revenue</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">€{filteredData.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-green-600 font-bold mt-1">Est. potential (all status)</div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                            <ChatBubbleLeftRightIcon className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Requests</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">{filteredData.quoteCount + filteredData.resCount}</div>
                    <div className="text-xs text-blue-600 font-bold mt-1">Quotes: {filteredData.quoteCount} | Sales: {filteredData.resCount}</div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600">
                            <Square3Stack3DIcon className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg Order</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">€{filteredData.avgOrderValue}</div>
                    <div className="text-xs text-purple-600 font-bold mt-1">Per unique Request</div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600">
                            <ArrowTrendingUpIcon className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">CR %</span>
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">{filteredData.conversionRate}%</div>
                    <div className="text-xs text-amber-600 font-bold mt-1">Repaired/Closed Quotes</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-bel-blue" />
                        Revenue Trend
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredData.trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `€${val}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`€${value}`, 'Revenue']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#4338ca"
                                    strokeWidth={4}
                                    dot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: '#4338ca' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Mix (Pie Chart) */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                        <DevicePhoneMobileIcon className="h-5 w-5 text-bel-blue" />
                        Category Mix
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={filteredData.pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {filteredData.pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => [`€${Number(value).toLocaleString()}`, 'Revenue']}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 'bold' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Shop Performance (Bar Chart) */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                        <BuildingStorefrontIcon className="h-5 w-5 text-bel-blue" />
                        Revenue by Shop
                    </h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredData.shopChartData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(67, 56, 202, 0.05)' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`€${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#4338ca"
                                    radius={[0, 8, 8, 0]}
                                    barSize={24}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Models Table */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
                        Top Performers (Models)
                    </h3>
                    <div className="space-y-4">
                        {filteredData.topModels.length > 0 ? filteredData.topModels.map((model, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-bel-blue text-white flex items-center justify-center font-black text-xs">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{model.name}</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold">{model.brand}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-gray-900 dark:text-white">€{model.revenue.toLocaleString()}</div>
                                    <div className="text-[10px] text-gray-400 font-bold">{model.count} Requests</div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 text-gray-400 font-medium italic">No data available for this range.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reporting;
