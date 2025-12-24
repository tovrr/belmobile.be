import React from 'react';
import { AdminStat } from '../../types';

interface StatCardProps {
    stat: AdminStat;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center transition-all hover:shadow-md h-full">
            <div className={`p-4 rounded-2xl mr-5 shrink-0 ${stat.color ? `bg-opacity-10 bg-current ${stat.color}` : 'bg-blue-50 dark:bg-blue-900/20 text-bel-blue'}`}>
                <stat.icon className={`h-8 w-8 ${stat.color || ''}`} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <div className="flex items-end gap-2">
                    <p className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white leading-none">{stat.value}</p>
                    {stat.trend && (
                        <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full mb-0.5">
                            {stat.trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
