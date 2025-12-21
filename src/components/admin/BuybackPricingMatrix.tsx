import React, { useState } from 'react';
import { BuybackCondition } from '../../types';
import { useBuybackPricing } from '../../hooks/useBuybackPricing';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
    deviceId: string;
    modelName: string;
}

const CONDITIONS: { id: BuybackCondition; label: string; color: string }[] = [
    { id: 'new', label: 'New (Sealed)', color: 'text-green-600 bg-green-50' },
    { id: 'like-new', label: 'Like New', color: 'text-blue-600 bg-blue-50' },
    { id: 'good', label: 'Good', color: 'text-yellow-600 bg-yellow-50' },
    { id: 'fair', label: 'Fair', color: 'text-orange-600 bg-orange-50' },
    { id: 'damaged', label: 'Damaged / Broken', color: 'text-red-600 bg-red-50' }
];

// Helper to sort storage sizes sensibly (e.g. 64GB < 128GB < 1TB)
const sortStorage = (a: string, b: string) => {
    const parse = (s: string) => {
        if (s.toLowerCase().includes('tb')) return parseFloat(s) * 1024;
        return parseFloat(s);
    };
    return parse(a) - parse(b);
};

export default function BuybackPricingMatrix({ deviceId, modelName }: Props) {
    const { prices, loading, updatePrice } = useBuybackPricing(deviceId);

    // Dynamic Storage Derivation from DB Records
    // We only show storages that actually exist in the database (were seeded)
    const availableStorages = React.useMemo(() => {
        const set = new Set(prices.map(p => p.storage));
        return Array.from(set).sort(sortStorage);
    }, [prices]);

    // Internal state for pending edits: { "storage_condition": { value: '123', status: 'idle'|'saving'|'saved' } }
    const [localState, setLocalState] = useState<Record<string, { value: string, status: 'idle' | 'saving' | 'saved' }>>({});

    // Handle input change
    const handleValueChange = (key: string, val: string) => {
        setLocalState(prev => ({
            ...prev,
            [key]: { value: val, status: 'idle' }
        }));
    };

    // Handle save on blur
    const handleSave = async (storage: string, condition: BuybackCondition, val: string, key: string) => {
        const numVal = parseFloat(val);
        if (isNaN(numVal)) return; // Don't save invalid numbers

        setLocalState(prev => ({ ...prev, [key]: { ...prev[key], status: 'saving' } }));

        try {
            await updatePrice(storage, condition, numVal);

            setLocalState(prev => ({ ...prev, [key]: { ...prev[key], status: 'saved' } }));

            // Revert back to idle after 2 seconds
            setTimeout(() => {
                setLocalState(prev => {
                    if (!prev[key] || prev[key].status !== 'saved') return prev;
                    return { ...prev, [key]: { ...prev[key], status: 'idle' } };
                });
            }, 2000);

        } catch (err) {
            console.error(err);
            setLocalState(prev => ({ ...prev, [key]: { ...prev[key], status: 'idle' } })); // Error state?
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading buyback prices...</div>;

    if (availableStorages.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Buyback Value Estimator</h2>
                <p className="text-gray-500">No buyback pricing found for this device.</p>
                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
                    💡 Tip: Go to "Batch Tools" and run "Seed Buyback Prices" to generate defaults first.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Buyback Value Estimator</h2>
                    <p className="text-sm text-gray-500">Set the purchase price for different conditions of {modelName}</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 border-b border-r border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 w-32 font-bold text-gray-700 dark:text-gray-300">
                                Storage \ Condition
                            </th>
                            {CONDITIONS.map(cond => (
                                <th key={cond.id} className={`p-4 border-b border-gray-100 dark:border-slate-700 ${cond.color} min-w-[140px]`}>
                                    <div className="text-sm font-bold uppercase tracking-wider">{cond.label}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {availableStorages.map(storage => (
                            <tr key={storage} className="group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 border-b border-r border-gray-100 dark:border-slate-700 font-bold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-slate-800/50">
                                    {storage.toUpperCase()}
                                </td>
                                {CONDITIONS.map(cond => {
                                    const key = `${storage}_${cond.id}`;
                                    const remoteRecord = prices.find(p => p.storage === storage && p.condition === cond.id);

                                    const state = localState[key];
                                    // Display Logic: Local Buffer > Remote > Empty
                                    const displayValue = (state && state.value !== undefined)
                                        ? state.value
                                        : (remoteRecord ? String(remoteRecord.price) : '');

                                    return (
                                        <td key={cond.id} className="p-3 border-b border-gray-100 dark:border-slate-700 relative">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                                                <input
                                                    type="number"
                                                    value={displayValue}
                                                    onChange={(e) => handleValueChange(key, e.target.value)}
                                                    onBlur={() => handleSave(storage, cond.id, displayValue, key)}
                                                    className={`w-full pl-7 pr-8 py-2.5 rounded-xl border outline-none font-medium transition-all
                                                        ${state?.status === 'saved'
                                                            ? 'border-green-500 bg-green-50 text-green-700'
                                                            : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue'}
                                                        ${state?.status === 'saving' ? 'opacity-70' : ''}
                                                    `}
                                                    placeholder="-"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    {state?.status === 'saving' && <ArrowPathIcon className="h-4 w-4 text-bel-blue animate-spin" />}
                                                    {state?.status === 'saved' && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-900 text-xs text-gray-500 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Saved locally & synced
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                    Empty (Not offered)
                </div>
            </div>
        </div>
    );
}
