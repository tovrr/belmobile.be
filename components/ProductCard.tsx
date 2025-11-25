

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // <-- Ajout de l'importation de Link
import { Product } from '../types';
import { useShop } from '../hooks/useShop';
import ReservationModal from './ReservationModal';
import { useLanguage } from '../hooks/useLanguage';
import { CameraIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { selectedShop } = useShop();
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    const availability = selectedShop ? product.availability[selectedShop.id] : undefined;
    const canReserve = selectedShop && availability && availability > 0;

    const localizedDescription = t(`product_desc_${product.id}`, product.description);
    const productSlug = product.name.toLowerCase().replace(/ /g, '-'); // <-- Génération du slug ici

    const handleReserveClick = (e: React.MouseEvent) => { // <-- Modifier pour prendre l'événement
        e.stopPropagation(); // <-- Empêcher la propagation du clic au lien parent
        if (canReserve) {
            setIsModalOpen(true);
        }
    };

    const hasImage = product.imageUrl && product.imageUrl.trim() !== '' && !imgError;

    return (
        <>
            <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-transparent overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-300 flex flex-col h-full relative">
                 {/* Stock Badge */}
                 {selectedShop && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                        <span className={`px-1.5 py-0.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-full shadow-sm backdrop-blur-md ${
                            availability && availability > 0 
                                ? 'bg-green-500/90 text-white' 
                                : 'bg-red-500/90 text-white'
                        }`}>
                            {availability && availability > 0 ? t('In Stock') : t('Out of Stock')}
                        </span>
                    </div>
                )}

                {/* Image Container */}
                <Link to={`/products/${productSlug}`}> {/* <-- Ajout du lien sur l'image */}
                    <div className="relative pt-[100%] bg-gray-50 dark:bg-gray-100 overflow-hidden">
                        {hasImage ? (
                            <img 
                                className="absolute top-0 left-0 w-full h-full object-contain mix-blend-multiply p-8 group-hover:scale-110 transition-transform duration-500 ease-in-out" 
                                src={product.imageUrl} 
                                alt={`${product.name} - ${t('Buy or Reserve at Belmobile')}`}
                                loading="lazy" 
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                                <CameraIcon className="h-12 w-12 mb-2 opacity-50" />
                                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">{t('Image Coming Soon')}</span>
                            </div>
                        )}
                    </div>
                </Link>

                <div className="p-3 sm:p-5 flex flex-col flex-grow">
                    <div className="flex-grow">
                        <Link to={`/products/${productSlug}`}> {/* <-- Ajout du lien sur le nom du produit */}
                            <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-bel-blue dark:group-hover:text-blue-400 transition-colors line-clamp-2">{product.name}</h3>
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3 hidden sm:block">{localizedDescription}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-50 dark:border-slate-700 gap-2 sm:gap-0">
                        <div className="flex flex-col">
                             <span className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide hidden sm:block">{t('Price')}</span>
                             <span className="text-base sm:text-xl font-extrabold text-bel-dark dark:text-white">€{product.price}</span>
                        </div>
                        
                         <button 
                            onClick={handleReserveClick}
                            disabled={!canReserve}
                            className="w-full sm:w-auto bg-bel-blue text-white font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl hover:bg-blue-700 active:scale-95 transition-all duration-200 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm text-xs sm:text-sm truncate"
                        >
                            {selectedShop ? (availability && availability > 0 ? t('Reserve') : t('Out')) : t('Shop?')}
                        </button>
                    </div>
                </div>
            </div>
            {isModalOpen && selectedShop && (
                <ReservationModal 
                    product={product} 
                    shop={selectedShop}
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </>
    );
};

export default ProductCard;
