'use client';

import React, { useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import TemplateManager from '@/components/admin/TemplateManager';
import EmailTemplateManager from '@/components/admin/EmailTemplateManager';
import { DocumentTextIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function TemplatesPage() {
    const [activeTab, setActiveTab] = useState<'pdf' | 'email'>('pdf');

    return (
        <AdminShell>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            Template Architecture
                        </h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Manage document aesthetics, sequencing, and communication standards.
                        </p>
                    </div>

                    <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex items-center">
                        <button
                            onClick={() => setActiveTab('pdf')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pdf'
                                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <DocumentTextIcon className="w-4 h-4" />
                            PDF Documents
                        </button>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'email'
                                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <EnvelopeIcon className="w-4 h-4" />
                            Email Notifications
                        </button>
                    </div>
                </div>

                {activeTab === 'pdf' ? <TemplateManager /> : <EmailTemplateManager />}
            </div>
        </AdminShell>
    );
}
