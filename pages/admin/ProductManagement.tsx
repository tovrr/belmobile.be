
import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { PencilIcon, TrashIcon, PlusIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import ProductModal from '../../components/admin/ProductModal';
import { Product } from '../../types';

const ProductManagement: React.FC = () => {
    const { products, deleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleAddProduct = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };
    
    const handleEdit = (product: Product) => {
       setEditingProduct(product);
       setIsModalOpen(true);
    };

    // Helper for total stock calculation
    const getTotalStock = (p: Product) => (Object.values(p.availability) as number[]).reduce((a, b) => a + b, 0);

    return (
        <>
            <div className="space-y-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Inventory & Products</h2>
                        <p className="text-gray-500 text-sm">Manage global stock across all franchise locations.</p>
                    </div>
                    <button 
                        onClick={handleAddProduct}
                        className="flex items-center px-4 py-2 bg-electric-indigo text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Product
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-bold">Product</th>
                                    <th scope="col" className="px-6 py-4 font-bold">Price</th>
                                    <th scope="col" className="px-6 py-4 font-bold">Global Stock</th>
                                    <th scope="col" className="px-6 py-4 font-bold">Status</th>
                                    <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map(product => {
                                    const stock = getTotalStock(product);
                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                        <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{product.name}</div>
                                                        <div className="text-xs text-gray-400">ID: #{product.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">€{product.price.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <ArchiveBoxIcon className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium">{stock}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    stock > 5 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : stock > 0 
                                                            ? 'bg-yellow-100 text-yellow-700' 
                                                            : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {stock > 5 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(product)} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-all">
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all">
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
            </div>
            {isModalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default ProductManagement;
