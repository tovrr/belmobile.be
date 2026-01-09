'use client';

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { EnvelopeIcon, CheckCircleIcon, EyeIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ContactMessage } from '../../types';

const MessageManagement: React.FC = () => {
    const { contactMessages, updateContactMessageStatus, deleteContactMessage, loading } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const filteredMessages = contactMessages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.phone && msg.phone.includes(searchTerm)) ||
        (msg.subject && msg.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMarkAsRead = (id: string) => {
        updateContactMessageStatus(id, 'read');
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await deleteContactMessage(id);
                if (selectedMessage?.id === id) {
                    setSelectedMessage(null); // Close modal if open
                }
            } catch (error) {
                console.error("Failed to delete message:", error);
                alert("Failed to delete message");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Messages</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage inquiries from the contact form</p>
                </div>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none w-full md:w-64 transition-all"
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Subject</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Preview</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                            {filteredMessages.length > 0 ? (
                                filteredMessages.map((msg) => (
                                    <tr key={msg.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-700/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${msg.status === 'new'
                                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                                : msg.status === 'read'
                                                    ? 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'
                                                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                }`}>
                                                {msg.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{msg.name}</div>
                                            <div className="text-[11px] text-gray-400 mt-0.5">{msg.date}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-700 dark:text-gray-300">{msg.subject || 'No Subject'}</div>
                                            <div className="text-[11px] text-gray-400">{msg.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate italic">
                                                "{msg.message}"
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => setSelectedMessage(msg)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                    title="View"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                                {msg.status === 'new' && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(msg.id)}
                                                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                                        title="Read"
                                                    >
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(msg.id)}
                                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <EnvelopeIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm font-medium">{loading ? 'Loading...' : 'Inbox empty'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredMessages.length > 0 ? (
                    filteredMessages.map((msg) => (
                        <div key={msg.id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${msg.status === 'new'
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                        : msg.status === 'read'
                                            ? 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'
                                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                        }`}>
                                        {msg.status}
                                    </span>
                                    <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{msg.name}</h4>
                                    <p className="text-xs text-gray-400 mt-1">{msg.date}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedMessage(msg)}
                                        className="p-2.5 bg-gray-50 dark:bg-slate-900 text-gray-500 rounded-xl"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-1">{msg.subject || 'No Subject'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 italic">"{msg.message}"</p>
                            </div>
                            {msg.status === 'new' && (
                                <button
                                    onClick={() => handleMarkAsRead(msg.id)}
                                    className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Mark as Read
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-700 shadow-sm">
                        <EnvelopeIcon className="w-12 h-12 mx-auto mb-4 text-gray-200 dark:text-slate-700" />
                        <p className="text-gray-400 font-medium">{loading ? 'Loading...' : 'No messages here'}</p>
                    </div>
                )}
            </div>

            {selectedMessage && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Message Details</h3>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                            >
                                <EyeIcon className="w-6 h-6 rotate-180" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">From</label>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{selectedMessage.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</label>
                                    <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mt-1">{selectedMessage.date}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
                                    <p className="text-lg font-medium text-bel-blue dark:text-blue-400 mt-1">{selectedMessage.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</label>
                                    <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mt-1">{selectedMessage.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                                    <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mt-1">{selectedMessage.subject || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message</label>
                                <div className="mt-4 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700 italic text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {selectedMessage.message}
                                </div>
                            </div>
                            {selectedMessage.attachmentUrl && (
                                <div className="pt-4">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Attachment</label>
                                    <a
                                        href={selectedMessage.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-bel-blue dark:text-blue-400 font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                        View Attachment
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={() => handleDelete(selectedMessage.id)}
                                className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 dark:border-red-900/50 dark:bg-red-900/20 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all mr-auto"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
                            >
                                Close
                            </button>
                            <a
                                href={`mailto:${selectedMessage.email}`}
                                className="px-8 py-2.5 bg-bel-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                            >
                                Reply via Email
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageManagement;
