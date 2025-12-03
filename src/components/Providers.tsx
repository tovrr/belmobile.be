'use client';

import React from 'react';
import { ShopProvider } from '../context/ShopContext';
import { DataProvider } from '../context/DataContext';
import { LanguageProvider } from '../hooks/useLanguage';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

export function Providers({ children, lang }: { children: React.ReactNode; lang?: string }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <LanguageProvider initialLanguage={lang as any}>
                    <DataProvider>
                        <ShopProvider>
                            {children}
                        </ShopProvider>
                    </DataProvider>
                </LanguageProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
