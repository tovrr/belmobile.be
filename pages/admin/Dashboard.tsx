
import React from 'react';
import StatCard from '../../components/admin/StatCard';
import DashboardChart from '../../components/admin/DashboardChart';
import { RESERVATIONS_CHART_DATA, QUOTES_CHART_DATA } from '../../constants';
import { useData } from '../../hooks/useData';
import { PhoneIcon, DocumentTextIcon, CubeIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
    const { reservations, quotes, products, shops } = useData();

    // Calculate live stats
    const stats = [
        { 
            label: 'Total Reservations', 
            value: reservations.length.toString(), 
            icon: PhoneIcon 
        },
        { 
            label: 'New Quotes', 
            value: quotes.filter(q => q.status === 'new').length.toString(), 
            icon: DocumentTextIcon 
        },
        { 
            label: 'Products in Stock', 
            value: products.length.toString(), 
            icon: CubeIcon 
        },
        { 
            label: 'Active Shops', 
            value: shops.filter(s => s.status === 'open').length.toString(), 
            icon: BuildingStorefrontIcon 
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <StatCard key={stat.label} stat={stat} />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardChart 
                    data={RESERVATIONS_CHART_DATA} // In a real app, this would be dynamic grouping by month
                    title="Monthly Reservations (Trend)"
                    dataKey="value"
                    fillColor="#0033a0"
                />
                <DashboardChart 
                    data={QUOTES_CHART_DATA}
                    title="Monthly Quotes (Trend)"
                    dataKey="value"
                    fillColor="#4a5568"
                />
            </div>
        </div>
    );
};

export default Dashboard;
