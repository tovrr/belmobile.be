'use client';

import React, { useState, useRef } from 'react';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/firebase';
import { XMarkIcon, ArrowUpTrayIcon, DocumentTextIcon, CheckCircleIcon } from '@/components/ui/BrandIcons';

interface BulkFleetUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    companyId: string;
}

export default function BulkFleetUploadModal({ isOpen, onClose, onSuccess, companyId }: BulkFleetUploadModalProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
            setError("Please upload a valid CSV file.");
            return;
        }
        setFile(file);
        setError(null);
    };

    const parseCSV = (text: string) => {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        return lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',').map(v => v.trim());
            const entry: any = {};
            headers.forEach((header, i) => {
                entry[header] = values[i];
            });
            return entry;
        });
    };

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        try {
            const text = await file.text();
            const data = parseCSV(text);

            if (data.length === 0) {
                throw new Error("CSV file is empty.");
            }

            // Simple validation of required fields
            const requiredFields = ['brand', 'model'];
            const firstRow = data[0];
            const missingFields = requiredFields.filter(f => !Object.keys(firstRow).includes(f));

            if (missingFields.length > 0) {
                throw new Error(`Missing columns: ${missingFields.join(', ')}`);
            }

            const batchSize = 500;
            for (let i = 0; i < data.length; i += batchSize) {
                const chunk = data.slice(i, i + batchSize);
                const batch = writeBatch(db);

                chunk.forEach(item => {
                    const newDocRef = doc(collection(db, 'b2b_inventory'));
                    batch.set(newDocRef, {
                        ...item,
                        companyId,
                        status: item.status || 'active',
                        createdAt: serverTimestamp()
                    });
                });

                await batch.commit();
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Bulk Upload Error:", err);
            setError(err.message || "Failed to process CSV file.");
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "brand,model,imei,serialNumber,assignedTo,status\nApple,iPhone 15 Pro,350000000000001,,John Doe,active\nSamsung,Galaxy S24,350000000000002,,Jane Smith,active";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'fleet_template.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-[#131725] border border-white/10 rounded-[2.5rem] w-full max-w-xl shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <ArrowUpTrayIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Bulk Ingestion</h3>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Protocol: Fleet_Expansion_v4</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Drag & Drop Area */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center gap-4 text-center
                            ${dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:border-white/20 bg-white/2'}
                            ${file ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".csv"
                            onChange={handleChange}
                        />

                        {file ? (
                            <>
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                                    <CheckCircleIcon className="w-10 h-10" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white font-black text-sm uppercase tracking-tight">{file.name}</p>
                                    <p className="text-[10px] font-mono text-slate-500 uppercase">Input file verified</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                                    <DocumentTextIcon className="w-10 h-10" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white font-black text-sm uppercase tracking-tight">Upload CSV Stream</p>
                                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Drag and drop or click to browse</p>
                                </div>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-mono font-black text-red-400 uppercase tracking-widest">
                            Error: {error}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={downloadTemplate}
                            className="flex-1 py-4 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all"
                        >
                            Download CSV Schema
                        </button>
                        <button
                            disabled={!file || loading}
                            onClick={handleSubmit}
                            className={`flex-1 py-4 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3
                                ${!file || loading
                                    ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 active:translate-y-1'}`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <ArrowUpTrayIcon className="w-4 h-4" />
                                    Initialize Batch
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-[9px] text-slate-600 font-mono text-center uppercase tracking-widest italic">
                        Encrypted transmission enabled. Supports documents up to 5,000 nodes.
                    </p>
                </div>
            </div>
        </div>
    );
}
