'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLeads } from '@/hooks/useFirestore';
import {
    ClockIcon,
    EnvelopeIcon,
    ArrowPathIcon,
    DevicePhoneMobileIcon,
    ChevronRightIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import BrandLoader from '@/components/ui/BrandLoader';

export default function LeadRecoveryPage() {
    const { user } = useAuth();
    const { leads, loading } = useLeads(user);

    const sendRecoveryEmail = async (lead: any) => {
        if (!confirm(`Send recovery email to ${lead.email}?`)) return;

        try {
            const magicLink = `${window.location.origin}/${lead.language || 'fr'}/recovery/${lead.magicLinkToken}`;

            const response = await fetch('/api/mail/recover-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: lead.email,
                    name: lead.customerName || 'Client',
                    device: `${lead.brand} ${lead.model}`,
                    price: lead.price,
                    magicLink,
                    lang: lead.language || 'fr'
                })
            });

            if (response.ok) {
                alert('Recovery email sent successfully!');
            } else {
                const err = await response.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error('Failed to send recovery email:', error);
            alert('Failed to send recovery email.');
        }
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><BrandLoader /></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Lead Recovery</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Nurture and recover abandoned wizard sessions</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {leads.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border-2 border-dashed border-gray-100 dark:border-slate-700">
                        <ExclamationCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No leads found yet.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xs overflow-hidden border border-gray-100 dark:border-slate-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Customer</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Device</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Last Activity</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-bel-blue">
                                                        <EnvelopeIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white capitalize">{lead.customerName || 'Anonymous'}</p>
                                                        <p className="text-xs text-gray-500">{lead.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <DevicePhoneMobileIcon className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lead.brand} {lead.model}</span>
                                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-[10px] font-bold text-gray-500 uppercase">{lead.type}</span>
                                                </div>
                                                <p className="text-xs font-bold text-green-600 mt-1">€{lead.price}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${lead.status === 'converted'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                    {lead.status === 'converted' ? <CheckCircleIcon className="h-3 w-3" /> : <ClockIcon className="h-3 w-3" />}
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {lead.updatedAt?.seconds ? new Date(lead.updatedAt.seconds * 1000).toLocaleString() : 'Recently'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {lead.status === 'draft' && (
                                                    <button
                                                        onClick={() => sendRecoveryEmail(lead)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-bel-blue text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all"
                                                    >
                                                        <PaperAirplaneIcon className="h-4 w-4" />
                                                        Rescue
                                                    </button>
                                                )}
                                                {lead.status === 'converted' && (
                                                    <span className="text-xs font-bold text-gray-400">Recovered! 🚀</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
