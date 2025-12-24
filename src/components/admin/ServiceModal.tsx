'use client';

import React from 'react';
import { Service } from '../../types';
import { useData } from '../../hooks/useData';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ServiceModalProps {
    onClose: () => void;
    service?: Service | null;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ onClose, service }) => {
    const { addService, updateService } = useData();
    const isEditing = !!service;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const serviceData: Omit<Service, 'id'> = {
            name: formData.get('name') as string,
            type: formData.get('type') as 'repair' | 'buyback',
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
        };

        try {
            if (isEditing && service) {
                await updateService({ ...serviceData, id: service.id } as Service);
            } else {
                await addService(serviceData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save service:", error);
            alert("Failed to save service");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{isEditing ? 'Edit Service' : 'Add New Service'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Service Name</label>
                        <input type="text" name="name" id="name" defaultValue={service?.name} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                        <select name="type" id="type" defaultValue={service?.type || 'repair'} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition">
                            <option value="repair">Repair</option>
                            <option value="buyback">Buyback</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea name="description" id="description" rows={3} defaultValue={service?.description} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"></textarea>
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Base Price</label>
                        <input type="number" name="price" id="price" step="0.01" defaultValue={service?.price} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition" />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 transition">Cancel</button>
                        <button type="submit" className="bg-bel-blue text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none">
                            {isEditing ? 'Save Changes' : 'Add Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceModal;
