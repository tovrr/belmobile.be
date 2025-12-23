'use client';

import React from 'react';
import { ShopProvider } from '../context/ShopContext';
import { DataProvider } from '../context/DataContext';
import { LanguageProvider } from '../hooks/useLanguage';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

export function Providers({ children, lang }: { children: React.ReactNode; lang?: string }) {
    return (
        <ThemeProvider>
            <LanguageProvider initialLanguage={lang as 'en' | 'fr' | 'nl' | undefined}>
                <DataProvider>
                    <ShopProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </ShopProvider>
                </DataProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
