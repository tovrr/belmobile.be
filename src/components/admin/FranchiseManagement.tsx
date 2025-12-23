'use client';

import React, { useState } from 'react';
import {
    BuildingStorefrontIcon,
    DocumentMagnifyingGlassIcon,
    ChevronRightIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CalendarDaysIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';
import { useData } from '../../hooks/useData';
import { FranchiseApplication } from '../../types';
import FranchiseApplicationModal from './FranchiseApplicationModal';

const FranchiseManagement: React.FC = () => {
    const { franchiseApplications, loading } = useData();
    const [selectedApplication, setSelectedApplication] = useState<FranchiseApplication | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredApplications = franchiseApplications.filter(app =>
        filterStatus === 'all' ? true : app.status === filterStatus
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'reviewing': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bel-blue"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <BuildingStorefrontIcon className="h-8 w-8 text-bel-blue" />
                        Franchise Applications
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Review and manage incoming franchise partnership requests.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Filter:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-transparent text-sm font-bold text-gray-700 dark:text-white border-none focus:ring-0 outline-none cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="new">New</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {filteredApplications.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-20 text-center border border-gray-100 dark:border-slate-700 shadow-xl">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <DocumentMagnifyingGlassIcon className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No applications found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {filterStatus === 'all'
                            ? "You haven't received any franchise applications yet."
                            : `There are no applications with status "${filterStatus}".`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredApplications.map((app) => (
                        <div
                            key={app.id}
                            onClick={() => setSelectedApplication(app)}
                            className="group bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-bel-blue/30 transition-all cursor-pointer relative overflow-hidden"
                        >
                            {/* Status Accent Line */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${app.status === 'new' ? 'bg-blue-500' :
                                    app.status === 'approved' ? 'bg-green-500' :
                                        app.status === 'rejected' ? 'bg-red-500' : 'bg-orange-500'
                                }`} />

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-900/50 flex items-center justify-center shrink-0">
                                        <BuildingStorefrontIcon className="h-6 w-6 text-bel-blue" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-bel-blue transition-colors">
                                            {app.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <EnvelopeIcon className="h-4 w-4" />
                                                {app.email}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <PhoneIcon className="h-4 w-4" />
                                                {app.phone}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPinIcon className="h-4 w-4" />
                                                {app.locationPreference}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 dark:border-slate-700">
                                    <div className="flex flex-col items-end gap-1 px-4 lg:border-r dark:border-slate-700">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                                            {app.status}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                                            <CalendarDaysIcon className="h-3 w-3" />
                                            {app.date}
                                        </span>
                                    </div>

                                    <div className="hidden sm:flex flex-col items-end gap-1 px-4 lg:border-r dark:border-slate-700">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Investment</span>
                                        <div className="flex items-center gap-1.5 text-bel-dark dark:text-white font-bold">
                                            <BanknotesIcon className="h-4 w-4 text-green-500" />
                                            {app.investmentCapacity}
                                        </div>
                                    </div>

                                    <button className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-400 group-hover:bg-bel-blue group-hover:text-white transition-all">
                                        <ChevronRightIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
