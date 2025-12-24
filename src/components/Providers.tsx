'use client';

import React from 'react';
import { ShopProvider } from '../context/ShopContext';
import { DataProvider } from '../context/DataContext';
import { LanguageProvider } from '../hooks/useLanguage';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { TranslationDict } from '../utils/translations';

export function Providers({ children, lang, translations }: { children: React.ReactNode; lang?: string; translations?: TranslationDict }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <LanguageProvider initialLanguage={lang as 'en' | 'fr' | 'nl' | undefined} initialTranslations={translations}>
                    <DataProvider>
                        <ShopProvider>
                            {children}
                        </ShopProvider>
                    </DataProvider>
                </LanguageProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
