'use client';

import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { XMarkIcon } from '@/components/ui/BrandIcons';

interface AddDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    companyId: string;
}

export default function AddDeviceModal({ isOpen, onClose, onSuccess, companyId }: AddDeviceModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        brand: 'Apple',
        model: '',
        imei: '',
        serialNumber: '',
        assignedTo: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, 'b2b_inventory'), {
                companyId,
                ...formData,
                status: 'active',
                currentCondition: 'good',
                createdAt: serverTimestamp()
            });

            // Reset and close
            setFormData({
                brand: 'Apple',
                model: '',
                imei: '',
                serialNumber: '',
                assignedTo: ''
            });
            onSuccess();
            onClose();

        } catch (error) {
            console.error("Error adding device:", error);
            alert("Failed to add device. See console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Add New Device</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <XMarkIcon size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Brand</label>
                            <select
                                value={formData.brand}
                                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent font-medium focus:ring-2 focus:ring-electric-indigo outline-none"
                            >
                                <option value="Apple">Apple</option>
                                <option value="Samsung">Samsung</option>
                                <option value="Google">Google</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Model</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. iPhone 14 Pro"
                                value={formData.model}
                                onChange={e => setFormData({ ...formData, model: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent font-medium focus:ring-2 focus:ring-electric-indigo outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Assigned Employee (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={formData.assignedTo}
                            onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent font-medium focus:ring-2 focus:ring-electric-indigo outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">IMEI (Optional)</label>
                            <input
                                type="text"
                                placeholder="15 digits"
                                value={formData.imei}
                                onChange={e => setFormData({ ...formData, imei: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent font-mono text-sm focus:ring-2 focus:ring-electric-indigo outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Serial No. (Optional)</label>
                            <input
                                type="text"
                                placeholder="Device Serial"
                                value={formData.serialNumber}
                                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent font-mono text-sm focus:ring-2 focus:ring-electric-indigo outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-electric-indigo hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Device'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
