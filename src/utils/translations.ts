
export type Language = 'en' | 'fr' | 'nl' | 'tr';

export type TranslationDict = {
    [key: string]: string;
};

export type Translations = {
    [lang in Language]: TranslationDict;
};

// Data has been moved to src/data/i18n/*.json for dynamic loading
// to reduce main thread blocking and bundle size.
