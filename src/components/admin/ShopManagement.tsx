'use client';

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { PencilIcon, PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import ShopModal from './ShopModal';
import { Shop } from '../../types';

const ShopManagement: React.FC = () => {
    const { shops, deleteShop } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);
    const [expandedShopId, setExpandedShopId] = useState<number | string | null>(null);

    const handleAddShop = () => {
        setEditingShop(null);
        setIsModalOpen(true);
    };

    const handleEdit = (shop: Shop) => {
        setEditingShop(shop);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number | string) => {
        if (window.confirm('Are you sure you want to delete this shop?')) {
            try {
                await deleteShop(id);
            } catch (error) {
                console.error("Error deleting shop:", error);
                alert("Failed to delete shop.");
            }
        }
    };

    const getTodayHours = (openingHours: string[]) => {
        if (!openingHours || !Array.isArray(openingHours)) return 'Closed';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = days[new Date().getDay()];
        // Assuming openingHours is an array of strings like "Mon-Sat: 10:00 - 19:00"
        // This logic might need to be more robust if the format varies
        const todayLine = openingHours.find(line => line.includes(today));
        // Note: "Mon-Sat" includes "Mon", "Sat" but not "Tue" explicitly in string check unless expanded.
        // For now, let's just return the first line or a placeholder if logic is complex.
        // Or better, just display the first line as a summary.
        return todayLine || openingHours[0] || 'Closed';
    };

    const toggleExpand = (id: number | string) => {
        setExpandedShopId(expandedShopId === id ? null : id);
    };

    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Shop Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your store locations and hours</p>
                </div>
                <button
                    onClick={handleAddShop}
                    className="w-full sm:w-auto bg-bel-blue text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Shop
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {shops
                    .sort((a, b) => {
                        // 1. Sort by Status (Open first, then Coming Soon)
                        if (a.status === 'open' && b.status !== 'open') return -1;
                        if (a.status !== 'open' && b.status === 'open') return 1;

                        // 2. Sort Alphabetically
                        return a.name.localeCompare(b.name);
                    })
                    .map(shop => (
                        <div key={shop.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/20 dark:border-slate-700/50 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">{shop.name}</h3>
                                        {shop.status === 'coming_soon' && (
                                            <span className="px-3 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full">Coming Soon</span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">{shop.address}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        <span>{shop.phone}</span>
                                        {shop.googleMapUrl && (
                                            <a href={shop.googleMapUrl} target="_blank" rel="noopener noreferrer" className="text-bel-blue hover:underline font-medium">
                                                View on Maps
                                            </a>
                                        )}
                                    </div>

                                    {/* Hours Section */}
                                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-3 max-w-md border border-gray-100 dark:border-slate-700">
                                        <div
                                            className="flex justify-between items-center cursor-pointer"
                                            onClick={() => toggleExpand(shop.id)}
                                        >
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                                <span className="text-gray-400 mr-2">Today:</span>
                                                {getTodayHours(shop.openingHours)}
                                            </span>
                                            {expandedShopId === shop.id ? (
                                                <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                            )}
                                        </div>

                                        {expandedShopId === shop.id && (
                                            <div className="mt-3 pt-3 border-t border-t-gray-200 dark:border-t-slate-700 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line pl-3 border-l-2 border-l-bel-blue">
                                                {(shop.openingHours || []).map((line, i) => (
                                                    <div key={i}>{line}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-2 ml-4">
                                    <button onClick={() => handleEdit(shop)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors" title="Edit">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDelete(shop.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" title="Delete">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
            {isModalOpen && (
                <ShopModal
                    shop={editingShop}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ShopManagement;
