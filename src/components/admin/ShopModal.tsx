'use client';

import React from 'react';
import { Shop } from '../../types';
import { useData } from '../../hooks/useData';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ShopModalProps {
    onClose: () => void;
    shop?: Shop | null;
}

const ShopModal: React.FC<ShopModalProps> = ({ onClose, shop }) => {
    const { addShop, updateShop } = useData();
    const isEditing = !!shop;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const shopData: Omit<Shop, 'id'> = {
            name: formData.get('name') as string,
            address: formData.get('address') as string,
            phone: formData.get('phone') as string,
            openingHours: (formData.get('hours') as string).split('\n').map(line => line.trim()).filter(line => line.length > 0),
            slugs: {
                fr: formData.get('slug_fr') as string,
                nl: formData.get('slug_nl') as string,
                en: formData.get('slug_en') as string,
            },
            coords: {
                lat: Number(formData.get('lat')),
                lng: Number(formData.get('lng')),
            },
            status: formData.get('status') as Shop['status'],
            googleMapUrl: formData.get('googleMapUrl') as string,
            email: formData.get('email') as string,
            rating: formData.get('rating') ? Number(formData.get('rating')) : undefined,
            reviewCount: formData.get('reviewCount') ? Number(formData.get('reviewCount')) : undefined,
            photos: (formData.get('photos') as string)?.split('\n').map(line => line.trim()).filter(line => line.length > 0) || [],
        };

        try {
            if (isEditing && shop) {
                await updateShop(String(shop.id), shopData);
            } else {
                await addShop(shopData);
            }
            onClose();
        } catch (error) {
            console.error("Error saving shop:", error);
            alert("Failed to save shop. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{isEditing ? 'Edit Shop' : 'Add New Shop'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Shop Name</label>
                        <input type="text" name="name" id="name" defaultValue={shop?.name} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                    </div>

                    {/* Slugs Section */}
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label htmlFor="slug_fr" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Slug (FR)</label>
                            <input type="text" name="slug_fr" id="slug_fr" defaultValue={shop?.slugs?.fr} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition text-sm" />
                        </div>
                        <div>
                            <label htmlFor="slug_nl" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Slug (NL)</label>
                            <input type="text" name="slug_nl" id="slug_nl" defaultValue={shop?.slugs?.nl} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition text-sm" />
                        </div>
                        <div>
                            <label htmlFor="slug_en" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Slug (EN)</label>
                            <input type="text" name="slug_en" id="slug_en" defaultValue={shop?.slugs?.en} required className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition text-sm" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Address</label>
                        <input type="text" name="address" id="address" defaultValue={shop?.address} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                        <input type="text" name="phone" id="phone" defaultValue={shop?.phone} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" name="email" id="email" defaultValue={shop?.email} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                    </div>
                    <div>
                        <label htmlFor="googleMapUrl" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Google My Business URL</label>
                        <input type="url" name="googleMapUrl" id="googleMapUrl" defaultValue={shop?.googleMapUrl} placeholder="https://maps.app.goo.gl/..." className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Shop Status</label>
                        <select name="status" id="status" defaultValue={shop?.status || 'open'} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition">
                            <option value="open">Open</option>
                            <option value="temporarily_closed">Temporarily Closed</option>
                            <option value="coming_soon">Coming Soon</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="hours" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Hours (One per line)</label>
                        <textarea name="hours" id="hours" rows={5} defaultValue={shop?.openingHours?.join('\n')} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" placeholder="Mon-Fri: 10:00 - 19:00&#10;Sat: 10:00 - 18:00&#10;Sun: Closed" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="lat" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Latitude</label>
                            <input type="number" step="any" name="lat" id="lat" defaultValue={shop?.coords.lat} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                        </div>
                        <div>
                            <label htmlFor="lng" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Longitude</label>
                            <input type="number" step="any" name="lng" id="lng" defaultValue={shop?.coords.lng} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="rating" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Google Rating</label>
                            <input type="number" step="0.1" min="0" max="5" name="rating" id="rating" defaultValue={shop?.rating} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                        </div>
                        <div>
                            <label htmlFor="reviewCount" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Review Count</label>
                            <input type="number" name="reviewCount" id="reviewCount" defaultValue={shop?.reviewCount} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="photos" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Photos (One URL per line)</label>
                        <textarea name="photos" id="photos" rows={3} defaultValue={shop?.photos?.join('\n')} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" placeholder="https://example.com/photo1.jpg" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 transition">Cancel</button>
                        <button type="submit" className="bg-bel-blue text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none">
                            {isEditing ? 'Save Changes' : 'Add Shop'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShopModal;
