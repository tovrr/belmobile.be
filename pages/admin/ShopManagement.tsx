
import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { PencilIcon, PlusIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { Shop } from '../../types';
import ShopModal from '../../components/admin/ShopModal';

const ShopManagement: React.FC = () => {
    const { shops } = useData();
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

    // Note: "Add Shop" is mocked for now as it would require coordinates generation logic or API
    const handleAdd = () => {
        alert("To add a new shop, please contact the developer to set up geolocation services.");
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Shop Management</h2>
                        <p className="text-gray-500 text-sm">Update opening hours, contact info, and status.</p>
                    </div>
                    <button 
                        onClick={handleAdd}
                        className="flex items-center px-4 py-2 bg-electric-indigo text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Shop
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {shops.map(shop => (
                        <div key={shop.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 p-3 rounded-full text-bel-blue">
                                    <BuildingStorefrontIcon className="h-6 w-6" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${shop.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {shop.status === 'open' ? 'OPEN' : 'COMING SOON'}
                                </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{shop.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{shop.address}</p>
                            
                            <div className="space-y-2 mb-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                                <div className="flex">
                                    <span className="font-semibold w-16">Phone:</span>
                                    <span>{shop.phone}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold w-16">Hours:</span>
                                    <span className="whitespace-pre-line">{shop.hours}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedShop(shop)}
                                className="mt-auto w-full flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-bel-blue hover:text-white hover:border-bel-blue transition-all"
                            >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Edit Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {selectedShop && (
                <ShopModal 
                    shop={selectedShop}
                    onClose={() => setSelectedShop(null)}
                />
            )}
        </>
    );
};

export default ShopManagement;
