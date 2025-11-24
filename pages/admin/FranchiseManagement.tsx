
import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { FranchiseApplication } from '../../types';
import FranchiseApplicationModal from '../../components/admin/FranchiseApplicationModal';
import { EyeIcon, MapPinIcon } from '@heroicons/react/24/outline';

const FranchiseManagement: React.FC = () => {
    const { franchiseApplications } = useData();
    const [selectedApplication, setSelectedApplication] = useState<FranchiseApplication | null>(null);

    const getStatusColor = (status: FranchiseApplication['status']) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'reviewing': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'approved': return 'bg-green-100 text-green-700 border border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <>
             <div className="space-y-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Franchise Pipeline</h2>
                        <p className="text-gray-500 text-sm">Review applications for new shop locations.</p>
                    </div>
                    <div className="px-4 py-2 bg-gray-100 rounded-xl font-bold text-gray-600 text-sm">
                        Total Applicants: {franchiseApplications.length}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-bold">Applicant</th>
                                    <th scope="col" className="px-6 py-4 font-bold">Preferred Location</th>
                                    <th scope="col" className="px-6 py-4 font-bold">Investment</th>
                                    <th scope="col" className="px-6 py-4 font-bold">Date</th>
                                    <th scope="col" className="px-6 py-4 font-bold">Status</th>
                                    <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {franchiseApplications.map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-gray-900">{app.name}</div>
                                                <div className="text-xs text-gray-400">{app.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <MapPinIcon className="h-4 w-4 text-gray-400" />
                                                {app.locationPreference}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{app.investmentCapacity}</td>
                                        <td className="px-6 py-4 text-gray-400">{app.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(app.status)}`}>
                                                {app.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedApplication(app)} 
                                                className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-electric-indigo hover:text-white hover:border-electric-indigo transition-all shadow-sm"
                                            >
                                                <EyeIcon className="h-3 w-3 mr-1.5" />
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedApplication && (
                <FranchiseApplicationModal
                    application={selectedApplication}
                    onClose={() => setSelectedApplication(null)}
                />
            )}
        </>
    );
};

export default FranchiseManagement;
