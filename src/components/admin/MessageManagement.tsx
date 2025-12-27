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

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Preview</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredMessages.length > 0 ? (
                                filteredMessages.map((msg) => (
                                    <tr key={msg.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${msg.status === 'new'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                : msg.status === 'read'
                                                    ? 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-400'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {msg.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                            {msg.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {msg.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {msg.phone || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {msg.subject || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                            {msg.message}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedMessage(msg)}
                                                    className="p-2 text-gray-400 hover:text-bel-blue dark:hover:text-blue-400 transition-colors"
                                                    title="View Full Message"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                                {msg.status === 'new' && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(msg.id)}
                                                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                        title="Mark as Read"
                                                    >
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(msg.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <EnvelopeIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
                                        <p>{loading ? 'Loading messages...' : 'No messages found.'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
