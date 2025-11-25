import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../hooks/useData';
import MetaTags from '../components/MetaTags';
import { useLanguage } from '../hooks/useLanguage';

const ProductDetail: React.FC = () => {
    const { productSlug } = useParams<{ productSlug: string }>();
    const { products } = useData();
    const { t } = useLanguage();

    // This is a simplified find logic. We might need to adjust the slug generation.
    const product = products.find(p => 
        p.name.toLowerCase().replace(/ /g, '-') === productSlug
    );

    if (!product) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h1 className="text-2xl font-bold">{t('Product not found')}</h1>
            </div>
        );
    }

    return (
        <>
            <MetaTags 
                title={`${product.name} - Belmobile.be`}
                description={t('product_desc_1', product.name, `€${product.price}`)}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-fade-in">
                    {/* Product Image Gallery */}
                    <div>
                        <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl w-full aspect-square flex items-center justify-center mb-4 shadow-lg">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain rounded-2xl" />
                            ) : (
                                <span className="text-gray-500">{t('Image Coming Soon')}</span>
                            )}
                        </div>
                        {/* Thumbnail images could go here */}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">{product.name}</h1>
                        <p className="text-3xl font-bold text-bel-blue dark:text-blue-400 mb-6">€{product.price}</p>
                        
                        <div className="prose dark:prose-invert max-w-none mb-8">
                            <p>{product.description || t('product_desc_2', product.name)}</p>
                        </div>

                        <div className="space-y-4">
                            <button className="w-full bg-bel-blue text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 transition-transform active:scale-95 shadow-lg shadow-blue-500/30">
                                {t('Reserve Item')}
                            </button>
                            <button className="w-full bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white font-bold py-4 px-8 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-transform active:scale-95">
                                {t('Contact Us')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetail;
