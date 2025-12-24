import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { createSlug } from '../../utils/slugs';
import { DEVICE_BRANDS } from '../../data/brands';
import { RepairPriceRecord } from '../../types';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface PriceRow {
    id: string; // The doc ID
    model: string; // Human readable model name "iPhone 13"
    screen: number | '';
    battery: number | '';
    charging: number | ''; // charging_port
    back: number | ''; // back_cover
    [key: string]: string | number | '';
}

export const BulkPriceEditor = () => {
    const [selectedBrand, setSelectedBrand] = useState('Apple');
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<PriceRow[]>([]);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const loadBrandData = useCallback(async () => {
        setLoading(true);
        setStatusMsg('');
        try {
            const brandSlug = createSlug(selectedBrand);
            const q = query(
                collection(db, 'repair_prices'),
                where('deviceId', '>=', brandSlug),
                where('deviceId', '<=', brandSlug + '\uf8ff')
            );

            const snapshot = await getDocs(q);
            const modelMap: Record<string, PriceRow> = {};

            snapshot.forEach(docSnap => {
                const data = docSnap.data() as RepairPriceRecord;
                const modelSlug = data.deviceId;

                if (!modelMap[modelSlug]) {
                    modelMap[modelSlug] = {
                        id: modelSlug, // Virtual ID for the row
                        model: modelSlug.replace(`${brandSlug}-`, '').replace(/-/g, ' ').toUpperCase(),
                        screen: '',
                        battery: '',
                        charging: '',
                        back: ''
                    };
                }

                // Map specific issues to columns
                if (data.issueId === 'screen') modelMap[modelSlug].screen = data.price;
                if (data.issueId === 'battery') modelMap[modelSlug].battery = data.price;
                if (data.issueId === 'charging_port') modelMap[modelSlug].charging = data.price;
                if (data.issueId === 'back_cover') modelMap[modelSlug].back = data.price;
            });

            // Convert map to array and sort
            const rowArray = Object.values(modelMap).sort((a, b) => a.model.localeCompare(b.model));
            setRows(rowArray);

        } catch (error) {
            console.error("Failed to load prices", error);
            setStatusMsg("Error loading data.");
        } finally {
            setLoading(false);
        }
    }, [selectedBrand]);

    // Load Data
    useEffect(() => {
        loadBrandData();
    }, [loadBrandData]);

    const handleCellChange = (rowIndex: number, field: string, value: string) => {
        const newRows = [...rows];
        const numVal = value === '' ? '' : Number(value);
        newRows[rowIndex] = { ...newRows[rowIndex], [field]: numVal };
        setRows(newRows);
        setHasChanges(true);
    };

    const saveChanges = async () => {
        setSaving(true);
        setStatusMsg('Saving...');
        try {
            const batch = writeBatch(db);
            // const brandSlug = createSlug(selectedBrand); // Unused
            let updateCount = 0;

            for (const row of rows) {
                // Fields to save
                ['screen', 'battery', 'charging', 'back'].forEach(col => {
                    const price = row[col];
                    if (price !== '') {
                        const issueId = col === 'charging' ? 'charging_port' : col === 'back' ? 'back_cover' : col;
                        // actually row.id IS the deviceId from our loader logic above!
                        const actualDeviceId = row.id;

                        // Construct standard ID
                        const docId = `${actualDeviceId}_${issueId}_base`;
                        const docRef = doc(db, 'repair_prices', docId);

                        // We do a merge set to update price but keep other metadata if exists
                        batch.set(docRef, {
                            price: Number(price),
                            deviceId: actualDeviceId,
                            issueId: issueId,
                            currency: 'EUR',
                            isActive: true, // Auto-activate
                            updatedAt: new Date().toISOString()
                        }, { merge: true });
                        updateCount++;
                    }
                });
            }

            await batch.commit();
            setStatusMsg(`✅ Saved ${updateCount} prices!`);
            setHasChanges(false);

        } catch (error) {
            console.error("Save failed", error);
            setStatusMsg('❌ Save failed. See console.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    ⚡ Bulk Price Editor (Spreadsheet Mode)
                </h3>
                <div className="flex gap-4">
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    >
                        {Array.from(new Set(Object.values(DEVICE_BRANDS).flat())).sort().map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    <button
                        onClick={loadBrandData}
                        className="p-2 text-gray-500 hover:text-bel-blue"
                        title="Refresh"
                    >
                        <ArrowPathIcon className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={saveChanges}
                        disabled={!hasChanges || saving}
                        className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-all"
                    >
                        {saving ? 'Saving...' : 'Save All Changes'}
                        {!saving && <CheckCircleIcon className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {statusMsg && <div className="mb-4 text-center font-bold text-sm text-blue-600">{statusMsg}</div>}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3 rounded-l-lg">Model</th>
                            <th className="px-6 py-3 text-center">Screen (€)</th>
                            <th className="px-6 py-3 text-center">Battery (€)</th>
                            <th className="px-6 py-3 text-center">Charging Port (€)</th>
                            <th className="px-6 py-3 rounded-r-lg text-center">Back Cover (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={row.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                    {row.model}
                                </td>
                                {['screen', 'battery', 'charging', 'back'].map(col => (
                                    <td key={col} className="px-2 py-2">
                                        <input
                                            type="number"
                                            value={row[col]}
                                            onChange={(e) => handleCellChange(idx, col, e.target.value)}
                                            className="w-full text-center p-2 rounded border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-bel-blue outline-none bg-transparent"
                                            placeholder="-"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && rows.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No models found for this brand. Try &quot;Seeding&quot; first.</div>
                )}
            </div>
        </div>
    );
};
