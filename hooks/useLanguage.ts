
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, Language } from '../utils/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, ...args: (string | number)[]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize language based on Storage -> Browser -> Default
    const [language, setLanguageState] = useState<Language>(() => {
        // 1. Check Local Storage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('belmobile_language');
            if (saved && ['en', 'fr', 'nl'].includes(saved)) {
                return saved as Language;
            }

            // 2. Check Browser Language
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.startsWith('fr')) return 'fr';
            if (browserLang.startsWith('nl')) return 'nl';
        }
        
        // 3. Default
        return 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('belmobile_language', lang);
    };

    const t = (key: string, ...args: (string | number)[]): string => {
        const langTranslations = translations[language];
        let translation = langTranslations[key] || translations['en'][key] || key;
        
        if (args.length > 0) {
            args.forEach((arg, index) => {
                const placeholder = new RegExp(`\\{${index}\\}`, 'g');
                translation = translation.replace(placeholder, String(arg));
            });
        }

        return translation;
    };

    // Use React.createElement since this is a .ts file (though usually .tsx is preferred for Context providers)
    return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
