'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useData } from '../hooks/useData';
import { useShop } from '../hooks/useShop';
import { useLanguage } from '../hooks/useLanguage';
import { ArrowLeftIcon, CheckCircleIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';
import ReservationModal from '../components/ReservationModal';
import SchemaMarkup from '../components/SchemaMarkup';
import ConditionGuide from '../components/ConditionGuide';
import { getLocalizedProduct } from '../utils/localization';

const ProductDetail: React.FC = () => {
    const params = useParams();
    // params.slug might be string or string[] depending on route. 
    // In [category]/[slug], it is string.
    const slug = typeof params?.slug === 'string' ? params.slug : params?.slug?.[0];

    const router = useRouter();
    const { products, loading } = useData();
    const { selectedShop } = useShop();
    const { t, language } = useLanguage();
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

    const product = products.find(p => p.slug === slug);

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
                <button
                    onClick={() => router.push(`/${language}/${language === 'fr' ? 'produits' : language === 'nl' ? 'producten' : 'products'}`)}
                    className="bg-bel-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                    {t('Back to Products')}
                </button>
            </div>
        );
    }

    const { name: localizedName, description: localizedDescription } = getLocalizedProduct(product, language as 'en' | 'fr' | 'nl');

    const handleReserve = () => {
        if (selectedShop) {
            setIsReservationModalOpen(true);
        } else {
            alert(t('Please select a shop first'));
        }
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

            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-500 hover:text-bel-blue mb-8 transition"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                {t('Back')}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Section */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center h-[500px]">
                    <img
                        src={product.imageUrl}
                        alt={localizedName}
                        className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-500"
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
                        <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                            <span className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('Color')}</span>
                            <span className="font-bold text-gray-900 dark:text-white">{t(product.color || 'N/A')}</span>
                        </div>
                        {product.category !== 'accessories' && (
                            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
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

                    <button
                        onClick={handleReserve}
                        className="w-full bg-bel-blue text-white text-lg font-bold py-4 rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none transform active:scale-95"
                    >
                        {t('Reserve This Device')}
                    </button>
                </div>
            </div>


            {/* Condition Guide */}
            {
                product.category !== 'accessories' && (
                    <ConditionGuide currentCondition={product.condition as 'perfect' | 'very_good' | 'good'} />
                )
            }

            {
                isReservationModalOpen && selectedShop && (
                    <ReservationModal
                        product={product}
                        shop={selectedShop}
                        onClose={() => setIsReservationModalOpen(false)}
                    />
                )
            }
        </div >
    );
};

export default ProductDetail;
