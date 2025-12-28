'use client';

import React from 'react';
import { Providers } from '../../components/Providers';
import AdminShell from '../../components/admin/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <AdminShell>
                {children}
            </AdminShell>
        </Providers>
    );
}
