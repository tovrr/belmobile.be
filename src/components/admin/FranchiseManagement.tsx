'use client';

import { BuildingStorefrontIcon, CubeIcon, DocumentTextIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const FranchiseManagement: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-slate-900 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-slate-700">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-purple-500/10">
                <BuildingStorefrontIcon className="h-10 w-10 text-purple-500" />
            </div>

            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                B2B & Partners Portal
            </h1>

            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mb-8 leading-relaxed">
                We are building a dedicated portal for our Franchise partners to manage their:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl w-full">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                        <CubeIcon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Shop Inventory</h3>
                    <p className="text-sm text-gray-500">Manage local stock, product availability, and transfers.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 mb-4">
                        <DocumentTextIcon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Order Management</h3>
                    <p className="text-sm text-gray-500">Processing incoming repair orders and click-and-collects.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                        <UserGroupIcon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Customer CRM</h3>
                    <p className="text-sm text-gray-500">Track customer history, warranty status, and communications.</p>
                </div>
            </div>

            <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-bold">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                Coming Soon - Feature Roadmap Q3
            </div>
        </div>
    );
};

export default FranchiseManagement;
