import fr from '../data/i18n/fr.json';
import en from '../data/i18n/en.json';
import nl from '../data/i18n/nl.json';

const translations: Record<string, any> = { fr, en, nl };

export type TFunction = (key: string, ...args: (string | number)[]) => string;

/**
 * Returns a translation function that is locked to a specific language.
 * Useful for generating PDFs in the customer's language regardless of the admin's UI language.
 * 
 * @param lang - The language code ('fr', 'en', 'nl'). Defaults to 'fr'.
 * @returns A t(key, ...args) function.
 */
export const getFixedT = (lang: string = 'fr'): TFunction => {
    // Normalize lang (handle cases like 'fr-BE' if they ever exist, though currently simple codes)
    const normalizedLang = lang.toLowerCase().split('-')[0];

    // Default to 'fr' if language not found
    const dict = translations[normalizedLang] || translations['fr'];

    return (key: string, ...args: (string | number)[]) => {
        let text = dict[key] || key;
        if (args.length > 0) {
            args.forEach((arg, index) => {
                // Simple replacement for {0}, {1} etc or %s if needed. 
                // Given existing code likely uses one of these.
                // If the string contains {0}, {1}, use that.
                // If it contains %s, use that.
                // Fallback: append? No, that's dangerous.
                // Let's assume standard replacement.
                text = text.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
                // Also support %s for legacy compatibility if present
                text = text.replace('%s', String(arg));
            });
        }
        return text;
    };
};
