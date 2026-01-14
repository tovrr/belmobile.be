'use client';

import React from 'react';
import { FleetDevice } from '@/types/models';
import {
    DevicePhoneMobileIcon,
    WrenchScrewdriverIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@/components/ui/BrandIcons';

interface FleetTableProps {
    devices: FleetDevice[];
    selectedIds?: string[];
    onSelect?: (deviceId: string) => void;
    onToggleSelection?: (deviceId: string) => void;
    onShowHistory?: (device: FleetDevice) => void;
}

export default function FleetTable({ devices, selectedIds = [], onToggleSelection, onSelect, onShowHistory }: FleetTableProps) {

    const getStatusBadge = (status: FleetDevice['status']) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <CheckCircleIcon size={12} strokeWidth={3} /> Active
                    </span>
                );
            case 'in_repair':
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                        <WrenchScrewdriverIcon size={12} strokeWidth={3} /> In Repair
                    </span>
                );
            case 'sold':
                return (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-500/10 text-slate-500 border border-slate-500/20 opacity-60">
                        <XMarkIcon size={12} strokeWidth={3} /> Archive
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-[#131725] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-white/2 border-b border-white/5">
                            {onToggleSelection && <th className="p-6 w-14"></th>}
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Asset Configuration</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Protocol.Status</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Assigned Entity</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Network Identifiers</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/2">
                        {devices.map((device) => {
                            const isSelected = selectedIds.includes(device.id);
                            return (
                                <tr
                                    key={device.id}
                                    className={`group transition-all cursor-crosshair ${isSelected
                                        ? 'bg-indigo-600/10 shadow-inner'
                                        : 'hover:bg-white/5'
                                        }`}
                                    onClick={() => onToggleSelection?.(device.id)}
                                >
                                    {onToggleSelection && (
                                        <td className="p-6">
                                            <div onClick={(e) => e.stopPropagation()} className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => onToggleSelection(device.id)}
                                                    className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-indigo-600 focus:ring-offset-0 focus:ring-transparent transition-all cursor-pointer accent-indigo-500 shadow-lg"
                                                />
                                            </div>
                                        </td>
                                    )}
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300'}`}>
                                                <DevicePhoneMobileIcon size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-sm tracking-tight uppercase">{device.model}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{device.brand}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        {getStatusBadge(device.status)}
                                    </td>
                                    <td className="p-6">
                                        {device.assignedTo ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-slate-700 to-slate-900 border border-white/10 text-white flex items-center justify-center text-xs font-black shadow-lg">
                                                    {device.assignedTo.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-200">{device.assignedTo}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono items-center flex gap-1 animate-pulse">
                                                        <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> Active Session
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic opacity-50">Null_Pointer</span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                                            {device.serialNumber && (
                                                <span className="text-[9px] text-indigo-300/60 font-mono bg-indigo-500/5 px-2 py-1 rounded-lg border border-indigo-500/10 w-fit tracking-tighter group-hover:border-indigo-500/30 transition-all">
                                                    SN_ID: {device.serialNumber}
                                                </span>
                                            )}
                                            {device.imei && (
                                                <span className="text-[9px] text-slate-500 font-mono bg-white/2 px-2 py-1 rounded-lg border border-white/5 w-fit tracking-tighter group-hover:border-white/20 transition-all">
                                                    NET_IMEI: {device.imei}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onShowHistory?.(device);
                                            }}
                                            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border rounded-xl transition-all ${isSelected ? 'bg-white text-midnight border-white' : 'text-slate-500 border-white/5 group-hover:border-white/20 group-hover:text-white'
                                                }`}>
                                            Lifecycle
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {devices.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-24 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <DevicePhoneMobileIcon className="w-16 h-16" />
                                        <p className="text-sm font-black uppercase tracking-[0.3em]">No Assets Found in Repository</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
