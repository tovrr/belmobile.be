'use client';

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import ServiceModal from './ServiceModal';
import { Service } from '../../types';

const ServiceManagement: React.FC = () => {
    const { services, deleteService } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const handleAddService = () => {
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number | string) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await deleteService(id);
            } catch (error) {
                console.error("Failed to delete service:", error);
                alert("Failed to delete service");
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Service Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage repair and buyback services</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button
                        onClick={async () => {
                            if (window.confirm('This will overwrite existing services with defaults. Continue?')) {
                                try {
                                    const { collection, doc, writeBatch } = await import('firebase/firestore');
                                    const { db } = await import('../../firebase');
                                    const { MOCK_SERVICES } = await import('../../data/mock-admin');

                                    const batch = writeBatch(db);
                                    MOCK_SERVICES.forEach((service: Service) => {
                                        const docRef = doc(collection(db, 'services'), String(service.id));
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        const { id, ...data } = service;
                                        batch.set(docRef, { ...data, id: service.id });
                                    });
                                    await batch.commit();
                                    alert('Services seeded successfully!');
                                } catch (error) {
                                    console.error('Error seeding services:', error);
                                    alert('Failed to seed services.');
                                }
                            }
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-bold text-center"
                    >
                        Seed Defaults
                    </button>
                    <button
                        onClick={handleAddService}
                        className="flex-1 sm:flex-none bg-bel-blue text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Service
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-4">Service Name</th>
                                <th scope="col" className="px-6 py-4">Type</th>
                                <th scope="col" className="px-6 py-4">Description</th>
                                <th scope="col" className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {services.map(service => (
                                <tr key={service.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <th scope="row" className="px-6 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">{service.name}</th>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${service.type === 'repair'
                                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {service.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{service.description}</td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <button onClick={() => handleEdit(service)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"><PencilIcon className="h-5 w-5" /></button>
                                        <button onClick={() => handleDelete(service.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <ServiceModal
                    service={editingService}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ServiceManagement;
