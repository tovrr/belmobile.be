'use client';

import React from 'react';
import { FranchiseApplication } from '../../types';
import { useData } from '../../hooks/useData';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FranchiseApplicationModalProps {
    application: FranchiseApplication;
    onClose: () => void;
}

const FranchiseApplicationModal: React.FC<FranchiseApplicationModalProps> = ({ application, onClose }) => {
    const { updateFranchiseApplicationStatus } = useData();

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as 'new' | 'reviewing' | 'approved' | 'rejected';
        try {
            await updateFranchiseApplicationStatus(application.id, newStatus);
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        Franchise Application
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Applicant: {application.name}</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Contact Information</h3>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <p><strong className="text-gray-900 dark:text-white">Name:</strong> {application.name}</p>
                                <p><strong className="text-gray-900 dark:text-white">Email:</strong> {application.email}</p>
                                <p><strong className="text-gray-900 dark:text-white">Phone:</strong> {application.phone}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Application Details</h3>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <p><strong className="text-gray-900 dark:text-white">Date Submitted:</strong> {application.date}</p>
                                <p><strong className="text-gray-900 dark:text-white">Preferred Location:</strong> {application.locationPreference}</p>
                                <p><strong className="text-gray-900 dark:text-white">Investment Capacity:</strong> {application.investmentCapacity}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Background & Experience</h3>
                        <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                            {application.background}
                        </div>
                    </div>
                    <div className="pt-4">
                        <label htmlFor="status" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Update Status</label>
                        <select
                            id="status"
                            name="status"
                            defaultValue={application.status}
                            onChange={handleStatusChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                        >
                            <option value="new">New</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex justify-end rounded-b-3xl">
                    <button onClick={onClose} className="bg-bel-blue text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FranchiseApplicationModal;
