'use client';

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { PencilIcon, TrashIcon, PlusIcon, ArchiveBoxIcon, DocumentDuplicateIcon, MagnifyingGlassIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import ProductModal from './ProductModal';
import BatchActionMenu from './BatchActionMenu';
import { Product } from '../../types';
import Image from 'next/image';

const ProductManagement: React.FC = () => {
    const { products, deleteProduct, stockLogs } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedBrand, setSelectedBrand] = useState<string>('all');
    const [selectedProducts, setSelectedProducts] = useState<Set<number | string>>(new Set());
    const [showBatchMenu, setShowBatchMenu] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

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
        setEditingProduct({ ...product, id: -1, name: `${product.name} (Copy)` });
        setIsModalOpen(true);
    };

    const getTotalStock = (p: Product) => {
        if (!p.availability) return 0;
        return Object.values(p.availability).reduce((a, b) => a + (Number(b) || 0), 0);
    };

    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
    const brands = ['all', ...new Set(products.map(p => p.brand).filter(Boolean))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(p.id).includes(searchQuery);
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
        return matchesSearch && matchesCategory && matchesBrand;
    });

    const toggleProductSelection = (id: number | string) => {
        const next = new Set(selectedProducts);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedProducts(next);
    };

    const toggleAllSelection = () => {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Product Inventory</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage device stock and pricing across all shops</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className={`flex items-center px-6 py-3 rounded-2xl font-bold transition-all hover:scale-[1.02] border-2 shadow-sm ${showLogs ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-100' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-200 shadow-gray-100'}`}
                    >
                        <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                        {showLogs ? 'Back to Inventory' : 'View Audit Logs'}
                    </button>
                    <button onClick={handleAddProduct} className="flex-1 sm:flex-none flex items-center justify-center px-8 py-3 bg-linear-to-r from-bel-blue to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition-all">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50 backdrop-blur-sm">
                <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="pl-10 pr-8 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none appearance-none cursor-pointer text-sm font-medium"
                        >
                            {categories.map(c => <option key={c ?? 'all'} value={c ?? 'all'}>{c === 'all' ? 'All Categories' : ((c?.charAt(0).toUpperCase() || '') + (c?.slice(1) || ''))}</option>)}
                        </select>
                    </div>
                    <div className="relative">
                        <AdjustmentsHorizontalIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            className="pl-10 pr-8 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-bel-blue outline-none appearance-none cursor-pointer text-sm font-medium"
                        >
                            {brands.map(b => <option key={b ?? 'all'} value={b ?? 'all'}>{b === 'all' ? 'All Brands' : b}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {selectedProducts.size > 0 && (
                <div className="flex items-center gap-4 p-4 bg-bel-blue/10 rounded-2xl border border-bel-blue/20 animate-slide-up">
                    <span className="text-bel-blue font-bold px-2">{selectedProducts.size} items selected</span>
                    <div className="h-6 w-px bg-bel-blue/20"></div>
                    <button
                        onClick={() => setShowBatchMenu(!showBatchMenu)}
                        className="flex items-center text-sm font-bold text-bel-blue hover:text-blue-700 transition-colors"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Batch Actions
                    </button>
                    <button
                        onClick={() => setSelectedProducts(new Set())}
                        className="text-sm font-bold text-gray-400 hover:text-gray-600 ml-auto"
                    >
                        Clear Selection
                    </button>
                </div>
            )}

            {!showLogs ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700">
                                <tr>
                                    <th scope="col" className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                                            onChange={toggleAllSelection}
                                            className="w-4 h-4 rounded border-gray-300 text-bel-blue focus:ring-bel-blue"
                                        />
                                    </th>
                                    <th scope="col" className="px-6 py-4 font-bold">Product</th>
                                    <th scope="col" className="px-6 py-4 font-bold text-right">Price</th>
                                    <th scope="col" className="px-6 py-4 font-bold text-center">Global Stock</th>
                                    <th scope="col" className="px-6 py-4 font-bold">Status</th>
                                    <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {filteredProducts.map(product => {
                                    const stock = getTotalStock(product);
                                    const isSelected = selectedProducts.has(product.id);
                                    return (
                                        <tr key={product.id} className={`transition-colors ${isSelected ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-slate-700/50'}`}>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleProductSelection(product.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-bel-blue focus:ring-bel-blue"
                                                />
                                            </td>
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
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-right">€{product.price.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
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
            ) : (
                <div className="space-y-4 animate-slide-up">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">Inventory Audit Trail</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-slate-900/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Date</th>
                                        <th scope="col" className="px-6 py-4">Product</th>
                                        <th scope="col" className="px-6 py-4">Type</th>
                                        <th scope="col" className="px-6 py-4">Change Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {stockLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs">
                                                {new Date(log.date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{log.productName}</div>
                                                <div className="text-[10px] text-gray-400">ID: {log.productId}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${log.type === 'stock_update' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        log.type === 'price_update' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                            log.type === 'creation' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                    {log.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
                                                {log.change}
                                            </td>
                                        </tr>
                                    ))}
                                    {stockLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No activity logged yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            {showBatchMenu && (
                <BatchActionMenu
                    products={products}
                    selectedIds={selectedProducts}
                    onClose={() => {
                        setShowBatchMenu(false);
                        setSelectedProducts(new Set());
                    }}
                />
            )}
        </div>
    );
};

export default ProductManagement;
