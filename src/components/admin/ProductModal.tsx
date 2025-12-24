'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '../../types';
import { useData } from '../../hooks/useData';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createSlug } from '../../utils/slugs';
import { compressImage } from '../../utils/imageUtils';

interface ProductModalProps {
    onClose: () => void;
    product?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ onClose, product }) => {
    const { addProduct, updateProduct, shops } = useData();
    const isEditing = !!product && product.id !== -1;
    const [activeTab, setActiveTab] = useState<'en' | 'fr' | 'nl'>('en');
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        name_fr: '',
        name_nl: '',
        description: '',
        description_fr: '',
        description_nl: '',
        price: 0,
        imageUrl: '',
        category: 'smartphone',
        brand: '',
        condition: 'perfect',
        capacity: '',
        color: '',
        availability: {} as { [shopId: string]: number },
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                name_fr: product.name_fr || '',
                name_nl: product.name_nl || '',
                description: product.description,
                description_fr: product.description_fr || '',
                description_nl: product.description_nl || '',
                price: product.price,
                imageUrl: product.imageUrl,
                category: product.category || 'smartphone',
                brand: product.brand || '',
                condition: product.condition || 'perfect',
                capacity: product.capacity || '',
                color: product.color || '',
                availability: product.availability,
            });
        } else {
            setFormData({
                name: '',
                name_fr: '',
                name_nl: '',
                description: '',
                description_fr: '',
                description_nl: '',
                price: 0,
                imageUrl: '',
                category: 'smartphone',
                brand: '',
                condition: 'perfect',
                capacity: '',
                color: '',
                availability: shops.reduce((acc, shop) => ({ ...acc, [shop.id]: 0 }), {}),
            });
        }
    }, [product, shops]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Compress Image
            const compressedBlob = await compressImage(file);

            // 2. Upload to Firebase Storage
            const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const storage = getStorage();
            const filename = `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}.webp`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, compressedBlob);
            const downloadURL = await getDownloadURL(storageRef);

            // 3. Update Form Data
            setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Generate slug from English name if not provided (or always regenerate for new products)
        const slug = createSlug(formData.name);

        const productData: Product = {
            ...formData,
            slug,
            id: isEditing && product ? product.id : 0, // ID will be ignored/overwritten by backend for new products
            condition: formData.condition as "perfect" | "very_good" | "good",
        };

        try {
            if (isEditing && product) {
                await updateProduct(productData);
            } else {
                // Remove ID for new product creation
                const { id: _id, ...newProductData } = productData as Product;
                void _id;
                await addProduct(newProductData as Omit<Product, 'id'>);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save product:", error);
            alert("Failed to save product");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        {isEditing ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Image Upload Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Product Image</label>
                        <div className="flex items-center space-x-6">
                            {formData.imageUrl && (
                                <div className="relative h-24 w-24 rounded-2xl border border-gray-200 dark:border-slate-700 p-2 bg-white overflow-hidden">
                                    <Image src={formData.imageUrl} alt={formData.name || "Product Image Preview"} fill className="object-cover" sizes="128px" />
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="block w-full cursor-pointer">
                                    <span className="sr-only">Choose file</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2.5 file:px-6
                                        file:rounded-xl file:border-0
                                        file:text-sm file:font-bold
                                        file:bg-blue-50 file:text-bel-blue
                                        hover:file:bg-blue-100
                                        dark:file:bg-blue-900/30 dark:file:text-blue-300
                                        transition-all
                                        "
                                    />
                                </label>
                                {uploading && <p className="text-xs text-bel-blue font-medium mt-2 animate-pulse">Compressing & Uploading...</p>}
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Or enter Image URL manually"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-bel-blue outline-none transition-all"
                        />
                    </div>

                    {/* Language Tabs */}
                    <div className="flex space-x-2 border-b border-gray-200 dark:border-slate-700 mb-6">
                        {(['en', 'fr', 'nl'] as const).map((lang) => (
                            <button
                                key={lang}
                                type="button"
                                onClick={() => setActiveTab(lang)}
                                className={`px-6 py-3 font-bold text-sm focus:outline-none transition-all rounded-t-xl ${activeTab === lang
                                    ? 'text-bel-blue border-b-2 border-bel-blue bg-blue-50/50 dark:bg-blue-900/10'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                {lang === 'en' ? '🇬🇧 English' : lang === 'fr' ? '🇫🇷 Français' : '🇳🇱 Nederlands'}
                            </button>
                        ))}
                    </div>

                    {/* English Fields */}
                    <div className={activeTab === 'en' ? 'block' : 'hidden'}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Name (EN)</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description (EN)</label>
                                <textarea
                                    name="description"
                                    id="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* French Fields */}
                    <div className={activeTab === 'fr' ? 'block' : 'hidden'}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name_fr" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nom du Produit (FR)</label>
                                <input
                                    type="text"
                                    name="name_fr"
                                    id="name_fr"
                                    value={formData.name_fr}
                                    onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                />
                            </div>
                            <div>
                                <label htmlFor="description_fr" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description (FR)</label>
                                <textarea
                                    name="description_fr"
                                    id="description_fr"
                                    rows={3}
                                    value={formData.description_fr}
                                    onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Dutch Fields */}
                    <div className={activeTab === 'nl' ? 'block' : 'hidden'}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name_nl" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Productnaam (NL)</label>
                                <input
                                    type="text"
                                    name="name_nl"
                                    id="name_nl"
                                    value={formData.name_nl}
                                    onChange={(e) => setFormData({ ...formData, name_nl: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                />
                            </div>
                            <div>
                                <label htmlFor="description_nl" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Beschrijving (NL)</label>
                                <textarea
                                    name="description_nl"
                                    id="description_nl"
                                    rows={3}
                                    value={formData.description_nl}
                                    onChange={(e) => setFormData({ ...formData, description_nl: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                        <div>
                            <label htmlFor="price" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
                                <input
                                    type="number"
                                    name="price"
                                    id="price"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                            <select
                                name="category"
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                            >
                                <option value="smartphone">Smartphone</option>
                                <option value="tablet">Tablet</option>
                                <option value="laptop">Laptop</option>
                                <option value="console">Console</option>
                                <option value="smartwatch">Smartwatch</option>
                                <option value="accessories">Accessories</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="brand" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Brand</label>
                            <input
                                type="text"
                                name="brand"
                                id="brand"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                            />
                        </div>
                        <div>
                            <label htmlFor="condition" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Condition</label>
                            <select
                                name="condition"
                                id="condition"
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value as "perfect" | "very_good" | "good" })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                            >
                                <option value="perfect">Perfect</option>
                                <option value="very_good">Very Good</option>
                                <option value="good">Good</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="capacity" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Capacity</label>
                            <input
                                type="text"
                                name="capacity"
                                id="capacity"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                placeholder="e.g. 128GB"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                            />
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                            <input
                                type="text"
                                name="color"
                                id="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                placeholder="e.g. Midnight"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none transition"
                            />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Stock Availability</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {shops.map(shop => (
                                <div key={shop.id} className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl flex items-center justify-between">
                                    <label htmlFor={`availability-${shop.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">{shop.name}</label>
                                    <input
                                        type="number"
                                        name={`availability-${shop.id}`}
                                        id={`availability-${shop.id}`}
                                        value={formData.availability[String(shop.id)] || 0}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            availability: { ...formData.availability, [String(shop.id)]: parseInt(e.target.value) }
                                        })}
                                        min="0"
                                        className="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-bel-blue outline-none text-center font-bold"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-bel-blue text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all">
                            {isEditing ? 'Save Changes' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
