'use client';

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { PencilIcon, TrashIcon, PlusIcon, ArchiveBoxIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import ProductModal from './ProductModal';
import { Product } from '../../types';
import Image from 'next/image';

const ProductManagement: React.FC = () => {
    const { products, deleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number | string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
            } catch (error) {
                console.error("Failed to delete product:", error);
                alert("Failed to delete product");
            }
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDuplicate = (product: Product) => {
        // Create a copy of the product but mark it as new (id: -1)
        setEditingProduct({ ...product, id: -1, name: `${product.name} (Copy)` });
        setIsModalOpen(true);
    };

    // Helper for total stock calculation
    const getTotalStock = (p: Product) => {
        if (!p.availability) return 0;
        return Object.values(p.availability).reduce((a, b) => a + (Number(b) || 0), 0);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Inventory & Products</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage global stock across all franchise locations.</p>
                </div>
                <button
                    onClick={handleAddProduct}
                    className="flex items-center px-6 py-3 bg-bel-blue text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Product
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-bold">Product</th>
                                <th scope="col" className="px-6 py-4 font-bold">Price</th>
                                <th scope="col" className="px-6 py-4 font-bold">Global Stock</th>
                                <th scope="col" className="px-6 py-4 font-bold">Status</th>
                                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {products.map(product => {
                                const stock = getTotalStock(product);
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-gray-200 dark:border-slate-600 relative">
                                                    <Image src={product.imageUrl} alt="" fill className="object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{product.name}</div>
                                                    <div className="text-xs text-gray-400">ID: #{product.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">€{product.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <ArchiveBoxIcon className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{stock}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${stock > 5
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                : stock > 0
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {stock > 5 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(product)} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-blue-400 rounded-xl transition-all" title="Edit">
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDuplicate(product)} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-green-400 rounded-xl transition-all" title="Duplicate">
                                                    <DocumentDuplicateIcon className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-all" title="Delete">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ProductManagement;
