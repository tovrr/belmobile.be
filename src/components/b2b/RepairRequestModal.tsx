'use client';

import React, { useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/firebase';
import { XMarkIcon, WrenchScrewdriverIcon } from '@/components/ui/BrandIcons';
import { FleetDevice } from '@/types/models';

interface RepairRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedDevices: FleetDevice[];
    companyId: string;
}

export default function RepairRequestModal({ isOpen, onClose, onSuccess, selectedDevices, companyId }: RepairRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [issueDescription, setIssueDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const batch = writeBatch(db);
            const repairsRef = collection(db, 'b2b_repair_requests');

            // 1. Create a Repair Request for each device
            // In a real app, maybe group them into one "Order"
            for (const device of selectedDevices) {
                const newRepairRef = doc(collection(db, 'b2b_repair_requests'));
                batch.set(newRepairRef, {
                    companyId,
                    deviceId: device.id,
                    deviceModel: device.model,
                    deviceBrand: device.brand,
                    issueDescription,
                    status: 'requested',
                    createdAt: serverTimestamp()
                });

                // 2. Update Device Status to 'in_repair' (Optimistic)
                const deviceRef = doc(db, 'b2b_inventory', device.id);
                batch.update(deviceRef, { status: 'in_repair' });
            }

            await batch.commit();

            setIssueDescription('');
            onSuccess();
            onClose();

        } catch (error) {
            console.error("Error creating repair request:", error);
            alert("Failed to submit repair request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-electric-indigo/10 flex items-center justify-center text-electric-indigo">
                            <WrenchScrewdriverIcon size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Request Repair</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <XMarkIcon size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Selected Devices ({selectedDevices.length})</p>
                        <ul className="space-y-1">
                            {selectedDevices.map(d => (
                                <li key={d.id} className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-electric-indigo"></span>
                                    {d.model} <span className="text-slate-400 font-normal">({d.imei || d.id.slice(0, 6)})</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Issue Description</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Please describe the issue(s) with these devices..."
                            value={issueDescription}
                            onChange={e => setIssueDescription(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent font-medium focus:ring-2 focus:ring-electric-indigo outline-none resize-none"
                        />
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
                            {loading ? 'Submitting...' : 'Confirm Request'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
