'use client';

import React, { useState, useRef } from 'react';
import {
    XMarkIcon,
    ArrowUpTrayIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    BanknotesIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon
} from '@/components/ui/BrandIcons';
import { calculateBulkBuybackAction, submitBulkBuybackAction } from '@/app/_actions/bulk-buyback';

interface BulkBuybackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    companyId: string;
}

export default function BulkBuybackModal({ isOpen, onClose, onSuccess, companyId }: BulkBuybackModalProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<any[] | null>(null);
    const [totalOffer, setTotalOffer] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
    };

    const validateAndSetFile = (file: File) => {
        if (!file.name.endsWith('.csv')) {
            setError("Only CSV streams are accepted for batch valuation.");
            return;
        }
        setFile(file);
        setError(null);
        setResults(null);
    };

    const handleValuation = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

            const items = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                const item: any = {};
                headers.forEach((header, i) => {
                    item[header] = values[i];
                });
                return item;
            });

            const response = await calculateBulkBuybackAction(items);
            if (response.success && response.results) {
                setResults(response.results);
                setTotalOffer(response.totalOffer || 0);
            } else {
                setError(response.error || "Valuation engine rejected the stream format.");
            }
        } catch (err: any) {
            setError("Malformed CSV structure. Ensure brand,model,storage,condition are present.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!results || !companyId) return;
        setLoading(true);
        try {
            const res = await submitBulkBuybackAction(companyId, results, totalOffer);
            if (res.success) {
                onSuccess();
                onClose();
            } else {
                setError("Submission failed: " + res.error);
            }
        } catch (err) {
            setError("Critical transmission error.");
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "brand,model,storage,condition,imei\nApple,iPhone 15 Pro,256GB,Flawless,350000000000001\nSamsung,Galaxy S24,128GB,Good,350000000000002";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'buyback_lot_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-[#131725] border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <BanknotesIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Bulk Valuation</h3>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Pricing_Engine: V4_Lot_Analyzer</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                    {!results ? (
                        <>
                            <div
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center gap-4 text-center
                                    ${dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:border-white/20 bg-white/2'}
                                    ${file ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
                            >
                                <input ref={fileInputRef} type="file" className="hidden" accept=".csv" onChange={handleChange} />
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${file ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-500'}`}>
                                    {file ? <CheckCircleIcon className="w-10 h-10" /> : <DocumentTextIcon className="w-10 h-10" />}
                                </div>
                                <div>
                                    <p className="text-white font-black text-sm uppercase tracking-tight">{file ? file.name : 'Upload Buyback Lot'}</p>
                                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{file ? 'Stream Verified' : 'Drag and drop or click to ingest'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={downloadTemplate} className="flex-1 py-4 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all">
                                    Download Schema
                                </button>
                                <button
                                    disabled={!file || loading}
                                    onClick={handleValuation}
                                    className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 ${!file || loading ? 'bg-white/5 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20'}`}
                                >
                                    {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "Simulate Payout"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-4xl flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Lot Estimated Payout</p>
                                    <p className="text-4xl font-black text-white tracking-tighter">€{totalOffer.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Devices Count</p>
                                    <p className="text-xl font-black text-white">{results.length}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Lot Preview</p>
                                {results.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-slate-500">
                                                <ArrowPathIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-white uppercase">{item.brand} {item.model}</p>
                                                <p className="text-[9px] text-slate-500 font-mono uppercase">{item.storage} • {item.condition}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-black text-emerald-400">€{item.calculatedPrice}</p>
                                    </div>
                                ))}
                                {results.length > 5 && (
                                    <p className="text-center text-[10px] text-slate-600 font-mono">+ {results.length - 5} more items in this stream</p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setResults(null)} className="flex-1 py-4 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all">
                                    Re-Ingest
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={handleSubmit}
                                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:translate-y-1"
                                >
                                    {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div> : "Accept Lot & Submit"}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 shrink-0" />
                            <p className="text-[10px] font-mono font-black text-red-400 uppercase tracking-widest">{error}</p>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-white/2 border-t border-white/5">
                    <p className="text-[9px] text-slate-600 font-mono text-center uppercase tracking-widest leading-relaxed">
                        Prices are simulated based on dynamic market anchor points. <br />Final valuation subject to physical inspection at Schaerbeek Hub.
                    </p>
                </div>
            </div>
        </div>
    );
}
