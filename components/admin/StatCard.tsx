
import React from 'react';
import { AdminStat } from '../../types';

interface StatCardProps {
    stat: AdminStat;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="p-3 rounded-full bg-bel-blue text-white mr-4">
                <stat.icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
        </div>
    );
};

export default StatCard;
