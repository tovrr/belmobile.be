import { useEffect, useCallback, useRef } from 'react';

interface UseExitIntentProps {
    onExit: () => void;
    enabled?: boolean;
    threshold?: number; // Distance from top in pixels
    delay?: number; // Delay before arming the trigger (prevents immediate trigger on load)
}

export const useExitIntent = ({
    onExit,
    enabled = true,
    threshold = 20,
    delay = 1000
}: UseExitIntentProps) => {
    const hasTriggered = useRef(false);
    const isArmed = useRef(false);

    const handleMouseLeave = useCallback((event: MouseEvent) => {
        // Validation 1: Must used enabled
        if (!enabled) return;

        // Validation 2: Must not have triggered already (One-time only)
        if (hasTriggered.current) return;

        // Validation 3: Must be armed (prevent firing on initial load glitch)
        if (!isArmed.current) return;

        // Validation 4: Must be leaving the top of the viewport
        // clientY < threshold (typically 0-50px)
        if (event.clientY <= threshold) {
            hasTriggered.current = true;
            onExit();
        }
    }, [enabled, onExit, threshold]);

    useEffect(() => {
        if (!enabled) return;

        // Arm the trigger after delay
        const armTimer = setTimeout(() => {
            isArmed.current = true;
        }, delay);

        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeout(armTimer);
        };
    }, [enabled, handleMouseLeave, delay]);

    return {
        hasTriggered: hasTriggered.current,
        reset: () => {
            hasTriggered.current = false;
        }
    };
};
