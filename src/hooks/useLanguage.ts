'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language, TranslationDict } from '../utils/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, ...args: (string | number)[]) => string;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode; initialLanguage?: Language; initialTranslations?: TranslationDict }> = ({ children, initialLanguage, initialTranslations }) => {
    // Initialize language based on Prop -> Storage -> Browser -> Default
    const [language, setLanguageState] = useState<Language>(() => {
        if (initialLanguage) return initialLanguage;

        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('belmobile_language');
            if (saved && ['en', 'fr', 'nl', 'tr'].includes(saved)) {
                return saved as Language;
            }

            const browserLang = navigator.language.toLowerCase();
            if (browserLang.startsWith('fr')) return 'fr';
            if (browserLang.startsWith('nl')) return 'nl';
        }

        return 'en';
    });

    const [translationsDict, setTranslationsDict] = useState<TranslationDict>(initialTranslations || {});
    const [isLoading, setIsLoading] = useState(!initialTranslations);

    // Dynamic loading of translation JSONs
    React.useEffect(() => {
        // If we already have translations for this language (from server), skip initial load
        if (initialTranslations && language === initialLanguage) {
            return;
        }

        let isMounted = true;
        setIsLoading(true);

        const loadTranslations = async () => {
            try {
                // Use dynamic import to create separate chunks for each language
                let dict;
                if (language === 'en') {
                    dict = await import('../data/i18n/en.json');
                } else if (language === 'fr') {
                    dict = await import('../data/i18n/fr.json');
                } else if (language === 'nl') {
                    dict = await import('../data/i18n/nl.json');
                } else if (language === 'tr') {
                    dict = await import('../data/i18n/tr.json');
                }

                if (isMounted && dict) {
                    setTranslationsDict(dict.default || dict);
                }
            } catch (error) {
                console.error(`Failed to load translations for ${language}:`, error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadTranslations();

        return () => {
            isMounted = false;
        };
    }, [language, initialLanguage, initialTranslations]);

    // Sync state if initialLanguage changes (e.g. navigation)
    React.useEffect(() => {
        if (initialLanguage && initialLanguage !== language) {
            setLanguageState(initialLanguage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLanguage]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('belmobile_language', lang);
    };

    const t = (key: string, ...args: (string | number)[]): string => {
        let translation = translationsDict[key] || key;

        if (args.length > 0) {
            args.forEach((arg, index) => {
                const placeholder = new RegExp(`\\{${index}\\}`, 'g');
                translation = translation.replace(placeholder, String(arg));
            });
        }

        return translation;
    };

    // Use React.createElement since this is a .ts file (though usually .tsx is preferred for Context providers)
    return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t, isLoading } }, children);
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

