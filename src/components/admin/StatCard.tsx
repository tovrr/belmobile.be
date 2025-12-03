import React from 'react';
import { AdminStat } from '../../types';

interface StatCardProps {
    stat: AdminStat;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center transition-all hover:shadow-md">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-bel-blue mr-5">
                <stat.icon className="h-8 w-8" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            </div>
        </div>
    );
};

export default StatCard;
