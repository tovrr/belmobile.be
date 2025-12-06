'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '../hooks/useData';
import { useShop } from '../hooks/useShop';
import { useLanguage } from '../hooks/useLanguage';
import dynamic from 'next/dynamic';
import { ArrowLeftIcon, CheckCircleIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';
const ReservationModal = dynamic(() => import('../components/ReservationModal'), { ssr: false });
import SchemaMarkup from '../components/SchemaMarkup';
import ConditionGuide from '../components/ConditionGuide';
import { getLocalizedProduct } from '../utils/localization';
import { Button } from './ui';

import { Product } from '../types';

interface ProductDetailProps {
    initialProduct?: Product;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ initialProduct }) => {
    const params = useParams();
    // params.slug might be string or string[] depending on route. 
    // In [category]/[slug], it is string.
    const slug = typeof params?.slug === 'string' ? params.slug : params?.slug?.[0];

    const router = useRouter();
    const { products, loading } = useData();
    const { selectedShop } = useShop();
    const { t, language } = useLanguage();
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

    const product = initialProduct || products.find(p => p.slug === slug);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-bel-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('Product not found')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{t('The product you are looking for does not exist.')}</p>
                <Button
                    onClick={() => router.push(`/${language}/${language === 'fr' ? 'produits' : language === 'nl' ? 'producten' : 'products'}`)}
                    variant="primary"
                >
                    {t('Back to Products')}
                </Button>
            </div>
        );
    }

    const { name: localizedName, description: localizedDescription } = getLocalizedProduct(product, language as 'en' | 'fr' | 'nl');

    const handleReserve = () => {
        setIsReservationModalOpen(true);
    };

    // Smart Title Construction
    // Check if capacity/color are already in the name to avoid duplication
    const nameLower = localizedName.toLowerCase();
    const capacityLower = product.capacity?.toLowerCase() || '';
    const colorLower = product.color ? t(product.color).toLowerCase() : '';
    const brandLower = product.brand?.toLowerCase() || '';

    const showBrand = !nameLower.includes(brandLower);
    const showCapacity = product.capacity && !nameLower.includes(capacityLower);
    const showColor = product.color && !nameLower.includes(colorLower);

    const fullTitle = `${showBrand ? product.brand + ' ' : ''}${localizedName}`;

    // Availability Logic
    const isAvailable = useMemo(() => {
        if (selectedShop) {
            return (product.availability?.[selectedShop.id.toString()] || 0) > 0;
        }
        // If no shop selected, check if available ANYWHERE
        return Object.values(product.availability || {}).some(qty => qty > 0);
    }, [product, selectedShop]);

    const stockText = useMemo(() => {
        if (!selectedShop) return null;
        const stock = product.availability?.[selectedShop.id.toString()] || 0;
        if (stock > 0) return t('In stock at {0} ({1} left)', selectedShop.name, stock);
        return t('Out of stock at {0}', selectedShop.name);
    }, [product, selectedShop, t]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <SchemaMarkup
                type="product"
                product={product}
                breadcrumbs={[
                    { name: t('Home'), item: `https://belmobile.be/${language}` },
                    { name: t('Products'), item: `https://belmobile.be/${language}/${language === 'fr' ? 'produits' : language === 'nl' ? 'producten' : 'products'}` },
                    { name: fullTitle, item: `https://belmobile.be/${language}/${language === 'fr' ? 'acheter' : language === 'nl' ? 'kopen' : 'buy'}/${product.category}/${product.slug}` }
                ]}
            />

            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-8 pl-0 hover:pl-2"
                icon={<ArrowLeftIcon className="h-5 w-5 mr-2" />}
            >
                {t('Back')}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                import Image from 'next/image';

                // ... (imports remain the same, just adding Image to existing imports or new line)

                // Inside component:
                {/* Image Section */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-white/10 flex items-center justify-center h-[500px] relative overflow-hidden">
                    <Image
                        src={product.imageUrl}
                        alt={localizedName}
                        fill
                        className="object-contain p-4 hover:scale-105 transition-transform duration-500"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                {/* Details Section */}
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        {product.category !== 'accessories' && (
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-full uppercase">
                                {t(product.condition || 'Good')}
                            </span>
                        )}
                        {product.brand && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-full">
                                {product.brand}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {fullTitle}
                    </h1>

                    <div className="flex items-center space-x-4 mb-6">
                        <span className="text-3xl font-bold text-bel-blue">€{product.price}</span>
                        {product.capacity && (
                            <span className="text-lg text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded-lg">
                                {product.capacity}
                            </span>
                        )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                        {localizedDescription}
                    </p>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 dark:bg-surface-dark/50 p-4 rounded-xl border border-gray-100 dark:border-white/10">
                            <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('Color')}</span>
                            <span className="font-bold text-gray-900 dark:text-white">{t(product.color || 'N/A')}</span>
                        </div>
                        {product.category !== 'accessories' && (
                            <div className="bg-gray-50 dark:bg-surface-dark/50 p-4 rounded-xl border border-gray-100 dark:border-white/10">
                                <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('Condition')}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{t(product.condition || 'Good')}</span>
                            </div>
                        )}
                    </div>

                    {/* Trust Signals */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-3" />
                            <span>{t('1 Year Warranty included')}</span>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                            <span>{t('Tested & Certified by Experts')}</span>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <TruckIcon className="h-6 w-6 text-green-500 mr-3" />
                            <span>{t('Free Delivery or Store Pickup')}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleReserve}
                        disabled={!isAvailable}
                        variant={isAvailable ? 'primary' : 'secondary'} // Use secondary for disabled look if needed, or rely on disabled prop
                        className="w-full text-lg py-4 h-auto" // Override height for bigger CTA
                    >
                        {isAvailable ? t('Reserve This Device') : t('Out of Stock')}
                    </Button>
                    {stockText && (
                        <p className={`text-center mt-2 text-sm font-medium ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                            {stockText}
                        </p>
                    )}
                </div>
            </div>


            {/* Condition Guide */}
            {
                product.category !== 'accessories' && (
                    <ConditionGuide currentCondition={product.condition as 'perfect' | 'very_good' | 'good'} />
                )
            }

            {
                isReservationModalOpen && (
                    <ReservationModal
                        product={product}
                        initialShop={selectedShop || null}
                        onClose={() => setIsReservationModalOpen(false)}
                    />
                )
            }
        </div >
    );
};

export default ProductDetail;
