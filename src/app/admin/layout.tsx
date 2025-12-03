'use client';

import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { DataProvider } from '../../context/DataContext';
import AdminShell from '../../components/admin/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <DataProvider>
                <AdminShell>
                    {children}
                </AdminShell>
            </DataProvider>
        </AuthProvider>
    );
}
