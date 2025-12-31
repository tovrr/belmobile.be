'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

// Wrapper to conditionally render layout elements (Header, Footer)
// Hides them on the protected (PIN) page
export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Check if we are on the protected page (localized or not)
    // e.g., /en/protected, /fr/protected, /protected
    const isProtectedPage = pathname?.includes('/protected');

    if (isProtectedPage) return null;

    return <>{children}</>;
}
