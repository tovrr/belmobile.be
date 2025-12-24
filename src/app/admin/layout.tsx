'use client';

import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { DataProvider } from '../../context/DataContext';
import { LanguageProvider } from '../../hooks/useLanguage';
import AdminShell from '../../components/admin/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <LanguageProvider>
                <DataProvider>
                    <AdminShell>
                        {children}
                    </AdminShell>
                </DataProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}
