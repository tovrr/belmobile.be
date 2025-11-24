
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../../types';
import { useData } from '../../hooks/useData';
import { XMarkIcon, PhotoIcon, PencilIcon } from '@heroicons/react/24/outline';

interface ProductModalProps {
    onClose: () => void;
    product?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ onClose, product }) => {
    const { addProduct, updateProduct, shops } = useData();
    const isEditing = !!product;
    
    // State for image URL to handle both text input and file reading
    const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (product) {
            setImageUrl(product.imageUrl);
        }
    }, [product]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Convert file to Base64 string
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const availability = shops.reduce((acc, shop) => {
            acc[shop.id] = Number(formData.get(`availability-${shop.id}`) || 0);
            return acc;
        }, {} as {[shopId: number]: number});

        const commonData = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
            imageUrl: imageUrl, // Use the state which contains either URL or Base64
            availability: availability,
        };

        if (isEditing && product) {
            updateProduct({
                ...commonData,
                id: product.id
            });
        } else {
            addProduct(commonData);
        }
        
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shadow-sm">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            {/* Visual Uploader */}
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="relative w-32 h-32 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-electric-indigo hover:bg-indigo-50 transition-all overflow-hidden bg-gray-50 group"
                            >
                                {imageUrl ? (
                                    <>
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PencilIcon className="h-6 w-6 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-2">
                                        <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-1 group-hover:text-electric-indigo" />
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide group-hover:text-indigo-600">Upload</span>
                                    </div>
                                )}
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                />
                            </div>

                            {/* URL Input Fallback */}
                            <div className="flex-1 w-full">
                                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Or paste image URL:</label>
                                <input 
                                    type="text" 
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none text-sm bg-gray-50 focus:bg-white transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                    Supported: JPG, PNG, WEBP. <br/>
                                    Click the box on the left to upload from your device.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                            <input type="text" name="name" id="name" defaultValue={product?.name} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none transition-all" placeholder="e.g. iPhone 15 Pro" />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-2">Price (€)</label>
                            <input type="number" name="price" id="price" step="0.01" defaultValue={product?.price} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none transition-all font-mono" placeholder="0.00" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea name="description" id="description" rows={3} defaultValue={product?.description} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-indigo focus:border-transparent outline-none transition-all resize-none" placeholder="Product details..."></textarea>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Stock Availability by Store</h3>
                        <div className="space-y-3">
                             {shops.map(shop => (
                                <div key={shop.id} className="flex items-center justify-between">
                                    <label htmlFor={`availability-${shop.id}`} className="text-sm text-gray-600 font-medium">{shop.name}</label>
                                    <input 
                                        type="number" 
                                        name={`availability-${shop.id}`} 
                                        id={`availability-${shop.id}`} 
                                        defaultValue={product?.availability[shop.id] || 0}
                                        min="0"
                                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-electric-indigo outline-none font-mono text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm transition-all border border-transparent hover:border-gray-200">
                        Cancel
                    </button>
                    <button 
                        onClick={(e) => handleSubmit(e as any)} // Trigger form submission
                        className="px-8 py-3 bg-electric-indigo text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                    >
                        {isEditing ? 'Save Changes' : 'Create Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
