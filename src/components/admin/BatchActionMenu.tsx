'use client';

import React, { useState } from 'react';
import { XMarkIcon, CurrencyEuroIcon, ArchiveBoxIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Product } from '../../types';
import { useData } from '../../hooks/useData';

interface BatchActionMenuProps {
    onClose: () => void;
    selectedIds: Set<number | string>;
    products: Product[];
}

const BatchActionMenu: React.FC<BatchActionMenuProps> = ({ onClose, selectedIds, products }) => {
    const { updateProduct, logStockMovement, deleteProduct, shops } = useData();
    const [action, setAction] = useState<'price' | 'stock' | 'delete' | null>(null);
    const [adjustment, setAdjustment] = useState<number>(0);
    const [selectedShop, setSelectedShop] = useState<string>('all');
    const [isProcessing, setIsProcessing] = useState(false);

    const selectedProducts = products.filter(p => selectedIds.has(p.id));

    const handleApply = async () => {
        setIsProcessing(true);
        try {
            for (const product of selectedProducts) {
                if (action === 'price') {
                    const oldPrice = product.price;
                    const newPrice = Math.max(0, action === 'price' ? product.price + adjustment : product.price);

                    if (oldPrice !== newPrice) {
                        await updateProduct({ ...product, price: newPrice });
                        await logStockMovement({
                            productId: String(product.id),
                            productName: product.name,
                            type: 'price_update',
                            change: `Batch Price Update: €${oldPrice} -> €${newPrice}`,
                            userEmail: 'admin@belmobile.be' // Placeholder
                        });
                    }
                } else if (action === 'stock') {
                    const newAvailability = { ...product.availability };
                    const shopIds = selectedShop === 'all' ? shops.map(s => String(s.id)) : [selectedShop];

                    shopIds.forEach(sid => {
                        const current = Number(newAvailability[sid]) || 0;
                        newAvailability[sid] = Math.max(0, current + adjustment);
                    });

                    await updateProduct({ ...product, availability: newAvailability });
                    await logStockMovement({
                        productId: String(product.id),
                        productName: product.name,
                        type: 'stock_update',
                        change: `Batch Stock Update (${selectedShop}): ${adjustment > 0 ? '+' : ''}${adjustment}`,
                        userEmail: 'admin@belmobile.be'
                    });
                } else if (action === 'delete') {
                    await deleteProduct(product.id);
                    await logStockMovement({
                        productId: String(product.id),
                        productName: product.name,
                        type: 'deletion',
                        change: 'Batch Deletion',
                        userEmail: 'admin@belmobile.be'
                    });
                }
            }
            onClose();
        } catch (error) {
            console.error("Batch action failed:", error);
            alert("Some actions failed. Please check the logs.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Batch Actions ({selectedIds.size} items)</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => setAction('price')}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${action === 'price' ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20 text-bel-blue' : 'border-gray-100 dark:border-slate-700 text-gray-400'}`}
                        >
                            <CurrencyEuroIcon className="h-6 w-6" />
                            <span className="text-xs font-bold">Update Price</span>
                        </button>
                        <button
                            onClick={() => setAction('stock')}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${action === 'stock' ? 'border-bel-blue bg-blue-50 dark:bg-blue-900/20 text-bel-blue' : 'border-gray-100 dark:border-slate-700 text-gray-400'}`}
                        >
                            <ArchiveBoxIcon className="h-6 w-6" />
                            <span className="text-xs font-bold">Update Stock</span>
                        </button>
                        <button
                            onClick={() => setAction('delete')}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${action === 'delete' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-gray-100 dark:border-slate-700 text-gray-400'}`}
                        >
                            <TrashIcon className="h-6 w-6" />
                            <span className="text-xs font-bold">Delete All</span>
                        </button>
                    </div>

                    {action === 'price' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Adjustment Amount (€)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">±</span>
                                <input
                                    type="number"
                                    value={adjustment}
                                    onChange={(e) => setAdjustment(parseFloat(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 font-bold"
                                    placeholder="e.g. -10 for €10 discount"
                                />
                            </div>
                            <p className="text-xs text-gray-400 italic">This will add/subtract the amount from the current price of each item.</p>
                        </div>
                    )}

                    {action === 'stock' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Shop</label>
                                    <select
                                        value={selectedShop}
                                        onChange={(e) => setSelectedShop(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 font-medium"
                                    >
                                        <option value="all">All Shops</option>
                                        {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Adjustment</label>
                                    <input
                                        type="number"
                                        value={adjustment}
                                        onChange={(e) => setAdjustment(parseInt(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 font-bold text-center"
                                        placeholder="± Qty"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {action === 'delete' && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 animate-pulse">
                            <p className="text-red-600 dark:text-red-400 font-bold text-center">Caution: This will permanently delete {selectedIds.size} products from the database!</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-slate-900/50 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={!action || isProcessing}
                        className={`flex-1 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${action === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-bel-blue hover:bg-blue-700 shadow-blue-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isProcessing ? 'Processing...' : 'Apply Change'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BatchActionMenu;
