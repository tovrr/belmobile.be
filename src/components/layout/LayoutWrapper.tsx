'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

// Wrapper to conditionally render layout elements (Header, Footer)
// Hides them on the protected (PIN) page
// Wrapper to conditionally render layout elements (Header, Footer)
// Hides them on the protected (PIN) page
export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isProtected, setIsProtected] = React.useState(false);

    React.useEffect(() => {
        // Run check only on client after mount
        if (pathname?.includes('/protected')) {
            setIsProtected(true);
        } else {
            setIsProtected(false);
        }
    }, [pathname]);

    // Defaults to visible (false) on server, matching initial state.
    // Client will update after mount if needed. This prevents mismatch.
    return (
        <div data-layout-wrapper style={{ display: isProtected ? 'none' : 'block' }}>
            {children}
        </div>
    );
}
