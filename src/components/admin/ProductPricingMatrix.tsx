import React, { useState } from 'react';
import { ProductPriceRecord, ProductCondition } from '../../types';
import { useProductPricing } from '../../hooks/useProductPricing';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
    deviceId: string;
    modelName: string;
}

const CONDITIONS: { id: ProductCondition; label: string; color: string }[] = [
    { id: 'new', label: 'New (Sealed)', color: 'text-green-600 bg-green-50' },
    { id: 'like-new', label: 'Like New', color: 'text-blue-600 bg-blue-50' },
    { id: 'good', label: 'Good', color: 'text-yellow-600 bg-yellow-50' },
    { id: 'fair', label: 'Fair', color: 'text-orange-600 bg-orange-50' }
];

const STORAGES = ['64gb', '128gb', '256gb', '512gb', '1tb'];

export default function ProductPricingMatrix({ deviceId, modelName }: Props) {
    const { prices, loading, updatePrice } = useProductPricing(deviceId);

    const [localState, setLocalState] = useState<Record<string, { value: string, status: 'idle' | 'saving' | 'saved' }>>({});

    const handleValueChange = (key: string, val: string) => {
        setLocalState(prev => ({
            ...prev,
            [key]: { value: val, status: 'idle' }
        }));
    };

    const handleSave = async (storage: string, condition: ProductCondition, val: string, key: string) => {
        const numVal = parseFloat(val);
        if (isNaN(numVal)) return;

        setLocalState(prev => ({ ...prev, [key]: { ...prev[key], status: 'saving' } }));

        try {
            await updatePrice(storage, condition, numVal);
            setLocalState(prev => ({ ...prev, [key]: { ...prev[key], status: 'saved' } }));

            setTimeout(() => {
                setLocalState(prev => {
                    if (!prev[key] || prev[key].status !== 'saved') return prev;
                    return { ...prev, [key]: { ...prev[key], status: 'idle' } };
                });
            }, 2000);
        } catch (err) {
            console.error(err);
            setLocalState(prev => ({ ...prev, [key]: { ...prev[key], status: 'idle' } }));
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading product prices...</div>;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product (Sales) Pricing</h2>
                <p className="text-sm text-gray-500">Set the selling price for refurbished {modelName}</p>
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
                        {STORAGES.map(storage => (
                            <tr key={storage} className="group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 border-b border-r border-gray-100 dark:border-slate-700 font-bold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-slate-800/50">
                                    {storage.toUpperCase()}
                                </td>
                                {CONDITIONS.map(cond => {
                                    const key = `${storage}_${cond.id}`;
                                    const remoteRecord = prices.find(p => p.storage === storage && p.condition === cond.id);

                                    const state = localState[key];
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
        </div>
    );
}
