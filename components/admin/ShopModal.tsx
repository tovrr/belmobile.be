
import React from 'react';
import { Shop } from '../../types';
import { useData } from '../../hooks/useData';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ShopModalProps {
    shop: Shop;
    onClose: () => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ shop, onClose }) => {
    const { updateShop } = useData();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const updatedShop: Shop = {
            ...shop,
            name: formData.get('name') as string,
            address: formData.get('address') as string,
            phone: formData.get('phone') as string,
            hours: formData.get('hours') as string,
            status: formData.get('status') as 'open' | 'coming_soon',
        };

        updateShop(updatedShop);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Edit Shop Details</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Updating ID: {shop.id}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Shop Name</label>
                        <input type="text" name="name" id="name" defaultValue={shop.name} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-bel-blue focus:border-transparent outline-none" />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                        <input type="text" name="address" id="address" defaultValue={shop.address} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-bel-blue focus:border-transparent outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                            <input type="text" name="phone" id="phone" defaultValue={shop.phone} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-bel-blue focus:border-transparent outline-none" />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                            <select name="status" id="status" defaultValue={shop.status} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-bel-blue focus:border-transparent outline-none bg-white">
                                <option value="open">Open</option>
                                <option value="coming_soon">Coming Soon</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="hours" className="block text-sm font-bold text-gray-700 mb-1">Opening Hours</label>
                        <textarea name="hours" id="hours" rows={4} defaultValue={shop.hours} required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-bel-blue focus:border-transparent outline-none font-mono text-sm"></textarea>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-bel-blue text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShopModal;
