
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
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={dataKey} fill={fillColor} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DashboardChart;
