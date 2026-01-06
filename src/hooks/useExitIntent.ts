import { useEffect, useCallback, useRef } from 'react';

interface UseExitIntentProps {
    onExit: () => void;
    enabled?: boolean;
    threshold?: number; // Distance from top in pixels
    delay?: number; // Delay before arming the trigger (prevents immediate trigger on load)
    mobileScrollSpeedThreshold?: number; // Sensibility for mobile scroll (pixels/ms)
    enableBackGate?: boolean; // Mobile Back Button soft-gate
}

export const useExitIntent = ({
    onExit,
    enabled = true,
    threshold = 20,
    delay = 2000,
    mobileScrollSpeedThreshold = 2.0, // Slightly more sensitive (was 2.5)
    enableBackGate = true
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
        if (currentScrollY > 50 && deltaTime > 0 && deltaY > 0) { // Reduced min scroll Y (was 100)
            const speed = deltaY / deltaTime;
            if (speed > mobileScrollSpeedThreshold) {
                // If checking speed, also ensure it's a significant movement
                if (deltaY > 50) { // Reduced min delta (was 100)
                    trigger();
                }
            }
        }

        lastScrollY.current = currentScrollY;
        lastScrollTime.current = currentTime;
    }, [enabled, mobileScrollSpeedThreshold, trigger]);

    // 3. MOBILE: Back Button Soft Gate
    useEffect(() => {
        if (!enabled || !enableBackGate || typeof window === 'undefined') return;

        const GATE_STATE_ID = 'exit-intent-gate';

        // Helper to check if our gate is set
        const isGateSet = () => window.history.state?.id === GATE_STATE_ID;

        // Arming Mechanism
        const armTimer = setTimeout(() => {
            if (!hasTriggered.current && !isGateSet()) {
                // Push a new state with our ID
                // This means "Current View + Gate". Hitting back removes Gate but stays on URL.
                window.history.pushState({ id: GATE_STATE_ID }, '', window.location.href);
            }
        }, delay);

        const handlePopState = (event: PopStateEvent) => {
            // When user hits back, the state is popped.
            // We intercept this ONLY if we haven't triggered yet.
            if (!hasTriggered.current && isArmed.current) {
                // We don't prevent navigation (hard to do), but we show the modal.
                // The URL remains the same (effectively), but the state is gone.
                trigger();
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            clearTimeout(armTimer);
            window.removeEventListener('popstate', handlePopState);
            // Note: We don't automatically remove the history state on unmount 
            // because that might mess up forward/back history logic for the user.
        };
    }, [enabled, enableBackGate, delay, trigger]); // Removed trigger from deps in stable ref pattern, but trigger is useCallback

    // Core Listeners
    useEffect(() => {
        if (!enabled) return;

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
