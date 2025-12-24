import { Product } from '../types';

export const getLocalizedProduct = (product: Product, language: 'en' | 'fr' | 'nl') => {
    let name = product.name;
    let description = product.description;

    if (language === 'fr') {
        name = product.name_fr || product.name;
        description = product.description_fr || product.description;
    } else if (language === 'nl') {
        name = product.name_nl || product.name;
        description = product.description_nl || product.description;
    }

    return { name, description };
};
