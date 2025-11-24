
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

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as 'new' | 'reviewing' | 'approved' | 'rejected';
        updateFranchiseApplicationStatus(application.id, newStatus);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-bel-dark">
                        Franchise Application
                    </h2>
                    <p className="text-sm text-gray-500">Applicant: {application.name}</p>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-800">Contact Information</h3>
                            <p><strong>Name:</strong> {application.name}</p>
                            <p><strong>Email:</strong> {application.email}</p>
                            <p><strong>Phone:</strong> {application.phone}</p>
                        </div>
                        <div>
                             <h3 className="font-semibold text-gray-800">Application Details</h3>
                            <p><strong>Date Submitted:</strong> {application.date}</p>
                            <p><strong>Preferred Location:</strong> {application.locationPreference}</p>
                            <p><strong>Investment Capacity:</strong> {application.investmentCapacity}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Background & Experience</h3>
                        <p className="p-3 bg-gray-50 rounded border text-sm">{application.background}</p>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Update Status</label>
                        <select 
                            id="status" 
                            name="status" 
                            defaultValue={application.status}
                            onChange={handleStatusChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-bel-blue focus:border-bel-blue"
                        >
                            <option value="new">New</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button onClick={onClose} className="bg-bel-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FranchiseApplicationModal;
