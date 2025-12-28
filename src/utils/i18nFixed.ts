import fr from '../data/i18n/fr.json';
import en from '../data/i18n/en.json';
import nl from '../data/i18n/nl.json';

const translations: Record<string, any> = { fr, en, nl };

export type TFunction = (key: string) => string;

/**
 * Returns a translation function that is locked to a specific language.
 * Useful for generating PDFs in the customer's language regardless of the admin's UI language.
 * 
 * @param lang - The language code ('fr', 'en', 'nl'). Defaults to 'fr'.
 * @returns A t(key) function.
 */
export const getFixedT = (lang: string = 'fr'): TFunction => {
    // Normalize lang (handle cases like 'fr-BE' if they ever exist, though currently simple codes)
    const normalizedLang = lang.toLowerCase().split('-')[0];

    // Default to 'fr' if language not found
    const dict = translations[normalizedLang] || translations['fr'];

    return (key: string) => {
        return dict[key] || key;
    };
};
