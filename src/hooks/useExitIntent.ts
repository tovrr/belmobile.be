import { useEffect, useCallback, useRef } from 'react';

interface UseExitIntentProps {
    onExit: () => void;
    enabled?: boolean;
    threshold?: number; // Distance from top in pixels
    delay?: number; // Delay before arming the trigger (prevents immediate trigger on load)
    mobileScrollSpeedThreshold?: number; // Sensibility for mobile scroll (pixels/ms)
}

export const useExitIntent = ({
    onExit,
    enabled = true,
    threshold = 20,
    delay = 2000, // Increased delay to avoid false positives on load
    mobileScrollSpeedThreshold = 2.5 // Tweak this for sensitivity
}: UseExitIntentProps) => {
    const hasTriggered = useRef(false);
    const isArmed = useRef(false);

    // Scroll tracking
    const lastScrollY = useRef(0);
    const lastScrollTime = useRef(0);

    const trigger = useCallback(() => {
        if (!hasTriggered.current && isArmed.current) {
            hasTriggered.current = true;
            onExit();
        }
    }, [onExit]);

    // 1. DESKTOP: Mouse leaves window top
    const handleMouseLeave = useCallback((event: MouseEvent) => {
        if (!enabled) return;
        if (event.clientY <= threshold) {
            trigger();
        }
    }, [enabled, threshold, trigger]);

    // 2. MOBILE: Fast Scroll Up (Seeking URL bar)
    const handleScroll = useCallback(() => {
        if (!enabled || hasTriggered.current) return;

        const currentScrollY = window.scrollY;
        const currentTime = Date.now();
        const deltaY = lastScrollY.current - currentScrollY; // Positive = UP
        const deltaTime = currentTime - lastScrollTime.current;

        // Ensure we are not at the very top (bouncing)
        // And ensure it is a FAST scroll up
        if (currentScrollY > 100 && deltaTime > 0 && deltaY > 0) {
            const speed = deltaY / deltaTime;
            if (speed > mobileScrollSpeedThreshold) {
                // If checking speed, also ensure it's a significant movement
                if (deltaY > 100) {
                    trigger();
                }
            }
        }

        lastScrollY.current = currentScrollY;
        lastScrollTime.current = currentTime;
    }, [enabled, mobileScrollSpeedThreshold, trigger]);

    useEffect(() => {
        if (!enabled) return;

        // Arm the trigger after delay
        const armTimer = setTimeout(() => {
            isArmed.current = true;
        }, delay);

        document.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(armTimer);
        };
    }, [enabled, handleMouseLeave, handleScroll, delay]);

    return {
        hasTriggered: hasTriggered.current,
        reset: () => {
            hasTriggered.current = false;
        }
    };
};
