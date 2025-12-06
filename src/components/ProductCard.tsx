'use client';
import React, { useState } from 'react';
import { getLocalizedProduct } from '../utils/localization';
import { useRouter } from 'next/navigation';
import { Product } from '../types';
import { useShop } from '../hooks/useShop';
import ReservationModal from './ReservationModal';
import { useLanguage } from '../hooks/useLanguage';
import { CameraIcon, BoltIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { selectedShop } = useShop();
    const { t, language } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    const router = useRouter();
    const { name: localizedName } = getLocalizedProduct(product, language as 'en' | 'fr' | 'nl');

    const availability = selectedShop ? product.availability[selectedShop.id] : undefined;
    const canReserve = selectedShop && availability && availability > 0;

    const handleOpenModal = () => {
        if (canReserve) {
            setIsModalOpen(true);
        }
    };

    const handleCardClick = () => {
        if (product.slug) {
            const basePath = language === 'fr' ? 'acheter' : language === 'nl' ? 'kopen' : 'buy';
            router.push(`/${language}/${basePath}/${product.category}/${product.slug}`);
        }
    };

    const hasImage = product.imageUrl && product.imageUrl.trim() !== '' && !imgError;

    return (
        <>
            <motion.div
                onClick={handleCardClick}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full relative cursor-pointer overflow-hidden border border-white/10 hover:border-bel-blue/50"
            >




                import Image from 'next/image';

                // ... (other imports)

                // Inside component render:
                {/* Image */}
                <div className="relative pt-[100%] bg-transparent p-4">
                    {hasImage ? (
                        <Image
                            className="object-contain p-2 sm:p-6 group-hover:scale-105 transition-transform duration-500"
                            src={product.imageUrl}
                            alt={localizedName}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                            <CameraIcon className="h-12 w-12" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-3 sm:p-5 flex flex-col grow">
                    {/* Title: Brand + Model + Capacity */}
                    <h3 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-center leading-tight">
                        {product.brand} {localizedName}
                    </h3>

                    {/* Badges: Condition Only (Color removed) */}
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                        {product.condition && product.category !== 'accessories' && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wide ${product.condition === 'perfect' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' :
                                product.condition === 'very_good' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                    'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                                }`}>
                                {t(product.condition === 'perfect' ? 'Perfect Condition' : product.condition === 'very_good' ? 'Very Good Condition' : 'Good Condition')}
                            </span>
                        )}
                    </div>



                    <div className="mt-auto flex flex-col sm:flex-row items-center justify-between pt-2 sm:pt-4 border-t border-white/10 gap-2 sm:gap-0">
                        <div className="flex flex-col items-center sm:items-start">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-0.5 hidden sm:block">{t('Price')}</span>
                            <span className="text-lg sm:text-2xl font-extrabold text-bel-blue dark:text-blue-400">€{product.price}</span>
                        </div>

                        {/* Stock / Reserve Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleOpenModal(); }}
                            disabled={!canReserve}
                            className={`w-full sm:w-auto px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all transform active:scale-95 ${canReserve
                                ? 'bg-bel-blue text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {canReserve ? t('Réserver') : t('Out of Stock')}
                        </button>
                    </div>
                </div>
            </motion.div>

            {isModalOpen && selectedShop && (
                <ReservationModal
                    product={product}
                    onClose={() => setIsModalOpen(false)}
                    initialShop={selectedShop}
                />
            )}
        </>
    );
};

export default ProductCard;
