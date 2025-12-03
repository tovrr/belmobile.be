'use client';

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { FranchiseApplication } from '../../types';
import FranchiseApplicationModal from './FranchiseApplicationModal';
import { EyeIcon, MapPinIcon } from '@heroicons/react/24/outline';

const FranchiseManagement: React.FC = () => {
    const { franchiseApplications } = useData();
    const [selectedApplication, setSelectedApplication] = useState<FranchiseApplication | null>(null);

    const getStatusColor = (status: FranchiseApplication['status']) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'reviewing': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Franchise Pipeline</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Review applications for new shop locations.</p>
                </div>
                <div className="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl font-bold text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-slate-700">
                    Total Applicants: {franchiseApplications.length}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-bold">Applicant</th>
                                <th scope="col" className="px-6 py-4 font-bold">Preferred Location</th>
                                <th scope="col" className="px-6 py-4 font-bold">Investment</th>
                                <th scope="col" className="px-6 py-4 font-bold">Date</th>
                                <th scope="col" className="px-6 py-4 font-bold">Status</th>
                                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {franchiseApplications.map(app => (
                                <tr key={app.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">{app.name}</div>
                                            <div className="text-xs text-gray-400">{app.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <MapPinIcon className="h-4 w-4 text-gray-400" />
                                            {app.locationPreference}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{app.investmentCapacity}</td>
                                    <td className="px-6 py-4 text-gray-400">{app.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(app.status)}`}>
                                            {app.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedApplication(app)}
                                            className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-bel-blue hover:text-white hover:border-bel-blue dark:hover:bg-bel-blue dark:hover:text-white transition-all shadow-sm"
                                        >
                                            <EyeIcon className="h-3 w-3 mr-2" />
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedApplication && (
                <FranchiseApplicationModal
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                />
            )}
        </div>
    );
};

export default FranchiseManagement;
