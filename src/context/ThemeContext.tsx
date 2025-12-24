'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme] = useState<Theme>('dark');

    useEffect(() => {
        // Aggressively force dark mode
        const root = window.document.documentElement;

        // Remove 'light' class if present
        if (root.classList.contains('light')) {
            root.classList.remove('light');
        }

        // Add 'dark' class if missing
        if (!root.classList.contains('dark')) {
            root.classList.add('dark');
        }

        // Enforce in localStorage
        localStorage.setItem('theme', 'dark');

        // Watch for changes and revert if something tries to remove it
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (!root.classList.contains('dark')) {
                        root.classList.add('dark');
                    }
                    if (root.classList.contains('light')) {
                        root.classList.remove('light');
                    }
                }
            });
        });

        observer.observe(root, { attributes: true });

        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        // Disabled: Strictly Dark Mode
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

