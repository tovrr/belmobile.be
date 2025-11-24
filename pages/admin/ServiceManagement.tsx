import React from 'react';
import { useData } from '../../hooks/useData';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const ServiceManagement: React.FC = () => {
    const { services } = useData();
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Service Management</h2>
                 <button className="bg-bel-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition duration-300 flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Service
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Service Name</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(service => (
                            <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{service.name}</th>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${service.type === 'repair' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                        {service.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{service.description}</td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button className="text-blue-600 hover:text-blue-800"><PencilIcon className="h-5 w-5" /></button>
                                    <button className="text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServiceManagement;