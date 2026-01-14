import { Product } from '../types';
import { Locale } from '../i18n-config';

export const getLocalizedProduct = (product: Product, language: Locale) => {
    let name = product.name;
    let description = product.description;

    if (language === 'fr') {
        name = product.name_fr || product.name;
        description = product.description_fr || product.description;
    } else if (language === 'nl') {
        name = product.name_nl || product.name;
        description = product.description_nl || product.description;
    } else if (language === 'tr') {
        name = product.name_tr || product.name;
        description = product.description_tr || product.description;
    }

    return { name, description };
};
