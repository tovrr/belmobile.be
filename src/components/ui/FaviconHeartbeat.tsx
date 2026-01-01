'use client';

import { useEffect, useRef } from 'react';

const FaviconHeartbeat = () => {
    const originalFavicon = useRef<string>('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Red Cross SVG (Data URI)
    // A red circle with a white X, highly visible.
    // Medical Cross SVG (Neon Red)
    // A classic "Pharmacy/Doctor" cross. Bright red used for high visibility.
    // Pentalobe Screw SVG (Repair Symbol)
    // A 5-point flower/star shape, iconic for smartphone repair (Apple screws).
    const pentalobeIcon = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><path d=%22M16 2 L19 10 L28 10 L22 17 L25 26 L16 21 L7 26 L10 17 L4 10 L13 10 Z%22 fill=%22%23EAB308%22 stroke=%22white%22 stroke-width=%222%22/></svg>`;

    // Dim/Empty State for "Blinking" effect
    const emptyIcon = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22></svg>`;

    useEffect(() => {
        // Store original favicon on mount
        const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (link) {
            originalFavicon.current = link.href;
        } else {
            const newLink = document.createElement('link');
            newLink.rel = 'shortcut icon';
            document.head.appendChild(newLink);
            originalFavicon.current = '';
        }

        const handleVisibilityChange = () => {
            const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
            if (!link) return;

            if (document.hidden) {
                // User left tab -> Start Heartbeat Pattern
                let step = 0;

                // Clear any existing
                if (intervalRef.current) clearInterval(intervalRef.current);

                // Simulation of "Lub-Dub... Lub-Dub..." Heartbeat
                // Pattern: ON (Yellow Icon) -> OFF (Original/Empty) -> ON (Yellow Icon) -> OFF (Original) ... repeat
                intervalRef.current = setInterval(() => {
                    step = (step + 1) % 4;

                    switch (step) {
                        case 0: // Beat 1
                            link.href = pentalobeIcon;
                            break;
                        case 1: // Gap - Show original
                            link.href = originalFavicon.current || emptyIcon;
                            break;
                        case 2: // Beat 2 
                            link.href = pentalobeIcon;
                            break;
                        case 3: // Rest (longer pause) - Show original
                            link.href = originalFavicon.current || emptyIcon;
                            break;
                    }
                }, 400); // 400ms tick

                // Start immediately
                link.href = pentalobeIcon;

            } else {
                // User returned -> Stop
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                if (originalFavicon.current) {
                    link.href = originalFavicon.current;
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Safety restore
            const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
            if (link && originalFavicon.current) link.href = originalFavicon.current;
        };
    }, []);

    return null; // Logic only component
};

export default FaviconHeartbeat;
